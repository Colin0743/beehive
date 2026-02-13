# 实现计划：Supabase Storage 迁移

## 概述

将媒体文件存储从数据库 base64 迁移到 Supabase Storage。按照"基础设施 → 工具函数 → 上传 API → 前端改造"的顺序逐步实现。

## 任务

- [x] 1. 创建 Storage Bucket SQL migration 脚本
  - 创建 `supabase/migrations/004_storage_bucket.sql`
  - 创建 `media` 公开 bucket
  - 添加 RLS 策略：已认证用户可上传、任何人可读取、用户可删除自己的文件
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. 创建文件上传工具和 API
  - [x] 2.1 创建前端上传工具函数 `src/lib/upload.ts`
    - 实现 `uploadFile(file: File): Promise<string>` 函数，调用 Upload API 并返回 URL
    - 实现 `isBase64(str: string): boolean` 函数，判断字符串是否为 base64 格式
    - 实现文件类型和大小的客户端预验证
    - _Requirements: 2.1, 2.2, 2.3, 3.3, 4.3, 5.2, 6.2_

  - [ ]* 2.2 为上传工具函数编写属性测试
    - **Property 1: 非法文件类型被拒绝**
    - **Property 2: 超大文件被拒绝**
    - **Property 3: 文件路径唯一性**
    - **Property 4: base64 与 URL 格式正确识别**
    - **Validates: Requirements 2.2, 2.3, 2.4, 3.3, 4.3, 5.2, 6.2**

  - [x] 2.3 创建服务端上传 API Route `src/app/api/upload/route.ts`
    - 实现 POST handler，接收 FormData
    - 验证用户认证、文件类型、文件大小
    - 使用 `{userId}/{timestamp}_{randomId}.{ext}` 格式生成唯一路径
    - 上传到 Supabase Storage `media` bucket
    - 返回 Public URL
    - 配置 Next.js route segment config 以支持大文件上传
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. 检查点 - 确保上传 API 和工具函数就绪
  - 确保所有测试通过，如有问题请询问用户。

- [x] 4. 改造创建项目页面
  - 修改 `src/app/projects/new/page.tsx`
  - 封面图片：选择文件后调用 `uploadFile` 获取 URL，存入 formData.coverImage
  - 视频文件：选择文件后调用 `uploadFile` 获取 URL，存入 formData.videoFile
  - 移除 `compressImage` 和 `FileReader.readAsDataURL` 的 base64 转换逻辑
  - 添加上传中的 loading 状态
  - _Requirements: 3.1, 4.1, 7.1, 7.2, 7.3_

- [x] 5. 改造编辑项目页面
  - 修改 `src/app/projects/edit/[id]/page.tsx`
  - 封面图片和视频文件上传改为调用 `uploadFile`
  - 移除 `compressImage` 和 base64 转换逻辑
  - 添加上传中的 loading 状态
  - 保持对已有 base64 数据的显示兼容
  - _Requirements: 3.2, 3.3, 4.2, 4.3, 7.1, 7.2, 7.3_

- [x] 6. 改造个人设置页面
  - 修改 `src/app/profile/page.tsx`
  - 头像上传改为调用 `uploadFile` 获取 URL
  - 移除 `FileReader.readAsDataURL` 的 base64 转换逻辑
  - 添加上传中的 loading 状态
  - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3_

- [x] 7. 改造任务表单组件
  - 修改 `src/components/TaskForm.tsx`
  - 参考图片上传改为逐张调用 `uploadFile` 获取 URL 数组
  - 移除 `compressImage` 的 base64 转换逻辑
  - 添加上传中的 loading 状态
  - _Requirements: 5.1, 5.2, 7.1, 7.2, 7.3_

- [x] 8. 最终检查点 - 确保所有改造完成
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 进度
- 数据库 schema 无需修改，text 字段天然兼容 URL 和 base64
- 已有的 base64 数据无需迁移，显示时 `<img src>` 和 `<video src>` 天然兼容两种格式
- 属性测试使用 `fast-check` 库
- 项目当前没有测试框架，属性测试任务为可选
