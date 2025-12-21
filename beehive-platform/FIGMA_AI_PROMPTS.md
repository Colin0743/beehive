# Figma AI 提示词 - 蜂巢平台设计生成

## 🤖 使用说明

将以下提示词复制到 Figma AI 中，可以快速生成对应的设计元素。建议按顺序生成，从设计系统到具体页面。

---

## 📋 提示词目录

1. [设计系统 - 配色板](#1-设计系统---配色板)
2. [设计系统 - 排版](#2-设计系统---排版)
3. [组件 - 按钮](#3-组件---按钮)
4. [组件 - 输入框](#4-组件---输入框)
5. [组件 - 项目卡片](#5-组件---项目卡片)
6. [组件 - 导航栏](#6-组件---导航栏)
7. [页面 - 首页Hero区域](#7-页面---首页hero区域)
8. [页面 - 项目网格](#8-页面---项目网格)
9. [页面 - 完整首页](#9-页面---完整首页)
10. [响应式设计](#10-响应式设计)

---

## 1. 设计系统 - 配色板

### 提示词：
```
Create a color palette design system for a beehive-themed AI video collaboration platform called "蜂巢平台" (Beehive Platform).

Design requirements:
- Primary color: Golden yellow #FFD700 (main brand color)
- Primary hover: #E6C200
- Primary light: #FFF9E6 (backgrounds)
- Secondary colors: Orange #FF8C42, Blue #4A90E2, Green #10B981
- Neutral colors: 10 shades from #111827 (darkest) to #FFFFFF (white)
- Status colors: Success (#10B981), Warning (#F59E0B), Error (#EF4444), Info (#3B82F6)

Layout:
- Arrange colors in a grid with 200x100px rectangles
- Label each color with its name, hex code, and usage scenario
- Group by category: Primary, Secondary, Neutral, Status
- Use clean, modern design with proper spacing
- All colors must meet WCAG 2.1 AA contrast standards

Style: Modern, clean, professional
```

---

## 2. 设计系统 - 排版

### 提示词：
```
Create a typography system showcase for a modern web platform.

Font family: Inter (or system fonts)

Typography scale (9 levels):
1. Hero: 48px, line-height 56px, weight 700, color #111827
2. H1: 36px, line-height 44px, weight 700, color #111827
3. H2: 30px, line-height 38px, weight 600, color #111827
4. H3: 24px, line-height 32px, weight 600, color #111827
5. H4: 20px, line-height 28px, weight 600, color #111827
6. Body Large: 18px, line-height 28px, weight 400, color #1F2937
7. Body: 16px, line-height 24px, weight 400, color #1F2937
8. Body Small: 14px, line-height 20px, weight 400, color #4B5563
9. Caption: 12px, line-height 16px, weight 400, color #6B7280

Layout:
- Display each style with sample text
- Show the style name, size, line-height, and weight
- Use actual text examples for each level
- Arrange vertically with proper spacing (24px between items)
- Include a visual scale indicator

Style: Clean, organized, easy to read
```

---

## 3. 组件 - 按钮

### 提示词：
```
Design a comprehensive button component system for a web platform with golden yellow branding.

Button types:
1. Primary Button:
   - Background: #FFD700 (golden yellow)
   - Text: #111827 (dark gray)
   - Border radius: 8px
   - Padding: 12px 24px
   - Font: 14px, weight 600
   - Hover state: Background #E6C200
   - Shadow: 0 1px 3px rgba(0,0,0,0.1)

2. Secondary Button:
   - Background: transparent
   - Border: 2px solid #FFD700
   - Text: #FFD700
   - Border radius: 8px
   - Padding: 10px 22px
   - Hover: Background #FFF9E6

3. Text Button:
   - Background: transparent
   - Text: #4A90E2 (blue)
   - No border
   - Hover: Underline

States for each type:
- Default
- Hover
- Pressed (scale 0.98)
- Disabled (gray)

Sizes:
- Small: 36px height
- Medium: 44px height
- Large: 52px height

Layout: Show all variations in a grid, organized by type and state
Style: Modern, clean, with clear labels
```

---

## 4. 组件 - 输入框

### 提示词：
```
Design a text input component system for a modern web form.

Input specifications:
- Width: 320px
- Height: 44px
- Border radius: 8px
- Font: 16px
- Padding: 12px 16px

States:
1. Default:
   - Border: 1px solid #D1D5DB
   - Background: #FFFFFF
   - Placeholder: #6B7280

2. Focus:
   - Border: 2px solid #FFD700 (golden yellow)
   - Shadow: 0 0 0 3px rgba(255, 215, 0, 0.1)
   - Background: #FFFFFF

3. Error:
   - Border: 2px solid #EF4444 (red)
   - Shadow: 0 0 0 3px rgba(239, 68, 68, 0.1)
   - Error message below in red

4. Disabled:
   - Background: #F3F4F6
   - Text: #9CA3AF
   - Border: 1px solid #E5E7EB

Layout: Show all 4 states vertically with labels
Include: Search icon on the left for search inputs
Style: Clean, modern, accessible
```

---

## 5. 组件 - 项目卡片

### 提示词：
```
Design a project card component for an AI video collaboration platform with a beehive theme.

Card specifications:
- Size: 360px width × 480px height
- Border radius: 12px
- Background: #FFFFFF
- Border: 1px solid #E5E7EB
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: Shadow 0 4px 12px rgba(0,0,0,0.15), lift 2px

Card structure (top to bottom):
1. Cover image area:
   - Height: 192px
   - Placeholder: Light gray #F3F4F6
   - Icon: 📹 video camera emoji

2. Category tag (top-left on cover):
   - Background: #FFF9E6 (light yellow)
   - Text: #92400E (dark orange)
   - Padding: 4px 12px
   - Border radius: 6px
   - Text: "科幻" or "动画"

3. Content area (padding 24px):
   - Title: 24px, bold, #111827, max 1 line
   - Description: 14px, #4B5563, max 2 lines
   - Current value: 32px bold, #111827 "1000 分钟"
   - Target value: 14px, #6B7280 "目标 5000"
   - Progress bar: 2px height, rounded, #10B981 fill, #E5E7EB background
   - Stats row: "10 支持者 | 20% 完成 | 5 天"

States: Default and Hover
Style: Modern, clean, card-based design with golden yellow accents
```

---

## 6. 组件 - 导航栏

### 提示词：
```
Design a top navigation bar for a beehive-themed platform called "蜂巢平台".

Navigation specifications:
- Width: 1440px
- Height: 64px
- Background: #FFFFFF
- Bottom border: 1px solid #E5E7EB
- Shadow: 0 1px 3px rgba(0,0,0,0.1)

Layout (left to right):
1. Left section:
   - Logo: Hexagonal beehive icon in golden yellow #FFD700
   - Text: "蜂巢" in bold, 20px

2. Center section:
   - Search bar: 600px width
   - Placeholder: "搜索项目..."
   - Search icon on left
   - Border radius: 8px
   - Border: 1px solid #D1D5DB

3. Right section:
   - Links: "登录" "注册" (14px, #4B5563)
   - Primary button: "开始创作" (golden yellow #FFD700)
   - Spacing: 24px between items

Below navigation (second row):
- Category tabs: "全部" "科幻" "动画" "纪录片" "教育" "其他"
- Height: 48px
- Selected tab: Bold, bottom border 2px #FFD700
- Unselected: Regular weight, #4B5563
- Spacing: 32px between tabs

Style: Clean, modern, professional with golden yellow accents
```

---

## 7. 页面 - 首页Hero区域

### 提示词：
```
Design a hero section for "蜂巢平台" (Beehive Platform), an AI video collaboration platform.

Hero specifications:
- Width: 1440px
- Height: 400px
- Background: Linear gradient from #FFF9E6 (top-left) to #FFD700 (bottom-right)
- Border radius: 0 0 24px 24px (rounded bottom corners)
- Padding: 48px

Background decoration:
- 4 bee emojis (🐝) at 6% opacity
- Positions: top-left, top-right, bottom-left, bottom-right
- Size: 64px
- Slight rotation: ±12 degrees

Content (centered):
1. Main title:
   - Text: "让创意在蜂巢中绽放"
   - Font: 48px, bold, #111827
   - Letter spacing: -0.02em

2. Subtitle:
   - Text: "蜂巢是AI视频创作者的协作平台，加入蜂巢，与优秀创作者一起完成AI视频作品"
   - Font: 18px, regular, #1F2937
   - Max width: 800px
   - Margin top: 16px

3. Process comic area:
   - Height: 200px
   - Placeholder: Light gray rounded rectangle
   - Text: "流程漫画"
   - Margin top: 32px

Style: Modern, warm, inviting with golden yellow theme
```

---

## 8. 页面 - 项目网格

### 提示词：
```
Design a project grid section for displaying AI video projects.

Section specifications:
- Width: 1200px (centered)
- Title: "精选项目" (30px, bold, #111827)
- Margin bottom: 32px

Grid layout:
- 3 columns
- Column gap: 24px
- Row gap: 32px
- 6 project cards total (2 rows)

Use the project card design with these variations:
Card 1: "科幻" category, 20% progress, "太空探索" title
Card 2: "动画" category, 50% progress, "童话世界" title
Card 3: "纪录片" category, 80% progress, "自然奇观" title
Card 4: "教育" category, 100% progress, "编程入门" title (show "已完成" badge)
Card 5: "科幻" category, 35% progress, "未来城市" title
Card 6: "其他" category, 60% progress, "创意实验" title

Each card should show:
- Cover image (use placeholder with category color)
- Category tag
- Title
- Description (2 lines)
- Progress bar
- Stats: supporters, completion %, days left

Style: Clean grid layout with consistent spacing, golden yellow accents
```

---

## 9. 页面 - 完整首页

### 提示词：
```
Design a complete homepage for "蜂巢平台" (Beehive Platform), an AI video collaboration platform.

Page structure (1440px width, scrollable):

1. Top Navigation (64px height):
   - Logo with hexagonal beehive icon
   - Search bar in center
   - Login/Register links and "开始创作" button on right
   - Golden yellow #FFD700 accents

2. Category Tabs (48px height):
   - Tabs: 全部, 科幻, 动画, 纪录片, 教育, 其他
   - Selected tab has golden bottom border

3. Hero Section (400px height):
   - Gradient background: #FFF9E6 to #FFD700
   - Title: "让创意在蜂巢中绽放"
   - Subtitle about AI video collaboration
   - 4 subtle bee emojis in background
   - Process comic placeholder

4. Featured Projects Section:
   - Title: "精选项目"
   - 3-column grid of project cards
   - 6 cards showing different categories and progress
   - Each card: cover, category tag, title, description, progress bar, stats

Design system:
- Primary color: #FFD700 (golden yellow)
- Text colors: #111827 (titles), #1F2937 (body), #4B5563 (secondary)
- Border radius: 8-12px
- Shadows: Subtle, layered
- Spacing: 8px grid system

Style: Modern, clean, warm, professional with beehive/collaboration theme
Overall feel: Inviting, creative, community-focused
```

---

## 10. 响应式设计

### 提示词 A - 移动端（375px）：
```
Design a mobile version (375px width) of the Beehive Platform homepage.

Adaptations:
1. Navigation:
   - Height: 56px
   - Hamburger menu icon (left)
   - Logo (center)
   - User icon (right)
   - Search bar: Hidden or collapsible

2. Hero Section:
   - Height: 280px
   - Padding: 24px
   - Title: 32px (smaller)
   - Subtitle: 16px
   - 2 bee emojis only

3. Category Tabs:
   - Horizontal scroll
   - Visible: 3-4 tabs at once
   - Swipe indicator

4. Project Grid:
   - 1 column layout
   - Full width cards
   - Spacing: 16px between cards
   - Show 3-4 cards initially

Adjustments:
- All text sizes reduced by 2-4px
- Padding reduced by 25%
- Touch targets: minimum 44px
- Simplified layouts

Style: Mobile-first, touch-friendly, optimized for small screens
```

### 提示词 B - 平板（768px）：
```
Design a tablet version (768px width) of the Beehive Platform homepage.

Adaptations:
1. Navigation:
   - Height: 60px
   - Simplified search bar
   - Condensed right section

2. Hero Section:
   - Height: 320px
   - Padding: 32px
   - Title: 40px
   - 3 bee emojis

3. Category Tabs:
   - All visible
   - Slightly reduced spacing

4. Project Grid:
   - 2 columns
   - Gap: 16px
   - Cards: 48% width each

Adjustments:
- Text sizes reduced by 1-2px
- Padding reduced by 12.5%
- Balanced layout

Style: Optimized for tablet viewing, touch-friendly
```

---

## 🎯 使用技巧

### 1. 分步生成
不要一次生成整个页面，按照顺序逐个生成：
1. 先生成设计系统（配色、排版）
2. 再生成组件（按钮、卡片等）
3. 最后组合成完整页面

### 2. 调整提示词
如果生成结果不理想，可以：
- 添加更多细节描述
- 指定具体的设计风格参考
- 调整尺寸和间距数值

### 3. 保存为组件
生成后立即将元素转换为Figma组件：
- 选中元素 → `Ctrl/Cmd + Alt + K`
- 创建变体以支持不同状态

### 4. 建立样式
将颜色和文字转换为样式：
- 右键点击颜色 → "Create style"
- 右键点击文字 → "Create text style"

### 5. 迭代优化
AI生成的设计可能需要手动调整：
- 对齐和间距
- 颜色精确度
- 文字内容

---

## 📝 提示词模板

如果需要生成其他页面，使用这个模板：

```
Design a [页面名称] for "蜂巢平台" (Beehive Platform).

Page purpose: [页面用途]

Layout specifications:
- Width: [宽度]
- Sections: [区块列表]

Design system:
- Primary color: #FFD700 (golden yellow)
- Text colors: #111827, #1F2937, #4B5563
- Border radius: 8-12px
- Spacing: 8px grid
- Shadows: Subtle, layered

Key elements:
1. [元素1描述]
2. [元素2描述]
3. [元素3描述]

Style: Modern, clean, warm, professional
Theme: Beehive, collaboration, creativity
```

---

## ⚠️ 注意事项

1. **AI生成的局限性**
   - 可能无法完全匹配精确的颜色值
   - 间距可能需要手动调整
   - 中文字体可能需要替换

2. **后续优化**
   - 检查对比度是否符合WCAG标准
   - 统一所有圆角和间距
   - 创建组件变体

3. **团队协作**
   - 将生成的设计转换为组件库
   - 建立清晰的命名规范
   - 添加设计注释

---

## 🚀 快速开始

1. 打开Figma，创建新文件
2. 点击Figma AI功能
3. 复制第1个提示词（配色板）
4. 粘贴并生成
5. 依次生成其他元素
6. 组合成完整页面

预计时间：1-2小时（使用AI）vs 4-6小时（手动）

祝你设计顺利！🎨✨
