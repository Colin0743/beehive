# 需求文档：项目任务详情弹窗

## 简介

本功能为项目详情页面的任务模块添加任务详情弹窗，允许用户点击任务卡片查看完整的任务信息。该功能复用任务大厅页面的 TaskDetailModal 设计，但需要适配项目详情页面的特殊需求，包括创建者的编辑和删除权限。

## 术语表

- **TaskCard**: 任务卡片组件，显示任务的基本信息
- **TaskDetailModal**: 任务详情模态框组件，显示任务的完整信息
- **Project_Owner**: 项目创建者，拥有编辑和删除项目任务的权限
- **System**: 蜂巢平台系统
- **User**: 平台用户
- **Modal**: 模态框，覆盖在页面内容之上的弹出层

## 需求

### 需求 1：任务卡片点击交互

**用户故事：** 作为用户，我想点击任务卡片查看完整的任务详情，以便了解任务的所有信息。

#### 验收标准

1. WHEN User 点击 TaskCard THEN THE System SHALL 打开 TaskDetailModal 并显示该任务的完整信息
2. WHEN TaskDetailModal 打开 THEN THE System SHALL 阻止背景页面滚动
3. WHEN User 点击模态框外部区域 THEN THE System SHALL 关闭 TaskDetailModal
4. WHEN User 点击关闭按钮 THEN THE System SHALL 关闭 TaskDetailModal
5. WHEN TaskDetailModal 关闭 THEN THE System SHALL 恢复背景页面滚动

### 需求 2：任务详情内容展示

**用户故事：** 作为用户，我想在详情弹窗中查看任务的所有信息，以便全面了解任务要求。

#### 验收标准

1. WHEN TaskDetailModal 显示 THEN THE System SHALL 展示所有参考图片（如果存在）
2. WHEN TaskDetailModal 显示 THEN THE System SHALL 展示完整的任务提示词
3. WHEN TaskDetailModal 显示 THEN THE System SHALL 展示任务要求说明（如果存在）
4. WHEN TaskDetailModal 显示 THEN THE System SHALL 展示创建者邮箱
5. WHEN TaskDetailModal 显示 THEN THE System SHALL 展示任务时长
6. WHEN TaskDetailModal 显示 THEN THE System SHALL 展示项目名称
7. WHEN TaskDetailModal 显示 THEN THE System SHALL 展示项目分类

### 需求 3：复制功能

**用户故事：** 作为用户，我想快速复制任务的关键信息，以便在其他地方使用。

#### 验收标准

1. WHEN User 点击提示词复制按钮 THEN THE System SHALL 将完整提示词复制到剪贴板
2. WHEN User 点击要求复制按钮 THEN THE System SHALL 将任务要求复制到剪贴板
3. WHEN User 点击邮箱复制按钮 THEN THE System SHALL 将创建者邮箱复制到剪贴板
4. WHEN 复制操作成功 THEN THE System SHALL 显示成功提示消息

### 需求 4：项目创建者操作权限

**用户故事：** 作为项目创建者，我想在任务详情弹窗中管理我的任务，以便快速编辑或删除任务。

#### 验收标准

1. WHERE User 是 Project_Owner WHEN TaskDetailModal 显示草稿任务 THEN THE System SHALL 显示编辑按钮
2. WHERE User 是 Project_Owner WHEN TaskDetailModal 显示草稿任务 THEN THE System SHALL 显示删除按钮
3. WHERE User 是 Project_Owner WHEN TaskDetailModal 显示草稿任务 THEN THE System SHALL 显示发布按钮
4. WHERE User 是 Project_Owner WHEN TaskDetailModal 显示已发布任务 THEN THE System SHALL 显示完成按钮
5. WHERE User 是 Project_Owner WHEN User 点击编辑按钮 THEN THE System SHALL 关闭 TaskDetailModal 并打开任务编辑表单
6. WHERE User 是 Project_Owner WHEN User 点击删除按钮 THEN THE System SHALL 显示确认对话框
7. WHERE User 是 Project_Owner WHEN User 确认删除 THEN THE System SHALL 删除任务并关闭 TaskDetailModal
8. WHERE User 是 Project_Owner WHEN User 点击发布按钮 THEN THE System SHALL 将任务状态更改为已发布并刷新显示
9. WHERE User 是 Project_Owner WHEN User 点击完成按钮 THEN THE System SHALL 关闭 TaskDetailModal 并打开完成任务对话框

### 需求 5：普通用户接受任务

**用户故事：** 作为普通用户，我想在任务详情弹窗中接受任务，以便参与项目。

#### 验收标准

1. WHERE User 不是 Project_Owner WHEN TaskDetailModal 显示已发布任务 THEN THE System SHALL 显示接受任务按钮
2. WHERE User 已登录 WHEN User 点击接受任务按钮 THEN THE System SHALL 记录用户接受该任务
3. WHERE User 未登录 WHEN User 点击接受任务按钮 THEN THE System SHALL 跳转到登录页面
4. WHERE User 已接受任务 WHEN TaskDetailModal 显示 THEN THE System SHALL 显示已接受状态并禁用接受按钮

### 需求 6：视觉反馈和动画

**用户故事：** 作为用户，我想获得流畅的视觉反馈，以便获得良好的使用体验。

#### 验收标准

1. WHEN TaskDetailModal 打开 THEN THE System SHALL 播放缩放进入动画
2. WHEN TaskDetailModal 显示 THEN THE System SHALL 显示半透明黑色遮罩背景
3. WHEN User 悬停在关闭按钮上 THEN THE System SHALL 改变按钮颜色提供视觉反馈
4. WHEN User 悬停在操作按钮上 THEN THE System SHALL 改变按钮样式提供视觉反馈

### 需求 7：响应式设计

**用户故事：** 作为用户，我想在不同设备上都能正常查看任务详情，以便随时随地使用。

#### 验收标准

1. WHEN TaskDetailModal 在移动设备上显示 THEN THE System SHALL 调整弹窗宽度适应屏幕
2. WHEN TaskDetailModal 内容超过视口高度 THEN THE System SHALL 允许弹窗内容垂直滚动
3. WHEN TaskDetailModal 显示 THEN THE System SHALL 限制最大高度为视口高度的 90%
4. WHEN TaskDetailModal 显示 THEN THE System SHALL 在小屏幕上保持适当的内边距

### 需求 8：图片展示

**用户故事：** 作为用户，我想查看任务的所有参考图片，以便更好地理解任务要求。

#### 验收标准

1. WHEN 任务包含多张参考图片 THEN THE System SHALL 以网格布局展示所有图片
2. WHEN 参考图片显示 THEN THE System SHALL 限制图片最大高度为 240px
3. WHEN 参考图片显示 THEN THE System SHALL 保持图片宽高比
4. WHEN 参考图片显示 THEN THE System SHALL 应用圆角样式保持视觉一致性
