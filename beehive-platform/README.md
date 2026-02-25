# 🐝 蜜蜂AI电影制片厂 - AI视频协作平台

AI视频创作者的协作平台，汇聚创意与算力。

## 功能特性

### ✅ 已实现功能

- **用户认证系统 (Supabase Auth)**
  - 用户注册和登录 (邮箱/密码)
  - 会话管理
  - 用户状态持久化

- **项目管理**
  - 创建新项目 (支持封面图上传)
  - 浏览项目列表
  - 查看项目详情
  - 编辑项目信息
  - 项目搜索和筛选

- **项目互动**
  - 关注项目
  - 参与项目 (工蜂/协作者角色)
  - 发布项目日志
  - 查看项目进度 (基于时长)

- **个人中心**
  - 查看发起的项目
  - 查看参与的项目
  - 查看关注的项目

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Semantic UI React
- **后端服务**: Supabase
  - **Auth**: 身份认证
  - **Database**: PostgreSQL
  - **Storage**: 文件存储

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填入 Supabase 项目配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的AnonKey
SUPABASE_SERVICE_ROLE_KEY=你的ServiceRoleKey
```

*详细配置指南请参考 [SUPABASE_SETUP.md](SUPABASE_SETUP.md)*

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
beehive-platform/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   ├── components/            # React 组件
│   ├── lib/                   # 工具库 (含 Supabase 客户端)
│   ├── types/                 # TypeScript 类型定义
│   └── middleware.ts          # 中间件 (Auth 保护)
├── supabase/                  # Supabase 配置与迁移文件
├── public/                    # 静态资源
└── package.json
```

## 部署

本项目针对 **Vercel** 部署进行了优化。

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. 部署完成

也可以使用本地 SSH 脚本部署到服务器：

```bash
SERVER_IP=你的服务器IP \
SERVER_USER=你的用户名 \
REMOTE_PATH=/www/wwwroot/beehive-platform \
SSH_PORT=22 \
SSH_KEY=~/.ssh/id_rsa \
bash scripts/deploy.sh
```

可选参数（默认已配置）：

- `PACKAGE_MANAGER`：默认 `npm`
- `INSTALL_CMD`：默认 `npm install`
- `BUILD_CMD`：默认 `npm run build`
- `START_CMD`：默认 `pm2 restart start || pm2 start npm --name 'start' -- start`

## 许可证

MIT

## 联系方式

如有问题或建议，请提交 Issue。
