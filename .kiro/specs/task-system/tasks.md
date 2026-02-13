# 实现计划：任务系统

## 概述

基于现有的 Next.js 14 + TypeScript + localStorage 架构，增量实现任务系统。从数据层开始，逐步构建 UI 组件和页面，最后集成和清理旧代码。

## 任务

- [x] 1. 定义类型和扩展数据模型
  - [x] 1.1 在 `src/types/index.ts` 中新增 Task、TaskStatus、TaskAcceptance、Notification、Achievement 类型定义，并扩展 Project 接口添加 `tasks?: Task[]` 字段
    - 定义 TaskStatus 类型别名、Task 接口、TaskAcceptance 接口、Notification 接口、Achievement 接口
    - _Requirements: 1.1, 12.1_

- [x] 2. 实现任务存储层
  - [x] 2.1 在 `src/lib/storage.ts` 中实现 `taskStorage` 模块
    - 实现 getTasksByProject、createTask（含 10 个上限校验）、updateTask、deleteTask、reorderTasks、getAllPublishedTasks
    - 复用现有的 safeSetItem/safeGetItem 模式和 StorageResult 返回类型
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 4.1, 4.2, 4.3_

  - [ ]* 2.2 编写 taskStorage 的属性测试
    - **Property 1: 任务创建往返一致性**
    - **Property 2: 任务编辑在所有状态下持久化**
    - **Property 3: 任务删除从存储中移除**
    - **Property 4: 任务重排序持久化**
    - **Property 15: 任务 JSON 序列化往返**
    - **Property 16: 损坏 JSON 数据错误处理**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.5, 1.6, 12.3, 12.4**

  - [x] 2.3 在 `src/lib/storage.ts` 中实现 `taskAcceptanceStorage` 模块
    - 实现 acceptTask、getAcceptances、hasUserAccepted、getUserAcceptedTaskIds
    - 存储 key 格式：`taskAcceptances_{taskId}`
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ]* 2.4 编写 taskAcceptanceStorage 的属性测试
    - **Property 7: 任务接受往返一致性**
    - **Validates: Requirements 3.1, 3.3, 3.4**

- [x] 3. 实现通知存储层
  - [x] 3.1 在 `src/lib/storage.ts` 中实现 `notificationStorage` 模块
    - 实现 getNotifications（按时间倒序）、createNotification、markAsRead、getUnreadCount
    - 存储 key 格式：`notifications_{userId}`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 3.2 编写 notificationStorage 的属性测试
    - **Property 11: 通知未读计数准确性**
    - **Property 12: 通知按时间倒序排列**
    - **Validates: Requirements 6.1, 6.2, 6.6**

- [x] 4. 实现成就存储层
  - [x] 4.1 在 `src/lib/storage.ts` 中实现 `achievementStorage` 模块
    - 实现 createAchievement、getByProject、getByContributor
    - 存储 key：`achievements`
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 4.2 编写 achievementStorage 的属性测试
    - **Property 13: 成就按项目过滤**
    - **Property 14: 成就按贡献者过滤**
    - **Validates: Requirements 7.2, 7.3**

- [x] 5. 检查点 - 确保存储层测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 6. 添加 i18n 翻译
  - [x] 6.1 在 `src/lib/i18n.ts` 中为任务系统添加中英文翻译键值
    - 包含任务相关、通知相关、成就相关、任务大厅相关的所有用户可见文本
    - _Requirements: 11.1, 11.2_

- [x] 7. 实现任务管理 UI 组件
  - [x] 7.1 创建 `src/components/TaskForm.tsx` 任务创建/编辑表单组件
    - 模态框形式，包含提示词文本、参考图片上传、任务需求、创建者邮箱字段
    - 表单验证：提示词必填、邮箱格式校验
    - _Requirements: 1.1, 1.2_

  - [x] 7.2 创建 `src/components/TaskCard.tsx` 任务卡片组件
    - 显示任务提示词预览、状态标签、项目信息
    - 创建者视图：编辑/删除/发布/完成按钮
    - 非创建者视图：接受任务按钮（含复制邮箱到剪贴板）
    - _Requirements: 1.1, 2.1, 2.2, 3.1, 10.1, 10.2, 10.3_

  - [x] 7.3 创建 `src/components/AchievementList.tsx` 成就列表组件
    - 展示成就记录：任务名称、贡献者名称、完成日期
    - 支持按项目和按贡献者两种展示模式
    - _Requirements: 7.2, 7.3_

