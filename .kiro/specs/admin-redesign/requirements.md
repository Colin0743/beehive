# 需求文档

## 简介

重新设计蜂巢AI电影制片厂的管理系统（/admin）所有页面，使其与主站的电影工业奢华风格设计系统保持一致。当前管理系统使用白色背景和灰色文字的传统后台风格，与主站深色背景 + 金色主题的视觉语言完全脱节。本次重设计需要将管理系统的所有页面迁移到主站设计系统，复用已有的 CSS 变量和类名，同时保留所有现有功能和权限逻辑不变。

## 术语表

- **Admin_Layout**: 管理系统的布局组件（`AdminLayout.tsx`），包含顶部导航栏、移动端菜单和主内容区域
- **Design_System**: 主站的电影工业奢华风格设计系统，定义在 `globals.css` 中，包含 CSS 变量（`--ink`、`--gold` 等）和工具类（`.card`、`.btn-primary` 等）
- **Dashboard_Page**: 管理系统仪表盘页面，展示统计卡片、项目状态和最近活动
- **Projects_Page**: 管理系统项目管理页面，提供搜索过滤和项目表格
- **Users_Page**: 管理系统用户管理页面，提供搜索过滤和用户表格
- **User_Detail_Page**: 管理系统用户详情页面，展示用户信息、角色管理和项目列表
- **i18n_System**: 基于 react-i18next 的国际化系统，支持中英文切换

## 需求

### 需求 1：管理系统布局重设计

**用户故事：** 作为管理员，我希望管理系统的布局与主站视觉风格一致，以获得统一的使用体验。

#### 验收标准

1. THE Admin_Layout SHALL use the Design_System CSS variables for background color (`--ink`), text color (`--text-primary`), and border color (`--ink-border`)
2. WHEN the Admin_Layout renders the navigation bar, THE Admin_Layout SHALL use a dark background (`--ink-light`) with gold accent color (`--gold`) for active menu items instead of the yellow-400 background
3. WHEN a navigation menu item is active, THE Admin_Layout SHALL display a gold-colored (`--gold`) bottom border indicator and gold text color
4. WHEN a navigation menu item is hovered, THE Admin_Layout SHALL transition the text color to `--text-primary` using the Design_System transition timing
5. THE Admin_Layout SHALL use the Design_System font families (`--font-display` for the logo title, `--font-body` for menu items)
6. WHEN the Admin_Layout renders on mobile devices, THE Admin_Layout SHALL display a sidebar menu with dark background (`--ink-lighter`) and gold accent colors consistent with the desktop navigation
7. THE Admin_Layout SHALL include the film grain decoration (`.film-grain`) overlay consistent with the main site

### 需求 2：仪表盘页面重设计

**用户故事：** 作为管理员，我希望仪表盘页面使用电影工业风格展示统计数据，以获得与主站一致的视觉体验。

#### 验收标准

1. THE Dashboard_Page SHALL use the `.card` class from the Design_System for all statistic cards, replacing the white background cards
2. WHEN displaying statistic values, THE Dashboard_Page SHALL use `--text-primary` for primary numbers and `--gold` for highlighted values
3. THE Dashboard_Page SHALL use the `--font-display` font family for the page title and section headings
4. WHEN displaying the recent projects list, THE Dashboard_Page SHALL use the `.card` class with dark background and gold-accented hover effects
5. WHEN displaying the recent users list, THE Dashboard_Page SHALL use the `.card` class with dark background and gold-accented hover effects
6. WHEN displaying project status badges, THE Dashboard_Page SHALL use the `.tag` and `.tag-gold` classes from the Design_System
7. THE Dashboard_Page SHALL apply the `animate-fade-up` animation class with staggered delays to statistic cards on page load
8. WHEN displaying progress information, THE Dashboard_Page SHALL use the `.progress-track` and `.progress-fill` classes from the Design_System
9. THE Dashboard_Page SHALL preserve all existing statistic calculations (total projects, active projects, total users, total participants, completed projects, paused projects, total duration)
10. THE Dashboard_Page SHALL preserve all existing navigation links to project detail and user detail pages

### 需求 3：项目管理页面重设计

**用户故事：** 作为管理员，我希望项目管理页面使用电影工业风格展示项目列表，以获得与主站一致的视觉体验。

#### 验收标准

1. THE Projects_Page SHALL use the `.input` class from the Design_System for the search input field, replacing the gray-bordered input
2. THE Projects_Page SHALL use Design_System styled select elements with dark background (`--ink-lighter`) and gold focus border for status and category filters
3. WHEN displaying the project table, THE Projects_Page SHALL use dark background (`--ink-light`) with `--ink-border` borders, replacing the white background table
4. WHEN a table row is hovered, THE Projects_Page SHALL apply a subtle background color change to `--ink-lighter` instead of gray-50
5. THE Projects_Page SHALL use the `.tag` class for project category labels and status indicators
6. WHEN displaying action buttons, THE Projects_Page SHALL use gold-colored text (`--gold`) for view and edit links, and `--error` color for delete actions
7. THE Projects_Page SHALL preserve all existing filter functionality (search by name/description/creator, status filter, category filter)
8. THE Projects_Page SHALL preserve all existing CRUD operations (view, edit, delete with confirmation)
9. THE Projects_Page SHALL preserve the project status change dropdown functionality

