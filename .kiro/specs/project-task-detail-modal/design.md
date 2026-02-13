# 设计文档：项目任务详情弹窗

## 概述

本设计为项目详情页面（`/projects/[id]/page.tsx`）的任务模块添加任务详情弹窗功能。该功能将复用任务大厅页面（`/tasks/page.tsx`）中已实现的 `TaskDetailModal` 组件的设计模式，但需要适配项目详情页面的特殊需求，特别是项目创建者的管理权限（编辑、删除、发布、完成任务）。

## 架构

### 组件层次结构

```
ProjectDetailPage
├── TaskCard (点击触发弹窗)
└── TaskDetailModal (新增)
    ├── Modal Overlay (遮罩层)
    ├── Modal Content (内容容器)
    │   ├── Close Button (关闭按钮)
    │   ├── Task Images (参考图片)
    │   ├── Task Prompt (提示词 + 复制按钮)
    │   ├── Task Requirements (要求 + 复制按钮)
    │   ├── Task Metadata (元信息 + 复制按钮)
    │   └── Action Buttons (操作按钮区域)
    │       ├── Edit Button (创建者可见)
    │       ├── Delete Button (创建者可见)
    │       ├── Publish Button (创建者可见，草稿状态)
    │       ├── Complete Button (创建者可见，已发布状态)
    │       └── Accept Button (非创建者可见，已发布状态)
```

### 状态管理

在 `ProjectDetailPage` 组件中添加以下状态：

```typescript
const [selectedTask, setSelectedTask] = useState<Task | null>(null);
const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
```

## 组件和接口

### TaskDetailModal 组件接口

```typescript
interface TaskDetailModalProps {
  task: Task;
  projectName: string;
  projectCategory: string;
  isCreator: boolean;
  isLoggedIn: boolean;
  hasAccepted: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onPublish: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onAccept: (task: Task) => void;
}
```

### TaskCard 组件修改

为 `TaskCard` 组件添加点击事件处理：

```typescript
interface TaskCardProps {
  // ... 现有属性
  onClick?: (task: Task) => void; // 新增
}
```

## 数据模型

使用现有的 `Task` 类型，无需修改：

```typescript
interface Task {
  id: string;
  prompt: string;
  referenceImages: string[];
  requirements: string;
  creatorEmail: string;
  status: 'draft' | 'published' | 'completed';
  duration: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}
```

## 正确性属性

*属性是应该在系统所有有效执行中保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性 1：模态框打开关闭状态管理

*对于任何*任务，当用户点击任务卡片时，模态框应该打开并显示该任务的数据；当用户点击关闭按钮或遮罩层时，模态框应该关闭。

**验证需求：1.1, 1.3, 1.4**

### 属性 2：背景滚动控制

*对于任何*模态框状态变化，当模态框打开时，背景页面滚动应该被阻止（document.body.style.overflow = 'hidden'）；当模态框关闭时，背景页面滚动应该被恢复（document.body.style.overflow = ''）。

**验证需求：1.2, 1.5**

### 属性 3：任务内容完整展示

*对于任何*任务数据，模态框应该展示所有必需字段（提示词、创建者邮箱、时长、项目名称、项目分类），并且展示的内容应该与输入数据完全匹配；如果任务包含可选字段（参考图片、要求说明），这些字段也应该被正确展示。

**验证需求：2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

### 属性 4：复制功能正确性

*对于任何*可复制字段（提示词、要求、邮箱），当用户点击对应的复制按钮时，正确的文本内容应该被复制到剪贴板，并且应该显示成功提示。

**验证需求：3.1, 3.2, 3.3, 3.4**

### 属性 5：创建者权限按钮显示

*对于任何*任务，当用户是项目创建者时：
- 如果任务状态为草稿，应该显示编辑、删除、发布按钮
- 如果任务状态为已发布，应该显示完成按钮
- 不应该显示接受任务按钮

**验证需求：4.1, 4.2, 4.3, 4.4**

### 属性 6：创建者操作回调调用

*对于任何*创建者操作（编辑、删除、发布、完成），当用户点击对应按钮时，相应的回调函数应该被调用，并且对于编辑和完成操作，模态框应该关闭。

