# 需求文档

## 简介

蜂巢（Beehive）平台是一个算力众筹平台。当前项目创建后，创建者无法在项目详情页直接编辑项目内容。本功能将在项目详情页添加内联编辑能力，同时实现任务时长自动累加到项目进度的机制，并将时长单位从分钟统一改为秒，以及优化页面布局使任务区域更加突出。

## 术语表

- **项目详情页（Project_Detail_Page）**：展示单个项目完整信息的页面，路径为 `/projects/[id]`
- **内联编辑（Inline_Edit）**：用户直接在详情页上点击字段进入编辑模式，无需跳转到独立编辑页面
- **项目创建者（Project_Creator）**：创建该项目的用户，通过 `project.creatorId === user.id` 判断
- **管理员（Admin）**：角色为 `admin` 或 `super_admin` 的用户
- **可编辑字段（Editable_Fields）**：title、description、category、targetDuration、telegramGroup、coverImage、videoFile
- **不可编辑字段（Non_Editable_Fields）**：id、creatorId、creatorName、createdAt
- **任务时长（Task_Duration）**：每个任务携带的时长值（5-30秒），表示该任务对项目进度的贡献量
- **当前时长（Current_Duration）**：项目已累积的时长（秒），由已完成任务的时长自动累加，也可手动调整
- **目标时长（Target_Duration）**：项目的目标总时长（秒）
- **进度条（Progress_Bar）**：以 `currentDuration / targetDuration` 百分比展示项目完成进度的 UI 组件
- **存储层（Storage_Layer）**：基于 localStorage 的数据持久化层，通过 `storage.ts` 中的方法操作

## 需求

### 需求 1：项目内联编辑

**用户故事：** 作为项目创建者，我希望能在项目详情页直接编辑项目信息，以便快速更新项目内容而无需跳转到独立编辑页面。

#### 验收标准

1. WHEN 项目创建者访问自己的项目详情页, THE Inline_Edit 组件 SHALL 在每个可编辑字段旁显示编辑按钮或可点击的编辑指示器
2. WHEN 项目创建者点击某个可编辑字段的编辑指示器, THE Inline_Edit 组件 SHALL 将该字段切换为编辑模式，显示对应的输入控件（文本输入框、富文本编辑器、下拉选择器、数字输入框或文件上传器）
3. WHEN 项目创建者在编辑模式中修改字段值并确认保存, THE Storage_Layer SHALL 通过 `projectStorage.updateProject()` 将更新持久化到 localStorage
4. WHEN 项目创建者在编辑模式中点击取消, THE Inline_Edit 组件 SHALL 恢复字段为编辑前的原始值并退出编辑模式
5. WHEN 项目详情页加载完成且当前用户不是项目创建者也不是管理员, THE Project_Detail_Page SHALL 以只读模式展示所有字段，不显示任何编辑指示器
6. WHEN 项目创建者编辑 description 字段, THE Inline_Edit 组件 SHALL 提供富文本编辑器进行编辑
7. WHEN 项目创建者编辑 category 字段, THE Inline_Edit 组件 SHALL 提供下拉选择器，选项为：科幻、动画、纪录片、教育、其他
8. WHEN 项目创建者编辑 coverImage 或 videoFile 字段, THE Inline_Edit 组件 SHALL 提供文件上传控件并在上传后即时预览新文件
9. THE Project_Detail_Page SHALL 移除指向 `/projects/edit/${project.id}` 的编辑链接，以内联编辑功能替代

### 需求 2：权限控制

**用户故事：** 作为平台管理员，我希望能编辑和删除任何项目，以便进行内容审核和管理。

#### 验收标准

1. WHEN 管理员访问任意项目详情页, THE Project_Detail_Page SHALL 显示与项目创建者相同的编辑指示器，允许管理员编辑所有可编辑字段
2. WHEN 管理员点击删除项目按钮, THE Storage_Layer SHALL 通过 `projectStorage.deleteProject()` 删除该项目并将管理员重定向到首页
3. WHEN 管理员执行删除操作前, THE Project_Detail_Page SHALL 显示确认对话框，要求管理员确认删除操作
4. WHILE 用户未登录或角色为普通用户且不是项目创建者, THE Project_Detail_Page SHALL 隐藏所有编辑和删除控件

### 需求 3：任务时长与项目进度自动计算

**用户故事：** 作为项目创建者，我希望每个任务都有一个时长值，当任务完成时自动累加到项目进度，以便准确追踪项目完成情况。

#### 验收标准

1. THE Task 数据模型 SHALL 包含一个 `duration` 字段，类型为数字，取值范围为 5 到 30（单位：秒）
2. WHEN 项目创建者创建或编辑任务, THE TaskForm 组件 SHALL 显示一个时长输入控件，允许输入 5 到 30 之间的整数值
3. WHEN 项目创建者提交任务表单且 duration 值小于 5 或大于 30, THE TaskForm 组件 SHALL 显示验证错误信息并阻止提交
4. WHEN 一个任务被标记为已完成（status 变为 'completed'）, THE `completeTask` 函数 SHALL 将该任务的 duration 值累加到所属项目的 currentDuration 字段
5. WHEN 项目创建者通过内联编辑手动修改 currentDuration, THE Inline_Edit 组件 SHALL 允许输入非负整数值并保存到 Storage_Layer

### 需求 4：时长单位从分钟改为秒

**用户故事：** 作为用户，我希望项目时长以秒为单位显示，以便更精确地了解项目进度。

#### 验收标准

1. THE Project 数据模型中的 targetDuration 和 currentDuration 字段 SHALL 以秒为单位存储和计算
2. WHEN 进度条显示项目进度, THE Progress_Bar SHALL 以秒为单位展示当前时长和目标时长（例如 "120 秒 / 600 秒"）
3. WHEN 项目创建页面显示目标时长输入, THE 项目创建页面 SHALL 将标签和提示文本从"分钟"改为"秒"
4. WHEN 种子数据页面生成测试数据, THE 种子数据页面 SHALL 使用秒为单位的时长值

### 需求 5：页面布局优化

**用户故事：** 作为用户，我希望任务区域在项目详情页中更加突出，以便更快地找到和浏览任务列表。

#### 验收标准

1. THE Project_Detail_Page SHALL 将任务区域放置在项目描述区域之后、成就区域和项目动态区域之前
2. WHEN 项目详情页渲染完成, THE 任务区域 SHALL 在页面布局中位于进度统计卡片区域的下方紧邻位置

### 需求 6：内联编辑字段验证

**用户故事：** 作为项目创建者，我希望编辑时有输入验证，以便确保提交的数据格式正确。

#### 验收标准

1. WHEN 项目创建者提交空白的 title 字段, THE Inline_Edit 组件 SHALL 显示验证错误信息并阻止保存
2. WHEN 项目创建者编辑 targetDuration 字段, THE Inline_Edit 组件 SHALL 仅允许输入正整数值
3. WHEN 项目创建者编辑 telegramGroup 字段并输入非空值, THE Inline_Edit 组件 SHALL 验证输入值为有效的 URL 格式
4. IF 保存操作因 localStorage 空间不足而失败, THEN THE Inline_Edit 组件 SHALL 显示错误提示信息并保留编辑状态，不丢失用户输入
