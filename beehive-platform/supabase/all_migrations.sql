-- ========================================
-- Migration: 001_initial_schema.sql
-- ========================================
-- ============================================================
-- 铚傚发AI瑙嗛鍗忎綔骞冲彴 - 鍒濆鏁版嵁搴?Schema
-- 鍒涘缓鎵€鏈夋暟鎹〃銆佸閿€佺储寮曘€侀粯璁ゅ€笺€佸鍚堜富閿?鍞竴绾︽潫
-- ============================================================

-- 1. profiles 琛細鐢ㄦ埛鎵╁睍淇℃伅锛屽叧鑱?auth.users
CREATE TABLE profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text,
  avatar     text,
  role       text        NOT NULL DEFAULT 'user'
                         CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. projects 琛細椤圭洰淇℃伅
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

-- 澶栭敭绱㈠紩
CREATE INDEX idx_projects_creator_id ON projects(creator_id);

-- 3. project_logs 琛細椤圭洰鏃ュ織
CREATE TABLE project_logs (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type         text        NOT NULL CHECK (type IN ('update', 'milestone', 'announcement')),
  content      text,
  creator_name text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 澶栭敭绱㈠紩
CREATE INDEX idx_project_logs_project_id ON project_logs(project_id);

-- 4. tasks 琛細浠诲姟淇℃伅
--    order_index 閬垮厤浣跨敤 PostgreSQL 淇濈暀瀛?order
--    reference_images 浣跨敤 jsonb 绫诲瀷瀛樺偍鍥剧墖鏁扮粍
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

-- 澶栭敭绱㈠紩
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- 5. task_acceptances 琛細浠诲姟鎺ュ彈璁板綍
CREATE TABLE task_acceptances (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, user_id)
);

-- 澶栭敭绱㈠紩
CREATE INDEX idx_task_acceptances_task_id ON task_acceptances(task_id);
CREATE INDEX idx_task_acceptances_user_id ON task_acceptances(user_id);

-- 6. notifications 琛細閫氱煡
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

-- 澶栭敭绱㈠紩
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- 7. achievements 琛細鎴愬氨璁板綍
CREATE TABLE achievements (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id          uuid        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  task_name        text,
  contributor_name text,
  project_id       uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_name     text,
  completed_at     timestamptz NOT NULL DEFAULT now()
);

-- 澶栭敭绱㈠紩
CREATE INDEX idx_achievements_task_id    ON achievements(task_id);
CREATE INDEX idx_achievements_project_id ON achievements(project_id);

-- 8. project_follows 琛細椤圭洰鍏虫敞锛堝鍚堜富閿級
CREATE TABLE project_follows (
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id  uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  followed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

-- 澶栭敭绱㈠紩锛堝鍚堜富閿凡瑕嗙洊 user_id锛岄渶鍗曠嫭涓?project_id 寤虹储寮曪級
CREATE INDEX idx_project_follows_project_id ON project_follows(project_id);

-- 9. project_participations 琛細椤圭洰鍙備笌锛堝鍚堜富閿級
CREATE TABLE project_participations (
  user_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role       text        NOT NULL DEFAULT 'worker_bee',
  joined_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

-- 澶栭敭绱㈠紩锛堝鍚堜富閿凡瑕嗙洊 user_id锛岄渶鍗曠嫭涓?project_id 寤虹储寮曪級
CREATE INDEX idx_project_participations_project_id ON project_participations(project_id);

-- 10. click_events 琛細鐐瑰嚮浜嬩欢
CREATE TABLE click_events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  timestamp  timestamptz NOT NULL DEFAULT now(),
  user_id    uuid
);

-- 澶栭敭绱㈠紩
CREATE INDEX idx_click_events_project_id ON click_events(project_id);

-- 澶嶅悎绱㈠紩锛氫紭鍖栨寜椤圭洰鍜屾椂闂寸獥鍙ｆ煡璇㈢偣鍑荤粺璁?
CREATE INDEX idx_click_events_project_timestamp ON click_events(project_id, timestamp);


-- ========================================
-- Migration: 002_rls_policies.sql
-- ========================================
-- ============================================================
-- 铚傚发AI瑙嗛鍗忎綔骞冲彴 - Row Level Security (RLS) 绛栫暐
-- 瀵规墍鏈夎〃鍚敤 RLS锛屽疄鐜板熀浜庤鑹茬殑鏁版嵁璁块棶鎺у埗
-- ============================================================

-- ============================================================
-- 绗竴閮ㄥ垎锛氬鎵€鏈夎〃鍚敤 RLS
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
-- 绗簩閮ㄥ垎锛氱鐞嗗憳鍒ゆ柇鍑芥暟
-- 浣跨敤 SECURITY DEFINER 纭繚鍑芥暟鍙互鏌ヨ profiles 琛?
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
-- 绗笁閮ㄥ垎锛歱rofiles 琛ㄧ瓥鐣?
-- 闇€姹?2.3锛氳璇佺敤鎴蜂粎鍏佽璇诲彇鍜屾洿鏂拌嚜宸辩殑 profile 璁板綍
-- 闇€姹?2.7锛氱鐞嗗憳鍙鍐欐墍鏈?
-- ============================================================

-- 鐢ㄦ埛璇诲彇鑷繁鐨?profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

-- 鐢ㄦ埛鏇存柊鑷繁鐨?profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- 鍏佽鎻掑叆鑷繁鐨?profile锛堢敤浜庤Е鍙戝櫒鎴栭娆″垱寤猴級
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() OR is_admin());

