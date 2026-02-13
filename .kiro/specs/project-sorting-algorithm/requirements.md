# 需求文档：项目排序/推荐算法

## 简介

为蜂巢AI视频协作平台实现项目排序与推荐算法，优化首页精选项目、分类板块和项目列表页的展示顺序。通过引入点击量追踪和综合热度评分机制，让用户更容易发现热门和优质项目。最新任务（Recent Tasks）保持当前按创建时间倒序的逻辑不变。

## 术语表

- **Sorting_Engine**: 项目排序引擎，负责根据不同策略对项目列表进行排序的核心模块
- **Click_Tracker**: 点击量追踪器，负责记录和统计项目的点击（浏览）次数
- **Hotness_Score**: 热度分数，基于点击量、时间衰减、参与者数量和进度活跃度计算的综合评分
- **Time_Decay_Factor**: 时间衰减因子，用于降低旧数据权重的数学函数，确保近期活跃项目获得更高分数
- **Project**: 蜂巢平台中的视频协作项目实体
- **Category_Section**: 首页按分类（科幻、动画等）展示项目的板块区域
- **Featured_Section**: 首页精选项目展示区域，展示平台最热门的6个项目
- **Project_List_Page**: 项目列表页（/projects），展示某一分类下所有项目并支持分页

## 需求

### 需求 1：点击量追踪

**用户故事：** 作为平台运营者，我希望追踪每个项目的点击量，以便为排序算法提供数据支撑。

#### 验收标准

1. WHEN 用户访问项目详情页, THE Click_Tracker SHALL 将该项目的点击计数加1并记录点击时间戳
2. WHEN Click_Tracker 记录点击事件, THE Click_Tracker SHALL 将点击数据持久化到 localStorage 中
3. WHEN 排序算法请求某项目的点击量, THE Click_Tracker SHALL 返回指定时间窗口内（默认24小时）的点击次数
4. IF localStorage 存储空间不足, THEN THE Click_Tracker SHALL 自动清理超过7天的历史点击记录以释放空间
5. WHEN 同一用户在5分钟内重复访问同一项目, THE Click_Tracker SHALL 仅计为1次有效点击

### 需求 2：热度分数计算

**用户故事：** 作为用户，我希望看到按热度排序的项目，以便快速发现当前最受关注的内容。

#### 验收标准

1. THE Sorting_Engine SHALL 使用以下公式计算每个项目的 Hotness_Score：`score = clickCount × timeDecayFactor + participantsWeight + progressActivityWeight`
2. WHEN 计算 Time_Decay_Factor, THE Sorting_Engine SHALL 使用指数衰减函数，使24小时前的点击权重降低为当前的50%
3. WHEN 计算参与者权重, THE Sorting_Engine SHALL 将参与者数量乘以固定系数（默认为2）
4. WHEN 计算进度活跃度权重, THE Sorting_Engine SHALL 基于项目进度百分比（currentDuration / targetDuration）乘以固定系数（默认为5）计算
5. IF 项目没有任何点击记录, THEN THE Sorting_Engine SHALL 将该项目的 Hotness_Score 设为仅基于参与者权重和进度活跃度的基础分

### 需求 3：首页精选项目排序

**用户故事：** 作为用户，我希望首页精选区域展示当前最热门的项目，而非仅按创建时间排列。

#### 验收标准

1. WHEN 首页加载精选项目, THE Sorting_Engine SHALL 按 Hotness_Score 降序排列所有项目并取前6个
2. WHEN 两个项目的 Hotness_Score 相同, THE Sorting_Engine SHALL 按创建时间降序作为次要排序条件

### 需求 4：首页分类板块排序

**用户故事：** 作为用户，我希望每个分类板块展示该分类下最值得关注的项目，包含热门和最新内容的混合。

#### 验收标准

1. WHEN 首页加载某分类板块, THE Sorting_Engine SHALL 从该分类的项目中选取最多6个项目展示
2. WHEN 选取分类板块项目, THE Sorting_Engine SHALL 采用混合策略：前3个按 Hotness_Score 降序选取，后3个按创建时间降序选取（去重后）
3. IF 某分类的项目总数不足6个, THEN THE Sorting_Engine SHALL 展示该分类所有可用项目

### 需求 5：项目列表页排序

**用户故事：** 作为用户，我希望在项目列表页能按不同维度排序项目，以便根据自己的偏好浏览。

#### 验收标准

1. WHEN 用户进入项目列表页, THE Project_List_Page SHALL 默认按 Hotness_Score 降序展示项目
2. THE Project_List_Page SHALL 提供以下排序选项：热门（Hotness_Score 降序）、最新（创建时间降序）、进度最快（进度百分比降序）、参与者最多（participantsCount 降序）
3. WHEN 用户选择一个排序选项, THE Project_List_Page SHALL 立即按所选维度重新排序项目列表并重置到第1页
4. WHEN 用户切换分类筛选, THE Project_List_Page SHALL 保持当前选中的排序选项不变

### 需求 6：排序算法性能与存储

**用户故事：** 作为开发者，我希望排序算法在 localStorage 环境下高效运行，不影响页面加载性能。

#### 验收标准

1. THE Sorting_Engine SHALL 在100个项目规模下完成排序计算的时间不超过50毫秒
2. THE Click_Tracker SHALL 将点击数据的 localStorage 占用控制在100KB以内
3. WHEN 页面加载时, THE Sorting_Engine SHALL 仅在需要排序时才读取点击数据，避免不必要的存储访问
