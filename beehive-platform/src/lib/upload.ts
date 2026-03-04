/**
 * 文件上传工具模块
 *
 * 提供统一的文件上传函数，将文件上传到 Supabase Storage 并返回公开 URL。
 * 包含客户端预验证（文件类型、文件大小）和 base64 格式判断工具函数。
 */
import { createClient } from '@/lib/supabase';

// ==================== 常量定义 ====================

/** 允许的文件 MIME 类型白名单 */
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime',
] as const;

/** 图片类型列表 */
const IMAGE_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/gif'];

/** 视频类型列表 */
const VIDEO_TYPES: readonly string[] = ['video/mp4', 'video/quicktime'];

/** 图片大小限制：5MB */
export const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024;

/** 视频大小限制：500MB */
export const VIDEO_SIZE_LIMIT = 500 * 1024 * 1024;

// ==================== 验证函数 ====================

/**
 * 验证文件类型是否在白名单中
 * @param type 文件的 MIME 类型
 * @returns 是否为允许的文件类型
 */
export function isAllowedFileType(type: string): boolean {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(type);
}

/**
 * 验证文件大小是否在限制范围内
 * @param file 要验证的文件
 * @returns 是否在大小限制内
 */
export function isFileSizeValid(file: File): boolean {
  if (IMAGE_TYPES.includes(file.type)) {
    return file.size <= IMAGE_SIZE_LIMIT;
  }
  if (VIDEO_TYPES.includes(file.type)) {
    return file.size <= VIDEO_SIZE_LIMIT;
  }
  // 未知类型不通过大小验证
  return false;
}

/**
 * 获取文件大小限制的可读描述
 * @param type 文件的 MIME 类型
 * @returns 大小限制描述字符串
 */
function getSizeLimitLabel(type: string): string {
  if (IMAGE_TYPES.includes(type)) return '5MB';
  if (VIDEO_TYPES.includes(type)) return '500MB';
  return '未知';
}

// ==================== 核心上传函数 ====================

/**
 * 统一的文件上传函数
 *
 * 流程：
 * 1. 客户端预验证文件类型和大小
 * 2. 构建 FormData，包含 file 字段
 * 3. POST 到 /api/upload
 * 4. 解析响应，返回 URL 或抛出错误
 *
 * @param file 要上传的文件
 * @returns 上传成功后的公开 URL
 * @throws Error 验证失败或上传失败时抛出错误
 */
export async function uploadFile(file: File): Promise<string> {
  // 1. 客户端预验证：文件类型
  if (!isAllowedFileType(file.type)) {
    throw new Error('不支持的文件格式，仅支持 JPEG、PNG、GIF 图片和 MP4、MOV 视频');
  }

  // 2. 客户端预验证：文件大小
  if (!isFileSizeValid(file)) {
    const limit = getSizeLimitLabel(file.type);
    throw new Error(`文件大小超过限制，最大允许 ${limit}`);
  }

  // 3. 构建路径并直传到 Supabase Storage (绕过后端服务器，省流量、提高上限)
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('未认证，无法上传文件');
  }

  const userId = session.user.id;
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 7);

  // 提取扩展名
  const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'bin';
  const filePath = `${userId}/${timestamp}_${randomId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Supabase 直传失败:', uploadError);
    throw new Error('上传失败，请重试');
  }

  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// ==================== 工具函数 ====================

/**
 * 判断字符串是否为 base64 格式（兼容旧数据）
 *
 * 以 "data:" 开头即视为 base64 编码的数据 URI。
 * 用于在显示媒体文件时区分旧的 base64 数据和新的 Storage URL。
 *
 * @param str 要判断的字符串
 * @returns 是否为 base64 格式
 */
export function isBase64(str: string): boolean {
  return str.startsWith('data:');
}
