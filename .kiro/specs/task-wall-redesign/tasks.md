# 实现计划：任务墙重新设计

## 概述

将任务大厅页面的列表式任务展示改为 4 列网格便签布局，新增悬停信息叠加、点击弹窗详情、自动/手动刷新（带翻转动画）、统计面板兼筛选功能。使用 TypeScript + React + Next.js，属性测试使用 fast-check。

## Tasks

- [x] 1. 添加翻转动画 CSS 和新增 i18n 键
  - [x] 1.1 在 `globals.css` 中添加任务便签翻转动画相关 CSS（`.task-note-container`、`.task-note-inner`、`.task-note-front`、`.task-note-back`、`.flipping`）
    - 使用 CSS `perspective`、`transform-style: preserve-3d`、`backface-visibility: hidden`
    - 翻转持续时间 600ms，使用 `--ease-out` 缓动函数
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 1.2 在中英文 i18n 文件中添加新增翻译键
    - 包括：`refreshCountdown`、`manualRefresh`、`taskTitle`、`taskPromptPreview`、`viewOtherCategories`、弹窗相关标签
    - _Requirements: 8.5_

- [x] 2. 实现核心工具函数
  - [x] 2.1 在 `src/app/tasks/page.tsx` 中实现 `shuffleArray` 洗牌函数（Fisher-Yates 算法）
    - _Requirements: 4.3, 5.2_
  - [x] 2.2 实现提示词截断函数：`getTitlePreview(prompt, 20)` 和 `getPromptPreview(prompt, 50)`
    - _Requirements: 2.2_
  - [ ]* 2.3 编写 `shuffleArray` 的属性测试
    - **Property 3: 洗牌不变量**
    - **Validates: Requirements 4.3, 5.2**
  - [ ]* 2.4 编写提示词截断函数的属性测试
    - **Property 4: 提示词截断正确性**
    - **Validates: Requirements 2.2**

- [x] 3. 实现统计筛选面板和分类过滤逻辑
  - [x] 3.1 改造统计面板为可点击的筛选面板（`Stats_Filter_Panel`）
    - 每个统计卡片可点击，点击后设置 `selectedCategory`
    - 选中状态使用金色边框高亮
    - 移除独立搜索栏
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6_
  - [x] 3.2 实现分类过滤逻辑（移除搜索过滤，只保留分类过滤）
    - _Requirements: 7.3_
  - [ ]* 3.3 编写统计计数的属性测试
    - **Property 1: 统计计数准确性**
    - **Validates: Requirements 7.1**
  - [ ]* 3.4 编写分类过滤的属性测试
    - **Property 2: 分类过滤正确性**
    - **Validates: Requirements 7.3**

- [x] 4. Checkpoint - 确保工具函数和过滤逻辑正确
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. 实现 TaskNote 便签组件和 Task Wall 网格布局
  - [x] 5.1 在 `src/app/tasks/page.tsx` 中实现 `TaskNote` 内联组件
    - 默认显示首张参考图片，aspect-ratio 3:4
    - 悬停时叠加半透明信息层（标题预览、时长、提示词缩写）
    - 点击触发 `onClick` 回调
    - 支持 `isFlipping` prop 控制翻转动画
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4_
  - [x] 5.2 将页面主内容区域从列表布局改为 4 列网格布局
    - 使用 CSS Grid：`grid-cols-4`，响应式 `lg:grid-cols-4 md:grid-cols-2 grid-cols-1`
    - 用 `TaskNote` 替代原有的 `TaskCard` 渲染
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 6. 实现 TaskDetailModal 弹窗组件
  - [x] 6.1 在 `src/app/tasks/page.tsx` 中实现 `TaskDetailModal` 内联组件
    - 展示完整参考图片、完整提示词、任务需求、时长、创建者邮箱、项目名称和分类
    - 包含"接受任务"按钮，复用现有接受任务逻辑
    - 点击外部区域或关闭按钮关闭弹窗
    - 打开时设置 `document.body.style.overflow = 'hidden'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 6.2 编写弹窗信息完整性的属性测试
    - **Property 5: 弹窗信息完整性**
    - **Validates: Requirements 3.2**

- [x] 7. 实现刷新机制（自动刷新 + 手动刷新 + 倒计时）
  - [x] 7.1 实现 `Refresh_Timer` 逻辑
    - 添加 `countdown` 状态（初始 60）和 `isFlipping` 状态
    - 每秒递减倒计时，到 0 时触发刷新
    - 页面卸载时清除定时器
    - _Requirements: 4.1, 4.2, 4.5_
  - [x] 7.2 实现刷新 UI（倒计时显示 + 手动刷新按钮）
    - 在统计面板下方显示 "距离下次刷新还剩 MM:SS" 文本
    - 旁边放置手动刷新图标按钮
    - _Requirements: 4.2, 5.1_
  - [x] 7.3 实现 `handleRefresh` 函数
    - 设置 `isFlipping = true`，600ms 后更新数据并重置
    - 手动刷新时重置倒计时为 60
    - _Requirements: 4.3, 4.4, 5.2, 5.3, 5.4_

- [x] 8. 整合所有组件并清理
  - [x] 8.1 将所有新组件整合到 `TaskHallPage` 中
    - 保留 Hero 区域和侧边栏
    - 用 Stats_Filter_Panel 替代原有的搜索栏 + 分类筛选栏
    - 用 Task Wall 网格替代原有的任务列表
    - 添加 TaskDetailModal 条件渲染
    - 添加刷新计时器 UI
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 8.2 实现空状态处理
    - 筛选无结果时显示空状态提示
    - 建议用户查看其他分类
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 8.3 移除不再使用的代码（搜索栏、旧的分类筛选栏、TaskCard 导入）
    - _Requirements: 7.6_

- [x] 9. Final checkpoint - 确保所有功能正常
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- 标记 `*` 的任务为可选测试任务，可跳过以加快 MVP 进度
- 所有新组件内联定义在 `page.tsx` 中，不创建独立组件文件
- 属性测试使用 `fast-check` 库，每个测试至少 100 次迭代
- 保留现有的 `TaskCard` 组件文件不删除（其他页面可能使用）
