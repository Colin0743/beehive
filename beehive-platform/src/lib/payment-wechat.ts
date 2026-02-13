/**
 * 自建支付对接 - 微信支付
 * 直接调用微信支付 API v3，无需第三方聚合
 * 环境变量：WXPAY_APP_ID, WXPAY_MCHID, WXPAY_API_KEY, WXPAY_PRIVATE_KEY
 */
import crypto from 'crypto';
import fs from 'fs';

const WXPAY_API = 'https://api.mch.weixin.qq.com';

function getWxPayConfig() {
  const appId = process.env.WXPAY_APP_ID;
  const mchId = process.env.WXPAY_MCHID;
  const apiKey = process.env.WXPAY_API_KEY;
  const privateKey = process.env.WXPAY_PRIVATE_KEY;
  const privateKeyPath = process.env.WXPAY_PRIVATE_KEY_PATH;

  if (!appId || !mchId || !apiKey) {
    throw new Error('WXPAY_APP_ID、WXPAY_MCHID、WXPAY_API_KEY 必须配置');
  }

  const privKey = privateKey || (privateKeyPath && fs.readFileSync(privateKeyPath, 'ascii'));
  if (!privKey) {
    throw new Error('WXPAY_PRIVATE_KEY 或 WXPAY_PRIVATE_KEY_PATH 必须配置');
  }

  return { appId, mchId, apiKey, privateKey: privKey };
}

function formatPrivateKey(key: string): string {
  if (key.includes('-----BEGIN')) return key;
  return `-----BEGIN PRIVATE KEY-----\n${key.replace(/\\n/g, '\n')}\n-----END PRIVATE KEY-----`;
}

function sign(method: string, url: string, timestamp: string, nonce: string, body: string, privateKey: string): string {
  const message = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;
  const sign = crypto.createSign('RSA-SHA256').update(message).sign(formatPrivateKey(privateKey), 'base64');
  return sign;
}

export interface CreateWxNativeOrderParams {
  outTradeNo: string;
  amountCents: number;
  description: string;
  notifyUrl: string;
}

/**
 * 创建微信 Native 支付订单（扫码支付），返回 code_url
 */