-- 绠＄悊鍛樺彲鍒犻櫎 profile
CREATE POLICY "profiles_delete_admin"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- 绗洓閮ㄥ垎锛歱rojects 琛ㄧ瓥鐣?
-- 闇€姹?2.2锛氭湭璁よ瘉鐢ㄦ埛鍙鍙栭」鐩?
-- 闇€姹?2.4锛氭墍鏈夎璇佺敤鎴峰彲璇婚」鐩紝浠呭垱寤鸿€呭彲鏇存柊鍜屽垹闄?
-- 闇€姹?2.7锛氱鐞嗗憳鍙啓鎵€鏈?
-- ============================================================

-- 鏈璇佺敤鎴峰彲璇诲彇鎵€鏈夐」鐩紙鍏紑鏁版嵁锛?
CREATE POLICY "projects_select_anon"
  ON projects FOR SELECT
  TO anon
  USING (true);

-- 璁よ瘉鐢ㄦ埛鍙鍙栨墍鏈夐」鐩?
CREATE POLICY "projects_select_authenticated"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

-- 璁よ瘉鐢ㄦ埛鍙垱寤洪」鐩紙creator_id 蹇呴』鏄嚜宸憋級
CREATE POLICY "projects_insert_authenticated"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid() OR is_admin());

-- 浠呴」鐩垱寤鸿€呮垨绠＄悊鍛樺彲鏇存柊椤圭洰
CREATE POLICY "projects_update_owner"
  ON projects FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid() OR is_admin())
  WITH CHECK (creator_id = auth.uid() OR is_admin());

-- 浠呴」鐩垱寤鸿€呮垨绠＄悊鍛樺彲鍒犻櫎椤圭洰
CREATE POLICY "projects_delete_owner"
  ON projects FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid() OR is_admin());

-- ============================================================
-- 绗簲閮ㄥ垎锛歱roject_logs 琛ㄧ瓥鐣?
-- 椤圭洰鏃ュ織璺熼殢椤圭洰鏉冮檺锛氭墍鏈変汉鍙锛岄」鐩垱寤鸿€呭彲鍐?
-- ============================================================

-- 鏈璇佺敤鎴峰彲璇诲彇椤圭洰鏃ュ織
CREATE POLICY "project_logs_select_anon"
  ON project_logs FOR SELECT
  TO anon
  USING (true);

-- 璁よ瘉鐢ㄦ埛鍙鍙栭」鐩棩蹇?
CREATE POLICY "project_logs_select_authenticated"
  ON project_logs FOR SELECT
  TO authenticated
  USING (true);

-- 椤圭洰鍒涘缓鑰呮垨绠＄悊鍛樺彲鍒涘缓鏃ュ織
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

-- 椤圭洰鍒涘缓鑰呮垨绠＄悊鍛樺彲鏇存柊鏃ュ織
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

