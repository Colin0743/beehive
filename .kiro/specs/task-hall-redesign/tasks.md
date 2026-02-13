# 实现计划：任务大厅页面重新设计

## 概述

基于设计文档，将任务大厅页面从简单列表重构为与主页风格一致的丰富页面。使用 TypeScript + Next.js + Tailwind CSS，复用现有设计系统的 CSS 变量和类名。

## 任务

- [x] 1. 添加国际化翻译键
  - 在 `src/lib/i18n.ts` 中为英文和中文资源分别添加新的翻译键
  - 新增键包括：`searchTasks`（搜索任务占位符）、`totalTasks`（任务总数）、`hotProjects`（热门项目）、`noHotProjects`（暂无热门项目）、`justNow`（刚刚）、`minutesAgo`（分钟前）、`hoursAgo`（小时前）、`daysAgo`（天前）、`longAgo`（很久以前）、`taskDuration`（任务时长）、`participants`（参与者）、`clearSearch`（清除搜索）、`tryOtherKeywords`（尝试其他关键词）
  - _Requirements: 8.4_

- [x] 2. 增强 TaskCard 组件
  - [x] 2.1 在 `src/components/TaskCard.tsx` 中添加创建时间和任务时长的展示
    - 在任务提示词下方添加一行元信息：创建时间（相对时间格式）和任务时长（`duration` 字段，单位秒）
    - 相对时间格式化函数定义为组件内的辅助函数，接收 ISO 时间戳字符串，返回如"3天前"的文本
    - 使用 `text-xs text-[var(--text-muted)]` 样式，与现有元信息风格一致
    - _Requirements: 5.4, 5.5_

  - [ ]* 2.2 为相对时间格式化函数编写属性测试
    - **Property 5: 相对时间格式化正确性**
    - **Validates: Requirements 5.4**

- [x] 3. 重写任务大厅页面主体
  - [x] 3.1 重构 `src/app/tasks/page.tsx`，添加 Hero 区域和统计面板
    - 在 `LayoutSimple` 内部，替换现有的简单标题为 Hero 区域
    - Hero 区域包含：两个 `.glow` 光晕装饰元素、使用衬线字体的大标题、描述文字、`animate-fade-up` 动画
    - Hero 区域下方添加统计卡片行：总任务数 + 各类别任务数，使用 `.card` 样式和金色高亮
    - 统计数据直接从 `allTasks` 状态计算，无需额外 API 调用
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 添加搜索栏和增强分类筛选栏
    - 在分类筛选栏上方添加搜索输入框，使用 `.input` 样式和搜索图标
    - 新增 `searchQuery` 状态，在 `useEffect` 中同时根据分类和搜索关键词过滤任务
    - 搜索逻辑：对 `task.prompt` 进行不区分大小写的 `includes` 匹配
    - 分类按钮增加任务计数显示，格式如"科幻 (3)"
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4_

  - [x] 3.3 实现左右两栏布局和侧边栏
    - 主内容区域改为 `flex` 两栏布局：左侧任务列表 + 右侧侧边栏（`lg:w-80`）
    - 侧边栏内容：热门项目列表（按 `participantsCount` 降序排序，取前 5 个）
    - 热门项目卡片直接在页面内定义为内联组件，显示排名序号、项目名称、参与者数
    - 使用 `lg:flex-row` 实现响应式：大屏两栏，小屏单栏堆叠
    - 新增 `hotProjects` 状态，在 `useEffect` 中从 `projectStorage.getAllProjects()` 加载并排序
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 3.4 优化空状态展示
    - 区分两种空状态：无任务（当前分类无数据）和搜索无结果
    - 搜索无结果时显示"尝试其他关键词"提示和清除搜索按钮
    - 空状态使用 `animate-fade-up` 动画和图标装饰
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 3.5 为统计计算逻辑编写属性测试
    - **Property 1: 统计计数准确性**
    - **Validates: Requirements 2.1, 2.2, 4.2**

  - [ ]* 3.6 为搜索过滤逻辑编写属性测试
    - **Property 2: 搜索过滤正确性**
    - **Validates: Requirements 3.2**

  - [ ]* 3.7 为热门项目排序逻辑编写属性测试
    - **Property 4: 热门项目排序正确性**
    - **Validates: Requirements 6.2**

- [x] 4. 检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 5. 视觉一致性验证和收尾
  - [x] 5.1 确保页面使用 LayoutSimple 组件（包含导航栏、胶片纹理、页脚）
    - 验证 `film-grain` 效果通过 LayoutSimple 自动包含
    - 确保所有新增文本通过 `useTranslation` 获取，不硬编码
    - 检查所有 CSS 变量引用正确（`--ink`、`--gold`、`--text-primary` 等）
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 5.2 为任务卡片信息完整性编写属性测试
    - **Property 3: 任务卡片信息完整性**
    - **Validates: Requirements 5.3, 5.4, 5.5**

- [x] 6. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的任务为可选测试任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号以确保可追溯性
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
- 所有新增 i18n 键需同时提供英文和中文翻译