export async function createWxNativeOrder(params: CreateWxNativeOrderParams): Promise<string> {
  const { appId, mchId, apiKey, privateKey } = getWxPayConfig();

  const url = '/v3/pay/transactions/native';
  const body = JSON.stringify({
    appid: appId,
    mchid: mchId,
    description: params.description,
    out_trade_no: params.outTradeNo,
    notify_url: params.notifyUrl,
    amount: {
      total: params.amountCents,
      currency: 'CNY',
    },
  });

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const signature = sign('POST', url, timestamp, nonce, body, privateKey);

  const auth = `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}"`;

  const res = await fetch(`${WXPAY_API}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth,
      'User-Agent': 'beehive-platform/1.0',
    },
    body,
  });

  const data = (await res.json()) as { code_url?: string; code?: string; message?: string };
  if (!res.ok) {
    throw new Error(data.message || `微信支付失败: ${res.status}`);
  }
  if (!data.code_url) {
    throw new Error('微信支付未返回 code_url');
  }
  return data.code_url;
}

/** 微信平台证书缓存（内存缓存，含过期时间） */
interface CachedCert {
  serialNo: string;
  publicKey: string;
  expireAt: number; // Unix 毫秒时间戳
}

let platformCertsCache: CachedCert[] = [];
let lastCertFetchTime = 0;
const CERT_CACHE_TTL = 12 * 60 * 60 * 1000; // 12 小时缓存

/**
 * 格式化公钥为 PEM 格式
 */
function formatPublicKey(key: string): string {
  if (key.includes('-----BEGIN')) return key;
  return `-----BEGIN CERTIFICATE-----\n${key}\n-----END CERTIFICATE-----`;
}

/**
 * 下载并缓存微信平台证书
 * 使用商户私钥签名请求，获取平台证书列表
 * 证书用 APIv3 密钥解密后缓存
 */
export async function fetchPlatformCerts(): Promise<CachedCert[]> {
  const now = Date.now();
  // 缓存未过期时直接返回
  if (platformCertsCache.length > 0 && now - lastCertFetchTime < CERT_CACHE_TTL) {
    return platformCertsCache;
  }

  const { mchId, apiKey, privateKey } = getWxPayConfig();
  const url = '/v3/certificates';
  const timestamp = Math.floor(now / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const signature = sign('GET', url, timestamp, nonce, '', privateKey);

  const auth = `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no=""`;

  const res = await fetch(`${WXPAY_API}${url}`, {
    method: 'GET',
    headers: {
      Authorization: auth,
      'User-Agent': 'beehive-platform/1.0',
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    console.error('[WeChat] 平台证书下载失败:', res.status);
    return platformCertsCache; // 下载失败时返回旧缓存
  }

  const body = (await res.json()) as {
    data?: Array<{
      serial_no: string;
      effective_time: string;
      expire_time: string;
      encrypt_certificate: {
        algorithm: string;
        nonce: string;
        associated_data: string;
        ciphertext: string;
      };
    }>;
  };

  if (!body.data || body.data.length === 0) {
    console.error('[WeChat] 平台证书列表为空');
    return platformCertsCache;
  }

  const certs: CachedCert[] = [];
  for (const cert of body.data) {
    try {
      // 使用 APIv3 密钥解密证书内容
      const decryptedCert = decryptAesGcm(
        apiKey,
        cert.encrypt_certificate.ciphertext,
        cert.encrypt_certificate.nonce,
        cert.encrypt_certificate.associated_data
      );
      certs.push({
        serialNo: cert.serial_no,
        publicKey: decryptedCert,
        expireAt: new Date(cert.expire_time).getTime(),
      });
    } catch (e) {
      console.error('[WeChat] 平台证书解密失败:', cert.serial_no, e);
    }
  }

  if (certs.length > 0) {
    platformCertsCache = certs;
    lastCertFetchTime = now;
  }

  return platformCertsCache;
}

/**
 * 使用微信平台证书验证回调签名
 * 构造验签串：timestamp + "\n" + nonce + "\n" + body + "\n"
 * 使用平台证书公钥进行 RSA-SHA256 验签
 */
export async function verifyWxCallbackSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  nonce: string,
  serialNo: string
): Promise<boolean> {
  try {
    // 获取平台证书
    const certs = await fetchPlatformCerts();
    if (certs.length === 0) {
      console.error('[WeChat] 无可用的平台证书，无法验签');
      return false;
    }

    // 根据序列号查找对应证书
    const cert = serialNo
      ? certs.find((c) => c.serialNo === serialNo)
      : certs[0]; // 无序列号时使用第一个证书

    if (!cert) {
      console.error('[WeChat] 未找到匹配的平台证书，序列号:', serialNo);
      return false;
    }

    // 构造验签串
    const message = `${timestamp}\n${nonce}\n${rawBody}\n`;

    // 使用平台证书公钥验证签名
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(message);
    return verify.verify(formatPublicKey(cert.publicKey), signature, 'base64');
  } catch (e) {
    console.error('[WeChat] 签名验证异常:', e);
    return false;
  }
}

/** verifyAndDecryptWxNotify 的返回结果类型 */
export interface WxNotifyVerifyResult {
  success: boolean;
  /** 解密后的交易数据（仅 success=true 时有值） */
  data?: { out_trade_no: string; transaction_id: string; amount: { total: number } };
  /** 失败原因标识 */
  failReason?: 'missing_api_key' | 'missing_headers' | 'signature_failed' | 'invalid_event_type' | 'decrypt_failed';
}

/**
 * 验证并解密微信支付回调
 * 1. 使用微信平台证书验证请求签名（RSA-SHA256）
 * 2. 使用 AES-256-GCM 解密 resource 数据
 */
export async function verifyAndDecryptWxNotify(
  rawBody: string,
  getHeader: (name: string) => string | null
): Promise<WxNotifyVerifyResult> {
  const apiKey = process.env.WXPAY_API_KEY;
  if (!apiKey) return { success: false, failReason: 'missing_api_key' };

  const signature = getHeader('wechatpay-signature') || getHeader('Wechatpay-Signature');
  const timestamp = getHeader('wechatpay-timestamp') || getHeader('Wechatpay-Timestamp');
  const nonce = getHeader('wechatpay-nonce') || getHeader('Wechatpay-Nonce');
  const serialNo = getHeader('wechatpay-serial') || getHeader('Wechatpay-Serial') || '';

  if (!signature || !timestamp || !nonce) {
    return { success: false, failReason: 'missing_headers' };
  }

  // 使用微信平台证书验证签名
  const signatureValid = await verifyWxCallbackSignature(rawBody, signature, timestamp, nonce, serialNo);
  if (!signatureValid) {
    return { success: false, failReason: 'signature_failed' };
  }

  // 解析通知体
  const body = JSON.parse(rawBody) as {
    id?: string;
    create_time?: string;
    event_type?: string;
    resource_type?: string;
    resource?: { ciphertext?: string; nonce?: string; associated_data?: string };
  };

  if (body.event_type !== 'TRANSACTION.SUCCESS' || !body.resource) {
    return { success: false, failReason: 'invalid_event_type' };
  }

  const r = body.resource;
  const ciphertext = r?.ciphertext || '';
  const resNonce = r?.nonce || '';
  const associatedData = r?.associated_data || '';

  if (!ciphertext || !resNonce) {
    return { success: false, failReason: 'decrypt_failed' };
  }

  try {
    const decrypted = decryptAesGcm(apiKey, ciphertext, resNonce, associatedData);
    const data = JSON.parse(decrypted) as {
      out_trade_no: string;
      transaction_id: string;
      amount: { total: number };
      trade_state?: string;
    };
    if (data.trade_state && data.trade_state !== 'SUCCESS') {
      return { success: false, failReason: 'invalid_event_type' };
    }
    return { success: true, data };
  } catch {
    return { success: false, failReason: 'decrypt_failed' };
  }
}

function decryptAesGcm(key: string, ciphertextB64: string, nonceB64: string, aad: string): string {
  const keyBuf = Buffer.from(key, 'utf8');
  const iv = Buffer.from(nonceB64, 'base64');
  const data = Buffer.from(ciphertextB64, 'base64');
  const tag = data.subarray(-16);
  const cipher = data.subarray(0, -16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuf, iv);
  decipher.setAuthTag(tag);
  decipher.setAAD(Buffer.from(aad || '', 'utf8'));

  return Buffer.concat([decipher.update(cipher), decipher.final()]).toString('utf8');
}

export function isWxPayEnabled(): boolean {
  return !!(
    process.env.WXPAY_APP_ID &&
    process.env.WXPAY_MCHID &&
    process.env.WXPAY_API_KEY &&
    (process.env.WXPAY_PRIVATE_KEY || process.env.WXPAY_PRIVATE_KEY_PATH)
  );
}