-- 椤圭洰鍒涘缓鑰呮垨绠＄悊鍛樺彲鍒犻櫎鏃ュ織
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
-- 绗叚閮ㄥ垎锛歵asks 琛ㄧ瓥鐣?
-- 闇€姹?2.2锛氭湭璁よ瘉鐢ㄦ埛鍙鍙?status 涓?'published' 鐨勪换鍔?
-- 闇€姹?2.5锛氭墍鏈夎璇佺敤鎴峰彲璇讳换鍔★紝浠呴」鐩垱寤鸿€呭彲鍒涘缓銆佹洿鏂板拰鍒犻櫎
-- 闇€姹?2.7锛氱鐞嗗憳鍙啓鎵€鏈?
-- ============================================================

-- 鏈璇佺敤鎴蜂粎鍙鍙栧凡鍙戝竷鐨勪换鍔?
CREATE POLICY "tasks_select_anon"
  ON tasks FOR SELECT
  TO anon
  USING (status = 'published');

-- 璁よ瘉鐢ㄦ埛鍙鍙栨墍鏈変换鍔?
CREATE POLICY "tasks_select_authenticated"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- 浠呴」鐩垱寤鸿€呮垨绠＄悊鍛樺彲鍒涘缓浠诲姟
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

-- 浠呴」鐩垱寤鸿€呮垨绠＄悊鍛樺彲鏇存柊浠诲姟
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

-- 浠呴」鐩垱寤鸿€呮垨绠＄悊鍛樺彲鍒犻櫎浠诲姟
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
-- 绗竷閮ㄥ垎锛歵ask_acceptances 琛ㄧ瓥鐣?
-- 璁よ瘉鐢ㄦ埛鍙搷浣滆嚜宸辩殑鎺ュ彈璁板綍
-- ============================================================

-- 璁よ瘉鐢ㄦ埛鍙鍙栬嚜宸辩殑鎺ュ彈璁板綍锛岀鐞嗗憳鍙鍙栨墍鏈?
CREATE POLICY "task_acceptances_select_own"
  ON task_acceptances FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 璁よ瘉鐢ㄦ埛鍙垱寤鸿嚜宸辩殑鎺ュ彈璁板綍
CREATE POLICY "task_acceptances_insert_own"
  ON task_acceptances FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- 鐢ㄦ埛鍙垹闄よ嚜宸辩殑鎺ュ彈璁板綍锛岀鐞嗗憳鍙垹闄ゆ墍鏈?
CREATE POLICY "task_acceptances_delete_own"
  ON task_acceptances FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 绠＄悊鍛樺彲鏇存柊浠诲姟鎺ュ彈璁板綍
CREATE POLICY "task_acceptances_update_admin"
  ON task_acceptances FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 绗叓閮ㄥ垎锛歯otifications 琛ㄧ瓥鐣?
-- 闇€姹?2.6锛氱敤鎴蜂粎鑳借鍙栧拰鏇存柊鑷繁鐨勯€氱煡璁板綍
-- 闇€姹?2.7锛氱鐞嗗憳鍙搷浣滄墍鏈?
-- ============================================================

-- 鐢ㄦ埛鍙兘璇诲彇鑷繁鐨勯€氱煡
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 绯荤粺鎴栫鐞嗗憳鍙垱寤洪€氱煡锛堥€氳繃 service_role 鎴栫鐞嗗憳锛?
CREATE POLICY "notifications_insert"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- 鐢ㄦ埛鍙兘鏇存柊鑷繁鐨勯€氱煡锛堝鏍囪宸茶锛?
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- 鐢ㄦ埛鍙垹闄よ嚜宸辩殑閫氱煡锛岀鐞嗗憳鍙垹闄ゆ墍鏈?
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- ============================================================
-- 绗節閮ㄥ垎锛歛chievements 琛ㄧ瓥鐣?
-- 闇€姹?2.2锛氭湭璁よ瘉鐢ㄦ埛鍙鍙栨垚灏憋紙鍏紑鏁版嵁锛?
-- 璁よ瘉鐢ㄦ埛鍙鍙栨墍鏈夋垚灏憋紝璁よ瘉鐢ㄦ埛鍙垱寤猴紝绠＄悊鍛樺彲瀹屽叏鎿嶄綔
-- ============================================================

-- 鏈璇佺敤鎴峰彲璇诲彇鎴愬氨
CREATE POLICY "achievements_select_anon"
  ON achievements FOR SELECT
  TO anon
  USING (true);

