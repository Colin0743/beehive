# V1.2.4 版本更新说明

**发布日期**: 2026-02-16
**版本号**: V1.2.4

## 1. 概览
本次更新主要集中在系统稳定性的提升和部署流程的优化。修复了多个核心业务模块的 500 内部服务器错误，并针对特定服务器环境实现了基于 SSH 密码认证的自动化部署方案。

## 2. 缺陷修复 (Bug Fixes)

### 2.1 项目创建 (Projects)
- **问题描述**: 创建新项目时服务器返回 500 错误。
- **原因分析**: 数据库写入时缺少关联的用户 `profile` 信息。
- **修复方案**: 在 `/api/projects` 接口中增加了 `profile` 的 `upsert` (更新或插入) 逻辑，确保在创建项目前用户档案已存在。

### 2.2 点击事件 (Click Events)
- **问题描述**: 记录点击事件时服务器返回 500 错误。
- **原因分析**: 时间戳处理逻辑在特定情况下引发异常。
- **修复方案**: 优化了 `/api/click-events` 中的时间戳解析和处理逻辑。

### 2.3 成就系统 (Achievements)
- **问题描述**: 访问成就相关接口时服务器返回 500 错误。
- **原因分析**: 接口未正确处理非 UUID 格式的项目 ID，导致数据库查询崩溃。
- **修复方案**: 在 `/api/achievements` 接口中增加了对项目 ID 格式的校验，防止无效 ID 触发数据库错误。

### 2.4 页面加载异常 (Page Loader)
- **问题描述**: 首页加载时出现 `TypeError: Cannot read properties of null (reading 'useContext')`，导致页面白屏。
- **原因分析**: `PageLoader` 组件中的 `PathnameContext` 在某些渲染阶段为空。
- **修复方案**: 暂时在 `src/app/layout.tsx` 中禁用了 `PageLoader` 组件，优先保证系统可用性和页面正常渲染。

## 3. 部署优化 (Deployment)

### 3.1 自动化 SSH 部署
- **新增脚本**: `deploy_with_expect.exp`
- **功能**: 支持基于密码认证的 SSH 自动化部署（替代了原有的密钥认证或手动操作）。
- **流程**:
    1. 自动处理 SSH 登录交互。
    2. 使用 SCP 上传部署包。
    3. 远程执行解压、依赖安装、构建和服务重启。

### 3.2 依赖与构建调整
- **NPM 镜像源**: 部署脚本中强制指定使用官方 NPM 源 (`registry.npmjs.org`)，解决了国内镜像源缺失部分依赖包 (`yn` 等) 的问题。
- **构建依赖**: 调整生产环境安装命令为 `npm install --include=dev`，确保 `jest` 等构建所需的开发依赖在服务器上可用。

## 4. 文件变更清单
- `src/app/api/projects/route.ts`
- `src/app/api/click-events/route.ts`
- `src/app/api/achievements/route.ts`
- `src/app/layout.tsx`
- `deploy_with_expect.exp` (新增)

# V1.2.3 版本更新说明

**发布日期**: 未记录
**版本号**: V1.2.3

## 1. 概览
本次更新新增了问题反馈功能与管理后台处理流程，并补充了相关的通知类型与前端交互文案。

## 2. 新增功能 (Features)

### 2.1 用户反馈 (Feedbacks)
- **功能**: 用户可提交问题反馈（类型、描述、图片）。
- **管理**: 管理员可查看并处理反馈，支持回复内容。
- **通知**: 反馈处理完成后自动向用户发送通知。

### 2.2 通知类型扩展 (Notifications)
- **新增类型**: `feedback_replied`，用于反馈处理结果提醒。

### 2.3 数据库变更 (Database)
- **新增表**: `feedbacks`
- **约束与策略**: 扩展 `notifications` 的 `type` 约束，并为 `feedbacks` 添加 RLS 策略。

## 3. 文件变更清单
- `supabase/migrations/009_feedbacks.sql`
- `src/app/api/feedbacks/route.ts`
- `src/components/FeedbackModal.tsx`
- `src/app/admin/feedbacks/page.tsx`
- `src/lib/api.ts`
- `src/types/index.ts`
- `src/lib/i18n.ts`
