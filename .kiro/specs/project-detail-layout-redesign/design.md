# 设计文档

## 概述

本设计文档描述了项目详情页布局重构的技术实现方案。重构的核心目标是优化信息架构，将媒体内容整合到轮播组件中，实现桌面端的侧边栏布局，并确保移动端的良好体验。

设计遵循以下原则：
- 保持与现有组件系统的兼容性
- 最小化代码改动，复用现有InlineEdit组件
- 优先考虑响应式设计
- 保持性能优化和渐进式加载

## 架构

### 页面结构层次

```
ProjectDetailPage
├── Header_Section (顶部信息卡片)
│   ├── Category (分类标签)
│   ├── Title (项目标题)
│   └── Creator_Info (发起人和时间)
├── Media_Section (媒体展示区域)
│   └── Media_Carousel (封面图/视频轮播)
│       ├── Video_Tab (视频标签页)
│       └── Image_Tab (封面图标签页)
├── Layout_Container (桌面端双栏/移动端单栏)
│   ├── Main_Content (左侧主内容区)
│   │   ├── Description_Card (项目描述)
│   │   ├── Tasks_Card (任务列表)
│   │   ├── Achievements_Card (成就列表)
│   │   └── Updates_Card (项目动态)
│   └── Sidebar (右侧边栏，移动端移到媒体下方)
│       ├── Progress_Card (进度信息)
│       └── Telegram_Card (群组链接)
```

### 响应式布局策略

- **桌面端 (≥1024px)**: 使用Flexbox双栏布局，侧边栏固定宽度320px，主内容区flex-1
- **移动端 (<1024px)**: 单栏布局，侧边栏移到媒体区域下方

## 组件和接口

### 1. MediaCarousel 组件

新建的媒体轮播组件，用于在封面图和视频之间切换。

```typescript
interface MediaCarouselProps {
  coverImage: string;
  videoFile?: string;
  canEdit: boolean;
  onSaveCover: (url: string) => Promise<boolean>;
  onSaveVideo: (url: string) => Promise<boolean>;
}

function MediaCarousel({
  coverImage,
  videoFile,
  canEdit,
  onSaveCover,
  onSaveVideo
}: MediaCarouselProps): JSX.Element
```

**功能说明:**
- 使用标签页(tabs)切换封面图和视频
- 如果有视频，默认显示视频标签页；否则显示封面图标签页
- 集成InlineEditFile组件实现编辑功能
- 标签页切换使用状态管理: `const [activeTab, setActiveTab] = useState<'video' | 'image'>(videoFile ? 'video' : 'image')`

### 2. ProgressSidebar 组件

提取的侧边栏组件，包含进度信息和Telegram链接。

```typescript
interface ProgressSidebarProps {
  project: Project;
  tasks: Task[];
  achievementsCount: number;
  canEdit: boolean;
  onFieldSave: (field: string, value: any) => Promise<boolean>;
}

function ProgressSidebar({
  project,
  tasks,
  achievementsCount,
  canEdit,
  onFieldSave
}: ProgressSidebarProps): JSX.Element
```

**功能说明:**
- 显示进度卡片：当前时长、目标时长、进度条
- 显示任务完成统计
- 显示成就数量
- 显示Telegram群组链接
- 在桌面端使用sticky定位: `className="sticky top-24"`

### 3. 布局容器结构

使用Tailwind CSS的响应式类实现布局切换：

```typescript
<div className="flex flex-col lg:flex-row gap-8">
  {/* 移动端：侧边栏在这里 */}
  <div className="lg:hidden">
    <ProgressSidebar {...sidebarProps} />
  </div>
  
  {/* 主内容区 */}
  <div className="flex-1 space-y-6">
    {/* 描述、任务、成就、动态 */}
  </div>
  
  {/* 桌面端：侧边栏在这里 */}
  <div className="hidden lg:block lg:w-80 flex-shrink-0">
    <ProgressSidebar {...sidebarProps} />
  </div>
</div>
```

## 数据模型

本次重构不涉及数据模型变更，继续使用现有的数据结构：

```typescript
interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  videoFile?: string;
  currentDuration: number;
  targetDuration: number;
  telegramGroup?: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  tasks?: Task[];
  logs?: ProjectLog[];
}
```

## 正确性属性

*正确性属性是关于系统行为的形式化陈述，应该在所有有效执行中保持为真。这些属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性 1: 顶部区域完整性

*对于任意*项目数据，渲染的顶部区域应该包含卡片容器，并按顺序显示分类标签、项目标题、发起人信息和创建时间。

**验证需求: 1.1, 1.2, 1.3**

### 属性 2: 媒体轮播默认标签页

*对于任意*项目数据，如果项目包含视频文件，则媒体轮播应默认显示视频标签页；如果不包含视频文件，则应默认显示封面图标签页。

**验证需求: 2.2, 2.3**

### 属性 3: 媒体区域整合

*对于任意*项目数据，封面图和视频应该在同一个媒体展示区域内，并提供标签页切换功能，且媒体区域应位于顶部信息区域下方。