-- 璁よ瘉鐢ㄦ埛鍙鍙栨墍鏈夋垚灏?
CREATE POLICY "achievements_select_authenticated"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- 璁よ瘉鐢ㄦ埛鍙垱寤烘垚灏辫褰曪紝绠＄悊鍛樺彲鍒涘缓鎵€鏈?
CREATE POLICY "achievements_insert_authenticated"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 绠＄悊鍛樺彲鏇存柊鎴愬氨
CREATE POLICY "achievements_update_admin"
  ON achievements FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 绠＄悊鍛樺彲鍒犻櫎鎴愬氨
CREATE POLICY "achievements_delete_admin"
  ON achievements FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================
-- 绗崄閮ㄥ垎锛歱roject_follows 琛ㄧ瓥鐣?
-- 璁よ瘉鐢ㄦ埛鍙搷浣滆嚜宸辩殑鍏虫敞璁板綍
-- ============================================================

-- 璁よ瘉鐢ㄦ埛鍙鍙栧叧娉ㄨ褰?
CREATE POLICY "project_follows_select_authenticated"
  ON project_follows FOR SELECT
  TO authenticated
  USING (true);

-- 璁よ瘉鐢ㄦ埛鍙垱寤鸿嚜宸辩殑鍏虫敞璁板綍
CREATE POLICY "project_follows_insert_own"
  ON project_follows FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- 鐢ㄦ埛鍙彇娑堣嚜宸辩殑鍏虫敞锛岀鐞嗗憳鍙垹闄ゆ墍鏈?
CREATE POLICY "project_follows_delete_own"
  ON project_follows FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- ============================================================
-- 绗崄涓€閮ㄥ垎锛歱roject_participations 琛ㄧ瓥鐣?
-- 璁よ瘉鐢ㄦ埛鍙搷浣滆嚜宸辩殑鍙備笌璁板綍
-- ============================================================

-- 璁よ瘉鐢ㄦ埛鍙鍙栧弬涓庤褰?
CREATE POLICY "project_participations_select_authenticated"
  ON project_participations FOR SELECT
  TO authenticated
  USING (true);

-- 璁よ瘉鐢ㄦ埛鍙垱寤鸿嚜宸辩殑鍙備笌璁板綍
CREATE POLICY "project_participations_insert_own"
  ON project_participations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- 鐢ㄦ埛鍙€€鍑哄弬涓庯紝绠＄悊鍛樺彲鍒犻櫎鎵€鏈?
CREATE POLICY "project_participations_delete_own"
  ON project_participations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 绠＄悊鍛樺彲鏇存柊鍙備笌璁板綍
CREATE POLICY "project_participations_update_admin"
  ON project_participations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 绗崄浜岄儴鍒嗭細click_events 琛ㄧ瓥鐣?
-- 鎵€鏈変汉鍙鍙栫偣鍑讳簨浠讹紝璁よ瘉鐢ㄦ埛鍙啓
-- ============================================================

-- 鏈璇佺敤鎴峰彲璇诲彇鐐瑰嚮浜嬩欢
CREATE POLICY "click_events_select_anon"
  ON click_events FOR SELECT
  TO anon
  USING (true);

-- 璁よ瘉鐢ㄦ埛鍙鍙栫偣鍑讳簨浠?
CREATE POLICY "click_events_select_authenticated"
  ON click_events FOR SELECT
  TO authenticated
  USING (true);

-- 璁よ瘉鐢ㄦ埛鍙褰曠偣鍑讳簨浠?
CREATE POLICY "click_events_insert_authenticated"
  ON click_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 绠＄悊鍛樺彲鏇存柊鍜屽垹闄ょ偣鍑讳簨浠?
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
-- Migration: 003_auto_profile.sql
-- ========================================
-- ============================================================
-- 铚傚发AI瑙嗛鍗忎綔骞冲彴 - Profiles 鑷姩鍒涘缓瑙﹀彂鍣?
-- 褰?auth.users 鏂板璁板綍鏃讹紝鑷姩鍦?profiles 琛ㄥ垱寤哄搴旇褰?
-- name 榛樿涓洪偖绠?@ 鍓嶇紑锛宺ole 榛樿涓?'user'
-- ============================================================

-- 瑙﹀彂鍣ㄥ嚱鏁帮細鑷姩鍒涘缓鐢ㄦ埛 profile
-- 浣跨敤 SECURITY DEFINER 纭繚鏈夋潈闄愭彃鍏?profiles 琛?
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

