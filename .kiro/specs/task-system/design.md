# 设计文档：任务系统

## 概述

任务系统为蜜蜂AI电影制片厂平台引入基于任务的协作机制，替代原有的"加入项目"模式。系统采用 localStorage 持久化，遵循现有的 `StorageResult<T>` 模式，使用 Next.js 14 App Router 和 react-i18next 国际化框架。

核心设计决策：
- 任务数据嵌入在项目数据结构中（tasks 数组字段），减少 localStorage key 数量
- 通知和成就数据独立存储，按用户 ID 索引
- 任务接受记录独立存储，按任务 ID 索引
- 复用现有的 `safeSetItem`/`safeGetItem` 安全存储模式

## 架构

```mermaid
graph TB
    subgraph Pages
        HP[Homepage /]
        TH[Task Hall /tasks]
        PD[Project Detail /projects/[id]]
        PP[Profile /profile]
    end

    subgraph Components
        TL[TaskList]
        TF[TaskForm]
        TC[TaskCard]
        NB[NotificationBell]
        AL[AchievementList]
    end

    subgraph Storage
        TS[taskStorage]
        NS[notificationStorage]
        AS[achievementStorage]
        PS[projectStorage - 现有]
    end

    HP --> TC
    TH --> TC
    PD --> TL
    PD --> TF
    PD --> AL
    PP --> AL
    
    TL --> TS
    TF --> TS
    NB --> NS
    AL --> AS
    TS --> PS
```

## 组件与接口

### 数据存储层 (`src/lib/storage.ts` 扩展)

新增以下存储模块，遵循现有的 `StorageResult<T>` 返回模式：

```typescript
// taskStorage - 任务操作（任务数据存储在 Project.tasks 数组中）
taskStorage.getTasksByProject(projectId: string): StorageResult<Task[]>
taskStorage.createTask(projectId: string, task: Task): StorageResult<Task>
taskStorage.updateTask(projectId: string, taskId: string, updates: Partial<Task>): StorageResult<Task>
taskStorage.deleteTask(projectId: string, taskId: string): StorageResult<void>
taskStorage.reorderTasks(projectId: string, taskIds: string[]): StorageResult<void>
taskStorage.getAllPublishedTasks(): StorageResult<(Task & { projectId: string; projectName: string; projectCategory: string })[]>

// taskAcceptanceStorage - 任务接受记录（独立存储，key: taskAcceptances_{taskId}）
taskAcceptanceStorage.acceptTask(taskId: string, userId: string): StorageResult<TaskAcceptance>
taskAcceptanceStorage.getAcceptances(taskId: string): StorageResult<TaskAcceptance[]>
taskAcceptanceStorage.hasUserAccepted(taskId: string, userId: string): StorageResult<boolean>
taskAcceptanceStorage.getUserAcceptedTaskIds(userId: string): StorageResult<string[]>

// notificationStorage - 通知操作（key: notifications_{userId}）
notificationStorage.getNotifications(userId: string): StorageResult<Notification[]>
notificationStorage.createNotification(userId: string, notification: Notification): StorageResult<Notification>
notificationStorage.markAsRead(userId: string, notificationId: string): StorageResult<void>
notificationStorage.getUnreadCount(userId: string): StorageResult<number>

// achievementStorage - 成就记录（key: achievements）
achievementStorage.createAchievement(achievement: Achievement): StorageResult<Achievement>
achievementStorage.getByProject(projectId: string): StorageResult<Achievement[]>
achievementStorage.getByContributor(contributorName: string): StorageResult<Achievement[]>
```

### 页面组件

1. **Task Hall 页面** (`src/app/tasks/page.tsx`)
   - 独立路由 `/tasks`
   - 聚合展示所有已发布任务
   - 支持按项目分类筛选
   - 使用 `taskStorage.getAllPublishedTasks()`

2. **项目详情页任务区域** (`src/app/projects/[id]/page.tsx` 修改)
   - 新增 Tasks 区域和 Achievements 区域
   - 创建者视图：任务管理（创建/编辑/删除/发布/完成）
   - 非创建者视图：任务列表 + 接受按钮
   - 移除"加入项目"按钮

