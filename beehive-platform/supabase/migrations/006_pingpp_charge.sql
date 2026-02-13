-- ============================================================
-- 支付对接：recharge_orders 表扩展（自建支付宝/微信等）
-- 新增 pingpp_charge_id 存储外部交易号（如支付宝 trade_no）
-- ============================================================

-- 1. 删除旧的 payment_channel 约束
ALTER TABLE recharge_orders DROP CONSTRAINT IF EXISTS recharge_orders_payment_channel_check;

-- 2. 新增 pingpp_charge_id 列（存储支付渠道返回的交易号，如支付宝 trade_no）
ALTER TABLE recharge_orders ADD COLUMN IF NOT EXISTS pingpp_charge_id text;

-- 3. 扩展 payment_channel 支持 alipay_pc, alipay_wap, wx_pub 等
ALTER TABLE recharge_orders ADD CONSTRAINT recharge_orders_payment_channel_check
  CHECK (payment_channel IN (
    'mock', 'alipay', 'wechat',
    'alipay_pc', 'alipay_wap', 'wx_pub', 'wx_pub_qr'
  ));

-- 4. 索引便于 Webhook 回调查询
CREATE INDEX IF NOT EXISTS idx_recharge_orders_pingpp_charge_id
  ON recharge_orders(pingpp_charge_id) WHERE pingpp_charge_id IS NOT NULL;
