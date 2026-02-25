-- ============================================================
-- 定时任务脚本：标记过期项目
-- 在宝塔面板中配置 cron 任务，每天执行一次
-- 
-- 使用方法：
-- 1. 登录 Supabase 控制台
-- 2. 在 SQL Editor 中执行此脚本
-- 或者
-- 1. 在宝塔面板配置定时任务
-- 2. 使用 psql 或其他 PostgreSQL 客户端执行
--
-- cron 配置示例（每天凌晨3点执行）：
-- 0 3 * * * psql -h <supabase_host> -U postgres -d postgres -f /path/to/mark-expired-projects.sql
-- ============================================================

-- 标记所有过期项目
UPDATE projects
SET is_expired = true, status = 'paused'
WHERE expires_at < now() AND is_expired = false;

-- 输出标记数量
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RAISE NOTICE '已标记 % 个过期项目', affected_count;
END $$;
