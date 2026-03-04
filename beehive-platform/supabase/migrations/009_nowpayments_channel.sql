-- ============================================================
-- 蜂巢AI视频协作平台 - 支付渠道扩展：添加 NOWPayments 稳定币支付
-- ============================================================

-- 更新 payment_channel 约束，添加 nowpayments 渠道
ALTER TABLE recharge_orders DROP CONSTRAINT IF EXISTS recharge_orders_payment_channel_check;

ALTER TABLE recharge_orders ADD CONSTRAINT recharge_orders_payment_channel_check
  CHECK (payment_channel IN ('mock', 'alipay_pc', 'alipay_wap', 'wx_native', 'nowpayments'));

-- 说明：
-- nowpayments: 海外版 NOWPayments 稳定币支付（USDT/USDC 等）
-- 该渠道对应 external_trade_no 字段存储 NOWPayments 的 payment_id