-- 瑙﹀彂鍣細鍦?auth.users 琛ㄦ彃鍏ユ柊璁板綍鍚庤Е鍙?
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ========================================
-- Migration: 004_storage_bucket.sql
-- ========================================
-- ============================================================
-- 铚傚发AI瑙嗛鍗忎綔骞冲彴 - Supabase Storage Bucket 閰嶇疆
-- 鍒涘缓 media 鍏紑瀛樺偍妗讹紝鐢ㄤ簬瀛樺偍椤圭洰灏侀潰銆佽棰戙€佷换鍔″弬鑰冨浘鐗囥€佺敤鎴峰ご鍍?
-- 閰嶇疆 RLS 绛栫暐锛氬凡璁よ瘉鐢ㄦ埛鍙笂浼犮€佷换浣曚汉鍙鍙栥€佺敤鎴峰彲鍒犻櫎鑷繁鐨勬枃浠?
-- ============================================================

-- 鍒涘缓 media bucket锛堝叕寮€璇诲彇锛?
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- ============================================================
-- Storage RLS 绛栫暐
-- ============================================================

-- 宸茶璇佺敤鎴峰彲涓婁紶鏂囦欢鍒?media bucket
CREATE POLICY "Authenticated users can upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- 浠讳綍浜哄彲璇诲彇 media bucket 涓殑鏂囦欢锛堝叕寮€璁块棶锛?
CREATE POLICY "Public read access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media');

-- 鐢ㄦ埛鍙垹闄よ嚜宸变笂浼犵殑鏂囦欢锛堥€氳繃鏂囦欢璺緞涓殑鐢ㄦ埛ID鍒ゆ柇褰掑睘锛?
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ========================================
-- Migration: 005_payment_balance.sql
-- ========================================
-- ============================================================
-- 铚傚发AI瑙嗛鍗忎綔骞冲彴 - 鏀粯浣欓鐩稿叧琛?
-- user_balances, balance_transactions, recharge_orders
-- ============================================================

