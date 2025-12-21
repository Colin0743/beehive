# 部署指南

## 本地开发

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 生产构建

### 1. 构建项目
```bash
npm run build
```

### 2. 启动生产服务器
```bash
npm start
```

## Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 自动部署完成

## 环境变量

当前版本使用 localStorage，无需配置环境变量。

## 注意事项

- 确保 Node.js 版本 >= 18
- 生产环境建议使用真实数据库替代 localStorage
