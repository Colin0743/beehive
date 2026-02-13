# 需求文档

## 简介

本文档定义了项目详情页布局重构的需求。当前项目详情页的布局存在信息层次不清晰、媒体展示方式不合理等问题。本次重构旨在优化页面布局结构，提升用户体验，使信息展示更加清晰合理。

## 术语表

- **System**: 项目详情页系统
- **Media_Carousel**: 媒体轮播组件，用于在封面图和视频之间切换
- **Sidebar**: 右侧边栏，显示项目进度和关键信息
- **Header_Section**: 顶部区域，包含项目标题、分类和创建者信息
- **Content_Area**: 主内容区域，包含项目描述、任务列表、成就和动态
- **Mobile_Viewport**: 移动端视口，宽度小于1024px
- **Desktop_Viewport**: 桌面端视口，宽度大于等于1024px

## 需求

### 需求 1: 顶部信息区域重构

**用户故事:** 作为用户，我希望在页面顶部清晰地看到项目的核心信息，以便快速了解项目概况。

#### 验收标准

1. THE System SHALL 在页面顶部显示项目标题、分类标签、发起人信息和创建时间
2. WHEN 用户访问项目详情页 THEN THE System SHALL 按照"分类标签 → 项目标题 → 发起人和时间"的顺序从上到下展示信息
3. THE System SHALL 使用卡片容器包裹顶部信息区域
4. WHERE 用户具有编辑权限 THEN THE System SHALL 允许内联编辑标题和分类
5. WHEN 用户是管理员 THEN THE System SHALL 在顶部区域显示删除项目按钮

### 需求 2: 媒体展示区域优化

**用户故事:** 作为用户，我希望在同一位置查看项目的封面图和视频，并且优先看到视频内容，以便更直观地了解项目。

#### 验收标准

1. THE System SHALL 将封面图和视频整合到同一个媒体展示区域
2. WHEN 项目包含视频文件 THEN THE System SHALL 默认显示视频标签页
3. WHEN 项目不包含视频文件 THEN THE System SHALL 默认显示封面图标签页
4. THE System SHALL 提供标签页或轮播控件以在封面图和视频之间切换
5. THE Media_Carousel SHALL 位于顶部信息区域下方
6. WHERE 用户具有编辑权限 THEN THE System SHALL 允许在媒体区域上传或更换封面图和视频

### 需求 3: 侧边栏布局实现

**用户故事:** 作为用户，我希望在页面右侧看到项目的关键进度信息，以便快速了解项目状态。

#### 验收标准

1. THE System SHALL 在桌面端视口显示右侧边栏
2. THE Sidebar SHALL 包含当前时长、目标时长、进度条、任务完成情况、成就数量和Telegram群组链接
3. THE Sidebar SHALL 使用粘性定位(sticky positioning)保持在视口可见范围内
4. THE System SHALL 在侧边栏顶部显示进度卡片，包含当前时长和目标时长的对比
5. THE System SHALL 在进度卡片中显示可视化进度条
6. THE System SHALL 在进度卡片下方显示任务完成统计(已完成/总数)
7. THE System SHALL 在进度卡片下方显示成就总数
8. THE System SHALL 在侧边栏底部显示Telegram群组链接卡片
9. WHERE 用户具有编辑权限 THEN THE System SHALL 允许内联编辑当前时长、目标时长和Telegram链接

### 需求 4: 主内容区域组织

**用户故事:** 作为用户，我希望按照逻辑顺序浏览项目的详细信息，以便系统地了解项目内容。

#### 验收标准

1. THE Content_Area SHALL 位于媒体区域下方，在桌面端位于侧边栏左侧
2. THE System SHALL 按照"项目描述 → 任务列表 → 成就列表 → 项目动态"的顺序展示内容
3. THE System SHALL 为每个内容模块使用独立的卡片容器
4. THE System SHALL 在项目描述卡片中显示富文本内容
5. THE System SHALL 在任务列表卡片中显示所有项目任务
6. WHEN 项目存在成就 THEN THE System SHALL 显示成就列表卡片
7. THE System SHALL 在项目动态卡片中按时间倒序显示所有日志
8. WHERE 用户是项目创建者 THEN THE System SHALL 在任务列表和项目动态卡片显示创建按钮

### 需求 5: 响应式布局适配

**用户故事:** 作为移动端用户，我希望在小屏幕设备上也能舒适地浏览项目详情，以便随时随地查看项目信息。

#### 验收标准

1. WHEN 视口宽度小于1024px THEN THE System SHALL 切换到移动端布局
2. WHEN 在移动端布局 THEN THE Sidebar SHALL 移动到媒体区域下方、主内容区域上方
3. WHEN 在移动端布局 THEN THE Sidebar SHALL 取消粘性定位
4. WHEN 在移动端布局 THEN THE System SHALL 使用单列布局展示所有内容
5. THE System SHALL 在移动端保持所有功能可用性
6. THE System SHALL 确保移动端的触摸交互体验良好

### 需求 6: 布局一致性和视觉层次

**用户故事:** 作为用户，我希望页面布局清晰美观，信息层次分明，以便快速找到所需信息。

#### 验收标准

1. THE System SHALL 使用一致的卡片样式和间距
2. THE System SHALL 为不同内容区域应用渐进式动画效果
3. THE System SHALL 使用视觉分隔符(divider)区分侧边栏中的不同信息组
4. THE System SHALL 保持与现有设计系统的一致性(颜色、字体、组件样式)
5. THE System SHALL 确保所有可交互元素具有明确的视觉反馈
6. THE System SHALL 使用合适的字体大小和行高确保可读性

### 需求 7: 内联编辑功能保留

**用户故事:** 作为项目创建者或管理员，我希望能够直接在页面上编辑项目信息，以便快速更新内容。

#### 验收标准

1. WHERE 用户具有编辑权限 THEN THE System SHALL 在所有可编辑字段显示内联编辑功能
2. THE System SHALL 保留现有的InlineEdit组件系列(Text, RichText, Select, Number, File)
3. WHEN 用户保存编辑 THEN THE System SHALL 验证输入并显示相应的成功或错误提示
4. THE System SHALL 在编辑模式和显示模式之间提供清晰的视觉区分
5. THE System SHALL 确保内联编辑不破坏页面布局

### 需求 8: 性能和加载体验

**用户故事:** 作为用户，我希望页面加载快速流畅，以便获得良好的浏览体验。

#### 验收标准

1. THE System SHALL 在数据加载时显示加载状态指示器
2. THE System SHALL 使用渐进式渲染优化首屏加载体验
3. THE System SHALL 为媒体文件(图片和视频)实现懒加载
4. THE System SHALL 优化图片尺寸和格式以减少加载时间
5. WHEN 项目数据加载失败 THEN THE System SHALL 显示友好的错误提示和返回首页的链接
