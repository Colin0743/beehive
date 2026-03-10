-- ============================================================
-- 蜂巢AI视频协作平台
-- 1. 增加新用户免费发布任务额度 (free_task_quota)
-- 2. 移除项目过期自动删除机制 (expires_at, is_expired)
-- ============================================================

-- 1. 为 profiles 表添加 free_task_quota 字段
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS free_task_quota integer NOT NULL DEFAULT 10 CHECK (free_task_quota >= 0);

-- 将现有用户的免费额度设置为 10
UPDATE public.profiles
SET free_task_quota = 10
WHERE free_task_quota IS NULL;

-- 2. 修改扣款函数，优先扣除免费额度
CREATE OR REPLACE FUNCTION public.deduct_task_publish_fee(
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
  v_free_quota integer;
BEGIN
  -- 先检查免费额度
  SELECT free_task_quota INTO v_free_quota
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_free_quota > 0 THEN
    -- 扣除一次免费额度
    UPDATE public.profiles
    SET free_task_quota = free_task_quota - 1
    WHERE id = p_user_id;
    
    -- 记录特殊的流水（金额为0，标记为免费）
    INSERT INTO balance_transactions (user_id, amount_cents, type, related_id)
    VALUES (p_user_id, 0, 'task_publish', p_task_id || '_free');
    
    RETURN true;
  END IF;

  -- 如果没有免费额度，走正常扣费逻辑
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

-- 3. 清理项目过期相关机制
-- 删除标记过期项目的函数
DROP FUNCTION IF EXISTS public.mark_expired_projects();

-- 清理 projects 表中的过期相关字段
ALTER TABLE public.projects DROP COLUMN IF EXISTS expires_at CASCADE;
ALTER TABLE public.projects DROP COLUMN IF EXISTS is_expired CASCADE;

-- 移除旧的触发器依赖（如果有的话，根据当前情况无需显式 DROP，刚才那个函数是手工调用的）
