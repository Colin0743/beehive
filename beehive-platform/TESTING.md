# Beehive Platform 测试体系文档

## 1. 测试策略

本项目采用分层测试策略，确保代码质量和系统稳定性。

### 1.1 测试层级
*   **单元测试 (Unit Tests)**: 针对工具函数 (`src/lib/*.ts`)、Hooks 和纯组件。使用 Jest + React Testing Library。
    *   *覆盖率目标*: >80%
    *   *关注点*: 逻辑正确性、边界条件、纯函数行为。
*   **集成测试 (Integration Tests)**: 针对 API 路由 (`src/app/api/**`) 和复杂组件交互。
    *   *关注点*: 模块间协作、数据流、API 响应格式。
*   **端到端测试 (E2E Tests)**: 针对关键用户流程。使用 Playwright。
    *   *关注点*: 用户真实场景、跨页面流程、核心功能（注册、登录、创建项目）。

### 1.2 测试环境
*   **本地环境**: 开发人员本地运行，使用 `.env.local` 配置。
*   **CI 环境**: GitHub Actions，自动运行测试流水线。

---

## 2. 单元测试与集成测试 (Jest)

### 2.1 安装依赖
```bash
npm install --save-dev jest @types/jest ts-jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 2.2 运行测试
*   运行所有单元测试: `npm run test:unit`
*   生成覆盖率报告: `npm run test:coverage`

### 2.3 目录结构
*   单元测试文件放置在 `__tests__` 目录或与源文件同级（命名为 `*.test.ts` / `*.test.tsx`）。

---

## 3. 端到端测试 (Playwright)

### 3.1 运行测试
*   运行所有 E2E 测试: `npx playwright test`
*   UI 模式运行: `npx playwright test --ui`
*   查看报告: `npx playwright show-report`

### 3.2 核心场景覆盖
1.  **用户认证**: 注册、登录、登出。
2.  **项目管理**: 创建项目（含文件上传、条款勾选）、编辑项目、查看列表。
3.  **交互功能**: 评论、点赞（待补充）。

---

## 4. CI/CD 流水线

本项目使用 GitHub Actions 实现自动化测试。配置文件位于 `.github/workflows/ci.yml`。

### 4.1 触发条件
*   推送到 `main` 分支。
*   提交 Pull Request 到 `main` 分支。

### 4.2 流程步骤
1.  检出代码。
2.  安装依赖 (`npm ci`)。
3.  运行 Lint 检查 (`npm run lint`)。
4.  运行单元测试 (`npm run test:unit`)。
5.  构建项目 (`npm run build`)。
6.  运行 E2E 测试 (`npx playwright test`)。
7.  上传测试报告。

---

## 5. 代码覆盖率

目标覆盖率：**80%**。

*   **Statement**: 80%
*   **Branch**: 80%
*   **Function**: 80%
*   **Lines**: 80%

运行 `npm run test:coverage` 查看当前覆盖率。
