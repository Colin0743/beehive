# 实施计划：后端 Supabase 迁移

## 概述

将蜂巢平台从 localStorage 迁移到 Supabase 后端。采用自底向上的实施策略：先搭建基础设施（Supabase 客户端、数据库 Schema），再构建 API 中间层，然后创建前端 API 客户端，最后迁移 AuthContext 和前端页面。使用 TypeScript 实现，测试使用 Playwright + fast-check。

## 任务

- [x] 1. 安装依赖与 Supabase 客户端初始化
  - [x] 1.1 安装 Supabase 依赖包并配置环境变量
    - 安装 `@supabase/supabase-js`、`@supabase/ssr`、`fast-check`
    - 创建 `.env.local.example` 文件，包含 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`
    - 在 `.gitignore` 中确认 `.env.local` 已被忽略
    - _Requirements: 8.1, 8.2_

  - [x] 1.2 创建浏览器端 Supabase 客户端模块 `src/lib/supabase.ts`
    - 使用 `@supabase/ssr` 的 `createBrowserClient` 创建浏览器端客户端
    - 环境变量缺失时输出明确错误日志
    - 导出 `createClient` 函数
    - _Requirements: 8.1, 8.3, 8.4_

  - [x] 1.3 创建服务端 Supabase 客户端模块 `src/lib/supabase-server.ts`
    - 使用 `@supabase/ssr` 的 `createServerClient` 创建服务端客户端
    - 通过 `cookies()` 读写 cookie 以继承用户 RLS 权限
    - 导出 `createServerSupabaseClient` 异步函数
    - _Requirements: 4.2, 8.2, 8.4_

  - [ ]* 1.4 编写 Supabase 客户端初始化属性测试
    - **Property 24: 环境变量缺失错误提示**
    - **Validates: Requirements 8.3**

- [x] 2. 数据库 Schema 与 RLS 策略
  - [x] 2.1 创建 SQL 迁移脚本 `supabase/migrations/001_initial_schema.sql`
    - 创建所有数据表：profiles、projects、project_logs、tasks、task_acceptances、notifications、achievements、project_follows、project_participations、click_events
    - 设置所有外键、索引、默认值、复合主键/唯一约束
    - 使用 `gen_random_uuid()` 自动生成 UUID 主键
    - tasks 表使用 `order_index` 避免保留字冲突，`reference_images` 使用 `jsonb` 类型
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 2.2 编写关系表唯一约束属性测试
    - **Property 1: 关系表唯一约束**
    - **Validates: Requirements 1.5**

  - [x] 2.3 创建 RLS 策略迁移脚本 `supabase/migrations/002_rls_policies.sql`
    - 对所有表启用 RLS
    - 创建 `is_admin()` 数据库函数判断管理员角色
    - 实现未认证用户只读公开数据策略（projects、published tasks、achievements）
    - 实现 profiles 表用户自身读写策略
    - 实现 projects 表所有人可读、创建者可写策略
    - 实现 tasks 表所有人可读、项目创建者可写策略
    - 实现 notifications 表用户自身读写策略
    - 实现管理员全表 CRUD 策略
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 2.4 编写 RLS 权限隔离属性测试
    - **Property 2: 未认证用户数据访问限制**
    - **Property 3: 资源所有者 Profile 隔离**
    - **Property 4: 项目创建者写权限**
    - **Property 5: 任务权限继承项目创建者**
    - **Property 6: 通知所有者隔离**
    - **Property 7: 管理员全表 CRUD 权限**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

  - [x] 2.5 创建 profiles 自动创建触发器 `supabase/migrations/003_auto_profile.sql`
    - 创建触发器函数：当 auth.users 新增记录时自动在 profiles 表创建对应记录
    - name 默认为邮箱 @ 前缀，role 默认为 'user'
    - _Requirements: 3.3_

  - [ ]* 2.6 编写首次登录自动创建 Profile 属性测试
    - **Property 8: 首次登录自动创建 Profile**
    - **Validates: Requirements 3.3**

- [x] 3. 检查点 - 基础设施验证
  - 确保所有 SQL 迁移脚本语法正确，所有测试通过，如有问题请询问用户。

- [x] 4. API Routes 中间层实现
  - [x] 4.1 创建 API 工具函数 `src/app/api/_helpers.ts`
    - 实现统一的认证检查函数（从 cookie 获取 session）
    - 实现统一的响应格式函数（success/error）
    - 实现请求体必填字段验证函数
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 4.2 编写 API 响应格式与字段验证属性测试
    - **Property 12: API 响应格式一致性**
    - **Property 13: 写操作必填字段验证**
    - **Validates: Requirements 4.4, 4.5, 4.6**

  - [x] 4.3 实现用户 Profile API `src/app/api/auth/profile/route.ts`
    - GET: 获取当前用户 profile（需认证）
    - PUT: 更新当前用户 profile（需认证，仅允许更新 name、avatar）
    - _Requirements: 6.5_

  - [x] 4.4 实现项目 CRUD API
    - 创建 `src/app/api/projects/route.ts`（GET 列表 / POST 创建）
    - 创建 `src/app/api/projects/[id]/route.ts`（GET / PUT / DELETE 单个项目）
    - 创建 `src/app/api/projects/[id]/logs/route.ts`（GET / POST 项目日志）
    - POST/PUT 验证必填字段（title、description、category）
    - _Requirements: 4.1, 4.6, 7.2, 7.3_

  - [ ]* 4.5 编写项目 CRUD Round-Trip 属性测试
    - **Property 21: 项目 CRUD Round-Trip**
    - **Validates: Requirements 7.3**

  - [x] 4.6 实现任务 API
    - 创建 `src/app/api/tasks/route.ts`（GET 所有已发布任务）
    - 创建 `src/app/api/tasks/[projectId]/route.ts`（GET / POST / PUT / DELETE 项目任务）
    - POST 时校验同一项目下任务数量不超过 10 个
    - _Requirements: 4.1, 4.7, 7.4_

  - [ ]* 4.7 编写任务数量上限属性测试
    - **Property 14: 任务数量上限**
    - **Validates: Requirements 4.7**

  - [x] 4.8 实现任务接受 API `src/app/api/task-acceptances/route.ts`
    - POST: 接受任务（需认证）
    - GET: 查询用户的任务接受记录
    - _Requirements: 4.1_

  - [x] 4.9 实现通知 API `src/app/api/notifications/route.ts`
    - GET: 获取当前用户通知列表
    - POST: 创建通知
    - PUT: 标记通知为已读
    - _Requirements: 4.1_

  - [x] 4.10 实现成就 API `src/app/api/achievements/route.ts`
    - GET: 获取成就列表
    - POST: 创建成就记录
    - _Requirements: 4.1_

  - [x] 4.11 实现关系操作 API
    - 创建 `src/app/api/project-follows/route.ts`（POST 关注 / DELETE 取消关注 / GET 查询）
    - 创建 `src/app/api/project-participations/route.ts`（POST 参与 / GET 查询）
    - _Requirements: 4.1, 7.5_

  - [ ]* 4.12 编写关系操作 Round-Trip 属性测试
    - **Property 22: 关系操作 Round-Trip**
    - **Validates: Requirements 7.5**

  - [x] 4.13 实现点击事件 API `src/app/api/click-events/route.ts`
    - POST: 记录点击事件
    - GET: 查询项目点击统计（支持批量查询）
    - _Requirements: 4.1_

  - [ ]* 4.14 编写无效 Session 返回 401 属性测试
    - **Property 11: 无效 Session 返回 401**
    - **Validates: Requirements 4.3**

  - [ ]* 4.15 编写管理后台权限控制属性测试
    - **Property 23: 管理后台权限控制**
    - **Validates: Requirements 7.6**

- [x] 5. 检查点 - API 层验证
  - 确保所有 API Routes 实现完成，所有测试通过，如有问题请询问用户。

- [x] 6. 前端 API 客户端
  - [x] 6.1 创建 API 客户端模块 `src/lib/api.ts`
    - 实现内部 `apiFetch<T>` 封装函数，自动处理 JSON 序列化、错误捕获
    - HTTP 401 时触发登出并重定向到 `/auth/login`
    - 网络失败时返回 `{ success: false, error: '网络请求失败，请检查网络连接' }`
    - 导出 `userStorage` 模块（getCurrentUser、updateUser 等方法）
    - 导出 `projectStorage` 模块（getAll、getById、create、update、delete 等方法）
    - 导出 `projectRelationStorage` 模块（follow、unfollow、isFollowing、participate 等方法）
    - 导出 `taskStorage` 模块（getByProject、create、update、delete、getAllPublished 等方法）
    - 导出 `taskAcceptanceStorage` 模块（accept、getByTask、getByUser 等方法）
    - 导出 `notificationStorage` 模块（getByUser、markAsRead、create 等方法）
    - 导出 `achievementStorage` 模块（getAll、create 等方法）
    - 所有方法返回 `StorageResult<T>` 格式
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 6.2 编写 API 客户端属性测试
    - **Property 15: API 客户端返回 StorageResult 格式**
    - **Property 16: 网络失败错误处理**
    - **Property 17: 401 自动登出**
    - **Validates: Requirements 5.2, 5.4, 5.5**

  - [x] 6.3 创建 clickTracker API 模块
    - 在 `src/lib/api.ts` 中导出 `clickTracker` 模块
    - 提供 `recordClick`、`getClickCount`、`getBatchClickCounts`、`cleanup` 方法
    - 接口与现有 `clickTracker.ts` 保持一致
    - _Requirements: 5.6_

- [x] 7. AuthContext 迁移
  - [x] 7.1 重写 `src/contexts/AuthContext.tsx`
    - 初始化时使用 `supabase.auth.getSession()` 恢复会话
    - 监听 `onAuthStateChange` 自动更新 React 状态（SIGNED_IN、SIGNED_OUT、TOKEN_REFRESHED）
    - 实现 `sendOtp(email)` 方法调用 `supabase.auth.signInWithOtp({ email })`
    - 实现 `verifyOtp(email, token)` 方法调用 `supabase.auth.verifyOtp({ email, token, type: 'email' })`
    - 实现 `logout()` 方法调用 `supabase.auth.signOut()` 并重定向到首页
    - 实现 `updateUser(data)` 方法通过 API_Layer 更新 profiles 表
    - 实现 `isProjectOwner(projectId)` 方法通过 API_Layer 查询项目创建者
    - 保持导出 `user`、`isLoggedIn`、`loading`、`isAdminUser` 状态
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 7.2 编写 AuthContext 属性测试
    - **Property 9: 错误 OTP 验证失败**
    - **Property 10: Session 生命周期 Round-Trip**
    - **Property 18: Auth 状态变化同步**
    - **Property 19: 用户信息更新 Round-Trip**
    - **Property 20: isProjectOwner 一致性**
    - **Validates: Requirements 3.4, 3.6, 3.7, 6.2, 6.5, 6.6**

- [x] 8. 检查点 - 客户端层验证
  - 确保 API 客户端和 AuthContext 实现完成，所有测试通过，如有问题请询问用户。

- [x] 9. 登录页面迁移
  - [x] 9.1 重写登录页面 `src/app/auth/login/page.tsx`
    - 替换密码登录为邮箱 OTP 两步流程：输入邮箱 → 输入验证码
    - 调用 AuthContext 的 `sendOtp` 和 `verifyOtp` 方法
    - 处理 OTP 发送失败、验证失败、过期等错误提示
    - Supabase Auth 不可用时显示友好错误提示并提供重试按钮
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.8_

  - [x] 9.2 重写注册页面 `src/app/auth/register/page.tsx`
    - 由于使用 OTP 登录，注册与登录合并为同一流程
    - 可将注册页重定向到登录页，或保留为首次登录引导页
    - _Requirements: 3.3_

- [x] 10. 前端页面数据层替换
  - [x] 10.1 迁移项目相关页面
    - 修改 `src/app/projects/page.tsx`：import 从 `@/lib/storage` 改为 `@/lib/api`
    - 修改 `src/app/projects/[id]/page.tsx`：同上
    - 修改 `src/app/projects/new/page.tsx`：同上
    - 将同步调用改为 async/await 异步调用（因 API 客户端方法为异步）
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 10.2 迁移任务大厅页面
    - 修改 `src/app/tasks/page.tsx`：import 从 `@/lib/storage` 改为 `@/lib/api`
    - 将同步调用改为 async/await 异步调用
    - _Requirements: 7.1, 7.4_

  - [x] 10.3 迁移个人资料页面
    - 修改 `src/app/profile/page.tsx`：import 从 `@/lib/storage` 改为 `@/lib/api`
    - 将同步调用改为 async/await 异步调用
    - _Requirements: 7.1_

  - [x] 10.4 迁移管理后台页面
    - 修改 `src/app/admin/` 下所有页面：import 从 `@/lib/storage` 改为 `@/lib/api`
    - 将同步调用改为 async/await 异步调用
    - 确保管理员权限检查通过 API_Layer 执行
    - _Requirements: 7.1, 7.6_

  - [x] 10.5 迁移首页和其他组件
    - 修改 `src/app/page.tsx`：import 从 `@/lib/storage` 改为 `@/lib/api`
    - 修改所有引用 `@/lib/storage` 或 `@/lib/clickTracker` 的组件
    - 将同步调用改为 async/await 异步调用
    - _Requirements: 7.1, 7.5_

- [x] 11. Supabase Middleware 配置
  - [x] 11.1 创建 Next.js Middleware `src/middleware.ts`
    - 使用 `@supabase/ssr` 的 `createServerClient` 刷新过期 session
    - 配置 matcher 匹配所有需要认证的路由
    - 确保 cookie 在请求/响应间正确传递
    - _Requirements: 3.7, 4.2_

- [x] 12. 清理与收尾
  - [x] 12.1 移除旧依赖和代码
    - 从 `package.json` 移除 `bcryptjs` 和 `@types/bcryptjs` 依赖
    - 确认 `src/lib/storage.ts` 和 `src/lib/clickTracker.ts` 不再被任何文件引用
    - 从 `User` 类型中移除 `passwordHash` 字段
    - _Requirements: 3.1, 5.1_

- [x] 13. 最终检查点 - 全量验证
  - 确保所有测试通过，所有页面功能正常，如有问题请询问用户。

## 备注

- 标记 `*` 的任务为可选属性测试任务，可跳过以加速 MVP 开发
- 每个任务引用了具体的需求编号以确保可追溯性
- 检查点任务用于阶段性验证，确保增量开发的正确性
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
- 所有 API 客户端方法为异步方法，前端页面迁移时需将同步调用改为 async/await
