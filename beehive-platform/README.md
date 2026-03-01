# 🐝 蜂巢 AI 视频协作平台

**版本**: v1.2.5  
**最后更新**: 2025-02-27

AI视频创作者的协作平台，汇聚创意与算力。

---

## 🌍 双版本部署架构

本项目采用**单代码库、双品牌**架构，同时运营国内版和海外版：

### 国内版 - 泱泱云合AI制片厂
- **域名**: yangyangyunhe.cloud
- **品牌名**: 泱泱云合AI制片厂
- **语言**: 纯中文
- **支付**: 支付宝 + 微信支付
- **部署**: 自建服务器
- **数据库**: 国内 Supabase 实例

### 海外版 - Bee Studio AI
- **域名**: beestudioai.com (当前临时域名: beehive-gules.vercel.app)
- **品牌名**: Bee Studio AI
- **语言**: 纯英文
- **支付**: Paddle (审核中)
- **部署**: Vercel + GitHub 自动部署
- **数据库**: 海外 Supabase 实例

### 🔄 区域切换机制

通过环境变量 `NEXT_PUBLIC_REGION` 控制：
- `cn` = 国内版（泱泱云合AI制片厂）
- `global` = 海外版（Bee Studio AI）

**品牌名称、语言、支付方式会根据区域自动切换，无需修改代码。**

---

## ✨ 功能特性

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
  - 参与项目 (参与者/参与者角色)
  - 发布项目日志
  - 查看项目进度 (基于时长)

- **个人中心**
  - 查看发起的项目
  - 查看参与的项目
  - 查看关注的项目

- **多区域支持**
  - 国内版/海外版自动切换
  - 品牌名称本地化
  - 支付方式区域化

- **任务系统**
  - 任务发布与管理
  - 任务大厅浏览
  - 任务接受与完成
  - 余额充值系统

- **支付集成**
  - 国内版：支付宝 + 微信支付
  - 海外版：Paddle 支付（审核中）
  - 任务发布费用：$0.5 USD / 任务

- **合规页面**
  - 服务条款页面 (`/terms`)
  - 充值/定价页面 (`/recharge`)
  - Footer 链接完整

---

## 🛠 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Semantic UI React
- **国际化**: i18next + react-i18next
- **后端服务**: Supabase
  - **Auth**: 身份认证
  - **Database**: PostgreSQL
  - **Storage**: 文件存储

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

#### 国内版配置 (`.env.local`)

```bash
NEXT_PUBLIC_REGION=cn
NEXT_PUBLIC_SUPABASE_URL=你的国内Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的国内AnonKey
SUPABASE_SERVICE_ROLE_KEY=你的国内ServiceRoleKey
USE_MOCK_PAYMENT=false
ALIPAY_APP_ID=你的支付宝AppID
ALIPAY_PRIVATE_KEY=你的支付宝私钥
```

#### 海外版配置 (`.env.global.local`)

```bash
NEXT_PUBLIC_REGION=global
NEXT_PUBLIC_SUPABASE_URL=你的海外Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的海外AnonKey
SUPABASE_SERVICE_ROLE_KEY=你的海外ServiceRoleKey
USE_MOCK_PAYMENT=true  # Paddle 集成完成后改为 false
```

*详细配置指南请参考 [DEPLOYMENT.md](DEPLOYMENT.md)*  
*Paddle 支付集成指南请参考 [PADDLE_INTEGRATION_CHECKLIST.md](PADDLE_INTEGRATION_CHECKLIST.md)*

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

---

## 📁 项目结构

```
beehive-platform/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── api/                # API Routes (RESTful 端点)
│   │   └── projects/           # 项目相关页面
│   ├── components/             # React 组件
│   ├── lib/                    # 工具库
│   │   ├── api.ts              # API 客户端封装
│   │   ├── region.ts           # 区域配置模块
│   │   ├── i18n.ts             # 国际化配置
│   │   ├── payment-unified.ts  # 统一支付接口
│   │   └── supabase.ts         # Supabase 客户端
│   ├── types/                  # TypeScript 类型定义
│   └── middleware.ts           # 中间件 (Auth 保护)
├── supabase/                   # Supabase 配置与迁移文件
│   └── migrations/             # 数据库迁移 SQL 脚本
├── public/                     # 静态资源
└── package.json
```

---

## 🌐 部署

### 海外版部署 (Vercel)

海外版已配置 GitHub + Vercel 自动部署：

1. 推送代码到 GitHub 仓库 `Colin0743/beehive`
2. Vercel 自动检测并部署
3. 访问 https://beehive-gules.vercel.app

**自动部署流程**：
```bash
git add .
git commit -m "your commit message"
git -c http.sslVerify=false push beehive main
# Vercel 会自动构建并部署
```

### 国内版部署 (自建服务器)

使用本地 SSH 脚本部署到服务器：

```bash
SERVER_IP=你的服务器IP \
SERVER_USER=你的用户名 \
REMOTE_PATH=/www/wwwroot/beehive-platform \
SSH_PORT=22 \
SSH_KEY=~/.ssh/id_rsa \
bash scripts/deploy.sh
```

---

## 📝 重要说明

### 品牌差异

- **国内版**使用"泱泱云合AI制片厂"品牌，面向中文用户
- **海外版**使用"Bee Studio AI"品牌，面向英文用户
- 两个版本功能完全一致，仅品牌名称、语言和支付方式不同
- 数据库完全独立，用户和项目数据不互通

### 域名配置

- 国内版域名：yangyangyunhe.cloud
- 海外版域名：beestudioai.com（需在 Vercel 配置自定义域名）

### 支付方式

- **国内版**：支付宝 + 微信支付（已集成）
- **海外版**：Paddle 支付（审核中，当前使用 mock 模式）
- **任务发布费用**：$0.5 USD / 任务

---

## 📋 版本历史

### v1.2.5 (2025-02-27)
- ✅ 创建服务条款页面 (`/terms`)，符合 Paddle 审核要求
- ✅ 更新充值页面，明确显示定价信息（$0.5 per task）
- ✅ 添加 Paddle 支付处理商声明
- ✅ 完善退款政策说明
- ✅ 创建 Paddle 集成准备文档 (`PADDLE_INTEGRATION_CHECKLIST.md`)
- ✅ 提交 Paddle 商家账号审核

### v1.2.4 (2025-02-26)
- ✅ 海外版品牌更名：YangYang Cloud → Bee Studio AI
- ✅ 更新所有英文翻译中的品牌名称
- ✅ 创建详细的 README 说明双版本架构
- ✅ 配置 Vercel 自动部署

### v1.2.0 - v1.2.3
- ✅ 多区域版本管理系统
- ✅ 统一支付接口
- ✅ 区域配置模块
- ✅ 动态语言锁定
- ✅ Supabase 海外数据库迁移
- ✅ Vercel 部署配置

---

## 📄 许可证

MIT

## 📧 联系方式

如有问题或建议，请提交 Issue。