- [x] 8. 实现通知组件
  - [x] 8.1 创建 `src/components/NotificationBell.tsx` 通知铃铛组件
    - 铃铛 SVG 图标 + 未读数量徽章
    - 点击展开通知下拉列表
    - 通知项显示消息文本、时间、已读/未读状态
    - 点击通知标记为已读
    - _Requirements: 6.1, 6.2, 6.6_

- [x] 9. 实现任务完成业务逻辑
  - [x] 9.1 创建 `src/lib/taskActions.ts` 任务完成动作函数
    - 实现 completeTask 函数：更新任务状态、创建成就记录、为所有接受者创建通知、为贡献者创建特殊通知
    - 封装完成任务的完整业务流程
    - _Requirements: 2.2, 2.3, 6.3, 6.4, 7.1_

  - [ ]* 9.2 编写 completeTask 业务逻辑的属性测试
    - **Property 6: 完成任务创建成就记录**
    - **Property 10: 任务完成触发通知创建**
    - **Validates: Requirements 2.2, 2.3, 6.3, 6.4**

- [x] 10. 检查点 - 确保组件和业务逻辑测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 11. 修改项目详情页
  - [x] 11.1 修改 `src/app/projects/[id]/page.tsx`
    - 移除"加入项目"按钮和 projectRelationStorage.participateInProject 相关代码
    - 保留 Telegram 群组链接
    - 新增"任务"区域：创建者可管理任务（创建/编辑/删除/发布/完成），非创建者可查看和接受任务
    - 新增"成就"区域：展示该项目的已完成任务和贡献者
    - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.4_

- [x] 12. 修改个人资料页
  - [x] 12.1 修改 `src/app/profile/page.tsx`
    - 移除"参与的项目"标签页和 projectRelationStorage 相关代码
    - 新增"成就"标签页，展示用户作为贡献者的成就记录
    - 无成就时显示空状态提示
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 13. 创建任务大厅页面
  - [x] 13.1 创建 `src/app/tasks/page.tsx` 任务大厅页面
    - 聚合展示所有已发布任务
    - 支持按项目分类筛选（科幻、动画、纪录片、教育、其他）
    - 每个任务显示提示词预览、项目名称、分类、创建者名称
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 13.2 编写已发布任务过滤的属性测试
    - **Property 8: 已发布任务按分类过滤**
    - **Property 9: 已发布任务包含项目元数据**
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 14. 修改首页和导航
  - [x] 14.1 修改 `src/app/page.tsx` 首页
    - 在"我的作品"下方右侧添加任务大厅预览模块
    - 显示最近发布的任务（最多 5 条）
    - 包含"查看全部任务"链接到 `/tasks`
    - 调整布局为左右两栏（精选项目 | 任务大厅预览）
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 14.2 在导航栏中添加任务大厅链接和通知铃铛
    - 在 `src/app/page.tsx` 导航栏添加"任务大厅"链接
    - 在导航栏右侧添加 NotificationBell 组件（登录用户可见）
    - _Requirements: 4.4, 6.1_

- [x] 15. 清理旧代码
  - [x] 15.1 清理项目参与相关的旧代码
    - 从首页移除 projectRelationStorage.getParticipatedProjectIds 调用和 hasParticipated 状态
    - 确认所有页面不再引用 participateInProject、isParticipating、getParticipatedProjectIds
    - _Requirements: 9.2_

- [x] 16. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的任务为可选测试任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号以确保可追溯性
- 检查点确保增量验证
- 属性测试验证通用正确性，单元测试验证具体场景和边界条件