**验证需求：4.5, 4.7, 4.8, 4.9**

### 属性 7：普通用户接受任务按钮显示

*对于任何*已发布状态的任务，当用户不是项目创建者时：
- 如果用户未接受任务，应该显示可点击的接受任务按钮
- 如果用户已接受任务，应该显示禁用的已接受状态按钮

**验证需求：5.1, 5.4**

### 属性 8：接受任务回调调用

*对于任何*接受任务操作，当用户点击接受任务按钮时，onAccept 回调应该被调用并传入正确的任务数据。

**验证需求：5.2, 5.3**

## 错误处理

### 复制功能错误处理

- 如果剪贴板 API 不可用或复制失败，应该捕获错误并显示错误提示
- 使用 try-catch 包裹 `navigator.clipboard.writeText()` 调用

### 回调函数错误处理

- 所有传入的回调函数（onEdit, onDelete, onPublish, onComplete, onAccept）都应该有默认的空函数处理
- 在调用回调前检查函数是否存在

### 数据验证

- 在渲染前验证任务数据的必需字段是否存在
- 对于可选字段（referenceImages, requirements），使用条件渲染

## 测试策略

### 单元测试

使用 React Testing Library 和 Jest 进行组件单元测试：

1. **渲染测试**：验证组件在不同 props 下正确渲染
2. **交互测试**：验证点击事件触发正确的回调
3. **条件渲染测试**：验证基于 props 的条件渲染逻辑
4. **副作用测试**：验证 useEffect 中的滚动控制逻辑

### 属性测试

使用 fast-check 库进行属性测试（最少 100 次迭代）：

1. **属性 1-8**：为每个正确性属性编写对应的属性测试
2. **数据生成器**：创建任务数据生成器，生成各种有效的任务对象
3. **标签格式**：**Feature: project-task-detail-modal, Property {number}: {property_text}**

### 集成测试

在项目详情页面上下文中测试：

1. 验证从 TaskCard 点击到 TaskDetailModal 显示的完整流程
2. 验证模态框操作与父组件状态更新的集成
3. 验证路由跳转（未登录用户接受任务）

### 测试平衡

- 单元测试专注于具体示例和边缘情况（如空数组、空字符串）
- 属性测试通过随机化输入覆盖大量场景
- 避免过多单元测试，让属性测试处理输入覆盖

## 实现细节

### 复制按钮实现

每个可复制字段旁边添加复制图标按钮：

```typescript
const handleCopy = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast('success', t('copiedToClipboard', { label }));
  } catch (error) {
    showToast('error', t('copyFailed'));
  }
};
```

### 按钮显示逻辑

```typescript
// 创建者查看草稿任务
if (isCreator && task.status === 'draft') {
  // 显示：编辑、删除、发布按钮
}

// 创建者查看已发布任务
if (isCreator && task.status === 'published') {
  // 显示：完成按钮
}

// 非创建者查看已发布任务
if (!isCreator && task.status === 'published') {
  // 显示：接受任务按钮（根据 hasAccepted 状态决定是否禁用）
}
```

### 样式复用

复用任务大厅页面的样式：
- 使用相同的 CSS 变量和设计令牌
- 使用相同的动画类（animate-scale-in）
- 使用相同的卡片样式（card 类）
- 使用相同的按钮样式（btn-primary, btn-secondary）

### 响应式设计

```typescript
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/60" />
  <div className="relative card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
    {/* 内容 */}
  </div>
</div>
```

## 性能考虑

1. **图片懒加载**：参考图片使用懒加载避免阻塞渲染
2. **事件委托**：使用事件冒泡处理遮罩层点击，避免多个事件监听器
3. **条件渲染优化**：使用 && 和三元运算符进行高效的条件渲染
4. **回调记忆化**：在父组件中使用 useCallback 包裹传入的回调函数

## 可访问性

1. **键盘导航**：支持 ESC 键关闭模态框
2. **ARIA 标签**：为关闭按钮添加 aria-label
3. **焦点管理**：模态框打开时将焦点移到模态框内
4. **屏幕阅读器**：为图片添加有意义的 alt 文本
