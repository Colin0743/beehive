# 🐝 蜂巢 - AI视频协作平台

AI视频创作者的协作平台，汇聚创意与算力。

## 功能特性

### ✅ 已实现功能

- **用户认证系统**
  - 用户注册和登录
  - 会话管理
  - 用户状态持久化

- **项目管理**
  - 创建新项目
  - 浏览项目列表
  - 查看项目详情
  - 编辑项目信息
  - 项目搜索和筛选

- **项目互动**
  - 关注项目
  - 参与项目
  - 发布项目日志
  - 查看项目进度

- **个人中心**
  - 查看发起的项目
  - 查看参与的项目
  - 查看关注的项目

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Semantic UI React
- **状态管理**: React Context API
- **数据存储**: localStorage (MVP阶段)

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
beehive-platform/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── auth/              # 认证相关页面
│   │   │   ├── login/         # 登录页面
│   │   │   └── register/      # 注册页面
│   │   ├── projects/          # 项目相关页面
│   │   │   ├── new/           # 创建项目
│   │   │   ├── edit/[id]/     # 编辑项目
│   │   │   └── [id]/          # 项目详情
│   │   ├── profile/           # 个人中心
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   └── globals.css        # 全局样式
│   ├── components/            # React 组件
│   │   ├── Header.tsx         # 导航栏
│   │   └── Layout.tsx         # 页面布局
│   └── contexts/              # React Context
│       └── AuthContext.tsx    # 认证上下文
├── public/                    # 静态资源
└── package.json
```

## 数据存储

当前版本使用 localStorage 存储数据，包括：

- `user`: 当前登录用户信息
- `registeredUsers`: 所有注册用户列表
- `projects`: 所有项目列表
- `userProjects_{userId}`: 用户创建的项目
- `followedProjects_{userId}`: 用户关注的项目
- `participatedProjects_{userId}`: 用户参与的项目

## 开发说明

### 添加新功能

1. 在 `src/app/` 下创建新页面
2. 在 `src/components/` 下创建可复用组件
3. 使用 `useAuth()` Hook 访问用户状态
4. 使用 localStorage 进行数据持久化

### 样式定制

- 主题色彩在 `src/app/globals.css` 中定义
- 使用 Tailwind CSS 工具类进行快速样式开发
- 使用 Semantic UI React 组件保持一致的 UI 风格

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 自动部署完成

### 本地构建

```bash
npm run build
npm start
```

## 后续计划

- [ ] 添加真实的后端 API
- [ ] 实现文件上传功能
- [ ] 添加实时通知
- [ ] 集成 AI 视频生成工具
- [ ] 添加项目协作工具
- [ ] 实现支付和众筹功能

## 许可证

MIT

## 联系方式

如有问题或建议，请提交 Issue。