3. **个人资料页** (`src/app/profile/page.tsx` 修改)
   - 移除"参与的项目"标签页
   - 新增"成就"标签页
   - 展示用户作为贡献者的成就记录

4. **首页任务模块** (`src/app/page.tsx` 修改)
   - 在"我的作品"下方右侧添加任务大厅预览
   - 展示最近发布的任务（最多5条）
   - "查看全部任务"链接

### UI 组件

1. **TaskForm** (`src/components/TaskForm.tsx`)
   - 模态框形式的任务创建/编辑表单
   - 字段：提示词文本（textarea）、参考图片（文件上传，base64）、任务需求（textarea）、创建者邮箱（input）
   - 验证逻辑：提示词必填，邮箱格式校验

2. **TaskCard** (`src/components/TaskCard.tsx`)
   - 任务卡片展示组件
   - 显示：任务提示词预览、状态标签、项目信息
   - 接受按钮（非创建者视图）

3. **NotificationBell** (`src/components/NotificationBell.tsx`)
   - 导航栏铃铛图标 + 未读数量徽章
   - 点击展开通知下拉列表
   - 通知项：消息文本 + 时间 + 已读/未读状态

4. **AchievementList** (`src/components/AchievementList.tsx`)
   - 成就记录列表组件
   - 显示：任务名称、贡献者名称、完成日期

## 数据模型

### Task（新增，嵌入 Project）

```typescript
interface Task {
  id: string;
  prompt: string;           // 提示词文本
  referenceImages: string[]; // 参考图片 base64 数组
  requirements: string;      // 任务需求说明
  creatorEmail: string;      // 创建者邮箱（用于接收提交）
  status: TaskStatus;        // draft | published | completed
  contributorName?: string;  // 完成者名称（completed 时填写）
  order: number;             // 排序序号
  createdAt: string;         // ISO 时间戳
  updatedAt: string;         // ISO 时间戳
}

type TaskStatus = 'draft' | 'published' | 'completed';
```

### Project（扩展现有类型）

```typescript
interface Project {
  // ... 现有字段
  tasks?: Task[];  // 新增：任务数组
}
```

### TaskAcceptance（新增）

```typescript
interface TaskAcceptance {
  id: string;
  taskId: string;
  userId: string;
  acceptedAt: string;  // ISO 时间戳
}
```

### Notification（新增）

```typescript
interface Notification {
  id: string;
  type: 'task_completed' | 'contribution_accepted';
  message: string;
  taskId: string;
  projectId: string;
  isRead: boolean;
  createdAt: string;  // ISO 时间戳
}
```

### Achievement（新增）

```typescript
interface Achievement {
  id: string;
  taskId: string;
  taskName: string;
  contributorName: string;
  projectId: string;
  projectName: string;
  completedAt: string;  // ISO 时间戳
}
```



## 正确性属性

*正确性属性是一种在系统所有有效执行中都应成立的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性是人类可读规格说明与机器可验证正确性保证之间的桥梁。*

### Property 1: 任务创建往返一致性
*For any* 有效的任务数据（包含提示词、参考图片、需求、邮箱），创建任务后从存储层读取，应返回等价的任务对象，且默认状态为 draft。
**Validates: Requirements 1.1**

### Property 2: 任务编辑在所有状态下持久化
*For any* 任务（无论状态为 draft、published 或 completed）和任意有效的字段更新，编辑后从存储层读取应反映所有更新。
**Validates: Requirements 1.2, 1.6**

### Property 3: 任务删除从存储中移除
*For any* 项目中的任务，删除该任务后，通过项目 ID 查询的任务列表不应包含该任务。
**Validates: Requirements 1.3**

### Property 4: 任务重排序持久化
*For any* 项目中的任务列表和任意排列顺序，重排序后读取的任务顺序应与指定的排列一致。
**Validates: Requirements 1.5**

### Property 5: 草稿到已发布状态转换
*For any* 状态为 draft 的任务，执行发布操作后，任务状态应变为 published。
**Validates: Requirements 2.1**

### Property 6: 完成任务创建成就记录
*For any* 状态为 published 的任务和任意贡献者名称，标记完成后，任务状态应变为 completed，contributorName 应等于输入的名称，且应创建包含正确任务 ID、贡献者名称、项目 ID 和时间戳的 Achievement_Record。
**Validates: Requirements 2.2, 2.3**

