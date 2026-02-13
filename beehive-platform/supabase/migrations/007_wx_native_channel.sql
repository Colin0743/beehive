-- 支持微信 Native 扫码支付渠道
ALTER TABLE recharge_orders DROP CONSTRAINT IF EXISTS recharge_orders_payment_channel_check;
ALTER TABLE recharge_orders ADD CONSTRAINT recharge_orders_payment_channel_check
  CHECK (payment_channel IN (
    'mock', 'alipay', 'wechat',
    'alipay_pc', 'alipay_wap', 'wx_pub', 'wx_pub_qr', 'wx_native'
  ));