### 需求 4：用户管理页面重设计

**用户故事：** 作为管理员，我希望用户管理页面使用电影工业风格展示用户列表，以获得与主站一致的视觉体验。

#### 验收标准

1. THE Users_Page SHALL use the `.input` class from the Design_System for the search input field
2. THE Users_Page SHALL use Design_System styled select elements with dark background and gold focus border for role and status filters
3. WHEN displaying the user table, THE Users_Page SHALL use dark background (`--ink-light`) with `--ink-border` borders
4. WHEN a table row is hovered, THE Users_Page SHALL apply a subtle background color change to `--ink-lighter`
5. WHEN displaying user status badges, THE Users_Page SHALL use `--success` color for active status and `--error` color for disabled status, with dark background styling
6. WHEN displaying action buttons, THE Users_Page SHALL use gold-colored text for detail links and `--error` color for delete actions
7. THE Users_Page SHALL preserve all existing filter functionality (search by username/email, role filter, status filter)
8. THE Users_Page SHALL preserve all existing operations (role change, status toggle, delete, navigate to detail)

### 需求 5：用户详情页面重设计

**用户故事：** 作为管理员，我希望用户详情页面使用电影工业风格展示用户信息，以获得与主站一致的视觉体验。

#### 验收标准

1. THE User_Detail_Page SHALL use the `.card` class from the Design_System for the user information container
2. THE User_Detail_Page SHALL use `--font-display` for the user name heading
3. WHEN displaying the role selector, THE User_Detail_Page SHALL use a Design_System styled select element with dark background and gold focus border
4. WHEN displaying the user status toggle button, THE User_Detail_Page SHALL use `--success` color for active state and `--error` color for disabled state with dark background styling
5. WHEN displaying the user's project list, THE User_Detail_Page SHALL use `.card`-styled items with dark background and gold-accented hover effects
6. WHEN displaying project status badges in the user's project list, THE User_Detail_Page SHALL use the `.tag` and `.tag-gold` classes
7. THE User_Detail_Page SHALL use gold-colored text (`--gold`) for the back navigation link
8. THE User_Detail_Page SHALL preserve all existing functionality (role change, status toggle, project list display)

### 需求 6：国际化支持

**用户故事：** 作为管理员，我希望管理系统支持中英文切换，与主站的国际化体验一致。

#### 验收标准

1. THE Admin_Layout SHALL integrate with the i18n_System for all navigation menu labels and UI text
2. THE Dashboard_Page SHALL use i18n_System translation keys for all display text including page titles, statistic labels, section headings, and status text
3. THE Projects_Page SHALL use i18n_System translation keys for all display text including page title, filter labels, table headers, action buttons, and empty state messages
4. THE Users_Page SHALL use i18n_System translation keys for all display text including page title, filter labels, table headers, action buttons, and empty state messages
5. THE User_Detail_Page SHALL use i18n_System translation keys for all display text including labels, button text, and status text
6. WHEN new translation keys are added for the admin pages, THE i18n_System SHALL include both English and Chinese translations for each key

### 需求 7：动画与视觉效果

**用户故事：** 作为管理员，我希望管理系统具有与主站一致的动画和视觉效果，以获得精致的使用体验。

#### 验收标准

1. WHEN the Dashboard_Page loads, THE Dashboard_Page SHALL apply `animate-fade-up` animation with staggered delays (`delay-1`, `delay-2`, etc.) to statistic cards
2. WHEN any admin page loads, THE Admin_Layout SHALL apply `animate-fade-in` animation to the main content area
3. WHEN table rows or card items are hovered, THE Design_System SHALL apply smooth transition effects using `--duration-fast` and `--ease-out` timing
4. THE Admin_Layout SHALL include a subtle glow decoration element (`.glow`) in the navigation area for visual consistency with the main site

### 需求 8：响应式设计

**用户故事：** 作为管理员，我希望管理系统在不同设备上都能正常使用，保持电影工业风格的视觉一致性。

#### 验收标准

1. WHEN the viewport width is below 768px, THE Admin_Layout SHALL collapse the desktop navigation into a mobile-friendly menu
2. WHEN the viewport width is below 768px, THE Projects_Page and Users_Page SHALL display table data in a card-based layout instead of a horizontal table
3. WHEN the viewport width is below 768px, THE Dashboard_Page SHALL stack statistic cards vertically in a single column
4. THE Admin_Layout SHALL use the Design_System responsive spacing variables for consistent padding and margins across breakpoints
