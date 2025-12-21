# 设计文档

## 概述

"蜂巢" AI视频协作平台是一个基于Next.js + React + Semantic UI构建的Web应用，旨在为AI视频创作者提供一个协作平台。平台的核心功能包括项目创建、项目浏览、用户认证、项目参与和进度管理。

**设计目标:**
- 快速MVP上线，验证产品概念
- 简洁直观的用户界面
- 响应式设计，适配多种设备
- 使用localStorage实现数据持久化（MVP阶段）
- 为未来后端API集成预留扩展空间

**技术栈:**
- 前端框架: Next.js 12.2.4 + React 17.0.2
- UI组件库: Semantic UI React 2.1.3
- 状态管理: React Context API (AuthContext)
- 数据存储: localStorage (MVP阶段)
- 样式: Semantic UI CSS + 自定义CSS变量

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                    用户浏览器                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Next.js 应用层                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │   Pages    │  │ Components │  │ Contexts  │  │  │
│  │  │  (路由)     │  │  (UI组件)   │  │ (状态管理) │  │  │
│  │  └────────────┘  └────────────┘  └───────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↕                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │           数据持久化层                             │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │         localStorage                        │  │  │
│  │  │  - projects (项目数据)                      │  │  │
│  │  │  - user (当前用户)                          │  │  │
│  │  │  - userProjects_{userId} (用户项目)        │  │  │
│  │  │  - userFollows_{userId} (用户关注)         │  │  │
│  │  │  - userParticipations_{userId} (用户参与)  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 页面路由结构

```
/                              # 首页 - 项目列表
├── /projects/new              # 创建项目
├── /projects/[id]             # 项目详情
├── /projects/edit/[id]        # 编辑项目 (待实现)
├── /profile                   # 个人中心 (待实现)
├── /auth/login                # 登录
└── /auth/register             # 注册
```

## 组件和接口

### 核心组件

#### 1. Layout组件
**职责:** 提供统一的页面布局结构
**接口:**
```typescript
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}
```

#### 2. Header组件
**职责:** 导航栏，显示Logo、菜单和用户信息
**功能:**
- 显示蜂巢Logo和品牌名称
- 提供主导航菜单（发现项目、个人中心）
- 根据登录状态显示不同的操作按钮
- 用户下拉菜单（个人中心、退出登录）

#### 3. ProjectCard组件
**职责:** 项目卡片展示
**接口:**
```typescript
interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    coverImage: string;
    currentDuration: number;
    targetDuration: number;
    participantsCount: number;
    category: string;
    status: string;
  };
}
```

#### 4. HeroCarousel组件
**职责:** 首页轮播图展示
**功能:**
- 展示平台特色和核心价值
- 自动轮播和手动切换
- 响应式设计

#### 5. RichTextEditor组件
**职责:** 富文本编辑器
**功能:**
- 支持Markdown格式
- 提供格式化工具栏
- 实时预览

### 数据模型

#### Project (项目)
```typescript
interface Project {
  id: number;                    // 项目唯一标识
  title: string;                 // 项目标题
  description: string;           // 项目描述
  coverImage: string;            // 封面图片URL
  coverImages: MediaFile[];      // 封面图片数组
  coverVideos: MediaFile[];      // 封面视频数组
  category: string;              // 项目分类
  targetDuration: number;        // 目标时长（分钟）
  currentDuration: number;       // 当前时长（分钟）
  initiator: string;             // 发起人名称
  initiatorId: string;           // 发起人ID
  participantsCount: number;     // 参与者数量
  status: 'active' | 'completed' | 'paused';  // 项目状态
  telegramGroup?: string;        // Telegram群组链接
  createdAt: string;             // 创建时间
  updatedAt?: string;            // 更新时间
  popularity: number;            // 热度值
  progressUpdatesCount: number;  // 进度更新数
  logs: ProjectLog[];            // 项目日志数组
}
```

#### MediaFile (媒体文件)
```typescript
interface MediaFile {
  id: number;
  name: string;
  url: string;
  type: string;
  size: number;
  base64?: string;  // Base64数据（用于图片持久化）
}
```

#### ProjectLog (项目日志)
```typescript
interface ProjectLog {
  id: number;
  title: string;
  content: string;
  type: 'progress' | 'milestone' | 'announcement';
  createdAt: string;
  author: string;
}
```

