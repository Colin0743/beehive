-- ============================================================
-- 蜂巢AI视频协作平台 - Row Level Security (RLS) 策略
-- 对所有表启用 RLS，实现基于角色的数据访问控制
-- ============================================================

-- ============================================================
-- 第一部分：对所有表启用 RLS
-- ============================================================

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_acceptances      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements          ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_follows       ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_events          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 第二部分：管理员判断函数
-- 使用 SECURITY DEFINER 确保函数可以查询 profiles 表
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- 第三部分：profiles 表策略
-- 需求 2.3：认证用户仅允许读取和更新自己的 profile 记录
-- 需求 2.7：管理员可读写所有
-- ============================================================

-- 用户读取自己的 profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

-- 用户更新自己的 profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- 允许插入自己的 profile（用于触发器或首次创建）
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() OR is_admin());

-- 管理员可删除 profile
CREATE POLICY "profiles_delete_admin"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- 第四部分：projects 表策略
-- 需求 2.2：未认证用户可读取项目
-- 需求 2.4：所有认证用户可读项目，仅创建者可更新和删除
-- 需求 2.7：管理员可写所有
-- ============================================================

-- 未认证用户可读取所有项目（公开数据）
CREATE POLICY "projects_select_anon"
  ON projects FOR SELECT
  TO anon
  USING (true);

-- 认证用户可读取所有项目
CREATE POLICY "projects_select_authenticated"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

-- 认证用户可创建项目（creator_id 必须是自己）
CREATE POLICY "projects_insert_authenticated"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid() OR is_admin());

-- 仅项目创建者或管理员可更新项目
CREATE POLICY "projects_update_owner"
  ON projects FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid() OR is_admin())
  WITH CHECK (creator_id = auth.uid() OR is_admin());

-- 仅项目创建者或管理员可删除项目
CREATE POLICY "projects_delete_owner"
  ON projects FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid() OR is_admin());

-- ============================================================
-- 第五部分：project_logs 表策略
-- 项目日志跟随项目权限：所有人可读，项目创建者可写
-- ============================================================

-- 未认证用户可读取项目日志
CREATE POLICY "project_logs_select_anon"
  ON project_logs FOR SELECT
  TO anon
  USING (true);

-- 认证用户可读取项目日志
CREATE POLICY "project_logs_select_authenticated"
  ON project_logs FOR SELECT
  TO authenticated
  USING (true);

-- 项目创建者或管理员可创建日志
CREATE POLICY "project_logs_insert_owner"
  ON project_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_logs.project_id
      AND projects.creator_id = auth.uid()
    )
    OR is_admin()
  );

-- 项目创建者或管理员可更新日志
CREATE POLICY "project_logs_update_owner"
  ON project_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_logs.project_id
      AND projects.creator_id = auth.uid()
    )
    OR is_admin()
  );

-- 项目创建者或管理员可删除日志
CREATE POLICY "project_logs_delete_owner"
  ON project_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_logs.project_id
      AND projects.creator_id = auth.uid()
    )
    OR is_admin()
  );

-- ============================================================
-- 第六部分：tasks 表策略
-- 需求 2.2：未认证用户可读取 status 为 'published' 的任务
-- 需求 2.5：所有认证用户可读任务，仅项目创建者可创建、更新和删除
-- 需求 2.7：管理员可写所有
-- ============================================================

-- 未认证用户仅可读取已发布的任务
CREATE POLICY "tasks_select_anon"
  ON tasks FOR SELECT
  TO anon
  USING (status = 'published');

-- 认证用户可读取所有任务
CREATE POLICY "tasks_select_authenticated"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- 仅项目创建者或管理员可创建任务
CREATE POLICY "tasks_insert_project_owner"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.creator_id = auth.uid()
    )
    OR is_admin()
  );

-- 仅项目创建者或管理员可更新任务
CREATE POLICY "tasks_update_project_owner"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.creator_id = auth.uid()
    )
    OR is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.creator_id = auth.uid()
    )
    OR is_admin()
  );

