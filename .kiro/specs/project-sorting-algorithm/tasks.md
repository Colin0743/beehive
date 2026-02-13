# 实现计划：项目排序/推荐算法

## 概述

基于已有的 localStorage 存储架构，新增点击追踪模块和排序引擎模块，然后集成到首页和项目列表页。使用 TypeScript 实现，fast-check 进行属性测试。

## 任务

- [x] 1. 实现 Click Tracker 点击追踪模块
  - [x] 1.1 创建 `src/lib/clickTracker.ts`，实现 ClickEvent/ClickData 接口和 clickTracker 对象
    - 实现 `recordClick`：记录点击事件，含5分钟同用户同项目去重逻辑
    - 实现 `getClickCount`：返回指定时间窗口内的点击次数
    - 实现 `getBatchClickCounts`：批量获取多个项目的点击次数
    - 实现 `cleanup`：清理超过7天的历史记录
    - 使用与 storage.ts 一致的 `StorageResult<T>` 模式和 safeSetItem/safeGetItem 风格
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.2 编写 Click Tracker 属性测试
    - **Property 1: 点击记录往返一致性**
    - **Validates: Requirements 1.1, 1.2**
    - **Property 2: 时间窗口过滤准确性**
    - **Validates: Requirements 1.3**
    - **Property 3: 清理移除过期记录**
    - **Validates: Requirements 1.4**
    - **Property 4: 点击去重**
    - **Validates: Requirements 1.5**

  - [ ]* 1.3 编写 Click Tracker 单元测试
    - 测试 localStorage 不可用时的错误处理
    - 测试 JSON 解析失败时的数据重置
    - 测试存储配额超限时的自动清理重试

- [x] 2. 实现 Sorting Engine 排序引擎模块
  - [x] 2.1 创建 `src/lib/sortingEngine.ts`，实现排序引擎
    - 实现 `calculateHotnessScore`：基于公式计算热度分数（指数衰减 + 参与者权重 + 进度权重）
    - 实现 `sortByHotness`：按热度降序排序，相同分数按创建时间降序
    - 实现 `sortProjects`：支持 hot/newest/fastest/mostParticipants 四种排序
    - 实现 `getCategoryMixedProjects`：混合策略（前3热门 + 后3最新，去重）
    - 实现 `getFeaturedProjects`：取热度最高的前N个项目
    - 定义 SortOption 类型和 HotnessConfig 接口
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 4.1, 4.2, 4.3_

  - [ ]* 2.2 编写 Sorting Engine 属性测试
    - **Property 5: 热度分数公式正确性**
    - **Validates: Requirements 2.1, 2.3, 2.4**
    - **Property 6: 精选项目为热度最高的前N个**
    - **Validates: Requirements 3.1**
    - **Property 7: 分类混合策略正确性**
    - **Validates: Requirements 4.1, 4.2**
    - **Property 8: 排序选项产生正确排序**
    - **Validates: Requirements 5.3**

  - [ ]* 2.3 编写 Sorting Engine 单元测试
    - 测试24小时衰减因子为0.5
    - 测试零点击项目的基础分
    - 测试热度相同时的平局处理
    - 测试分类项目不足6个的情况
    - 测试 targetDuration 为0时不除零

- [x] 3. 检查点 - 确保核心模块测试通过
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 4. 集成到首页
  - [x] 4.1 修改 `src/app/page.tsx`，集成排序引擎
    - 在 useEffect 中调用 `clickTracker.getBatchClickCounts` 获取点击数据
    - 精选项目区域：替换当前按 createdAt 排序的逻辑，改用 `sortingEngine.getFeaturedProjects`
    - 分类板块：替换当前无排序的 `.filter().slice(0,6)`，改用 `sortingEngine.getCategoryMixedProjects`
    - 最新任务区域：保持不变
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3_

- [x] 5. 集成到项目列表页
  - [x] 5.1 修改 `src/app/projects/page.tsx`，添加排序功能
    - 新增排序选项下拉选择器 UI（热门/最新/进度最快/参与者最多），支持 i18n
    - 新增 `sortOption` 状态，默认值 `'hot'`，从 URL 参数 `sort` 读取
    - 在过滤后调用 `sortingEngine.sortProjects` 进行排序
    - 切换排序时重置到第1页
    - 切换分类时保持排序选项不变
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6. 集成点击追踪到项目详情页
  - [x] 6.1 修改 `src/app/projects/[id]/page.tsx`，在页面加载时调用 `clickTracker.recordClick`
    - 在 useEffect 中调用，传入项目ID和当前用户ID（如已登录）
    - _Requirements: 1.1, 1.5_

- [x] 7. 最终检查点 - 确保所有功能集成正确
  - 确保所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加速 MVP 开发
- 每个任务引用了具体的需求编号以确保可追溯性
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
- 使用 fast-check 库进行属性测试，每个属性至少100次迭代
