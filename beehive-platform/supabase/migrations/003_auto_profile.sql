-- ============================================================
-- 蜂巢AI视频协作平台 - Profiles 自动创建触发器
-- 当 auth.users 新增记录时，自动在 profiles 表创建对应记录
-- name 默认为邮箱 @ 前缀，role 默认为 'user'
-- ============================================================

-- 触发器函数：自动创建用户 profile
-- 使用 SECURITY DEFINER 确保有权限插入 profiles 表
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 触发器：在 auth.users 表插入新记录后触发
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
