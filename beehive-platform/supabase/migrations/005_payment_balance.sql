-- ============================================================
-- 蜂巢AI视频协作平台 - 支付余额相关表
-- user_balances, balance_transactions, recharge_orders
-- ============================================================

-- 1. user_balances 表：用户余额
CREATE TABLE user_balances (
  user_id       uuid        PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance_cents integer     NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_balances_user_id ON user_balances(user_id);

-- 2. balance_transactions 表：余额流水
CREATE TABLE balance_transactions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_cents integer     NOT NULL,
  type         text        NOT NULL CHECK (type IN ('recharge', 'task_publish')),
  related_id   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX idx_balance_transactions_created_at ON balance_transactions(created_at DESC);

-- 3. recharge_orders 表：充值订单
CREATE TABLE recharge_orders (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_cents     integer     NOT NULL CHECK (amount_cents > 0),
  status           text        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'paid', 'failed')),
  payment_channel  text        CHECK (payment_channel IN ('alipay', 'wechat', 'mock')),
  out_trade_no     text        UNIQUE NOT NULL,
  trade_no         text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  paid_at          timestamptz
);

CREATE INDEX idx_recharge_orders_user_id ON recharge_orders(user_id);
CREATE INDEX idx_recharge_orders_out_trade_no ON recharge_orders(out_trade_no);
CREATE INDEX idx_recharge_orders_status ON recharge_orders(status);

-- ============================================================
-- RLS 策略
-- ============================================================

ALTER TABLE user_balances           ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_orders         ENABLE ROW LEVEL SECURITY;

-- user_balances: 用户只能读写自己的余额
CREATE POLICY "user_balances_select_own"
  ON user_balances FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "user_balances_insert_own"
  ON user_balances FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "user_balances_update_own"
  ON user_balances FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- balance_transactions: 用户只能读自己的流水
CREATE POLICY "balance_transactions_select_own"
  ON balance_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 插入由服务端 API 完成（使用 service role），不开放给客户端
CREATE POLICY "balance_transactions_insert_service"
  ON balance_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- recharge_orders: 用户只能读写自己的订单
CREATE POLICY "recharge_orders_select_own"
  ON recharge_orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "recharge_orders_insert_own"
  ON recharge_orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "recharge_orders_update_own"
  ON recharge_orders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- ============================================================
-- 新用户自动创建余额记录
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_profile_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_balances (user_id, balance_cents)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_balance
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_balance();

-- 为已有 profiles 补全 user_balances
INSERT INTO user_balances (user_id, balance_cents)
SELECT id, 0 FROM profiles
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 原子扣款函数（发布任务时使用）
-- ============================================================

CREATE OR REPLACE FUNCTION deduct_task_publish_fee(
  p_user_id uuid,
  p_task_id text,
  p_fee_cents integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  UPDATE user_balances
  SET balance_cents = balance_cents - p_fee_cents,
      updated_at = now()
  WHERE user_id = p_user_id
    AND balance_cents >= p_fee_cents
  RETURNING balance_cents INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO balance_transactions (user_id, amount_cents, type, related_id)
  VALUES (p_user_id, -p_fee_cents, 'task_publish', p_task_id);

  RETURN true;
END;
$$;
