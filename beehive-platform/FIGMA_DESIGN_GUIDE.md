# 蜂巢平台 Figma 设计文件创建指南

## 📋 目录
1. [准备工作](#1-准备工作)
2. [创建文件结构](#2-创建文件结构)
3. [设置设计系统](#3-设置设计系统)
4. [创建组件库](#4-创建组件库)
5. [设计页面](#5-设计页面)
6. [导出和交付](#6-导出和交付)

---

## 1. 准备工作

### 1.1 创建新文件
1. 打开 Figma（[figma.com](https://figma.com)）
2. 点击 **"New design file"** 或按 `Ctrl/Cmd + N`
3. 将文件命名为：**"蜂巢平台 - 设计系统 v1.0"**

### 1.2 设置画布
1. 按 `F` 键创建 Frame
2. 选择预设尺寸：
   - Desktop: 1440 × 1024
   - Tablet: 768 × 1024
   - Mobile: 375 × 812

---

## 2. 创建文件结构

### 2.1 页面组织
在左侧面板创建以下页面（Pages）：

```
📄 Cover（封面页）
📄 Design System（设计系统）
  ├─ Colors（配色）
  ├─ Typography（排版）
  ├─ Spacing（间距）
  └─ Icons（图标）
📄 Components（组件库）
  ├─ Buttons（按钮）
  ├─ Inputs（输入框）
  ├─ Cards（卡片）
  ├─ Navigation（导航）
  └─ Modals（弹窗）
📄 Pages - Desktop（桌面端页面）
  ├─ Home（首页）
  ├─ Project Detail（项目详情）
  ├─ Create Project（创建项目）
  ├─ Profile（个人中心）
  └─ Auth（登录/注册）
📄 Pages - Mobile（移动端页面）
📄 Prototypes（原型）
```

### 2.2 创建封面页
1. 选择 **Cover** 页面
2. 创建一个 1440×900 的 Frame
3. 添加标题：
   ```
   蜂巢平台设计系统
   Beehive Platform Design System
   Version 1.0 | 2025-12-19
   ```
4. 使用金黄色背景渐变：
   - 起始色：#FFF9E6
   - 结束色：#FFD700

---

## 3. 设置设计系统

### 3.1 创建配色样式（Color Styles）

#### 步骤：
1. 选择 **Design System > Colors** 页面
2. 创建色块（按 `R` 键绘制矩形）
3. 右键点击填充色 → **Create style**
4. 按照以下规范创建所有颜色样式

#### 主色系
```
🎨 Primary/Default
- 名称：Primary/Default
- 色值：#FFD700
- 尺寸：200×100

🎨 Primary/Hover
- 名称：Primary/Hover
- 色值：#E6C200
- 尺寸：200×100

🎨 Primary/Light
- 名称：Primary/Light
- 色值：#FFF9E6
- 尺寸：200×100
```

#### 辅助色系
```
🟠 Secondary/Orange
- 名称：Secondary/Orange
- 色值：#FF8C42
- 尺寸：200×100

🔵 Secondary/Blue
- 名称：Secondary/Blue
- 色值：#4A90E2
- 尺寸：200×100

🟢 Secondary/Green
- 名称：Secondary/Green
- 色值：#10B981
- 尺寸：200×100
```

#### 中性色系
```
⚫ Neutral/900 (标题黑)
- 色值：#111827

⚫ Neutral/800 (正文黑)
- 色值：#1F2937

⚫ Neutral/600 (次要文字)
- 色值：#4B5563

⚫ Neutral/500 (辅助文字)
- 色值：#6B7280

⚫ Neutral/400 (禁用文字)
- 色值：#9CA3AF

⚪ Neutral/300 (分割线)
- 色值：#D1D5DB

⚪ Neutral/200 (边框)
- 色值：#E5E7EB

⚪ Neutral/100 (卡片背景)
- 色值：#F3F4F6

⚪ Neutral/50 (浅灰背景)
- 色值：#F9FAFB

⚪ Neutral/0 (白色)
- 色值：#FFFFFF
```

#### 状态色系
```
✅ Success/Default - #10B981
✅ Success/Light - #D1FAE5
✅ Success/Dark - #065F46

⚠️ Warning/Default - #F59E0B
⚠️ Warning/Light - #FEF3C7
⚠️ Warning/Dark - #92400E

❌ Error/Default - #EF4444
❌ Error/Light - #FEE2E2
❌ Error/Dark - #991B1B

ℹ️ Info/Default - #3B82F6
ℹ️ Info/Light - #DBEAFE
ℹ️ Info/Dark - #1E40AF
```

### 3.2 创建文字样式（Text Styles）

#### 步骤：
1. 选择 **Design System > Typography** 页面
2. 按 `T` 键创建文本
3. 设置字体属性
4. 右键 → **Create text style**

#### 文字样式列表
```
📝 Heading/Hero
- 字体：Inter/Bold
- 字号：48px
- 行高：56px (117%)
- 字重：700

📝 Heading/H1
- 字体：Inter/Bold
- 字号：36px
- 行高：44px (122%)
- 字重：700

📝 Heading/H2
- 字体：Inter/Semibold
- 字号：30px
- 行高：38px (127%)
- 字重：600

📝 Heading/H3
- 字体：Inter/Semibold
- 字号：24px
- 行高：32px (133%)
- 字重：600

📝 Heading/H4
- 字体：Inter/Semibold
- 字号：20px
- 行高：28px (140%)
- 字重：600

📝 Body/Large
- 字体：Inter/Regular
- 字号：18px
- 行高：28px (156%)
- 字重：400

📝 Body/Default
- 字体：Inter/Regular
- 字号：16px
- 行高：24px (150%)
- 字重：400

📝 Body/Small
- 字体：Inter/Regular
- 字号：14px
- 行高：20px (143%)
- 字重：400

📝 Label/Default
- 字体：Inter/Medium
- 字号：14px
- 行高：20px (143%)
- 字重：500

📝 Caption/Default
- 字体：Inter/Regular
- 字号：12px
- 行高：16px (133%)
- 字重：400
```

### 3.3 创建间距系统

#### 步骤：
1. 选择 **Design System > Spacing** 页面
2. 创建间距示意图

#### 间距规范
```
📏 Spacing/XS - 4px
📏 Spacing/SM - 8px
📏 Spacing/MD - 16px
📏 Spacing/LG - 24px
📏 Spacing/XL - 32px
📏 Spacing/2XL - 48px
📏 Spacing/3XL - 64px
```

#### 创建方法：
1. 绘制矩形，宽度为对应间距值
2. 填充颜色：#FFD700
3. 添加标签文字
4. 垂直排列所有间距块

---

## 4. 创建组件库

### 4.1 按钮组件（Buttons）

#### 主要按钮（Primary Button）
1. 选择 **Components > Buttons** 页面
2. 创建矩形：
   - 宽度：Auto（自适应）
   - 高度：44px
   - 圆角：8px
   - 填充：Primary/Default (#FFD700)
3. 添加文字：
   - 样式：Label/Default
   - 颜色：Neutral/900
   - 文字：按钮文字
   - 内边距：12px 24px
4. 选中矩形和文字 → 右键 → **Create component**
5. 命名：`Button/Primary`

#### 创建变体（Variants）
1. 选中组件 → 右键 → **Add variant**
2. 创建以下变体：
   ```
   State: Default, Hover, Pressed, Disabled
   Size: Small (36px), Medium (44px), Large (52px)
   ```

#### 其他按钮类型
按照相同方法创建：
- `Button/Secondary`（边框按钮）
- `Button/Text`（文字按钮）
- `Button/Icon`（图标按钮）

### 4.2 输入框组件（Inputs）

#### 文本输入框
1. 创建矩形：
   - 宽度：320px
   - 高度：44px
   - 圆角：8px
   - 边框：1px solid Neutral/300
   - 填充：Neutral/0
2. 添加占位符文字：
   - 样式：Body/Default
   - 颜色：Neutral/500
   - 位置：左侧 16px
3. 创建组件：`Input/Text`

#### 创建状态变体
```
State: Default, Focus, Error, Disabled
Size: Small, Medium, Large
```

### 4.3 卡片组件（Cards）

#### 项目卡片
1. 创建 Frame：
   - 宽度：360px
   - 高度：480px
   - 圆角：12px
   - 填充：Neutral/0
   - 阴影：0 1px 3px rgba(0,0,0,0.1)
   - 边框：1px solid Neutral/200

2. 添加内容区域：
   ```
   📷 封面图片区域
   - 高度：192px
   - 圆角：12px 12px 0 0
   - 填充：Neutral/100

   📝 内容区域
   - 内边距：20px
   - 包含：
     * 分类标签
     * 标题（H3）
     * 描述（Body/Small）
     * 进度信息
     * 统计数据
   ```

3. 创建组件：`Card/Project`

### 4.4 导航组件（Navigation）

#### 顶部导航栏
1. 创建 Frame：
   - 宽度：1440px
   - 高度：64px
   - 填充：Neutral/0
   - 底部边框：1px solid Neutral/200

2. 添加内容：
   ```
   左侧：Logo + 导航链接
   中间：搜索框
   右侧：用户信息 + 按钮
   ```

3. 创建组件：`Navigation/Header`

#### 分类标签栏
1. 创建 Frame：
   - 宽度：1440px
   - 高度：48px
   - 填充：Neutral/0

2. 添加标签按钮（使用 Auto Layout）
3. 创建组件：`Navigation/Categories`

### 4.5 模态框组件（Modals）

#### 基础模态框
1. 创建背景遮罩：
   - 宽度：1440px
   - 高度：1024px
   - 填充：rgba(0, 0, 0, 0.6)

2. 创建模态框容器：
   - 宽度：560px
   - 高度：Auto
   - 圆角：16px
   - 填充：Neutral/0
   - 阴影：0 20px 25px rgba(0,0,0,0.15)

3. 添加内容区域：
   ```
   📌 头部（Header）
   - 标题 + 关闭按钮
   - 内边距：24px
   - 底部边框：1px solid Neutral/200

   📄 内容（Content）
   - 内边距：24px
   - 高度：Auto

   🔘 底部（Footer）
   - 按钮组
   - 内边距：24px
   - 顶部边框：1px solid Neutral/200
   ```

4. 创建组件：`Modal/Base`

---

## 5. 设计页面

### 5.1 首页设计（Home Page）

#### 步骤：
1. 选择 **Pages - Desktop > Home** 页面
2. 创建 Frame：1440 × 3000（可滚动）
3. 命名：`Desktop/Home`

#### 布局结构：
```
┌─────────────────────────────────────┐
│  Navigation/Header                  │ 64px
├─────────────────────────────────────┤
│  Navigation/Categories              │ 48px
├─────────────────────────────────────┤
│  Hero Section                       │ 400px
│  - 标题 + 描述                       │
│  - 流程漫画（简化版）                │
├─────────────────────────────────────┤
│  Project Grid                       │ Auto
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Card  │ │Card  │ │Card  │        │
│  └──────┘ └──────┘ └──────┘        │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Card  │ │Card  │ │Card  │        │
│  └──────┘ └──────┘ └──────┘        │
└─────────────────────────────────────┘
```

#### 详细设计：

**1. Hero Section（英雄区）**
```
容器：
- 宽度：1440px
- 高度：400px
- 背景：线性渐变
  * 起始：#FFF9E6 (左上)
  * 结束：#FFD700 (右下)
- 内边距：64px

内容：
- 标题：Heading/Hero
  * 文字："让创意在蜂巢中绽放"
  * 颜色：Neutral/900
  * 对齐：居中

- 副标题：Body/Large
  * 文字："蜂巢是AI视频创作者的协作平台..."
  * 颜色：Neutral/800
  * 对齐：居中
  * 最大宽度：800px

- 装饰元素：
  * 蜜蜂图标（简化，透明度 10%）
  * 随机分布 5-6 个
```

**2. 项目网格（Project Grid）**
```
容器：
- 最大宽度：1200px
- 居中对齐
- 内边距：48px 24px

网格设置：
- 列数：3
- 列间距：24px
- 行间距：32px

使用组件：
- Card/Project（实例化）
- 每行 3 个卡片
- 至少显示 6 个项目
```

### 5.2 项目详情页（Project Detail）

#### 布局结构：
```
┌─────────────────────────────────────┐
│  Navigation/Header                  │
├─────────────────────────────────────┤
│  Media Section (视频/图片)          │ 600px
├─────────────────────────────────────┤
│  ┌─────────────────┬──────────────┐ │
│  │  Main Content   │  Sidebar     │ │
│  │  (70%)          │  (30%)       │ │
│  │                 │              │ │
│  │  - 项目信息     │  - 进度卡片  │ │
│  │  - 项目描述     │  - 行动按钮  │ │
│  │  - 项目动态     │              │ │
│  │                 │              │ │
│  └─────────────────┴──────────────┘ │
└─────────────────────────────────────┘
```

#### 详细设计：

**1. 媒体区域**
```
- 宽度：100%
- 高度：600px
- 背景：Neutral/900
- 内容：视频播放器或封面图片
- 对象适配：contain
```

**2. 主内容区**
```
宽度：70%
内边距：48px

包含卡片：
1. 项目信息卡片
   - 标题（H1）
   - 分类标签
   - 发起人信息
   - 创建时间

2. 项目描述卡片
   - 标题（H2）："关于这个项目"
   - 正文（Body/Default）
   - 富文本格式

3. 项目动态卡片
   - 标题（H2）："项目动态"
   - 发布按钮（仅发起人可见）
   - 动态列表
```

**3. 侧边栏**
```
宽度：30%
粘性定位：top 24px

包含卡片：
1. 进度卡片
   - 当前时长（大号数字）
   - 目标时长
   - 进度条
   - 统计信息

2. 行动按钮卡片
   - 主要按钮："成为工蜂"
   - 次要按钮："关注项目"
```

### 5.3 创建项目页（Create Project）

#### 布局结构：
```
┌─────────────────────────────────────┐
│  Navigation/Header                  │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  Form Container (最大 800px)  │  │
│  │  居中对齐                      │  │
│  │                               │  │
│  │  - 标题                       │  │
│  │  - 描述                       │  │
│  │  - 分类                       │  │
│  │  - 目标时长                   │  │
│  │  - 封面上传                   │  │
│  │  - 视频上传                   │  │
│  │  - Telegram 群组              │  │
│  │  - 提交按钮                   │  │
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### 表单设计：
```
每个表单项：
- 标签（Label/Default）
- 输入框（Input/Text 组件）
- 帮助文字（Caption/Default）
- 错误提示（Error 状态）
- 间距：24px

上传区域：
- 虚线边框：2px dashed Neutral/300
- 圆角：12px
- 内边距：48px
- 背景：Neutral/50
- 悬停：背景 Neutral/100
- 图标 + 提示文字
```

### 5.4 个人中心页（Profile）

#### 布局结构：
```
┌─────────────────────────────────────┐
│  Navigation/Header                  │
├─────────────────────────────────────┤
│  User Info Section                  │ 200px
│  - 头像 + 用户名 + 统计数据         │
├─────────────────────────────────────┤
│  Tab Navigation                     │ 48px
│  [我发起的] [我参与的] [我关注的]   │
├─────────────────────────────────────┤
│  Project Grid                       │
│  (使用 Card/Project 组件)           │
└─────────────────────────────────────┘
```

### 5.5 登录/注册页（Auth）

#### 布局结构：
```
┌─────────────────────────────────────┐
│  Navigation/Header (简化版)         │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  Auth Container (最大 480px)  │  │
│  │  居中对齐                      │  │
│  │                               │  │
│  │  - Logo                       │  │
│  │  - 标题                       │  │
│  │  - 表单                       │  │
│  │  - 提交按钮                   │  │
│  │  - 切换链接                   │  │
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 6. 导出和交付

### 6.1 创建原型（Prototype）

#### 步骤：
1. 切换到 **Prototype** 模式（右上角）
2. 连接页面流程：
   ```
   Home → Project Detail（点击卡片）
   Home → Create Project（点击"开始创作"）
   Home → Auth（点击"登录"）
   Project Detail → Home（点击返回）
   ```

3. 设置交互：
   - 触发：On Click
   - 动作：Navigate to
   - 动画：Smart Animate
   - 持续时间：300ms
   - 缓动：Ease Out

### 6.2 添加注释（Comments）

在关键位置添加注释：
```
💬 "这里使用 Primary/Default 颜色"
💬 "间距使用 Spacing/LG (24px)"
💬 "悬停时显示阴影效果"
💬 "移动端需要调整为单列布局"
```

### 6.3 导出资源

#### 导出设置：
1. 选择要导出的元素
2. 右侧面板 → **Export**
3. 设置：
   ```
   格式：PNG (图片), SVG (图标)
   倍率：1x, 2x, 3x
   ```

#### 导出内容：
- Logo（SVG）
- 图标集（SVG）
- 示例截图（PNG 2x）

### 6.4 生成开发标注

#### 使用 Figma Inspect：
1. 选择 **Inspect** 面板（右侧）
2. 开发者可以查看：
   - CSS 代码
   - 颜色值
   - 字体属性
   - 间距尺寸

#### 分享链接：
1. 点击右上角 **Share**
2. 设置权限：**Anyone with the link can view**
3. 复制链接分享给开发团队

---

## 📚 快捷键参考

```
创建 Frame：F
创建矩形：R
创建文本：T
创建组件：Ctrl/Cmd + Alt + K
创建实例：Ctrl/Cmd + Alt + V
Auto Layout：Shift + A
复制样式：Ctrl/Cmd + Alt + C
粘贴样式：Ctrl/Cmd + Alt + V
缩放到适应：Shift + 1
缩放到选中：Shift + 2
```

---

## ✅ 检查清单

完成设计后，检查以下项目：

- [ ] 所有颜色都创建了样式
- [ ] 所有文字都使用了文字样式
- [ ] 所有组件都有清晰的命名
- [ ] 组件包含必要的变体（状态、尺寸）
- [ ] 页面使用了 Auto Layout
- [ ] 间距符合 8px 栅格
- [ ] 创建了原型流程
- [ ] 添加了必要的注释
- [ ] 设置了导出选项
- [ ] 分享链接已生成

---

## 🎯 下一步

完成 Figma 设计后：

1. **分享设计文件**
   - 复制 Figma 文件链接
   - 分享给团队成员审阅

2. **开始代码实施**
   - 使用 Figma Inspect 获取样式
   - 按照设计规范更新代码
   - 参考 `DESIGN_OPTIMIZATION_PLAN.md`

3. **持续迭代**
   - 收集反馈
   - 优化设计
   - 更新组件库

---

**预计完成时间**：4-6 小时
**难度等级**：中等
**推荐工具**：Figma Desktop App

祝您设计顺利！🎨✨