#### User (用户)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}
```

#### UserProjectRelation (用户项目关系)
```typescript
interface UserProjectRelation {
  userId: string;
  projectId: number;
  role: 'initiator' | 'collaborator' | 'worker_bee';
  joinedAt: string;
}
```

#### UserFollowRelation (用户关注关系)
```typescript
interface UserFollowRelation {
  userId: string;
  projectId: number;
  followedAt: string;
}
```

### AuthContext (认证上下文)

**职责:** 管理用户认证状态和相关操作

**接口:**
```typescript
interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  isProjectOwner: (projectId: number) => boolean;
}
```

**功能:**
- 管理用户登录状态
- 提供登录、登出功能
- 从localStorage恢复用户状态
- 检查用户是否为项目发起人

## 数据模型

### localStorage数据结构

#### 1. projects (所有项目)
```json
[
  {
    "id": 1,
    "title": "科幻短片：未来城市",
    "description": "探索2050年智能城市生活的短片...",
    "coverImage": "https://...",
    "coverImages": [...],
    "coverVideos": [...],
    "category": "short-video",
    "targetDuration": 3,
    "currentDuration": 2,
    "initiator": "导演王小明",
    "initiatorId": "user_001",
    "participantsCount": 8,
    "status": "active",
    "telegramGroup": "https://t.me/...",
    "createdAt": "2024-01-15",
    "popularity": 95,
    "progressUpdatesCount": 3,
    "logs": [...]
  }
]
```

#### 2. user (当前登录用户)
```json
{
  "id": "user_001",
  "name": "王小明",
  "email": "wangxiaoming@example.com",
  "avatar": "https://...",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### 3. userProjects_{userId} (用户创建的项目)
```json
[
  {
    "id": 1,
    "title": "科幻短片：未来城市",
    "createdAt": "2024-01-15"
  }
]
```

#### 4. userFollows_{userId} (用户关注的项目)
```json
[
  {
    "projectId": 2,
    "followedAt": "2024-01-20T10:00:00Z"
  }
]
```

#### 5. userParticipations_{userId} (用户参与的项目)
```json
[
  {
    "projectId": 3,
    "role": "collaborator",
    "joinedAt": "2024-01-18T14:30:00Z"
  }
]
```

#### 6. registeredUsers (所有注册用户)
```json
[
  {
    "id": "user_001",
    "name": "王小明",
    "email": "wangxiaoming@example.com",
    "avatar": "https://...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### 数据操作接口

#### 项目操作
```typescript
// 创建项目
function createProject(projectData: Omit<Project, 'id' | 'createdAt'>): Project;

// 获取所有项目
function getAllProjects(): Project[];

// 获取单个项目
function getProjectById(id: number): Project | null;

// 更新项目
function updateProject(id: number, updates: Partial<Project>): Project;

// 删除项目
function deleteProject(id: number): boolean;

// 添加项目日志
function addProjectLog(projectId: number, log: Omit<ProjectLog, 'id' | 'createdAt'>): ProjectLog;
```

#### 用户操作
```typescript
// 注册用户
function registerUser(userData: { name: string; email: string; password: string }): User;

// 登录用户
function loginUser(email: string, password: string): User | null;

// 获取当前用户
function getCurrentUser(): User | null;

// 更新用户信息
function updateUserInfo(userId: string, updates: Partial<User>): User;
```

#### 用户项目关系操作
```typescript
// 关注项目
function followProject(userId: string, projectId: number): void;

// 取消关注
function unfollowProject(userId: string, projectId: number): void;

// 检查是否关注
function isFollowing(userId: string, projectId: number): boolean;

// 加入项目
function joinProject(userId: string, projectId: number, role: 'collaborator' | 'worker_bee'): void;

// 退出项目
function leaveProject(userId: string, projectId: number): void;

// 检查是否参与
function isParticipating(userId: string, projectId: number): boolean;

// 获取用户角色
function getUserRole(userId: string, projectId: number): string | null;
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: 项目创建持久化
*对于任何*有效的项目数据，当调用创建项目函数后，localStorage中应该包含该项目记录，且项目ID应该是唯一的。
**验证: 需求 1.1, 1.4**

### 属性 2: 必填字段验证
*对于任何*缺少必填字段（标题、描述、分类或时长目标）的项目数据，创建项目函数应该拒绝并返回验证错误。
**验证: 需求 1.2**

### 属性 3: 项目所有权
*对于任何*创建的项目，项目的initiatorId字段应该等于当前登录用户的ID。
**验证: 需求 1.3**

### 属性 4: 项目列表完整性
*对于任何*localStorage中的项目集合，首页显示的项目列表应该包含所有项目（在应用筛选之前）。
**验证: 需求 2.1**

### 属性 5: 项目卡片信息完整性
*对于任何*项目，渲染的项目卡片HTML应该包含项目标题、封面图URL、进度百分比和参与者数量。
**验证: 需求 2.2**

### 属性 6: 筛选结果正确性
*对于任何*筛选条件（分类、状态、排序），返回的项目列表中的每个项目都应该满足该筛选条件。
**验证: 需求 2.5**

### 属性 7: 进度计算正确性
*对于任何*项目，显示的进度百分比应该等于 (currentDuration / targetDuration) * 100，且不超过100%。
**验证: 需求 3.2**

### 属性 8: 日志时间排序
*对于任何*项目的日志数组，显示的日志顺序应该按createdAt字段倒序排列（最新的在前）。
**验证: 需求 3.3, 7.4**

### 属性 9: 权限控制 - 项目管理
*对于任何*项目和用户，当且仅当用户ID等于项目的initiatorId时，用户应该能看到编辑和管理按钮。
**验证: 需求 3.4, 7.5**

### 属性 10: 关注关系持久化
*对于任何*用户和项目，当用户关注项目后，localStorage中的userFollows_{userId}应该包含该项目ID的记录。
**验证: 需求 4.1**

### 属性 11: 关注状态一致性
*对于任何*用户和项目，如果localStorage中存在关注记录，则UI应该显示"已关注"状态；否则显示"关注项目"按钮。
**验证: 需求 4.2, 4.5**

### 属性 12: 参与关系持久化
*对于任何*用户、项目和角色（collaborator或worker_bee），当用户加入项目后，localStorage中的userParticipations_{userId}应该包含该项目ID和角色的记录。
**验证: 需求 5.2**

### 属性 13: 参与者计数正确性
*对于任何*项目，当用户加入项目后，项目的participantsCount应该增加1。
**验证: 需求 5.3**

### 属性 14: 时长更新验证
*对于任何*新的时长值，如果该值是负数、非数字或超过目标时长，更新函数应该拒绝并返回验证错误。
**验证: 需求 6.2**

### 属性 15: 时长更新持久化
*对于任何*有效的新时长值，当更新成功后，localStorage中项目的currentDuration应该等于新值。
**验证: 需求 6.3**

### 属性 16: 日志创建持久化
*对于任何*有效的日志数据（标题、内容、类型），当添加日志后，localStorage中项目的logs数组应该包含该日志记录。
**验证: 需求 7.2, 7.3**

### 属性 17: 用户注册验证
*对于任何*无效的注册数据（空姓名、无效邮箱、短密码），注册函数应该拒绝并返回验证错误。
**验证: 需求 9.1**

### 属性 18: 用户注册持久化
*对于任何*有效的注册数据，注册成功后，localStorage中的registeredUsers应该包含新用户记录。
**验证: 需求 9.2**

### 属性 19: 登录会话创建
*对于任何*有效的登录凭据，登录成功后，localStorage应该包含user键，且值应该是用户对象。
**验证: 需求 9.4**

### 属性 20: 登出会话清除
*对于任何*登录用户，当执行登出操作后，localStorage中的user和isLoggedIn键应该被移除。
**验证: 需求 9.5**

### 属性 21: 项目编辑表单预填充
*对于任何*项目，当加载编辑页面时，表单中的所有字段值应该等于localStorage中该项目的对应字段值。
**验证: 需求 10.2**

### 属性 22: 项目更新持久化
*对于任何*有效的项目更新数据，当更新成功后，localStorage中项目的对应字段应该等于新值。
**验证: 需求 10.4**


## 错误处理

### 错误类型

#### 1. 验证错误 (Validation Errors)
**场景:** 用户输入无效数据
**处理策略:**
- 在客户端进行即时验证
- 显示清晰的错误消息
- 阻止表单提交
- 高亮显示错误字段

**示例:**
```typescript
interface ValidationError {
  field: string;
  message: string;
}

// 项目创建验证
function validateProjectData(data: Partial<Project>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: '请输入项目标题' });
  }
  
  if (!data.description?.trim() || data.description.length < 10) {
    errors.push({ field: 'description', message: '项目描述至少需要10个字符' });
  }
  
  if (!data.category) {
    errors.push({ field: 'category', message: '请选择项目分类' });
  }
  
  if (!data.targetDuration || data.targetDuration <= 0) {
    errors.push({ field: 'targetDuration', message: '请输入有效的目标时长' });
  }
  
  return errors;
}
```

#### 2. 权限错误 (Permission Errors)
**场景:** 用户尝试执行未授权的操作
**处理策略:**
- 在UI层隐藏未授权的操作按钮
- 在操作执行前验证权限
- 显示友好的权限错误消息
- 提供登录或返回的选项

**示例:**
```typescript
function checkProjectOwnership(userId: string, projectId: number): boolean {
  const userProjects = JSON.parse(
    localStorage.getItem(`userProjects_${userId}`) || '[]'
  );
  return userProjects.some(p => p.id === projectId);
}

function requireAuth(user: User | null): void {
  if (!user) {
    throw new Error('请先登录');
  }
}

function requireProjectOwner(user: User, projectId: number): void {
  if (!checkProjectOwnership(user.id, projectId)) {
    throw new Error('您没有权限编辑此项目');
  }
}
```

#### 3. 数据不存在错误 (Not Found Errors)
**场景:** 请求的资源不存在
**处理策略:**
- 显示404页面或错误消息
- 提供返回首页的链接
- 记录错误日志

**示例:**
```typescript
function getProjectById(id: number): Project {
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    throw new Error(`项目 ${id} 不存在`);
  }
  
  return project;
}
```

#### 4. 存储错误 (Storage Errors)
**场景:** localStorage操作失败
**处理策略:**
- 捕获localStorage异常
- 显示用户友好的错误消息
- 提供重试选项
- 检查存储空间限制

**示例:**
```typescript
function safeLocalStorageSet(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage空间不足');
      alert('存储空间不足，请清理浏览器数据');
    } else {
      console.error('localStorage操作失败:', error);
      alert('数据保存失败，请重试');
    }
    return false;
  }
}
```

### 错误边界

使用React Error Boundary捕获组件错误：

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('组件错误:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>出错了</h2>
          <p>页面加载失败，请刷新重试</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## 测试策略

### 测试金字塔

```
        /\
       /  \
      / E2E \          少量端到端测试
     /______\
    /        \
   / 集成测试  \        适量集成测试
  /____________\
 /              \
/   单元测试      \     大量单元测试
/________________\
```

### 1. 单元测试 (Unit Tests)

**目标:** 测试独立函数和组件的正确性

**工具:** Jest + React Testing Library

**覆盖范围:**
- 数据操作函数（CRUD）
- 验证函数
- 工具函数
- React组件渲染
- 用户交互

**示例:**
```typescript
// 测试项目创建函数
describe('createProject', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it('应该创建新项目并保存到localStorage', () => {
    const projectData = {
      title: '测试项目',
      description: '这是一个测试项目',
      category: 'short-video',
      targetDuration: 5,
      initiatorId: 'user_001'
    };
    
    const project = createProject(projectData);
    
    expect(project.id).toBeDefined();
    expect(project.title).toBe(projectData.title);
    
    const projects = JSON.parse(localStorage.getItem('projects'));
    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe(project.id);
  });
  
  it('应该拒绝缺少必填字段的项目', () => {
    const invalidData = {
      title: '',
      description: '描述',
      category: 'short-video'
    };
    
    expect(() => createProject(invalidData)).toThrow();
  });
});

// 测试组件渲染
describe('ProjectCard', () => {
  it('应该显示项目信息', () => {
    const project = {
      id: 1,
      title: '测试项目',
      description: '项目描述',
      coverImage: 'https://example.com/image.jpg',
      currentDuration: 2,
      targetDuration: 5,
      participantsCount: 10
    };
    
    const { getByText } = render(<ProjectCard project={project} />);
    
    expect(getByText('测试项目')).toBeInTheDocument();
    expect(getByText('10 参与者')).toBeInTheDocument();
  });
});
```

### 2. 属性测试 (Property-Based Tests)

**目标:** 验证系统在各种输入下的通用属性

**工具:** fast-check (JavaScript属性测试库)

**配置:** 每个属性测试运行至少100次迭代

**覆盖范围:**
- 数据验证属性
- 数据持久化属性
- 计算正确性属性
- 状态一致性属性

**示例:**
```typescript
import fc from 'fast-check';

// 属性 1: 项目创建持久化
describe('Property: 项目创建持久化', () => {
  it('对于任何有效的项目数据，创建后应该存在于localStorage', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 2, maxLength: 50 }),
          description: fc.string({ minLength: 10, maxLength: 500 }),
          category: fc.constantFrom('short-video', 'animation', 'documentary'),
          targetDuration: fc.integer({ min: 1, max: 300 }),
          initiatorId: fc.string()
        }),
        (projectData) => {
          localStorage.clear();
          
          const project = createProject(projectData);
          const projects = JSON.parse(localStorage.getItem('projects'));
          
          expect(projects.some(p => p.id === project.id)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// 属性 7: 进度计算正确性
describe('Property: 进度计算正确性', () => {
  it('对于任何项目，进度百分比应该正确计算且不超过100%', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 300 }), // currentDuration
        fc.integer({ min: 1, max: 300 }), // targetDuration
        (current, target) => {
          const progress = calculateProgress(current, target);
          
          expect(progress).toBeGreaterThanOrEqual(0);
          expect(progress).toBeLessThanOrEqual(100);
          expect(progress).toBe(Math.min((current / target) * 100, 100));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// 属性 8: 日志时间排序
describe('Property: 日志时间排序', () => {
  it('对于任何日志数组，排序后应该按时间倒序', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.integer(),
            title: fc.string(),
            content: fc.string(),
            createdAt: fc.date().map(d => d.toISOString())
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (logs) => {
          const sorted = sortLogsByTime(logs);
          
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = new Date(sorted[i].createdAt);
            const next = new Date(sorted[i + 1].createdAt);
            expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 3. 集成测试 (Integration Tests)

**目标:** 测试多个组件和功能的协同工作

**工具:** Jest + React Testing Library

**覆盖范围:**
- 用户完整流程（注册→登录→创建项目→查看详情）
- 页面导航
- 数据流转
- Context与组件交互

**示例:**
```typescript
describe('用户创建项目流程', () => {
  it('应该完成完整的项目创建流程', async () => {
    // 1. 注册用户
    const { getByLabelText, getByText } = render(<RegisterPage />);
    
    fireEvent.change(getByLabelText('姓名'), { target: { value: '测试用户' } });
    fireEvent.change(getByLabelText('邮箱'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByLabelText('密码'), { target: { value: 'password123' } });
    fireEvent.click(getByText('注册'));
    
    await waitFor(() => {
      expect(localStorage.getItem('user')).toBeTruthy();
    });
    
    // 2. 创建项目
    const { getByPlaceholderText } = render(<CreateProjectPage />);
    
    fireEvent.change(getByPlaceholderText('项目标题'), { target: { value: '测试项目' } });
    fireEvent.change(getByPlaceholderText('项目描述'), { target: { value: '这是一个测试项目描述' } });
    fireEvent.click(getByText('创建项目'));
    
    await waitFor(() => {
      const projects = JSON.parse(localStorage.getItem('projects'));
      expect(projects).toHaveLength(1);
      expect(projects[0].title).toBe('测试项目');
    });
  });
});
```

### 测试覆盖率目标

- **单元测试:** 80%+ 代码覆盖率
- **属性测试:** 覆盖所有22个正确性属性
- **集成测试:** 覆盖主要用户流程

### 测试执行策略

1. **开发阶段:** 运行相关单元测试
2. **提交前:** 运行所有单元测试和属性测试
3. **CI/CD:** 运行完整测试套件
4. **发布前:** 运行集成测试和手动测试

## 性能考虑

### localStorage性能优化

1. **批量操作:** 减少localStorage读写次数
2. **数据压缩:** 对大型数据进行压缩存储
3. **懒加载:** 按需加载项目数据
4. **缓存策略:** 在内存中缓存常用数据

### 渲染性能优化

1. **React.memo:** 避免不必要的组件重渲染
2. **虚拟滚动:** 处理大量项目列表
3. **图片懒加载:** 延迟加载项目封面图
4. **代码分割:** 使用Next.js动态导入

## 安全考虑

### 数据验证

- 所有用户输入必须经过验证
- 防止XSS攻击（使用React的自动转义）
- 防止注入攻击（验证输入格式）

### 权限控制

- 在UI层和操作层双重验证权限
- 使用AuthContext统一管理权限
- 敏感操作需要二次确认

### 数据隐私

- 不在localStorage中存储敏感信息（如密码）
- 用户数据仅在本地存储（MVP阶段）
- 未来迁移到后端时需要加密传输

## 未来扩展

### 后端API集成

当MVP验证成功后，可以迁移到后端API：

```typescript
// 替换localStorage操作为API调用
async function createProject(projectData: ProjectData): Promise<Project> {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  
  if (!response.ok) {
    throw new Error('创建项目失败');
  }
  
  return response.json();
}
```

### 实时功能

- WebSocket实时更新项目进度
- 实时通知系统
- 协作者在线状态

### 高级功能

- 项目搜索优化（全文搜索）
- 推荐算法
- 数据分析和统计
- 文件上传到云存储
- 视频预览和播放

## 部署策略

### MVP阶段部署

1. **静态托管:** Vercel / Netlify
2. **环境变量:** 配置必要的环境变量
3. **域名配置:** 绑定自定义域名
4. **监控:** 基础的错误监控

### 生产环境部署

1. **前端:** Next.js部署到Vercel
2. **后端:** Node.js API部署到云服务器
3. **数据库:** PostgreSQL / MongoDB
4. **CDN:** 静态资源CDN加速
5. **监控:** 完整的APM和日志系统