-- 仅项目创建者或管理员可删除任务
CREATE POLICY "tasks_delete_project_owner"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.creator_id = auth.uid()
    )
    OR is_admin()
  );

-- ============================================================
-- 第七部分：task_acceptances 表策略
-- 认证用户可操作自己的接受记录
-- ============================================================

-- 认证用户可读取自己的接受记录，管理员可读取所有
CREATE POLICY "task_acceptances_select_own"
  ON task_acceptances FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 认证用户可创建自己的接受记录
CREATE POLICY "task_acceptances_insert_own"
  ON task_acceptances FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- 用户可删除自己的接受记录，管理员可删除所有
CREATE POLICY "task_acceptances_delete_own"
  ON task_acceptances FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 管理员可更新任务接受记录
CREATE POLICY "task_acceptances_update_admin"
  ON task_acceptances FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 第八部分：notifications 表策略
-- 需求 2.6：用户仅能读取和更新自己的通知记录
-- 需求 2.7：管理员可操作所有
-- ============================================================

-- 用户只能读取自己的通知
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 系统或管理员可创建通知（通过 service_role 或管理员）
CREATE POLICY "notifications_insert"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- 用户只能更新自己的通知（如标记已读）
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- 用户可删除自己的通知，管理员可删除所有
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- ============================================================
-- 第九部分：achievements 表策略
-- 需求 2.2：未认证用户可读取成就（公开数据）
-- 认证用户可读取所有成就，认证用户可创建，管理员可完全操作
-- ============================================================

-- 未认证用户可读取成就
CREATE POLICY "achievements_select_anon"
  ON achievements FOR SELECT
  TO anon
  USING (true);

-- 认证用户可读取所有成就
CREATE POLICY "achievements_select_authenticated"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- 认证用户可创建成就记录，管理员可创建所有
CREATE POLICY "achievements_insert_authenticated"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 管理员可更新成就
CREATE POLICY "achievements_update_admin"
  ON achievements FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 管理员可删除成就
CREATE POLICY "achievements_delete_admin"
  ON achievements FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- 第十部分：project_follows 表策略
-- 认证用户可操作自己的关注记录
-- ============================================================

-- 认证用户可读取关注记录
CREATE POLICY "project_follows_select_authenticated"
  ON project_follows FOR SELECT
  TO authenticated
  USING (true);

-- 认证用户可创建自己的关注记录
CREATE POLICY "project_follows_insert_own"
  ON project_follows FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- 用户可取消自己的关注，管理员可删除所有
CREATE POLICY "project_follows_delete_own"
  ON project_follows FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- ============================================================
-- 第十一部分：project_participations 表策略
-- 认证用户可操作自己的参与记录
-- ============================================================

-- 认证用户可读取参与记录
CREATE POLICY "project_participations_select_authenticated"
  ON project_participations FOR SELECT
  TO authenticated
  USING (true);

-- 认证用户可创建自己的参与记录
CREATE POLICY "project_participations_insert_own"
  ON project_participations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- 用户可退出参与，管理员可删除所有
CREATE POLICY "project_participations_delete_own"
  ON project_participations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 管理员可更新参与记录
CREATE POLICY "project_participations_update_admin"
  ON project_participations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 第十二部分：click_events 表策略
-- 所有人可读取点击事件，认证用户可写
-- ============================================================

-- 未认证用户可读取点击事件
CREATE POLICY "click_events_select_anon"
  ON click_events FOR SELECT
  TO anon
  USING (true);

-- 认证用户可读取点击事件
CREATE POLICY "click_events_select_authenticated"
  ON click_events FOR SELECT
  TO authenticated
  USING (true);

-- 认证用户可记录点击事件
CREATE POLICY "click_events_insert_authenticated"
  ON click_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 管理员可更新和删除点击事件
CREATE POLICY "click_events_update_admin"
  ON click_events FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "click_events_delete_admin"
  ON click_events FOR DELETE
  TO authenticated
  USING (is_admin());
