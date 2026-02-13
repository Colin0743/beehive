# 实现计划：管理系统电影工业风格重设计

## 概述

将管理系统的 5 个文件（AdminLayout、Dashboard、Projects、Users、User Detail）从白色后台风格迁移到主站电影工业奢华风格设计系统，同时添加 i18n 国际化支持。采用自底向上的方式：先改布局组件，再逐页改造。

## 任务

- [x] 1. 添加管理系统 i18n 翻译键
  - 在 `src/lib/i18n.ts` 的 `enResources` 和 `zhResources` 中添加 admin 相关翻译键
  - 包含：系统标题、导航菜单、仪表盘标签、项目管理标签、用户管理标签、操作按钮、空状态提示、过滤标签、表头等所有硬编码中文文本
  - 确保每个英文键都有对应的中文翻译
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 2. 重设计 AdminLayout 布局组件
  - [x] 2.1 改造 AdminLayout.tsx 的整体布局和导航栏
    - 将外层容器从 `bg-gray-50` 改为 `bg-[var(--ink)]`
    - 将导航栏从 `bg-yellow-400` 改为 `bg-[var(--ink)]/95 backdrop-blur-md border-b border-[var(--ink-border)]`
    - 将 Logo 文字改为使用 `--font-display` 字体和 `--gold` 颜色
    - 将菜单项改为使用 `nav-link` 样式，活跃状态使用 `--gold` 底部边框和文字颜色
    - 将返回首页链接改为使用 `nav-link` 样式
    - 添加 `.film-grain` 装饰层和 `.glow` 光晕元素
    - 集成 `useTranslation` hook，替换所有硬编码文本
    - 改造移动端菜单为深色背景 + 金色高亮
    - 将加载状态改为深色背景 + `--text-secondary` 文字
    - 主内容区域添加 `animate-fade-in` 动画
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.1, 7.2, 7.4, 8.1, 8.4_

- [x] 3. 重设计仪表盘页面
  - [x] 3.1 改造 Dashboard page.tsx 的统计卡片和列表
    - 将页面标题改为使用 `--font-display` 字体和 `--text-primary` 颜色
    - 将统计卡片从 `bg-white shadow rounded-lg` 改为 `.card` 类
    - 将统计数值颜色从 Tailwind 颜色改为 CSS 变量（`--text-primary`、`--gold`、`--success`）
    - 将统计标签从 `text-gray-500` 改为 `text-[var(--text-secondary)]`
    - 添加 `animate-fade-up` + `delay-N` 交错动画到统计卡片
    - 将项目状态统计卡片改为 `.card` 类 + CSS 变量颜色
    - 将最近项目列表容器改为 `.card` 类，列表项使用 `border-[var(--ink-border)]` 分隔
    - 将最近用户列表容器改为 `.card` 类，列表项使用 `border-[var(--ink-border)]` 分隔
    - 将悬停效果从 `hover:bg-gray-50` 改为 `hover:bg-[var(--ink-lighter)]`
    - 将状态徽章改为使用 `.tag` / `.tag-gold` 类
    - 将底部链接从 `text-yellow-600` 改为 `text-[var(--gold)]`
    - 将加载状态改为深色背景样式
    - 集成 `useTranslation` hook，替换所有硬编码文本
    - 使用 `.progress-track` 和 `.progress-fill` 类展示进度信息（如适用）
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 6.2, 7.1_