**验证需求: 2.1, 2.4, 2.5**

### 属性 4: 侧边栏内容完整性

*对于任意*项目数据和任务列表，侧边栏应该包含进度卡片（当前时长、目标时长、进度条）、任务完成统计、成就数量和Telegram群组链接卡片，且这些元素应按顺序排列。

**验证需求: 3.2, 3.4, 3.5, 3.6, 3.7, 3.8**

### 属性 5: 桌面端侧边栏定位

*对于任意*项目数据，在桌面端视口（宽度≥1024px）下，侧边栏应该可见并使用粘性定位。

**验证需求: 3.1, 3.3**

### 属性 6: 主内容区域顺序

*对于任意*项目数据，主内容区域应该按照"项目描述 → 任务列表 → 成就列表（如果有） → 项目动态"的顺序展示内容，每个模块使用独立的卡片容器。

**验证需求: 4.1, 4.2, 4.3**

### 属性 7: 任务列表渲染

*对于任意*任务数组，任务列表卡片中渲染的任务数量应该与数组长度一致。

**验证需求: 4.5**

### 属性 8: 成就列表条件渲染

*对于任意*项目数据，当且仅当成就数组非空时，应该显示成就列表卡片。

**验证需求: 4.6**

### 属性 9: 项目动态时间排序

*对于任意*项目日志数组，项目动态卡片中的日志应该按创建时间倒序排列（最新的在前）。

**验证需求: 4.7**

### 属性 10: 编辑权限控制

*对于任意*用户和项目组合，当且仅当用户是项目创建者或管理员时，应该显示所有可编辑字段的内联编辑功能（标题、分类、描述、时长、Telegram链接、媒体文件）和创建按钮（任务、动态）。

**验证需求: 1.4, 1.5, 2.6, 3.9, 4.8, 7.1**

### 属性 11: 移动端布局切换

*对于任意*项目数据，当视口宽度小于1024px时，应该切换到移动端布局：侧边栏移到媒体区域下方、主内容区域上方，取消粘性定位，使用单列布局。

**验证需求: 5.1, 5.2, 5.3, 5.4**

### 属性 12: 视觉一致性

*对于任意*渲染的页面，所有卡片容器应该使用一致的样式类，内容区域应该有渐进式动画类，侧边栏应该包含视觉分隔符。

**验证需求: 6.1, 6.2, 6.3**

### 属性 13: 保存验证和反馈

*对于任意*可编辑字段的保存操作，系统应该调用相应的验证函数，并根据结果显示成功或错误提示。

**验证需求: 7.3**

### 属性 14: 加载状态显示

*对于任意*数据加载状态，当loading为true时应该显示加载指示器，当项目数据为null时应该显示错误提示和返回首页的链接。

**验证需求: 8.1, 8.5**

## 错误处理

### 数据加载错误

- **场景**: 项目数据加载失败或项目不存在
- **处理**: 显示友好的错误页面，包含错误信息和返回首页的链接
- **实现**: 在useEffect中捕获错误，设置project为null

### 保存操作错误

- **场景**: 内联编辑保存失败（网络错误、验证失败等）
- **处理**: 显示错误toast提示，保持编辑状态，不更新UI
- **实现**: 在handleFieldSave中检查result.success，失败时调用showToast('error')

### 媒体文件加载错误

- **场景**: 图片或视频文件无法加载
- **处理**: 显示占位符或错误图标，不阻塞页面渲染
- **实现**: 使用img和video标签的onError事件处理

### 响应式布局降级

- **场景**: 浏览器不支持某些CSS特性
- **处理**: 使用渐进增强策略，确保基本布局可用
- **实现**: 使用Tailwind的标准响应式类，广泛兼容

## 测试策略

### 单元测试

使用React Testing Library进行组件单元测试，重点测试：

1. **MediaCarousel组件**
   - 默认标签页选择逻辑
   - 标签页切换交互
   - 编辑权限控制

2. **ProgressSidebar组件**
   - 进度计算和显示
   - 任务统计计算
   - 响应式类应用

3. **布局结构**
   - 响应式布局切换
   - DOM元素顺序
   - 条件渲染逻辑

### 属性测试

使用fast-check库进行属性测试，每个测试运行最少100次迭代：

1. **属性 1-14**: 为每个正确性属性编写对应的属性测试
2. **数据生成器**: 创建随机项目数据、任务数据、用户数据生成器
3. **标签格式**: `Feature: project-detail-layout-redesign, Property {N}: {property_text}`

### 集成测试

测试完整的页面交互流程：

1. 页面加载和数据获取
2. 内联编辑保存流程
3. 任务和动态创建流程
4. 响应式布局在不同视口下的表现

### 视觉回归测试

使用截图对比工具验证：

1. 桌面端布局
2. 移动端布局
3. 不同数据状态下的渲染（有/无视频、有/无成就等）

### 测试配置

- 单元测试框架: Jest + React Testing Library
- 属性测试库: fast-check
- 最小迭代次数: 100次/属性测试
- 覆盖率目标: 80%以上