-- 1. user_balances 琛細鐢ㄦ埛浣欓
CREATE TABLE user_balances (
  user_id       uuid        PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance_cents integer     NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_balances_user_id ON user_balances(user_id);

-- 2. balance_transactions 琛細浣欓娴佹按
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

-- 3. recharge_orders 琛細鍏呭€艰鍗?
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
-- RLS 绛栫暐
-- ============================================================

ALTER TABLE user_balances           ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_orders         ENABLE ROW LEVEL SECURITY;

-- user_balances: 鐢ㄦ埛鍙兘璇诲啓鑷繁鐨勪綑棰?
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

-- balance_transactions: 鐢ㄦ埛鍙兘璇昏嚜宸辩殑娴佹按
CREATE POLICY "balance_transactions_select_own"
  ON balance_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 鎻掑叆鐢辨湇鍔＄ API 瀹屾垚锛堜娇鐢?service role锛夛紝涓嶅紑鏀剧粰瀹㈡埛绔?
CREATE POLICY "balance_transactions_insert_service"
  ON balance_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- recharge_orders: 鐢ㄦ埛鍙兘璇诲啓鑷繁鐨勮鍗?
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
-- 鏂扮敤鎴疯嚜鍔ㄥ垱寤轰綑棰濊褰?
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

-- 涓哄凡鏈?profiles 琛ュ叏 user_balances
INSERT INTO user_balances (user_id, balance_cents)
SELECT id, 0 FROM profiles
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 鍘熷瓙鎵ｆ鍑芥暟锛堝彂甯冧换鍔℃椂浣跨敤锛?
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
-- Migration: 006_pingpp_charge.sql
-- ========================================
-- ============================================================
-- 鏀粯瀵规帴锛歳echarge_orders 琛ㄦ墿灞曪紙鑷缓鏀粯瀹?寰俊绛夛級
-- 鏂板 pingpp_charge_id 瀛樺偍澶栭儴浜ゆ槗鍙凤紙濡傛敮浠樺疂 trade_no锛?
-- ============================================================

-- 1. 鍒犻櫎鏃х殑 payment_channel 绾︽潫
ALTER TABLE recharge_orders DROP CONSTRAINT IF EXISTS recharge_orders_payment_channel_check;

-- 2. 鏂板 pingpp_charge_id 鍒楋紙瀛樺偍鏀粯娓犻亾杩斿洖鐨勪氦鏄撳彿锛屽鏀粯瀹?trade_no锛?
ALTER TABLE recharge_orders ADD COLUMN IF NOT EXISTS pingpp_charge_id text;

-- 3. 鎵╁睍 payment_channel 鏀寔 alipay_pc, alipay_wap, wx_pub 绛?
ALTER TABLE recharge_orders ADD CONSTRAINT recharge_orders_payment_channel_check
  CHECK (payment_channel IN (
    'mock', 'alipay', 'wechat',
    'alipay_pc', 'alipay_wap', 'wx_pub', 'wx_pub_qr'
  ));

-- 4. 绱㈠紩渚夸簬 Webhook 鍥炶皟鏌ヨ
CREATE INDEX IF NOT EXISTS idx_recharge_orders_pingpp_charge_id
  ON recharge_orders(pingpp_charge_id) WHERE pingpp_charge_id IS NOT NULL;


-- ========================================
-- Migration: 007_wx_native_channel.sql
-- ========================================
-- 鏀寔寰俊 Native 鎵爜鏀粯娓犻亾
ALTER TABLE recharge_orders DROP CONSTRAINT IF EXISTS recharge_orders_payment_channel_check;
ALTER TABLE recharge_orders ADD CONSTRAINT recharge_orders_payment_channel_check
  CHECK (payment_channel IN (
    'mock', 'alipay', 'wechat',
    'alipay_pc', 'alipay_wap', 'wx_pub', 'wx_pub_qr', 'wx_native'
  ));


-- ========================================
-- Migration: 008_payment_go_live.sql
-- ========================================
-- ============================================================
-- 铚傚发AI瑙嗛鍗忎綔骞冲彴 - 鏀粯绯荤粺涓婄嚎杩佺Щ
-- 1. 灏?pingpp_charge_id 閲嶅懡鍚嶄负 external_trade_no
-- 2. 鏀剁揣 payment_channel 绾︽潫锛屼粎淇濈暀鏈夋晥娓犻亾
-- 3. 鍒涘缓 confirm_recharge_order 鍘熷瓙鍏呭€肩‘璁ゅ嚱鏁?
-- ============================================================

-- ============================================================
-- 绗竴姝ワ細灏?pingpp_charge_id 鍒楅噸鍛藉悕涓?external_trade_no
-- 璇存槑锛氬師鍒楀悕婧愯嚜 Ping++ 鏃朵唬锛岀幇宸叉敼涓鸿嚜寤烘敮浠樺鎺ワ紝
--       璇ュ垪瀹為檯瀛樺偍鏀粯瀹?trade_no 鎴栧井淇?transaction_id锛?
--       閲嶅懡鍚嶅悗鏇村噯纭弽鏄犵敤閫斻€侫LTER COLUMN RENAME 淇濈暀鍘熸湁鏁版嵁銆?
-- ============================================================

ALTER TABLE recharge_orders RENAME COLUMN pingpp_charge_id TO external_trade_no;

-- 鍚屾閲嶅懡鍚嶇储寮曪紙PostgreSQL 涓嶄細鑷姩閲嶅懡鍚嶇储寮曪級
ALTER INDEX IF EXISTS idx_recharge_orders_pingpp_charge_id
  RENAME TO idx_recharge_orders_external_trade_no;

-- ============================================================
-- 绗簩姝ワ細鏀剁揣 payment_channel 绾︽潫
-- 绉婚櫎涓嶅啀浣跨敤鐨勬笭閬撳€硷紙alipay, wechat, wx_pub, wx_pub_qr锛夛紝
-- 浠呬繚鐣?mock銆乤lipay_pc銆乤lipay_wap銆亀x_native
-- ============================================================

ALTER TABLE recharge_orders DROP CONSTRAINT IF EXISTS recharge_orders_payment_channel_check;

ALTER TABLE recharge_orders ADD CONSTRAINT recharge_orders_payment_channel_check
  CHECK (payment_channel IN ('mock', 'alipay_pc', 'alipay_wap', 'wx_native'));

-- ============================================================
-- 绗笁姝ワ細鍒涘缓 confirm_recharge_order 鍘熷瓙鍏呭€肩‘璁ゅ嚱鏁?
-- 鍦ㄥ崟涓簨鍔′腑瀹屾垚锛?
--   1. 妫€鏌ヨ鍗曠姸鎬佷负 pending锛堜娇鐢?FOR UPDATE 琛岄攣闃叉骞跺彂锛?
--   2. 鏇存柊璁㈠崟鐘舵€佷负 paid锛岃褰曞閮ㄤ氦鏄撳彿鍜屾敮浠樻椂闂?
--   3. 鎻掑叆 balance_transactions 鍏呭€兼祦姘?
--   4. upsert user_balances 浣欓锛堝師瀛愬鍔狅級
--   5. 杩斿洖鎿嶄綔缁撴灉鍜屾柊浣欓
--
-- 骞跺彂瀹夊叏锛氫娇鐢?SELECT ... FOR UPDATE 琛岄攣锛岀‘淇濆悓涓€璁㈠崟
-- 鍙湁涓€涓簨鍔¤兘鎴愬姛澶勭悊锛屽叾浠栧苟鍙戣皟鐢ㄤ細绛夊緟閿侀噴鏀惧悗
-- 鍙戠幇鐘舵€佸凡闈?pending 鑰岃繑鍥炲け璐ャ€?
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
  -- 1. 鍔犺閿佽鍙栬鍗曪紝闃叉骞跺彂澶勭悊鍚屼竴璁㈠崟
  SELECT *
    INTO v_order
    FROM recharge_orders
   WHERE id = p_order_id
     FOR UPDATE;

  -- 璁㈠崟涓嶅瓨鍦?
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success',   false,
      'new_balance', 0,
      'error_msg', '璁㈠崟涓嶅瓨鍦?
    );
  END IF;

  -- 璁㈠崟宸叉敮浠橈紙骞傜瓑澶勭悊锛氶噸澶嶅洖璋冪洿鎺ヨ繑鍥炴垚鍔燂級
  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object(
      'success',   true,
      'new_balance', 0,
      'error_msg', '璁㈠崟宸叉敮浠?
    );
  END IF;

  -- 璁㈠崟鐘舵€侀潪 pending锛屾嫆缁濆鐞?
  IF v_order.status <> 'pending' THEN
    RETURN jsonb_build_object(
      'success',   false,
      'new_balance', 0,
      'error_msg', '璁㈠崟鐘舵€佸紓甯? ' || v_order.status
    );
  END IF;

  -- 閲戦鏍￠獙锛氬洖璋冮噾棰濆繀椤讳笌璁㈠崟閲戦涓€鑷?
  IF v_order.amount_cents <> p_expected_amount THEN
    RETURN jsonb_build_object(
      'success',   false,
      'new_balance', 0,
      'error_msg', '閲戦涓嶅尮閰? 璁㈠崟=' || v_order.amount_cents || ', 鍥炶皟=' || p_expected_amount
    );
  END IF;

  -- 2. 鏇存柊璁㈠崟鐘舵€佷负 paid
  UPDATE recharge_orders
     SET status           = 'paid',
         paid_at          = now(),
         external_trade_no = p_trade_no
   WHERE id = p_order_id;

  -- 3. 鎻掑叆鍏呭€兼祦姘?
  INSERT INTO balance_transactions (user_id, amount_cents, type, related_id)
  VALUES (v_order.user_id, v_order.amount_cents, 'recharge', p_order_id::text);

  -- 4. upsert 鐢ㄦ埛浣欓锛堝師瀛愬鍔狅級
  INSERT INTO user_balances (user_id, balance_cents, updated_at)
  VALUES (v_order.user_id, v_order.amount_cents, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance_cents = user_balances.balance_cents + EXCLUDED.balance_cents,
    updated_at    = now()
  RETURNING balance_cents INTO v_new_bal;

  -- 5. 杩斿洖鎴愬姛缁撴灉鍜屾柊浣欓
  RETURN jsonb_build_object(
    'success',   true,
    'new_balance', v_new_bal,
    'error_msg', ''
  );
END;
$$;


-- ========================================
-- Migration: 009_feedbacks.sql
-- ========================================
-- ============================================================
-- 鐢ㄦ埛鍙嶉鍔熻兘
-- 1. 鏂板缓 feedbacks 琛?
-- 2. 鎵╁睍 notifications 琛ㄧ殑 type 绾︽潫锛屽鍔?feedback_replied
-- ============================================================

-- 1. feedbacks 琛細鐢ㄦ埛鍙嶉
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

-- 绱㈠紩
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_status  ON feedbacks(status);

-- 2. 鎵╁睍 notifications 琛ㄧ殑 type CHECK 绾︽潫
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('task_completed', 'contribution_accepted', 'feedback_replied'));

