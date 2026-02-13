# 需求文档

## 简介

当前蜂巢平台将所有媒体文件（项目封面图片、视频文件、任务参考图片、用户头像）以 base64 字符串存储在 Supabase 数据库的 text 字段中。这导致创建/更新项目时 JSON payload 巨大（几百KB到几MB），请求耗时十几秒，数据库体积膨胀，页面加载缓慢。本次迁移将所有文件存储到 Supabase Storage（对象存储），数据库字段改为存储公开 URL，从根本上解决性能问题。

## 术语表

- **Storage_Service**: Supabase Storage 对象存储服务，用于存储和提供媒体文件
- **Upload_API**: 服务端文件上传 API 路由，接收文件并上传到 Storage_Service，返回公开 URL
- **Media_File**: 平台中的媒体文件，包括项目封面图片、视频文件、任务参考图片、用户头像
- **Public_URL**: Storage_Service 返回的文件公开访问地址
- **Base64_String**: 以 data:image 或 data:video 开头的 base64 编码字符串（旧格式）
- **Storage_Bucket**: Supabase Storage 中的存储桶，用于组织和管理文件

## 需求

### 需求 1：创建 Storage Bucket 和访问策略

**用户故事：** 作为平台运维人员，我希望有一个配置好的 Supabase Storage Bucket，以便媒体文件可以安全地存储和公开访问。

#### 验收标准

1. THE Storage_Service SHALL 提供一个名为 `media` 的公开 Storage_Bucket 用于存储所有 Media_File
2. THE Storage_Service SHALL 允许已认证用户上传文件到 Storage_Bucket
3. THE Storage_Service SHALL 允许任何人通过 Public_URL 读取 Storage_Bucket 中的文件
4. THE Storage_Service SHALL 通过 SQL migration 脚本创建 Storage_Bucket 和对应的 RLS 策略

### 需求 2：服务端文件上传 API

**用户故事：** 作为前端开发者，我希望有一个统一的服务端文件上传接口，以便前端可以将文件上传到 Storage_Service 并获取 Public_URL。

#### 验收标准

1. WHEN 前端发送文件到 Upload_API，THE Upload_API SHALL 将文件上传到 Storage_Service 并返回对应的 Public_URL
2. WHEN 上传的文件类型不在允许列表中（图片：jpeg/png/gif，视频：mp4/quicktime），THE Upload_API SHALL 返回明确的错误信息并拒绝上传
3. WHEN 上传的文件大小超过限制（图片 5MB，视频 50MB），THE Upload_API SHALL 返回明确的错误信息并拒绝上传
4. THE Upload_API SHALL 使用唯一的文件路径（包含用户ID和时间戳）存储文件，避免文件名冲突
5. WHEN 用户未认证时调用 Upload_API，THE Upload_API SHALL 返回 401 未认证错误

### 需求 3：项目封面图片迁移到 Storage

**用户故事：** 作为项目创建者，我希望上传封面图片时速度更快，以便创建项目的体验更流畅。

#### 验收标准

1. WHEN 用户在创建项目页面选择封面图片，THE 系统 SHALL 先将图片文件上传到 Storage_Service 获取 Public_URL，再将 Public_URL 存入数据库的 cover_image 字段
2. WHEN 用户在编辑项目页面更换封面图片，THE 系统 SHALL 将新图片上传到 Storage_Service 并用新的 Public_URL 替换数据库中的旧值
3. WHEN 显示项目封面图片时，THE 系统 SHALL 同时兼容 Base64_String 格式和 Public_URL 格式的 cover_image 值

### 需求 4：项目视频文件迁移到 Storage

**用户故事：** 作为项目创建者，我希望上传视频文件时不再因为 payload 过大而等待十几秒。

#### 验收标准

1. WHEN 用户在创建项目页面选择视频文件，THE 系统 SHALL 先将视频文件上传到 Storage_Service 获取 Public_URL，再将 Public_URL 存入数据库的 video_file 字段
2. WHEN 用户在编辑项目页面更换视频文件，THE 系统 SHALL 将新视频上传到 Storage_Service 并用新的 Public_URL 替换数据库中的旧值
3. WHEN 显示项目视频时，THE 系统 SHALL 同时兼容 Base64_String 格式和 Public_URL 格式的 video_file 值

### 需求 5：任务参考图片迁移到 Storage

**用户故事：** 作为任务创建者，我希望上传参考图片时更快速，以便高效地创建任务。

#### 验收标准

1. WHEN 用户在任务表单中上传参考图片，THE 系统 SHALL 将每张图片上传到 Storage_Service 获取 Public_URL，再将 Public_URL 数组存入数据库的 reference_images 字段
2. WHEN 显示任务参考图片时，THE 系统 SHALL 同时兼容 Base64_String 格式和 Public_URL 格式的 reference_images 数组元素

### 需求 6：用户头像迁移到 Storage

**用户故事：** 作为平台用户，我希望更换头像时响应更快。

#### 验收标准

1. WHEN 用户在个人设置页面选择新头像，THE 系统 SHALL 将头像图片上传到 Storage_Service 获取 Public_URL，再将 Public_URL 存入数据库的 avatar 字段
2. WHEN 显示用户头像时，THE 系统 SHALL 同时兼容 Base64_String 格式和 Public_URL 格式的 avatar 值

### 需求 7：前端上传体验

**用户故事：** 作为用户，我希望在上传文件时能看到上传进度，以便了解上传状态。

#### 验收标准

1. WHILE 文件正在上传到 Storage_Service，THE 系统 SHALL 显示上传中的加载状态，禁止用户重复提交
2. IF 文件上传到 Storage_Service 失败，THEN THE 系统 SHALL 显示明确的错误提示信息并允许用户重试
3. WHEN 文件上传成功，THE 系统 SHALL 显示文件预览（图片显示缩略图，视频显示播放器）
