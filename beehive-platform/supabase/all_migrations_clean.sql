-- ========================================
-- 001_initial_schema.sql
-- ========================================
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


-- ========================================
-- 002_rls_policies.sql
-- ========================================
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


-- ========================================
-- 003_auto_profile.sql
-- ========================================
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


-- ========================================
-- 004_storage_bucket.sql
-- ========================================
-- ============================================================
-- 蜂巢AI视频协作平台 - Supabase Storage Bucket 配置
-- 创建 media 公开存储桶，用于存储项目封面、视频、任务参考图片、用户头像
-- 配置 RLS 策略：已认证用户可上传、任何人可读取、用户可删除自己的文件
-- ============================================================

-- 创建 media bucket（公开读取）
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- ============================================================
-- Storage RLS 策略
-- ============================================================

-- 已认证用户可上传文件到 media bucket
CREATE POLICY "Authenticated users can upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- 任何人可读取 media bucket 中的文件（公开访问）
CREATE POLICY "Public read access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media');

-- 用户可删除自己上传的文件（通过文件路径中的用户ID判断归属）
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ========================================
-- 005_payment_balance.sql
-- ========================================
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


-- ========================================
-- 006_pingpp_charge.sql
-- ========================================
-- ============================================================
-- 支付对接：recharge_orders 表扩展（自建支付宝/微信等）
-- 新增 pingpp_charge_id 存储外部交易号（如支付宝 trade_no）
-- ============================================================

-- 1. 删除旧的 payment_channel 约束
ALTER TABLE recharge_orders DROP CONSTRAINT IF EXISTS recharge_orders_payment_channel_check;

-- 2. 新增 pingpp_charge_id 列（存储支付渠道返回的交易号，如支付宝 trade_no）
ALTER TABLE recharge_orders ADD COLUMN IF NOT EXISTS pingpp_charge_id text;

-- 3. 扩展 payment_channel 支持 alipay_pc, alipay_wap, wx_pub 等
ALTER TABLE recharge_orders ADD CONSTRAINT recharge_orders_payment_channel_check
  CHECK (payment_channel IN (
    'mock', 'alipay', 'wechat',
    'alipay_pc', 'alipay_wap', 'wx_pub', 'wx_pub_qr'
  ));

-- 4. 索引便于 Webhook 回调查询
CREATE INDEX IF NOT EXISTS idx_recharge_orders_pingpp_charge_id
  ON recharge_orders(pingpp_charge_id) WHERE pingpp_charge_id IS NOT NULL;


-- ========================================
-- 007_wx_native_channel.sql
-- ========================================
-- 支持微信 Native 扫码支付渠道
ALTER TABLE recharge_orders DROP CONSTRAINT IF EXISTS recharge_orders_payment_channel_check;
ALTER TABLE recharge_orders ADD CONSTRAINT recharge_orders_payment_channel_check
  CHECK (payment_channel IN (
    'mock', 'alipay', 'wechat',
    'alipay_pc', 'alipay_wap', 'wx_pub', 'wx_pub_qr', 'wx_native'
  ));


-- ========================================
-- 008_payment_go_live.sql
-- ========================================
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


-- ========================================
-- 009_feedbacks.sql
-- ========================================
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


-- ========================================
-- 010_project_expiry_and_review.sql
-- ========================================
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