-- 3. RLS 绛栫暐
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 鐢ㄦ埛鍙互鏌ョ湅鑷繁鐨勫弽棣?
CREATE POLICY "Users can view own feedbacks"
  ON feedbacks FOR SELECT
  USING (auth.uid() = user_id);

-- 鐢ㄦ埛鍙互鍒涘缓鍙嶉
CREATE POLICY "Users can create feedbacks"
  ON feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 绠＄悊鍛樺彲浠ユ煡鐪嬫墍鏈夊弽棣堬紙閫氳繃 service role 鎴?profiles.role 鍒ゆ柇锛?
CREATE POLICY "Admins can view all feedbacks"
  ON feedbacks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 绠＄悊鍛樺彲浠ユ洿鏂板弽棣堢姸鎬?
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
-- Migration: 010_project_expiry_and_review.sql
-- ========================================
-- ============================================================
-- 铚傚发AI瑙嗛鍗忎綔骞冲彴 - 椤圭洰杩囨湡鏈哄埗鍜屽唴瀹瑰鏍?
-- 1. 娣诲姞 expires_at 瀛楁锛堥」鐩竴涓湀鍚庤繃鏈燂級
-- 2. 娣诲姞 review_status 瀛楁锛堝唴瀹瑰鏍哥姸鎬侊級
-- ============================================================

