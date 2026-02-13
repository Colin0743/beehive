# 需求文档：任务墙重新设计

## 简介

将蜂巢AI电影制片厂平台任务大厅页面（`/tasks`）的任务展示区域从列表式布局改为游戏风格的"任务墙"。任务以便签/卡片形式排列在 4 列网格中，默认只显示首张参考图片，悬停时叠加显示摘要信息，点击后弹窗展示完整详情。任务墙支持每分钟自动刷新和手动刷新，刷新时所有便签执行翻转动画。统计面板兼具分类筛选功能，去掉独立搜索栏。保留 Hero 区域、侧边栏和国际化支持。

## 术语表

- **Task_Wall**: 任务墙组件，以 4 列网格布局展示任务便签卡片的核心区域
- **Task_Note**: 任务便签组件，网格中的单个卡片，默认显示参考图片，悬停时叠加摘要信息
- **Task_Detail_Modal**: 任务详情弹窗组件，点击便签后弹出的模态窗口，展示完整任务信息
- **Refresh_Timer**: 刷新计时器组件，显示距离下次自动刷新的倒计时，并提供手动刷新按钮
- **Stats_Filter_Panel**: 统计筛选面板组件，同时展示任务统计数据和提供分类筛选功能
- **Flip_Animation**: 翻转动画效果，刷新时所有便签同时执行的 3D 翻转过渡动画
- **Task_Hall_Page**: 任务大厅页面组件（路由 `/tasks`），包含 Hero 区域、统计筛选面板、任务墙和侧边栏
- **Design_System**: 现有的 CSS 变量设计系统，包含深色背景、金色主题、电影工业风格的视觉规范

## 需求

### 需求 1：任务便签网格布局

**用户故事：** 作为平台用户，我希望任务以便签卡片形式排列在网格中，以便获得类似游戏任务告示板的浏览体验。

#### 验收标准

1. THE Task_Wall SHALL 采用 4 列网格布局展示任务便签卡片
2. WHEN 任务数据加载完成, THE Task_Wall SHALL 将所有已发布任务以 Task_Note 形式填充到网格中
3. THE Task_Note SHALL 默认只显示该任务的首张参考图片，图片铺满整个便签区域
4. WHEN 屏幕宽度小于 1024px, THE Task_Wall SHALL 将网格列数减少为 2 列以适配小屏幕
5. WHEN 屏幕宽度小于 640px, THE Task_Wall SHALL 将网格列数减少为 1 列以适配移动端

### 需求 2：便签悬停信息叠加

**用户故事：** 作为平台用户，我希望鼠标悬停在便签上时能看到任务摘要信息，以便快速了解任务内容而无需点击。

#### 验收标准

1. WHEN 用户将鼠标悬停在 Task_Note 上, THE Task_Note SHALL 在参考图片上方叠加显示半透明信息层
2. THE 悬停信息层 SHALL 包含以下内容：任务标题（prompt 的前 20 个字符）、任务时长（duration 字段，单位为秒）、提示词缩写（prompt 的前 50 个字符，超出部分以省略号截断）
3. WHEN 鼠标离开 Task_Note, THE Task_Note SHALL 隐藏信息叠加层，恢复只显示参考图片的状态
4. THE 悬停信息层 SHALL 使用渐入渐出过渡动画，持续时间与 Design_System 中的 `--duration-fast` 一致

### 需求 3：任务详情弹窗

**用户故事：** 作为平台用户，我希望点击便签后能在弹窗中查看完整任务详情，以便了解任务的全部信息并决定是否接受。

#### 验收标准

1. WHEN 用户点击一个 Task_Note, THE Task_Detail_Modal SHALL 以模态弹窗形式显示该任务的完整信息
2. THE Task_Detail_Modal SHALL 展示以下内容：完整参考图片（所有图片）、完整提示词文本、任务需求说明、任务时长、创建者邮箱、任务所属项目名称和分类
3. THE Task_Detail_Modal SHALL 包含"接受任务"按钮，功能与现有 TaskCard 的接受任务逻辑一致
4. WHEN 用户点击弹窗外部区域或关闭按钮, THE Task_Detail_Modal SHALL 关闭弹窗并返回任务墙视图
5. THE Task_Detail_Modal SHALL 使用 Design_System 中的卡片样式和金色主题色进行视觉呈现
6. WHEN 弹窗打开时, THE Task_Detail_Modal SHALL 阻止背景页面滚动

### 需求 4：自动刷新与倒计时

**用户故事：** 作为平台用户，我希望任务墙能定时自动刷新并显示倒计时，以便我能持续看到最新的任务。

#### 验收标准