### Property 7: 任务接受往返一致性
*For any* 已发布任务和任意多个用户，每个用户接受任务后，hasUserAccepted 应返回 true，且 getAcceptances 返回的记录数应等于接受的用户数。
**Validates: Requirements 3.1, 3.3, 3.4**

### Property 8: 已发布任务按分类过滤
*For any* 项目集合（包含不同分类和不同状态的任务），getAllPublishedTasks 返回的结果应仅包含状态为 published 的任务，且按分类过滤后应仅包含对应分类的任务。
**Validates: Requirements 4.1, 4.2**

### Property 9: 已发布任务包含项目元数据
*For any* getAllPublishedTasks 返回的任务，每条记录应包含 projectId、projectName 和 projectCategory 字段，且这些字段应与源项目数据一致。
**Validates: Requirements 4.3**

### Property 10: 任务完成触发通知创建
*For any* 已完成的任务，所有接受过该任务的用户应收到包含任务名称和贡献者名称的通知，且被指定的贡献者应额外收到一条 contribution_accepted 类型的特殊通知。
**Validates: Requirements 6.3, 6.4**

### Property 11: 通知未读计数准确性
*For any* 用户的通知列表，未读计数应等于 isRead 为 false 的通知数量；标记一条通知为已读后，未读计数应减少 1。
**Validates: Requirements 6.1, 6.6**

### Property 12: 通知按时间倒序排列
*For any* 用户的通知列表，返回的通知应按 createdAt 降序排列（最新的在前）。
**Validates: Requirements 6.2**

### Property 13: 成就按项目过滤
*For any* 项目 ID，getByProject 返回的所有成就记录的 projectId 应等于查询的项目 ID。
**Validates: Requirements 7.2**

### Property 14: 成就按贡献者过滤
*For any* 贡献者名称，getByContributor 返回的所有成就记录的 contributorName 应等于查询的贡献者名称。
**Validates: Requirements 7.3**

### Property 15: 任务 JSON 序列化往返
*For any* 有效的 Task 对象，序列化为 JSON 再反序列化应产生等价的 Task 对象。
**Validates: Requirements 12.4**

### Property 16: 损坏 JSON 数据错误处理
*For any* 非有效 JSON 的字符串，存储层反序列化时应返回 success: false 的错误结果，而非抛出异常。
**Validates: Requirements 12.3**

### Property 17: 最近发布任务按时间排序
*For any* 已发布任务集合，首页预览返回的任务应按 createdAt 降序排列。
**Validates: Requirements 5.2**

## 错误处理

| 场景 | 处理方式 |
|------|---------|
| localStorage 空间不足 | 返回 `StorageResult` 错误，UI 显示存储空间不足提示 |
| JSON 解析失败 | 返回 `StorageResult` 错误，不崩溃，显示数据格式错误提示 |
| 任务数量超过 10 个上限 | 拒绝创建，返回错误信息 |
| 未登录用户尝试接受任务 | 重定向到登录页 |
| 剪贴板 API 不可用 | 降级处理：显示邮箱文本供手动复制 |
| 项目不存在 | 返回 `StorageResult` 错误，显示项目不存在提示 |
| 任务不存在 | 返回 `StorageResult` 错误，显示任务不存在提示 |

## 测试策略

### 属性测试（Property-Based Testing）

- 使用 **fast-check** 库进行属性测试
- 每个属性测试至少运行 100 次迭代
- 每个测试用注释标注对应的设计文档属性编号
- 标注格式：**Feature: task-system, Property {number}: {property_text}**
- 每个正确性属性对应一个独立的属性测试

### 单元测试

- 使用 **Jest** + **@testing-library/react** 进行单元测试
- 单元测试聚焦于：
  - 边界条件（如 10 个任务上限）
  - 特定示例（如未登录用户重定向）
  - 错误条件（如 localStorage 不可用）
  - 组件渲染验证

### 测试覆盖范围

- 存储层：属性测试覆盖所有 CRUD 操作的正确性
- 业务逻辑：属性测试覆盖状态转换、通知创建、成就记录
- UI 组件：单元测试覆盖条件渲染、用户交互
- 属性测试和单元测试互补：属性测试验证通用正确性，单元测试验证具体场景
