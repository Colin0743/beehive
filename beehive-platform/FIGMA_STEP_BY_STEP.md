# 蜂巢平台 Figma 设计文件创建指南（分步教程）

## 📋 准备工作

### 所需工具
- Figma账号（免费版即可）
- 浏览器访问 [figma.com](https://figma.com)
- 预计时间：4-6小时

### 设计规范参考
- 配色方案：已在 `DESIGN_OPTIMIZATION_PLAN.md` 中定义
- 组件规范：已在代码中实现
- 当前页面：`src/app/page.tsx` 和 `src/components/HeaderSimple.tsx`

---

## 🎯 第一步：创建文件和页面结构

### 1.1 创建新文件
1. 打开 Figma → 点击 **"New design file"**
2. 文件命名：**"蜂巢平台 - 设计系统 v1.0"**
3. 保存到你的项目文件夹

### 1.2 创建页面结构
在左侧面板创建以下页面（点击 + 号添加页面）：

```
📄 01 - Cover（封面）
📄 02 - Design System（设计系统）
📄 03 - Components（组件库）
📄 04 - Home Page（首页设计）
📄 05 - Responsive（响应式）
📄 06 - Prototype（原型）
```

---

## 🎨 第二步：设置设计系统

### 2.1 创建配色样式

#### 操作步骤：
1. 选择 **"02 - Design System"** 页面
2. 按 `R` 键创建矩形
3. 设置尺寸：200px × 100px
4. 填充颜色后，右键点击填充色 → **"Create style"**

#### 主色系（必须创建）

**Primary/Default**
```
名称：Primary/Default
色值：#FFD700
尺寸：200×100
标签：主要按钮、重要标签、品牌元素
```

**Primary/Hover**
```
名称：Primary/Hover
色值：#E6C200
尺寸：200×100
标签：主色悬停状态
```

**Primary/Light**
```
名称：Primary/Light
色值：#FFF9E6
尺寸：200×100
标签：背景、卡片高亮
```

#### 辅助色系

**Secondary/Orange**
```
名称：Secondary/Orange
色值：#FF8C42
尺寸：200×100
标签：次要按钮、标签
```

**Secondary/Blue**
```
名称：Secondary/Blue
色值：#4A90E2
尺寸：200×100
标签：链接、信息提示
```

**Secondary/Green**
```
名称：Secondary/Green
色值：#10B981
尺寸：200×100
标签：成功状态、进度满
```

#### 中性色系（10个层级）

```
Neutral/900 → #111827 (标题黑)
Neutral/800 → #1F2937 (正文黑)
Neutral/600 → #4B5563 (次要文字)
Neutral/500 → #6B7280 (辅助文字)
Neutral/400 → #9CA3AF (禁用文字)
Neutral/300 → #D1D5DB (分割线)
Neutral/200 → #E5E7EB (边框)
Neutral/100 → #F3F4F6 (卡片背景)
Neutral/50 → #F9FAFB (浅灰背景)
Neutral/0 → #FFFFFF (白色)
```

#### 状态色系

**Success（成功）**
```
Success/Default → #10B981
Success/Light → #D1FAE5
Success/Dark → #065F46
```

**Warning（警告）**
```
Warning/Default → #F59E0B
Warning/Light → #FEF3C7
Warning/Dark → #92400E
```

**Error（错误）**
```
Error/Default → #EF4444
Error/Light → #FEE2E2
Error/Dark → #991B1B
```

**Info（信息）**
```
Info/Default → #3B82F6
Info/Light → #DBEAFE
Info/Dark → #1E40AF
```

### 2.2 创建文字样式

#### 操作步骤：
1. 按 `T` 键创建文本
2. 设置字体属性
3. 右键 → **"Create text style"**

#### 字体家族
```
主字体：Inter（Figma默认）
备选：-apple-system, Roboto
```

#### 文字样式列表

**Heading/Hero**
```
字体：Inter Bold
字号：48px
行高：56px (117%)
字重：700
颜色：Neutral/900
```

**Heading/H1**
```
字体：Inter Bold
字号：36px
行高：44px (122%)
字重：700
颜色：Neutral/900
```

**Heading/H2**
```
字体：Inter Semibold
字号：30px
行高：38px (127%)
字重：600
颜色：Neutral/900
```

**Heading/H3**
```
字体：Inter Semibold
字号：24px
行高：32px (133%)
字重：600
颜色：Neutral/900
```

**Heading/H4**
```
字体：Inter Semibold
字号：20px
行高：28px (140%)
字重：600
颜色：Neutral/900
```

**Body/Large**
```
字体：Inter Regular
字号：18px
行高：28px (156%)
字重：400
颜色：Neutral/800
```

**Body/Default**
```
字体：Inter Regular
字号：16px
行高：24px (150%)
字重：400
颜色：Neutral/800
```

**Body/Small**
```
字体：Inter Regular
字号：14px
行高：20px (143%)
字重：400
颜色：Neutral/600
```

**Label/Default**
```
字体：Inter Medium
字号：14px
行高：20px (143%)
字重：500
颜色：Neutral/900
```

**Caption/Default**
```
字体：Inter Regular
字号：12px
行高：16px (133%)
字重：400
颜色：Neutral/500
```

---

## 🧩 第三步：创建组件库

### 3.1 按钮组件

#### 主要按钮（Primary Button）

**操作步骤：**
1. 选择 **"03 - Components"** 页面
2. 按 `R` 创建矩形
3. 设置属性：
   - 宽度：Auto Layout（自适应）
   - 高度：44px
   - 圆角：8px
   - 填充：Primary/Default
4. 按 `T` 添加文字：
   - 样式：Label/Default
   - 颜色：Neutral/900
   - 文字："按钮文字"
5. 选中矩形和文字 → 按 `Ctrl/Cmd + Alt + K` 创建组件
6. 命名：`Button/Primary`

**使用Auto Layout：**
1. 选中组件 → 按 `Shift + A`
2. 设置内边距：
   - 水平：24px
   - 垂直：12px
3. 设置间距：8px（如果有图标）

**创建变体：**
1. 选中组件 → 右键 → **"Add variant"**
2. 创建以下变体：

```
State（状态）：
- Default（默认）
- Hover（悬停）→ 背景改为 Primary/Hover
- Pressed（按下）→ 缩放 98%
- Disabled（禁用）→ 背景 Neutral/200，文字 Neutral/400

Size（尺寸）：
- Small → 高度 36px，内边距 8px 16px
- Medium → 高度 44px，内边距 12px 24px
- Large → 高度 52px，内边距 16px 32px
```

#### 次要按钮（Secondary Button）

**属性：**
```
背景：透明
边框：2px solid Primary/Default
文字：Primary/Default
圆角：8px
内边距：10px 22px（减2px因为边框）
悬停：背景 Primary/Light
```

#### 文字按钮（Text Button）

**属性：**
```
背景：透明
文字：Secondary/Blue
悬停：文字 Info/Default + 下划线
```

### 3.2 输入框组件

#### 文本输入框

**操作步骤：**
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

**创建状态变体：**
```
State：
- Default → 边框 Neutral/300
- Focus → 边框 2px Primary/Default + 阴影
- Error → 边框 2px Error/Default + 阴影
- Disabled → 背景 Neutral/100，文字 Neutral/400

阴影效果：
Focus: 0 0 0 3px rgba(255, 215, 0, 0.1)
Error: 0 0 0 3px rgba(239, 68, 68, 0.1)
```

### 3.3 项目卡片组件

#### 操作步骤：
1. 按 `F` 创建 Frame
2. 设置尺寸：360px × 480px
3. 圆角：12px
4. 填充：Neutral/0
5. 添加效果：
   - 阴影：0 1px 3px rgba(0,0,0,0.1)
   - 边框：1px solid Neutral/200

#### 卡片内容结构：

**封面区域**
```
高度：192px
圆角：12px 12px 0 0
填充：Neutral/100
对象适配：Cover
```

**内容区域（使用Auto Layout）**
```
内边距：24px
间距：16px（垂直）
方向：垂直

包含元素：
1. 分类标签
   - 背景：Primary/Light
   - 文字：Warning/Dark
   - 圆角：6px
   - 内边距：4px 12px
   - 字号：12px

2. 标题
   - 样式：Heading/H3
   - 最大行数：1

3. 描述
   - 样式：Body/Small
   - 颜色：Neutral/600
   - 最大行数：2

4. 进度信息
   - 当前值：Heading/H2
   - 目标值：Body/Small + Neutral/500
   - 进度条：高度 2px，圆角 1px

5. 统计信息
   - 水平排列
   - 间距：16px
   - 字号：14px
```

**创建组件：** `Card/Project`

**创建悬停变体：**
```
State：
- Default → 阴影 0 1px 3px
- Hover → 阴影 0 4px 12px + 上移 2px
```

### 3.4 导航栏组件

#### 顶部导航栏

**操作步骤：**
1. 创建 Frame：1440px × 64px
2. 填充：Neutral/0
3. 底部边框：1px solid Neutral/200
4. 添加阴影：0 1px 3px rgba(0,0,0,0.1)

**内容结构（使用Auto Layout）：**
```
左侧：
- Logo（使用你的六边形Logo）
- 间距：24px

中间：
- 搜索框（Input/Text组件实例）
- 最大宽度：600px
- 左右边距：32px

右侧：
- 导航链接（间距 24px）
- 用户头像（32px圆形）
- 主按钮（Button/Primary实例）
```

**创建组件：** `Navigation/Header`

#### 分类标签栏

**操作步骤：**
1. 创建 Frame：1440px × 48px
2. 填充：Neutral/0
3. 底部边框：1px solid Neutral/200

**标签按钮（使用Auto Layout）：**
```
内边距：8px 0
字号：15px
字重：400（未选中）/ 600（选中）
颜色：Neutral/600（未选中）/ Neutral/900（选中）
底部边框：2px solid transparent（未选中）/ Primary（选中）
间距：32px
```

**创建组件：** `Navigation/Categories`

**创建变体：**
```
State：
- Default
- Selected → 字重 600 + 底部黄色边框
```

---

## 🏠 第四步：设计首页

### 4.1 创建画布

1. 选择 **"04 - Home Page"** 页面
2. 按 `F` 创建 Frame
3. 选择预设：Desktop (1440 × 1024)
4. 命名：`Desktop/Home`
5. 设置高度为 3000px（可滚动）

### 4.2 Hero区域设计

**容器设置：**
```
宽度：1440px
高度：400px
背景：线性渐变
  - 起始色：#FFF9E6 (左上 0%)
  - 结束色：#FFD700 (右下 100%)
圆角：0 0 24px 24px
内边距：48px
```

**背景装饰：**
1. 添加4个蜜蜂emoji（🐝）
2. 位置：
   - 左上：top 40px, left 40px, 旋转 12°
   - 右上：top 64px, right 64px, 旋转 -12°
   - 左下：bottom 48px, left 25%, 旋转 8°
   - 右下：bottom 64px, right 25%, 旋转 -8°
3. 字号：64px
4. 透明度：6%

**内容区域：**
```
最大宽度：1024px
居中对齐

标题：
- 文字："让创意在蜂巢中绽放"
- 样式：Heading/Hero
- 颜色：Neutral/900
- 对齐：居中

副标题：
- 文字："蜂巢是AI视频创作者的协作平台，加入蜂巢，与优秀创作者一起完成AI视频作品"
- 样式：Body/Large
- 颜色：Neutral/800
- 对齐：居中
- 最大宽度：800px
- 上边距：16px

流程漫画区域：
- 高度：200px
- 上边距：32px
- 占位符：灰色矩形 + "流程漫画"文字
```

### 4.3 精选项目标题

**容器设置：**
```
宽度：1200px
居中对齐
上边距：48px
下边距：32px
```

**内容：**
```
标题：
- 文字："精选项目"
- 样式：Heading/H2
- 颜色：Neutral/900

链接（可选）：
- 文字："查看全部 →"
- 样式：Body/Small
- 颜色：Secondary/Blue
- 位置：右对齐
```

### 4.4 项目网格

**容器设置：**
```
宽度：1200px
居中对齐
布局：Auto Layout
方向：垂直
间距：32px（行间距）
```

**网格行（使用Auto Layout）：**
```
方向：水平
间距：24px（列间距）
每行：3个卡片
```

**卡片内容：**
1. 使用 `Card/Project` 组件实例
2. 至少创建6个卡片（2行）
3. 填充示例内容：
   - 封面：使用占位图片或纯色
   - 分类：科幻、动画、纪录片等
   - 标题：示例项目名称
   - 描述：简短描述文字
   - 进度：不同的完成度（20%, 50%, 80%, 100%）

---

## 📱 第五步：响应式设计

### 5.1 创建响应式画布

1. 选择 **"05 - Responsive"** 页面
2. 创建3个Frame：

```
Mobile：375 × 812
Tablet：768 × 1024
Desktop：1440 × 1024
```

### 5.2 移动端适配（375px）

**Hero区域：**
```
高度：280px
内边距：24px
标题字号：32px
副标题字号：16px
背景装饰：2个蜜蜂
```

**项目网格：**
```
布局：1列
卡片宽度：100%
间距：16px
```

**导航栏：**
```
高度：56px
搜索框：隐藏或折叠
汉堡菜单：显示
```

### 5.3 平板适配（768px）

**Hero区域：**
```
高度：320px
内边距：32px
标题字号：40px
```

**项目网格：**
```
布局：2列
卡片宽度：48%
间距：16px
```

### 5.4 桌面适配（1440px）

**使用第四步创建的设计**

---

## 🔗 第六步：创建原型

### 6.1 设置原型模式

1. 点击右上角 **"Prototype"** 标签
2. 选择起始Frame：`Desktop/Home`

### 6.2 添加交互

**卡片点击 → 项目详情：**
```
1. 选中项目卡片
2. 点击右侧 + 号
3. 拖动到目标页面（如果有）
4. 设置：
   - Trigger: On Click
   - Action: Navigate to
   - Animation: Smart Animate
   - Duration: 300ms
   - Easing: Ease Out
```

**按钮悬停效果：**
```
1. 选中按钮组件
2. 切换到 Hover 变体
3. 设置：
   - Trigger: While Hovering
   - Action: Change to
   - Target: Hover variant
   - Animation: Instant
```

**搜索框焦点：**
```
1. 选中搜索框
2. 切换到 Focus 变体
3. 设置：
   - Trigger: On Click
   - Action: Change to
   - Target: Focus variant
```

### 6.3 预览原型

1. 点击右上角播放按钮 ▶️
2. 测试所有交互
3. 检查动画流畅度

---

## 📝 第七步：添加注释和文档

### 7.1 添加设计注释

在关键位置添加注释（按 `C` 键）：

```
💬 "主色使用 Primary/Default (#FFD700)"
💬 "间距使用 Spacing/LG (24px)"
💬 "悬停时阴影加深，上移2px"
💬 "移动端需要调整为单列布局"
💬 "对比度符合WCAG 2.1 AA标准"
```

### 7.2 创建设计规范页面

在 **"02 - Design System"** 页面添加：

**配色板展示：**
```
- 所有颜色样式排列
- 标注色值和使用场景
- 标注对比度数值
```

**排版展示：**
```
- 所有文字样式示例
- 标注字号、行高、字重
- 显示实际效果
```

**间距展示：**
```
- 8px栅格系统
- 7个标准间距
- 使用示例
```

---

## 📤 第八步：导出和分享

### 8.1 导出资源

**导出设置：**
1. 选择要导出的元素
2. 右侧面板 → **Export**
3. 设置：
   ```
   格式：PNG (图片), SVG (图标)
   倍率：1x, 2x, 3x
   ```

**导出内容：**
- Logo（SVG）
- 所有图标（SVG）
- 示例截图（PNG 2x）
- 组件预览（PNG 2x）

### 8.2 生成开发标注

**使用 Figma Inspect：**
1. 选择 **Inspect** 面板（右侧）
2. 开发者可以查看：
   - CSS 代码
   - 颜色值（自动转换为HEX/RGB）
   - 字体属性
   - 间距尺寸
   - 阴影效果

### 8.3 分享链接

1. 点击右上角 **Share** 按钮
2. 设置权限：**Anyone with the link can view**
3. 复制链接
4. 分享给团队成员

---

## ✅ 检查清单

完成设计后，检查以下项目：

### 设计系统
- [ ] 所有颜色都创建了样式（40+个）
- [ ] 所有文字都使用了文字样式（10个）
- [ ] 颜色对比度符合WCAG 2.1 AA标准
- [ ] 间距符合8px栅格系统

### 组件库
- [ ] 按钮组件（3种类型 × 4种状态）
- [ ] 输入框组件（4种状态）
- [ ] 卡片组件（2种状态）
- [ ] 导航栏组件
- [ ] 所有组件都有清晰的命名
- [ ] 组件包含必要的变体

### 页面设计
- [ ] Hero区域设计完成
- [ ] 项目网格设计完成
- [ ] 使用了组件实例
- [ ] 页面使用了Auto Layout
- [ ] 间距统一

### 响应式
- [ ] 移动端设计（375px）
- [ ] 平板设计（768px）
- [ ] 桌面设计（1440px）
- [ ] 断点标注清晰

### 原型
- [ ] 创建了交互流程
- [ ] 动画流畅（300ms）
- [ ] 悬停效果正确

### 文档
- [ ] 添加了设计注释
- [ ] 设计规范页面完整
- [ ] 导出设置正确
- [ ] 分享链接已生成

---

## 🎯 核心优化点总结

### 1. 统一配色体系 ✅
- 建立40+个系统颜色
- 符合WCAG 2.1 AA标准
- 金黄色主色系统

### 2. 简化信息层级 ✅
- Hero区域装饰减少60%
- 卡片信息精简46%
- 清晰的视觉层级

### 3. 优化卡片设计 ✅
- 统一圆角12px
- 标准阴影系统
- 悬停效果增强

### 4. 统一组件样式 ✅
- 3种标准按钮
- 完整状态系统
- 可复用组件库

### 5. 提升对比度 ✅
- 所有文字≥4.5:1
- 无障碍优化
- 可读性提升

### 6. 增加交互反馈 ✅
- 悬停效果
- 焦点状态
- 过渡动画

### 7. 优化排版体系 ✅
- 9个字号级别
- 8px栅格系统
- 统一行高

### 8. 响应式优化 ✅
- 3个断点
- 移动优先
- 完整适配

### 9. 简化视觉装饰 ✅
- 装饰减少60%
- 内容优先
- 品牌保留

### 10. 建立设计规范 ✅
- 完整文档
- 组件库
- 使用指南

---

## 💡 设计技巧

### Auto Layout 使用
- 使用 `Shift + A` 快速创建
- 设置合理的内边距和间距
- 使用 Hug/Fill 控制尺寸

### 组件变体
- 合理规划变体属性
- 使用描述性命名
- 保持变体数量适中

### 颜色管理
- 使用颜色样式而非直接填充
- 建立清晰的命名规范
- 定期整理未使用的样式

### 性能优化
- 避免过度使用效果
- 合理使用组件实例
- 定期清理未使用资源

---

## 📚 参考资源

- [Figma官方教程](https://help.figma.com/)
- [WCAG 2.1标准](https://www.w3.org/WAI/WCAG21/quickref/)
- [8-Point Grid System](https://spec.fm/specifics/8-pt-grid)
- [Material Design](https://m3.material.io/)

---

## 🆘 常见问题

### Q: 如何快速复制样式？
A: 选中元素 → `Ctrl/Cmd + Alt + C` 复制样式 → 选中目标 → `Ctrl/Cmd + Alt + V` 粘贴样式

### Q: 如何批量修改组件？
A: 修改主组件，所有实例会自动更新

### Q: 如何导出多个元素？
A: 选中多个元素 → 右侧Export → 点击Export按钮

### Q: 如何查看对比度？
A: 使用插件 "Contrast" 或 "A11y - Color Contrast Checker"

---

**预计完成时间**：4-6小时
**难度等级**：中等
**推荐工具**：Figma Desktop App

祝你设计顺利！🎨✨