1. THE Refresh_Timer SHALL 每 60 秒触发一次任务墙的自动刷新
2. THE Refresh_Timer SHALL 在页面上方显示"距离下次刷新还剩 MM:SS"格式的倒计时文本
3. WHEN 自动刷新触发时, THE Task_Wall SHALL 重新从 Storage_Layer 获取已发布任务数据并随机排列
4. WHEN 自动刷新触发时, THE Task_Wall SHALL 对所有 Task_Note 同时执行 Flip_Animation
5. WHEN Task_Hall_Page 卸载（用户离开页面）时, THE Refresh_Timer SHALL 清除定时器以避免内存泄漏

### 需求 5：手动刷新

**用户故事：** 作为平台用户，我希望能随时手动刷新任务墙，以便立即查看最新任务而无需等待自动刷新。

#### 验收标准

1. THE Refresh_Timer SHALL 在倒计时旁边显示一个手动刷新图标按钮
2. WHEN 用户点击手动刷新按钮, THE Task_Wall SHALL 立即重新获取任务数据并随机排列
3. WHEN 用户点击手动刷新按钮, THE Task_Wall SHALL 对所有 Task_Note 执行 Flip_Animation
4. WHEN 手动刷新完成后, THE Refresh_Timer SHALL 将倒计时重置为 60 秒重新开始计时

### 需求 6：翻转动画效果

**用户故事：** 作为平台用户，我希望刷新时看到便签翻转的动画效果，以便获得更生动的视觉反馈。

#### 验收标准

1. WHEN 刷新触发（自动或手动）时, THE Flip_Animation SHALL 对所有 Task_Note 同时执行 Y 轴 180 度翻转动画
2. THE Flip_Animation SHALL 在翻转到背面（90 度）时隐藏旧内容，翻转到正面时显示新任务内容
3. THE Flip_Animation SHALL 使用 CSS transform 和 backface-visibility 属性实现 3D 翻转效果
4. THE Flip_Animation SHALL 持续时间为 600ms，使用 Design_System 中的 `--ease-out` 缓动函数

### 需求 7：统计筛选面板

**用户故事：** 作为平台用户，我希望统计面板同时具备分类筛选功能，以便我能通过点击统计数字快速筛选任务。

#### 验收标准

1. THE Stats_Filter_Panel SHALL 显示已发布任务的总数量和各项目类别下的任务数量
2. WHEN 用户点击某个分类的统计卡片, THE Stats_Filter_Panel SHALL 将该分类设为当前筛选条件，并高亮显示被选中的统计卡片
3. WHEN 分类筛选条件改变, THE Task_Wall SHALL 只显示属于所选分类的已发布任务
4. WHEN 用户点击"全部"统计卡片, THE Stats_Filter_Panel SHALL 清除分类筛选，显示所有已发布任务
5. THE Stats_Filter_Panel SHALL 使用 Design_System 中的卡片样式，选中状态使用金色边框（`--gold`）高亮
6. THE Task_Hall_Page SHALL 移除独立的搜索栏组件

### 需求 8：保留现有页面结构

**用户故事：** 作为平台用户，我希望页面的整体结构保持不变，以便我能继续使用熟悉的导航和布局。

#### 验收标准

1. THE Task_Hall_Page SHALL 保留页面顶部的 Hero_Section（标题、描述、光晕效果）
2. THE Task_Hall_Page SHALL 保留右侧的 Sidebar（热门项目列表）
3. THE Task_Hall_Page SHALL 采用左右两栏布局，左侧为任务墙区域，右侧为侧边栏
4. WHEN 屏幕宽度小于 1024px, THE Task_Hall_Page SHALL 将侧边栏折叠到任务墙下方
5. THE Task_Hall_Page SHALL 保持现有的国际化支持，所有用户可见文本通过 `useTranslation` 获取

### 需求 9：视觉风格一致性

**用户故事：** 作为平台用户，我希望任务墙保持平台现有的深色电影工业风格，以便获得一致的视觉体验。

#### 验收标准

1. THE Task_Wall SHALL 使用 Design_System 中定义的所有 CSS 变量（颜色、字体、间距、圆角等）
2. THE Task_Note SHALL 使用 Design_System 中的卡片样式（`.card` 类）作为基础样式，并在悬停时显示金色边框效果
3. THE Task_Hall_Page SHALL 保持深色背景主题，不引入拟物化元素（纸质纹理、撕边效果等）
4. THE Flip_Animation SHALL 使用 Design_System 中已有的缓动函数和过渡时长变量

### 需求 10：空状态处理

**用户故事：** 作为平台用户，我希望在没有任务时看到友好的提示，以便了解当前状态。

#### 验收标准

1. WHEN 当前筛选条件下没有匹配的任务, THE Task_Wall SHALL 显示一个包含图标和文字说明的空状态提示
2. THE 空状态提示 SHALL 使用 `animate-fade-up` 动画类实现渐入效果
3. WHEN 用户选择了特定分类但该分类无任务, THE 空状态提示 SHALL 建议用户查看其他分类