- [x] 4. 重设计项目管理页面
  - [x] 4.1 改造 Projects page.tsx 的过滤栏和表格
    - 将页面标题和计数文字改为 `--text-primary` / `--text-secondary`
    - 将过滤栏容器从 `bg-white shadow rounded-lg` 改为 `.card` 类
    - 将搜索输入框改为使用 `.input` 类
    - 将下拉选择框改为深色背景样式：`bg-[var(--ink-lighter)] border-[var(--ink-border)] text-[var(--text-primary)]`，聚焦时 `border-[var(--gold)]`
    - 将过滤标签从 `text-gray-700` 改为 `text-[var(--text-secondary)]`
    - 将表格容器从 `bg-white shadow rounded-lg` 改为 `.card` 类
    - 将表头从 `bg-gray-50` 改为 `bg-[var(--ink-lighter)]`，文字改为 `text-[var(--text-muted)]`
    - 将表体行从 `bg-white` 改为 `bg-[var(--ink-light)]`
    - 将行分隔线从 `divide-gray-200` 改为 `border-[var(--ink-border)]`
    - 将悬停效果从 `hover:bg-gray-50` 改为 `hover:bg-[var(--ink-lighter)]`
    - 将项目标题链接悬停色从 `hover:text-yellow-600` 改为 `hover:text-[var(--gold)]`
    - 将状态选择器改为深色背景样式
    - 将操作链接改为：查看/编辑用 `text-[var(--gold)]`，删除用 `text-[var(--error)]`
    - 将空状态提示改为 `text-[var(--text-muted)]`
    - 将加载状态改为深色背景样式
    - 集成 `useTranslation` hook，替换所有硬编码文本
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 6.3, 8.2_

- [x] 5. 重设计用户管理页面
  - [x] 5.1 改造 Users page.tsx 的过滤栏和表格
    - 采用与项目管理页面相同的深色样式策略改造过滤栏和表格
    - 将状态徽章改为深色背景样式：活跃用 `bg-[rgba(74,222,128,0.15)] text-[var(--success)]`，已禁用用 `bg-[rgba(248,113,113,0.15)] text-[var(--error)]`
    - 将角色选择器改为深色背景样式
    - 将操作链接改为：详情用 `text-[var(--gold)]`，删除用 `text-[var(--error)]`
    - 集成 `useTranslation` hook，替换所有硬编码文本
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 6.4, 8.2_

- [x] 6. 重设计用户详情页面
  - [x] 6.1 改造 User Detail page.tsx 的信息展示和操作区域
    - 将用户信息容器从 `bg-white shadow rounded-lg` 改为 `.card` 类
    - 将用户名改为使用 `--font-display` 字体
    - 将头像添加金色边框 `border-2 border-[var(--gold-muted)]`
    - 将邮箱文字改为 `text-[var(--text-secondary)]`
    - 将分隔线从 `border-gray-200` 改为 `border-[var(--ink-border)]`
    - 将标签文字从 `text-gray-700` 改为 `text-[var(--text-secondary)]`
    - 将角色选择器改为深色背景样式
    - 将状态切换按钮改为深色背景 + `--success`/`--error` 颜色
    - 将注册时间文字改为 `text-[var(--text-primary)]`
    - 将项目列表项从 `bg-gray-50 rounded-lg` 改为 `bg-[var(--ink-lighter)] rounded-[var(--radius-lg)]`
    - 将项目标题链接悬停色改为 `hover:text-[var(--gold)]`
    - 将项目状态徽章改为深色背景 + 对应颜色
    - 将返回链接从 `text-yellow-600` 改为 `text-[var(--gold)]`
    - 将加载状态和空状态改为深色背景样式
    - 集成 `useTranslation` hook，替换所有硬编码文本
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.5_

- [x] 7. 检查点 - 确保所有页面视觉一致性
  - 确保所有页面编译无错误，如有问题请询问用户。
  - 验证所有管理页面使用统一的深色背景和金色主题
  - 验证所有硬编码中文文本已替换为 i18n 翻译键
  - 验证所有现有功能（CRUD、过滤、权限检查）正常工作

- [ ]* 8. 编写属性测试和单元测试
  - [ ]* 8.1 编写 i18n 翻译键完整性属性测试
    - **Property 4: i18n 翻译键完整性**
    - **Validates: Requirements 6.6**
  - [ ]* 8.2 编写项目过滤功能属性测试
    - **Property 2: 项目过滤功能正确性**
    - **Validates: Requirements 3.7**
  - [ ]* 8.3 编写用户过滤功能属性测试
    - **Property 3: 用户过滤功能正确性**
    - **Validates: Requirements 4.7**
  - [ ]* 8.4 编写仪表盘统计计算属性测试
    - **Property 1: 仪表盘统计计算正确性**
    - **Validates: Requirements 2.9**

- [x] 9. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号以确保可追溯性
- 检查点确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
