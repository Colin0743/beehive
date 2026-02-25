# 蜂巢AI视频协作平台 - 项目概览

## 技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4 + CSS 变量（深色主题）
- **UI组件**: Semantic UI React（部分使用）
- **后端服务**: Supabase
  - Auth: 身份认证（邮箱/密码）
  - Database: PostgreSQL
  - Storage: 文件存储（图片上传）
- **国际化**: i18next + react-i18next
- **测试**: Playwright

## 目录结构
```
beehive-platform/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── admin/              # 后台管理页面
│   │   │   ├── dashboard/      # 仪表盘
│   │   │   ├── projects/       # 项目管理
│   │   │   └── users/          # 用户管理
│   │   ├── api/                # API Routes
│   │   ├── auth/               # 认证相关页面
│   │   └── projects/           # 项目相关页面
│   ├── components/             # React 组件
│   ├── contexts/               # React Context（含 AuthContext）
│   ├── lib/                    # 工具库
│   │   ├── api.ts              # API 客户端（核心数据操作）
│   │   ├── supabase.ts         # Supabase 客户端
│   │   ├── admin.ts            # 管理员权限检查
│   │   └── i18n.ts             # 国际化配置
│   ├── types/                  # TypeScript 类型定义
│   └── middleware.ts           # 中间件（Auth 保护）
├── supabase/                   # Supabase 配置与迁移文件
│   └── migrations/             # 数据库迁移脚本
├── public/                     # 静态资源
└── tests/                      # Playwright 测试
```

## 数据库表结构
| 表名 | 说明 |
|------|------|
| profiles | 用户信息（关联 auth.users） |
| projects | 项目信息 |
| project_logs | 项目日志 |
| tasks | 任务信息 |
| task_acceptances | 任务接受记录 |
| notifications | 通知（已有 type: task_completed, contribution_accepted） |
| achievements | 成就记录 |
| project_follows | 项目关注（复合主键） |
| project_participations | 项目参与（复合主键） |
| click_events | 点击事件统计 |
| feedbacks | 用户反馈（问题类型、描述、图片、状态） |

## 核心模块

### API 客户端 (src/lib/api.ts)
统一的数据操作接口，导出模块：
- `userStorage` - 用户相关操作
- `projectStorage` - 项目 CRUD
- `projectRelationStorage` - 关注/参与
- `taskStorage` - 任务管理
- `taskAcceptanceStorage` - 任务接受
- `notificationStorage` - 通知管理
- `achievementStorage` - 成就记录
- `feedbackStorage` - 用户反馈
- `clickTracker` - 点击追踪
- `balanceStorage` - 余额查询
- `rechargeStorage` - 充值订单

### 通知系统
- 数据库表: `notifications`
- 组件: `NotificationBell.tsx`
- API: `/api/notifications`
- 现有类型: `task_completed`, `contribution_accepted`, `feedback_replied`

### 后台管理
- 布局组件: `AdminLayout.tsx`
- 权限检查: `lib/admin.ts` 中的 `isAdmin()` 函数
- 用户角色: `user`, `admin`, `super_admin`

## 样式规范
使用 CSS 变量定义主题色：
- `--ink`: 深色背景
- `--ink-lighter`, `--ink-light`, `--ink-border`: 背景层级
- `--gold`, `--gold-light`, `--gold-muted`: 主题金色
- `--text-primary`, `--text-secondary`, `--text-muted`: 文本色
- `--success`, `--error`: 状态色

常用 class：
- `card`: 卡片容器
- `btn`, `btn-primary`, `btn-secondary`: 按钮
- `nav-link`: 导航链接
- `tag`, `tag-gold`: 标签
- `animate-fade-in`, `animate-scale-in`: 动画

## API 路由规范
- 路径: `/api/[resource]`
- 返回格式: `{ success: boolean, data?: T, error?: string }`
- 认证: 通过 Supabase SSR 中间件处理
- HTTP 401 时前端自动重定向到登录页

## 开发命令
```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run lint       # ESLint 检查
npm run test       # Playwright 测试
```
