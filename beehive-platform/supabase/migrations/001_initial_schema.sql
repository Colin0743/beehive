-- ============================================================
-- 蜂巢AI视频协作平台 - 初始数据库 Schema
-- 创建所有数据表、外键、索引、默认值、复合主键/唯一约束
-- ============================================================

-- 1. profiles 表：用户扩展信息，关联 auth.users
CREATE TABLE profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text,
  avatar     text,
  role       text        NOT NULL DEFAULT 'user'
                         CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. projects 表：项目信息
CREATE TABLE projects (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text        NOT NULL,
  description        text,
  category           text,
  target_duration    integer,
  current_duration   integer     DEFAULT 0,
  telegram_group     text,
  cover_image        text,
  video_file         text,
  creator_id         uuid        NOT NULL REFERENCES profiles(id),
  creator_name       text,
  participants_count integer     NOT NULL DEFAULT 0,
  status             text        NOT NULL DEFAULT 'active'
                                 CHECK (status IN ('active', 'completed', 'paused')),
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- 外键索引
CREATE INDEX idx_projects_creator_id ON projects(creator_id);

-- 3. project_logs 表：项目日志
CREATE TABLE project_logs (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type         text        NOT NULL CHECK (type IN ('update', 'milestone', 'announcement')),
  content      text,
  creator_name text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 外键索引
CREATE INDEX idx_project_logs_project_id ON project_logs(project_id);

-- 4. tasks 表：任务信息
--    order_index 避免使用 PostgreSQL 保留字 order
--    reference_images 使用 jsonb 类型存储图片数组
CREATE TABLE tasks (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  prompt           text,
  reference_images jsonb,
  requirements     text,
  creator_email    text,
  status           text        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft', 'published', 'completed')),
  contributor_name text,
  duration         integer,
  order_index      integer,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 外键索引
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- 5. task_acceptances 表：任务接受记录
CREATE TABLE task_acceptances (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, user_id)
);

-- 外键索引
CREATE INDEX idx_task_acceptances_task_id ON task_acceptances(task_id);
CREATE INDEX idx_task_acceptances_user_id ON task_acceptances(user_id);

-- 6. notifications 表：通知
CREATE TABLE notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       text        NOT NULL CHECK (type IN ('task_completed', 'contribution_accepted')),
  message    text,
  task_id    uuid,
  project_id uuid,
  is_read    boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 外键索引
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- 7. achievements 表：成就记录
CREATE TABLE achievements (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id          uuid        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  task_name        text,
  contributor_name text,
  project_id       uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_name     text,
  completed_at     timestamptz NOT NULL DEFAULT now()
);

-- 外键索引
CREATE INDEX idx_achievements_task_id    ON achievements(task_id);
CREATE INDEX idx_achievements_project_id ON achievements(project_id);

-- 8. project_follows 表：项目关注（复合主键）
CREATE TABLE project_follows (
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id  uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  followed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

-- 外键索引（复合主键已覆盖 user_id，需单独为 project_id 建索引）
CREATE INDEX idx_project_follows_project_id ON project_follows(project_id);

-- 9. project_participations 表：项目参与（复合主键）
CREATE TABLE project_participations (
  user_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role       text        NOT NULL DEFAULT 'worker_bee',
  joined_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

-- 外键索引（复合主键已覆盖 user_id，需单独为 project_id 建索引）
CREATE INDEX idx_project_participations_project_id ON project_participations(project_id);

-- 10. click_events 表：点击事件
CREATE TABLE click_events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  timestamp  timestamptz NOT NULL DEFAULT now(),
  user_id    uuid
);

-- 外键索引
CREATE INDEX idx_click_events_project_id ON click_events(project_id);

-- 复合索引：优化按项目和时间窗口查询点击统计
CREATE INDEX idx_click_events_project_timestamp ON click_events(project_id, timestamp);
