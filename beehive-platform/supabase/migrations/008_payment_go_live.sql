-- ============================================================
-- 蜂巢AI视频协作平台 - 支付系统上线迁移
-- 1. 将 pingpp_charge_id 重命名为 external_trade_no
-- 2. 收紧 payment_channel 约束，仅保留有效渠道
-- 3. 创建 confirm_recharge_order 原子充值确认函数
-- ============================================================

-- ============================================================
-- 第一步：将 pingpp_charge_id 列重命名为 external_trade_no
-- 说明：原列名源自 Ping++ 时代，现已改为自建支付对接，
--       该列实际存储支付宝 trade_no 或微信 transaction_id，
--       重命名后更准确反映用途。ALTER COLUMN RENAME 保留原有数据。
-- ============================================================

ALTER TABLE recharge_orders RENAME COLUMN pingpp_charge_id TO external_trade_no;

-- 同步重命名索引（PostgreSQL 不会自动重命名索引）
ALTER INDEX IF EXISTS idx_recharge_orders_pingpp_charge_id
  RENAME TO idx_recharge_orders_external_trade_no;

-- ============================================================
-- 第二步：收紧 payment_channel 约束
-- 移除不再使用的渠道值（alipay, wechat, wx_pub, wx_pub_qr），
-- 仅保留 mock、alipay_pc、alipay_wap、wx_native
-- ============================================================

ALTER TABLE recharge_orders DROP CONSTRAINT IF EXISTS recharge_orders_payment_channel_check;

ALTER TABLE recharge_orders ADD CONSTRAINT recharge_orders_payment_channel_check
  CHECK (payment_channel IN ('mock', 'alipay_pc', 'alipay_wap', 'wx_native'));

-- ============================================================
-- 第三步：创建 confirm_recharge_order 原子充值确认函数
-- 在单个事务中完成：
--   1. 检查订单状态为 pending（使用 FOR UPDATE 行锁防止并发）
--   2. 更新订单状态为 paid，记录外部交易号和支付时间
--   3. 插入 balance_transactions 充值流水
--   4. upsert user_balances 余额（原子增加）
--   5. 返回操作结果和新余额
--
-- 并发安全：使用 SELECT ... FOR UPDATE 行锁，确保同一订单
-- 只有一个事务能成功处理，其他并发调用会等待锁释放后
-- 发现状态已非 pending 而返回失败。
-- ============================================================

CREATE OR REPLACE FUNCTION public.confirm_recharge_order(
  p_order_id       uuid,
  p_trade_no       text,
  p_expected_amount integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order   recharge_orders%ROWTYPE;
  v_new_bal integer;
BEGIN
  -- 1. 加行锁读取订单，防止并发处理同一订单
  SELECT *
    INTO v_order
    FROM recharge_orders
   WHERE id = p_order_id
     FOR UPDATE;

  -- 订单不存在
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success',   false,
      'new_balance', 0,
      'error_msg', '订单不存在'
    );
  END IF;

  -- 订单已支付（幂等处理：重复回调直接返回成功）
  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object(
      'success',   true,
      'new_balance', 0,
      'error_msg', '订单已支付'
    );
  END IF;

  -- 订单状态非 pending，拒绝处理
  IF v_order.status <> 'pending' THEN
    RETURN jsonb_build_object(
      'success',   false,
      'new_balance', 0,
      'error_msg', '订单状态异常: ' || v_order.status
    );
  END IF;

  -- 金额校验：回调金额必须与订单金额一致
  IF v_order.amount_cents <> p_expected_amount THEN
    RETURN jsonb_build_object(
      'success',   false,
      'new_balance', 0,
      'error_msg', '金额不匹配: 订单=' || v_order.amount_cents || ', 回调=' || p_expected_amount
    );
  END IF;

  -- 2. 更新订单状态为 paid
  UPDATE recharge_orders
     SET status           = 'paid',
         paid_at          = now(),
         external_trade_no = p_trade_no
   WHERE id = p_order_id;

  -- 3. 插入充值流水
  INSERT INTO balance_transactions (user_id, amount_cents, type, related_id)
  VALUES (v_order.user_id, v_order.amount_cents, 'recharge', p_order_id::text);

  -- 4. upsert 用户余额（原子增加）
  INSERT INTO user_balances (user_id, balance_cents, updated_at)
  VALUES (v_order.user_id, v_order.amount_cents, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance_cents = user_balances.balance_cents + EXCLUDED.balance_cents,
    updated_at    = now()
  RETURNING balance_cents INTO v_new_bal;

  -- 5. 返回成功结果和新余额
  RETURN jsonb_build_object(
    'success',   true,
    'new_balance', v_new_bal,
    'error_msg', ''
  );
END;
$$;
