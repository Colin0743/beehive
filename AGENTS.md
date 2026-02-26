# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 项目概述

蜂巢是一个AI视频协作平台，参考Kickstarter模式但目标是"筹集"视频制作时长而非资金。用户分为三种角色：
- **发起人 (Initiator)**: 项目创建者/导演
- **协作者 (Collaborator)**: 核心美术师
- **工蜂 (Worker Bee)**: 算力提供者

## 技术架构

### 主项目: `beehive-platform/`
- **框架**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + Semantic UI React
- **后端**: Supabase (Auth + PostgreSQL + Storage)
- **测试**: Playwright (E2E)
- **国际化**: i18next + react-i18next

### 核心目录结构
```
beehive-platform/
├── src/
│   ├── app/              # Next.js 页面 (App Router)
│   │   ├── api/          # API Routes (RESTful 端点)
│   │   └── projects/     # 项目相关页面
│   ├── components/       # React 组件
│   ├── contexts/         # React Context (AuthContext)
│   ├── lib/              # 工具库
│   │   ├── api.ts        # API 客户端封装 (替代直接 Supabase 调用)
│   │   ├── supabase.ts   # 浏览器端 Supabase 客户端
│   │   └── supabase-server.ts  # 服务端 Supabase 客户端
│   └── types/            # TypeScript 类型定义
├── supabase/migrations/  # 数据库迁移 SQL 脚本
└── tests/                # Playwright 测试
```

## 常用命令

```bash
cd beehive-platform

# 开发
npm run dev          # 启动开发服务器 (localhost:3000)

# 构建
npm run build        # 生产构建
npm start            # 启动生产服务器

# 测试
npm test             # 运行 Playwright 测试
npm run test:ui      # Playwright UI 模式
npm run test:report  # 查看测试报告

# 代码检查
npm run lint         # ESLint 检查
```

## 数据流架构

### 前端 → API → Supabase
1. 前端组件调用 `src/lib/api.ts` 中的存储模块 (`projectStorage`, `userStorage` 等)
2. API 客户端封装了 HTTP 请求到 `/api/*` 路由
3. API Routes 使用服务端 Supabase 客户端操作数据库

### 字段命名转换
- 前端使用 **camelCase** (`targetDuration`, `creatorId`)
- 数据库使用 **snake_case** (`target_duration`, `creator_id`)
- 转换在 `src/lib/api.ts` 的 `mapDbProjectToProject()` 和 `mapProjectToDb()` 函数中处理

### 认证流程
1. 使用 Supabase Magic Link (OTP) 邮箱登录
2. `AuthContext` 管理全局认证状态
3. `middleware.ts` 刷新 session 并处理 cookie
4. RLS (Row Level Security) 策略在数据库层控制权限

## 数据库表结构

核心表 (见 `supabase/migrations/001_initial_schema.sql`):
- `profiles`: 用户信息 (关联 `auth.users`)
- `projects`: 项目信息 (包含 `target_duration`, `current_duration`)
- `tasks`: 任务信息 (提示词、参考图等)
- `project_logs`: 项目日志
- `project_participations`: 用户参与记录 (角色: `worker_bee`)
- `project_follows`: 项目关注记录

权限通过 RLS 策略控制 (见 `002_rls_policies.sql`):
- 项目公开可读，仅创建者可改
- `is_admin()` 函数判断管理员权限

## 开发注意事项

### API 开发
- 新增 API 端点在 `src/app/api/` 下创建 `route.ts`
- 使用 `src/app/api/_helpers.ts` 中的辅助函数
- 认证检查通过 `supabase.auth.getUser()` 获取当前用户

### 组件开发
- 使用 `'use client'` 指令标记客户端组件
- 认证状态通过 `useAuth()` hook 获取
- Toast 通知使用 `useToast()` hook

### 类型定义
- 核心类型在 `src/types/index.ts`
- 新增字段需同步更新类型定义和 API 映射函数

### 测试
- 测试文件放在 `tests/` 目录
- 使用 `data-testid` 属性作为稳定选择器
- 等待页面加载使用 `waitForLoadState('networkidle')`

## 环境变量

必需的环境变量 (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

支付相关 (可选):
```
USE_MOCK_PAYMENT=true
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
```
