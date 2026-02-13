# 需求文档：任务大厅页面重新设计

## 简介

重新设计蜂巢AI电影制片厂平台的任务大厅页面（`/tasks`），使其视觉风格与主页保持一致。当前任务大厅页面设计过于简单，缺少 Hero 区域、统计信息、搜索功能和视觉层次感。本次重新设计将引入电影工业风格的设计元素（光晕效果、胶片纹理、金色主题），丰富页面布局（Hero 区域、统计面板、搜索栏、侧边栏），并提升任务卡片的视觉表现力。

## 术语表

- **Task_Hall_Page**: 任务大厅页面组件（路由 `/tasks`），展示所有已发布任务的列表页面
- **Hero_Section**: 页面顶部的视觉焦点区域，包含标题、描述文字和光晕装饰效果
- **Stats_Panel**: 统计面板组件，展示任务总数和各状态任务数量的汇总信息
- **Search_Bar**: 搜索栏组件，允许用户通过关键词搜索任务内容
- **Category_Filter**: 分类筛选栏组件，允许用户按项目类别筛选任务
- **Task_Card**: 任务卡片组件，展示单个任务的详细信息
- **Sidebar**: 侧边栏组件，展示热门项目或推荐内容
- **Design_System**: 现有的 CSS 变量设计系统，包含深色背景、金色主题、电影工业风格的视觉规范

## 需求

### 需求 1：Hero 区域

**用户故事：** 作为平台用户，我希望任务大厅页面有一个醒目的 Hero 区域，以便我能快速了解页面用途并感受到与主页一致的视觉体验。

#### 验收标准

1. WHEN 用户访问任务大厅页面, THE Task_Hall_Page SHALL 在页面顶部显示一个包含标题和描述文字的 Hero 区域
2. THE Hero_Section SHALL 包含光晕效果（glow）装饰元素，使用 Design_System 中已有的 `.glow` 类
3. THE Hero_Section SHALL 使用 `animate-fade-up` 动画类实现内容的渐入效果
4. THE Hero_Section SHALL 使用 Design_System 中定义的衬线字体（`--font-display`）作为标题字体

### 需求 2：任务统计面板

**用户故事：** 作为平台用户，我希望看到任务的统计汇总信息，以便我能快速了解当前任务大厅的整体情况。

#### 验收标准

1. THE Stats_Panel SHALL 显示已发布任务的总数量
2. THE Stats_Panel SHALL 显示各项目类别下的任务数量分布
3. WHEN 任务列表数据加载完成, THE Stats_Panel SHALL 根据实际数据计算并展示统计数值
4. THE Stats_Panel SHALL 使用 Design_System 中的卡片样式（`.card` 类）和金色主题色（`--gold`）进行视觉呈现

### 需求 3：搜索功能

**用户故事：** 作为平台用户，我希望能通过关键词搜索任务，以便我能快速找到感兴趣的任务。

#### 验收标准

1. THE Task_Hall_Page SHALL 在分类筛选栏上方或附近提供一个搜索输入框
2. WHEN 用户在搜索框中输入关键词, THE Task_Hall_Page SHALL 根据任务的提示词（prompt）内容实时过滤任务列表
3. WHEN 搜索框内容为空, THE Task_Hall_Page SHALL 显示当前分类下的所有任务
4. THE Search_Bar SHALL 使用 Design_System 中的输入框样式（`.input` 类）保持视觉一致性

### 需求 4：分类筛选栏增强

**用户故事：** 作为平台用户，我希望分类筛选栏有更好的视觉效果，以便我能清晰地看到当前选中的分类。

#### 验收标准

1. THE Category_Filter SHALL 使用金色背景（`--gold`）高亮显示当前选中的分类按钮
2. THE Category_Filter SHALL 在每个分类按钮旁显示该分类下的任务数量
3. WHEN 用户切换分类, THE Category_Filter SHALL 通过平滑过渡动画更新选中状态
4. THE Category_Filter SHALL 保持与主页分类栏一致的视觉样式

### 需求 5：任务卡片视觉增强

**用户故事：** 作为平台用户，我希望任务卡片有更丰富的视觉层次，以便我能更直观地浏览和区分不同任务。

#### 验收标准

1. THE Task_Card SHALL 使用 `animate-fade-up` 动画类实现交错渐入效果，每张卡片的动画延迟递增
2. THE Task_Card SHALL 在悬停时显示边框颜色变化效果（使用 `--gold-muted` 色值）
3. THE Task_Card SHALL 显示任务所属项目的类别标签，使用 Design_System 中的 `.tag` 样式
4. THE Task_Card SHALL 显示任务的创建时间信息，使用相对时间格式（如"3天前"）
5. THE Task_Card SHALL 显示任务的时长信息（duration 字段），标明该任务对项目进度的贡献量

### 需求 6：页面布局优化

**用户故事：** 作为平台用户，我希望任务大厅页面有更丰富的布局结构，以便我能获得与主页一致的浏览体验。

#### 验收标准

1. THE Task_Hall_Page SHALL 采用左右两栏布局，左侧为主要任务列表区域，右侧为侧边栏
2. THE Sidebar SHALL 展示热门项目信息（按参与者数量排序的前几个项目）
3. WHEN 屏幕宽度小于 1024px, THE Task_Hall_Page SHALL 将侧边栏隐藏或折叠到主内容区域下方
4. THE Task_Hall_Page SHALL 使用 Design_System 中的 `.container` 类控制最大宽度和内边距

### 需求 7：空状态处理

**用户故事：** 作为平台用户，我希望在没有任务时看到友好的提示信息，以便我了解当前状态并知道下一步可以做什么。

#### 验收标准

1. WHEN 当前筛选条件下没有匹配的任务, THE Task_Hall_Page SHALL 显示一个包含图标和文字说明的空状态提示
2. THE 空状态提示 SHALL 使用 `animate-fade-up` 动画类实现渐入效果
3. WHEN 搜索结果为空, THE Task_Hall_Page SHALL 提示用户尝试其他关键词或清除搜索条件

### 需求 8：视觉一致性

**用户故事：** 作为平台用户，我希望任务大厅页面与主页保持一致的视觉风格，以便我在不同页面间切换时获得连贯的体验。

#### 验收标准

1. THE Task_Hall_Page SHALL 使用 Design_System 中定义的所有 CSS 变量（颜色、字体、间距、圆角等）
2. THE Task_Hall_Page SHALL 包含胶片纹理效果（`.film-grain` 类），与主页保持一致
3. THE Task_Hall_Page SHALL 使用与主页相同的导航栏组件（通过 LayoutSimple 组件实现）
4. THE Task_Hall_Page SHALL 保持现有的国际化支持，所有用户可见文本通过 `useTranslation` 获取
