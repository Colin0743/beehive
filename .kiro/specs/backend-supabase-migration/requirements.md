# 需求文档：后端 Supabase 迁移

## 简介

蜂巢AI视频协作平台当前完全基于浏览器 localStorage 存储数据，存在数据丢失风险、无法多设备同步、无法多用户协作等问题。本需求描述将平台数据层迁移到 Supabase 后端服务（BaaS），并实现基于邮箱验证码（OTP）的登录认证系统，替代现有的前端密码哈希模拟认证。

## 术语表

- **Supabase_Client**: Supabase JavaScript SDK 客户端实例，用于与 Supabase 服务通信
- **API_Layer**: 基于 Next.js API Routes 的服务端中间层，封装所有 Supabase 数据库操作
- **Auth_Module**: 基于 Supabase Auth 的认证模块，处理用户注册、登录、会话管理
- **RLS_Policy**: Supabase Row Level Security 策略，在数据库层面控制数据访问权限
- **OTP**: One-Time Password，一次性验证码，通过邮箱发送给用户用于身份验证
- **Session**: Supabase Auth 管理的用户会话，包含 access_token 和 refresh_token
- **profiles 表**: 存储用户扩展信息（name、avatar、role）的数据库表，与 Supabase Auth 用户关联
- **StorageResult**: 现有前端统一的操作结果类型 `{ success: boolean; data?: T; error?: string }`
- **API_Client**: 前端 `src/lib/api.ts` 模块，替代现有 `storage.ts`，通过 HTTP 调用 API_Layer

## 需求

### 需求 1：Supabase 数据库 Schema 设计与创建

**用户故事：** 作为开发者，我希望在 Supabase 中创建与现有数据模型对应的数据库表结构，以便将 localStorage 数据迁移到持久化数据库。

#### 验收标准

1. THE API_Layer SHALL 提供以下数据库表的 SQL 迁移脚本：profiles、projects、project_logs、tasks、task_acceptances、notifications、achievements、project_follows、project_participations、click_events
2. WHEN 创建 profiles 表时，THE Schema SHALL 包含字段：id（关联 auth.users）、name、avatar、role（默认 'user'）、is_active（默认 true）、created_at
3. WHEN 创建 projects 表时，THE Schema SHALL 包含字段：id、title、description、category、target_duration、current_duration、telegram_group、cover_image、video_file、creator_id（外键关联 profiles）、creator_name、participants_count、status、created_at
4. WHEN 创建 tasks 表时，THE Schema SHALL 包含字段：id、project_id（外键关联 projects）、prompt、reference_images、requirements、creator_email、status、contributor_name、duration、order、created_at、updated_at
5. WHEN 创建关系表（project_follows、project_participations、task_acceptances）时，THE Schema SHALL 使用复合主键或唯一约束防止重复记录
6. THE Schema SHALL 为所有外键字段创建索引以优化查询性能
7. WHEN 创建 click_events 表时，THE Schema SHALL 包含字段：id、project_id、timestamp、user_id（可选），并为 project_id 和 timestamp 创建复合索引

### 需求 2：Row Level Security（RLS）策略

**用户故事：** 作为开发者，我希望通过 RLS 策略在数据库层面控制数据访问权限，以便确保用户只能访问和修改自己有权限的数据。

#### 验收标准

1. THE RLS_Policy SHALL 对所有数据表启用 Row Level Security
2. WHEN 未认证用户访问数据时，THE RLS_Policy SHALL 仅允许读取 projects、tasks（status 为 'published'）和 achievements 表的公开数据
3. WHEN 认证用户操作 profiles 表时，THE RLS_Policy SHALL 仅允许用户读取和更新自己的 profile 记录
4. WHEN 认证用户操作 projects 表时，THE RLS_Policy SHALL 允许所有认证用户读取项目，仅允许项目创建者更新和删除自己的项目
5. WHEN 认证用户操作 tasks 表时，THE RLS_Policy SHALL 允许所有认证用户读取任务，仅允许任务所属项目的创建者创建、更新和删除任务
6. WHEN 认证用户操作 notifications 表时，THE RLS_Policy SHALL 仅允许用户读取和更新自己的通知记录
7. WHEN 管理员用户（role 为 'admin' 或 'super_admin'）操作数据时，THE RLS_Policy SHALL 允许管理员对所有表执行完整的 CRUD 操作

### 需求 3：邮箱 OTP 认证系统

**用户故事：** 作为用户，我希望通过邮箱验证码登录平台，以便无需记忆密码即可安全访问我的账户。

#### 验收标准

1. WHEN 用户在登录页面输入邮箱地址并提交时，THE Auth_Module SHALL 调用 Supabase Auth 发送 OTP 验证码到该邮箱
2. WHEN 用户输入正确的 OTP 验证码时，THE Auth_Module SHALL 验证成功并创建用户会话（Session）
3. WHEN 用户首次通过 OTP 登录且 profiles 表中无对应记录时，THE Auth_Module SHALL 自动创建 profile 记录，name 默认为邮箱前缀，role 默认为 'user'
4. WHEN 用户输入错误的 OTP 验证码时，THE Auth_Module SHALL 返回明确的错误提示信息
5. WHEN OTP 验证码超过有效期时，THE Auth_Module SHALL 拒绝验证并提示用户重新获取验证码
6. WHEN 用户点击登出时，THE Auth_Module SHALL 清除 Supabase Session 并将用户重定向到首页
7. WHEN 页面加载时，THE Auth_Module SHALL 检查现有 Session 有效性并自动恢复登录状态
8. IF Supabase Auth 服务不可用，THEN THE Auth_Module SHALL 显示友好的错误提示并允许用户重试

