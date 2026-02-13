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
