-- ============================================================
-- 用户反馈功能
-- 1. 新建 feedbacks 表
-- 2. 扩展 notifications 表的 type 约束，增加 feedback_replied
-- ============================================================

-- 1. feedbacks 表：用户反馈
CREATE TABLE feedbacks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category    text        NOT NULL,
  description text        NOT NULL,
  images      jsonb       DEFAULT '[]'::jsonb,
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'resolved')),
  admin_reply text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

-- 索引
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_status  ON feedbacks(status);

-- 2. 扩展 notifications 表的 type CHECK 约束
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('task_completed', 'contribution_accepted', 'feedback_replied'));

-- 3. RLS 策略
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的反馈
CREATE POLICY "Users can view own feedbacks"
  ON feedbacks FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以创建反馈
CREATE POLICY "Users can create feedbacks"
  ON feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 管理员可以查看所有反馈（通过 service role 或 profiles.role 判断）
CREATE POLICY "Admins can view all feedbacks"
  ON feedbacks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 管理员可以更新反馈状态
CREATE POLICY "Admins can update feedbacks"
  ON feedbacks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