-- 1. 涓?projects 琛ㄦ坊鍔?expires_at 瀛楁
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- 涓哄凡瀛樺湪鐨勯」鐩缃?expires_at锛堝垱寤烘椂闂?+ 30澶╋級
UPDATE projects 
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;

-- 璁剧疆榛樿鍊硷細鏂伴」鐩垱寤烘椂鑷姩璁剧疆涓?0澶╁悗杩囨湡
ALTER TABLE projects 
ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '30 days');

-- 2. 涓?projects 琛ㄦ坊鍔?review_status 瀛楁
ALTER TABLE projects ADD COLUMN IF NOT EXISTS review_status text 
DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected'));

-- 涓哄凡瀛樺湪鐨勯」鐩缃?review_status 涓?approved锛堜繚鎸佸悜鍚庡吋瀹癸級
UPDATE projects 
SET review_status = 'approved'
WHERE review_status IS NULL OR review_status = 'pending';

-- 3. 涓?tasks 琛ㄦ坊鍔?review_status 瀛楁
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS review_status text 
DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected'));

-- 涓哄凡瀛樺湪鐨勪换鍔¤缃?review_status 涓?approved
UPDATE tasks 
SET review_status = 'approved'
WHERE review_status IS NULL OR review_status = 'pending';

-- 4. 鍒涘缓绱㈠紩浠ヤ紭鍖栨煡璇?
CREATE INDEX IF NOT EXISTS idx_projects_expires_at ON projects(expires_at);
CREATE INDEX IF NOT EXISTS idx_projects_review_status ON projects(review_status);
CREATE INDEX IF NOT EXISTS idx_tasks_review_status ON tasks(review_status);

-- 5. 鍒涘缓椤圭洰杩囨湡鐘舵€佸瓧娈?(杞垹闄ゆ爣璁?
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_expired boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_projects_is_expired ON projects(is_expired);

-- 6. 鍒涘缓鍑芥暟锛氭爣璁拌繃鏈熼」鐩?
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

-- 7. 鍒涘缓鍑芥暟锛氬鏍搁」鐩紙绠＄悊鍛樹娇鐢級
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
  -- 妫€鏌ョ鐞嗗憳鏉冮檺
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

-- 8. 鍒涘缓鍑芥暟锛氬鏍镐换鍔★紙绠＄悊鍛樹娇鐢級
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
  -- 妫€鏌ョ鐞嗗憳鏉冮檺
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

-- 9. 鍒涘缓鍑芥暟锛氭壒閲忓鏍搁」鐩?
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
  -- 妫€鏌ョ鐞嗗憳鏉冮檺
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

-- 10. 鍒涘缓鍑芥暟锛氭壒閲忓鏍镐换鍔?
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
  -- 妫€鏌ョ鐞嗗憳鏉冮檺
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



