-- ============================================================
-- 蜂巢AI视频协作平台 - 项目过期机制和内容审核
-- 1. 添加 expires_at 字段（项目一个月后过期）
-- 2. 添加 review_status 字段（内容审核状态）
-- ============================================================

-- 1. 为 projects 表添加 expires_at 字段
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- 为已存在的项目设置 expires_at（创建时间 + 30天）
UPDATE projects 
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;

-- 设置默认值：新项目创建时自动设置为30天后过期
ALTER TABLE projects 
ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '30 days');

-- 2. 为 projects 表添加 review_status 字段
ALTER TABLE projects ADD COLUMN IF NOT EXISTS review_status text 
DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected'));

-- 为已存在的项目设置 review_status 为 approved（保持向后兼容）
UPDATE projects 
SET review_status = 'approved'
WHERE review_status IS NULL OR review_status = 'pending';

-- 3. 为 tasks 表添加 review_status 字段
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS review_status text 
DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected'));

-- 为已存在的任务设置 review_status 为 approved
UPDATE tasks 
SET review_status = 'approved'
WHERE review_status IS NULL OR review_status = 'pending';

-- 4. 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_projects_expires_at ON projects(expires_at);
CREATE INDEX IF NOT EXISTS idx_projects_review_status ON projects(review_status);
CREATE INDEX IF NOT EXISTS idx_tasks_review_status ON tasks(review_status);

-- 5. 创建项目过期状态字段 (软删除标记)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_expired boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_projects_is_expired ON projects(is_expired);

-- 6. 创建函数：标记过期项目
CREATE OR REPLACE FUNCTION mark_expired_projects()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE projects
  SET is_expired = true, status = 'paused'
  WHERE expires_at < now() AND is_expired = false;
END;
$$;

-- 7. 创建函数：审核项目（管理员使用）
CREATE OR REPLACE FUNCTION review_project(
  p_project_id uuid,
  p_status text,
  p_admin_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 检查管理员权限
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_admin_id AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN false;
  END IF;

  UPDATE projects
  SET review_status = p_status
  WHERE id = p_project_id;
  
  RETURN FOUND;
END;
$$;

-- 8. 创建函数：审核任务（管理员使用）
CREATE OR REPLACE FUNCTION review_task(
  p_task_id uuid,
  p_status text,
  p_admin_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 检查管理员权限
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_admin_id AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN false;
  END IF;

  UPDATE tasks
  SET review_status = p_status
  WHERE id = p_task_id;
  
  RETURN FOUND;
END;
$$;

-- 9. 创建函数：批量审核项目
CREATE OR REPLACE FUNCTION batch_review_projects(
  p_project_ids uuid[],
  p_status text,
  p_admin_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  -- 检查管理员权限
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_admin_id AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN 0;
  END IF;

  UPDATE projects
  SET review_status = p_status
  WHERE id = ANY(p_project_ids);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 10. 创建函数：批量审核任务
CREATE OR REPLACE FUNCTION batch_review_tasks(
  p_task_ids uuid[],
  p_status text,
  p_admin_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  -- 检查管理员权限
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_admin_id AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN 0;
  END IF;

  UPDATE tasks
  SET review_status = p_status
  WHERE id = ANY(p_task_ids);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
