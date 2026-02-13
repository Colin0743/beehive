# 实施计划：项目内联编辑

## 概述

将项目详情页从只读展示改为支持内联编辑，添加任务时长字段及自动累加逻辑，统一时长单位为秒，优化页面布局。

## 任务

- [x] 1. 数据模型与类型更新
  - [x] 1.1 在 Task 接口中添加 duration 字段
    - 修改 `src/types/index.ts`，在 Task 接口中添加 `duration: number` 字段
    - _Requirements: 3.1_
  - [x] 1.2 创建验证工具函数
    - 在 `src/lib/validators.ts` 中创建验证函数：`validateTitle`（非空）、`validateDuration`（5-30整数）、`validateTargetDuration`（正整数）、`validateCurrentDuration`（非负整数）、`validateTelegramGroup`（空或有效URL）
    - _Requirements: 6.1, 6.2, 6.3, 3.3_
  - [ ]* 1.3 为验证函数编写属性测试
    - **Property 4: 任务 duration 范围验证**
    - **Property 6: targetDuration 正整数验证**
    - **Property 7: telegramGroup URL 格式验证**
    - **Property 9: currentDuration 非负整数验证**
    - **Validates: Requirements 3.3, 6.2, 6.3, 3.5**

- [x] 2. 内联编辑组件开发
  - [x] 2.1 创建 InlineEditText 组件
    - 在 `src/components/InlineEditText.tsx` 中实现文本内联编辑组件，支持展示/编辑模式切换、保存/取消、Enter/Escape 快捷键、验证错误显示
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.2 创建 InlineEditRichText 组件
    - 在 `src/components/InlineEditRichText.tsx` 中实现富文本内联编辑组件，复用现有 RichTextEditor
    - _Requirements: 1.6_
  - [x] 2.3 创建 InlineEditSelect 组件
    - 在 `src/components/InlineEditSelect.tsx` 中实现下拉选择内联编辑组件
    - _Requirements: 1.7_
  - [x] 2.4 创建 InlineEditNumber 组件
    - 在 `src/components/InlineEditNumber.tsx` 中实现数字内联编辑组件，支持 min/max/suffix 配置
    - _Requirements: 1.2, 6.2_
  - [x] 2.5 创建 InlineEditFile 组件
    - 在 `src/components/InlineEditFile.tsx` 中实现文件上传内联编辑组件，支持图片和视频，上传后即时预览
    - _Requirements: 1.8_

- [x] 3. 检查点 - 确保内联编辑组件可用
  - 确保所有内联编辑组件编译通过，如有问题请询问用户。

- [x] 4. 项目详情页集成内联编辑
  - [x] 4.1 重构项目详情页，集成内联编辑组件
    - 修改 `src/app/projects/[id]/page.tsx`：
    - 扩展权限判断：添加 `canEdit = isOwner || isAdminUser`、`canDelete = isAdminUser`
    - 将标题区域的静态文本替换为 InlineEditText（title）
    - 将描述区域替换为 InlineEditRichText（description）
    - 将分类标签替换为 InlineEditSelect（category）
    - 在进度卡片中集成 InlineEditNumber（targetDuration、currentDuration）
    - 将封面/视频区域集成 InlineEditFile（coverImage、videoFile）
    - 将 telegramGroup 链接区域集成 InlineEditText
    - 移除指向 `/projects/edit/${project.id}` 的编辑链接
    - 每个字段的 onSave 回调调用 `projectStorage.updateProject()` 并更新本地 state
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 1.8, 1.9_
  - [x] 4.2 添加管理员删除项目功能
    - 在项目详情页中为管理员添加删除按钮，点击后显示确认对话框，确认后调用 `projectStorage.deleteProject()` 并重定向到首页
    - _Requirements: 2.2, 2.3_
  - [ ]* 4.3 为编辑保存 round-trip 编写属性测试
    - **Property 1: 编辑保存 round-trip**
    - **Validates: Requirements 1.3**

- [x] 5. 任务时长功能实现
  - [x] 5.1 修改 TaskForm 组件添加 duration 输入
    - 在 `src/components/TaskForm.tsx` 中添加 duration 数字输入字段（5-30），添加验证逻辑，在提交数据中包含 duration
    - _Requirements: 3.2, 3.3_
  - [x] 5.2 修改 completeTask 函数实现 duration 自动累加
    - 在 `src/lib/taskActions.ts` 的 `completeTask` 函数中，任务完成后读取任务的 duration 值并累加到项目的 currentDuration
    - _Requirements: 3.4_
  - [ ]* 5.3 为 completeTask 的 duration 累加编写属性测试
    - **Property 5: 任务完成自动累加 duration**
    - **Validates: Requirements 3.4**

- [x] 6. 时长单位从分钟改为秒
  - [x] 6.1 更新项目详情页的时长显示
    - 修改 `src/app/projects/[id]/page.tsx` 中进度卡片的显示文本，将"分钟"改为"秒"
    - _Requirements: 4.2_
  - [x] 6.2 更新项目创建页面的时长标签
    - 修改 `src/app/projects/new/page.tsx` 中 targetDuration 输入旁的单位标签从"分钟"改为"秒"
    - _Requirements: 4.3_
  - [x] 6.3 更新种子数据
    - 修改 `src/app/seed/page.tsx` 中的 sampleProjects 数据，将 targetDuration 和 currentDuration 的值调整为合理的秒级数值
    - _Requirements: 4.4_
  - [x] 6.4 更新国际化翻译文件
    - 检查并更新 i18n 翻译文件中所有"分钟/minutes"相关的翻译键，改为"秒/seconds"
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. 页面布局优化
  - [x] 7.1 调整项目详情页任务区域位置
    - 修改 `src/app/projects/[id]/page.tsx`，将任务区域（tasks section）移动到描述区域之后、成就区域和项目动态区域之前
    - _Requirements: 5.1, 5.2_

- [x] 8. 最终检查点 - 确保所有功能正常
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号以便追溯
- 属性测试使用 fast-check 库，每个属性至少运行 100 次迭代
- 内联编辑组件应复用现有的 Tailwind CSS 样式变量（如 `var(--gold)`、`var(--text-primary)` 等）
