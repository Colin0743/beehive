# 🐝 泱泱云合AI制片厂 - 国内版

**版本**: v1.2.5  
**最后更新**: 2025-02-27  
**部署区域**: 中国大陆

---

## 📋 版本信息

- **品牌名称**: 泱泱云合AI制片厂
- **公司**: 泱泱云合（深圳）科技有限公司
- **域名**: yangyangyunhe.cloud
- **语言**: 纯中文
- **支付方式**: 支付宝 + 微信支付
- **部署方式**: 自建服务器
- **数据库**: 国内 Supabase 实例

---

## ✨ 功能特性

### 核心功能
- ✅ 用户注册和登录（邮箱/密码）
- ✅ 项目创建、浏览、编辑、搜索
- ✅ 项目关注和参与（参与者角色）
- ✅ 任务发布与管理
- ✅ 任务大厅浏览和接受
- ✅ 余额充值系统
- ✅ 项目日志发布

### 支付集成
- ✅ 支付宝 PC 网站支付
- ✅ 支付宝 WAP 移动支付
- ✅ 微信 Native 扫码支付
- ✅ 任务发布费用：¥1.00 / 任务

### 合规页面
- ✅ 服务条款 (`/terms`)
- ✅ 充值页面 (`/recharge`)
- ✅ Footer 完整链接

---

## 🚀 部署配置

### 环境变量 (`.env.local`)

```bash
# 区域配置
NEXT_PUBLIC_REGION=cn

# Supabase 配置（国内实例）
NEXT_PUBLIC_SUPABASE_URL=你的国内Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的国内AnonKey
SUPABASE_SERVICE_ROLE_KEY=你的国内ServiceRoleKey

# 支付配置
USE_MOCK_PAYMENT=false
ALIPAY_APP_ID=你的支付宝AppID
ALIPAY_PRIVATE_KEY=你的支付宝私钥
WECHAT_MCHID=你的微信商户号
WECHAT_SERIAL_NO=你的微信证书序列号
WECHAT_PRIVATE_KEY=你的微信私钥
```

### 部署命令

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

### 自建服务器部署

```bash
SERVER_IP=你的服务器IP \
SERVER_USER=你的用户名 \
REMOTE_PATH=/www/wwwroot/beehive-platform \
SSH_PORT=22 \
SSH_KEY=~/.ssh/id_rsa \
bash scripts/deploy.sh
```

---

## 📊 数据库配置

### Supabase 国内实例

- **项目名称**: beehive-cn
- **区域**: 国内节点
- **数据库**: PostgreSQL
- **认证**: Supabase Auth
- **存储**: Supabase Storage

### 数据库迁移

```bash
# 执行迁移脚本
cd supabase
# 在 Supabase SQL Editor 中执行 all_migrations_clean.sql
```

---

## 🔧 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI**: Tailwind CSS + Semantic UI React
- **国际化**: i18next (锁定中文)
- **后端**: Supabase (Auth + PostgreSQL + Storage)
- **支付**: 支付宝 SDK + 微信支付 API

---

## 📝 版本更新记录

### v1.2.5 (2025-02-27)
- ✅ 完善服务条款页面
- ✅ 优化充值流程
- ✅ 更新支付配置

### v1.2.4 (2025-02-26)
- ✅ 品牌名称确认
- ✅ 多区域架构完善

### v1.2.0 - v1.2.3
- ✅ 多区域版本管理
- ✅ 统一支付接口
- ✅ 区域配置模块

---

## 📞 联系信息

**公司**: 泱泱云合（深圳）科技有限公司  
**邮箱**: Colincao0734@Outlook.com  
**网站**: yangyangyunhe.cloud

---

## 📄 许可证

MIT License

---

**备注**: 本文档为国内版（泱泱云合AI制片厂）专用配置说明，海外版配置请参考 `README_GLOBAL_v1.2.5.md`