### 需求 4：Next.js API Routes 中间层

**用户故事：** 作为开发者，我希望通过 Next.js API Routes 封装所有 Supabase 数据库操作，以便前端不直接暴露数据库连接信息，并统一处理认证和错误。

#### 验收标准

1. THE API_Layer SHALL 为以下资源提供 RESTful API 端点：projects、tasks、notifications、achievements、project-follows、project-participations、click-events
2. WHEN API 请求包含有效的 Supabase Session 时，THE API_Layer SHALL 使用该 Session 创建服务端 Supabase 客户端以继承 RLS 权限
3. WHEN API 请求缺少有效 Session 且访问受保护资源时，THE API_Layer SHALL 返回 401 状态码和错误信息
4. WHEN API 操作成功时，THE API_Layer SHALL 返回统一格式 `{ success: true, data: T }`
5. WHEN API 操作失败时，THE API_Layer SHALL 返回统一格式 `{ success: false, error: string }` 和适当的 HTTP 状态码
6. THE API_Layer SHALL 对所有写操作（POST、PUT、DELETE）验证请求体的必填字段
7. WHEN 创建任务时，THE API_Layer SHALL 校验同一项目下任务数量不超过 10 个

### 需求 5：前端 API 客户端

**用户故事：** 作为开发者，我希望创建一个新的前端 API 客户端模块替代现有的 localStorage 存储模块，以便前端页面通过统一接口访问后端数据。

#### 验收标准

1. THE API_Client SHALL 导出与现有 storage.ts 相同命名的模块：userStorage、projectStorage、projectRelationStorage、taskStorage、taskAcceptanceStorage、notificationStorage、achievementStorage
2. WHEN 调用 API_Client 的任何方法时，THE API_Client SHALL 返回与现有 StorageResult<T> 相同结构的结果对象
3. WHEN 发起 HTTP 请求时，THE API_Client SHALL 自动附带当前用户的 Supabase Session token
4. IF 网络请求失败或超时，THEN THE API_Client SHALL 返回 `{ success: false, error: '网络请求失败，请检查网络连接' }`
5. IF API 返回 401 状态码，THEN THE API_Client SHALL 触发用户登出流程并重定向到登录页面
6. THE API_Client SHALL 导出 clickTracker 模块，提供与现有 clickTracker.ts 相同的 recordClick、getClickCount、getBatchClickCounts、cleanup 方法接口

### 需求 6：AuthContext 迁移

**用户故事：** 作为开发者，我希望将现有的 AuthContext 从 localStorage 认证迁移到 Supabase Auth，以便整个应用使用统一的后端认证状态。

#### 验收标准

1. WHEN AuthProvider 初始化时，THE Auth_Module SHALL 通过 Supabase Auth 的 `getSession()` 恢复用户会话，而非从 localStorage 读取
2. WHEN Supabase Auth 会话状态变化时（登录、登出、token 刷新），THE Auth_Module SHALL 通过 `onAuthStateChange` 监听器自动更新 React 状态
3. THE Auth_Module SHALL 继续提供现有 AuthContextValue 接口的所有属性和方法：user、isLoggedIn、loading、isAdminUser、login、logout、updateUser、isProjectOwner
4. WHEN 调用 login 方法时，THE Auth_Module SHALL 接受邮箱和 OTP 验证码参数，而非 User 对象
5. WHEN 调用 updateUser 方法时，THE Auth_Module SHALL 通过 API_Layer 更新 profiles 表中的用户信息
6. WHEN 调用 isProjectOwner 方法时，THE Auth_Module SHALL 通过 API_Layer 查询项目创建者信息，而非从 localStorage 读取

### 需求 7：前端页面数据层替换

**用户故事：** 作为开发者，我希望将所有前端页面的数据层调用从 localStorage 切换到新的 API 客户端，以便整个应用使用后端数据。

#### 验收标准

1. WHEN 前端页面导入数据操作模块时，THE API_Client SHALL 作为 storage.ts 的直接替代品，所有现有页面的 import 路径从 `@/lib/storage` 更改为 `@/lib/api`
2. WHEN 项目列表页面加载时，THE API_Client SHALL 通过 API_Layer 获取项目数据，而非从 localStorage 读取
3. WHEN 用户创建、编辑或删除项目时，THE API_Client SHALL 通过 API_Layer 执行操作并返回 StorageResult 格式的结果
4. WHEN 任务大厅页面加载时，THE API_Client SHALL 通过 API_Layer 获取所有已发布任务
5. WHEN 用户执行关注、参与项目等关系操作时，THE API_Client SHALL 通过 API_Layer 执行操作
6. WHEN 管理后台页面加载时，THE API_Client SHALL 通过 API_Layer 获取用户列表和项目列表，仅管理员角色可访问

### 需求 8：Supabase 项目配置

**用户故事：** 作为开发者，我希望有清晰的 Supabase 项目配置指南和环境变量设置，以便快速搭建和部署后端服务。

#### 验收标准

1. THE Supabase_Client SHALL 通过环境变量 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 进行初始化
2. THE API_Layer SHALL 通过环境变量 `SUPABASE_SERVICE_ROLE_KEY` 访问需要管理员权限的操作
3. WHEN 环境变量缺失时，THE Supabase_Client SHALL 在应用启动时输出明确的错误日志提示配置缺失
4. THE Supabase_Client SHALL 提供独立的客户端初始化模块 `src/lib/supabase.ts`，导出浏览器端客户端和服务端客户端的创建函数
5. WHEN 配置 Supabase Auth 邮箱 OTP 时，THE Auth_Module SHALL 支持自定义邮件模板和发送频率限制配置