# 需求文档

## 简介

为蜜蜂AI电影制片厂平台的导航栏用户区域添加悬停触发的下拉弹出面板。该面板将整合用户信息展示、快捷导航链接和退出登录功能，替代当前分散在导航栏中的用户头像链接和独立退出按钮。下拉菜单需匹配现有的 Cinematic Luxury 设计系统（深色主题 + 金色点缀）。

## 术语表

- **User_Dropdown**：悬停触发的浮动面板组件，显示用户信息和操作链接
- **Trigger_Area**：导航栏中触发下拉面板的用户头像和名称区域
- **Navigation_Bar**：页面顶部的固定导航栏，包含首页导航栏（page.tsx）和共享头部组件（HeaderSimple.tsx）
- **Design_System**：Cinematic Luxury 设计系统，使用深色主题（#0a0a0b）、金色点缀（#c9a227）、Playfair Display 和 DM Sans 字体

## 需求

### 需求 1：悬停触发显示下拉面板

**用户故事：** 作为已登录用户，我希望将鼠标悬停在导航栏的用户区域时看到下拉面板，以便快速访问个人相关功能。

#### 验收标准

1. WHEN 鼠标悬停在 Trigger_Area 上时，THE User_Dropdown SHALL 在 Trigger_Area 下方显示浮动面板
2. WHEN 鼠标离开 Trigger_Area 和 User_Dropdown 区域时，THE User_Dropdown SHALL 关闭浮动面板
3. WHEN User_Dropdown 显示时，THE User_Dropdown SHALL 使用 animate-scale-in 动画过渡效果
4. WHILE 用户未登录，THE Trigger_Area SHALL 不渲染，Navigation_Bar 保持显示登录和注册按钮

### 需求 2：用户信息展示

**用户故事：** 作为已登录用户，我希望在下拉面板中看到我的个人信息，以便确认当前登录的账户。

#### 验收标准

1. THE User_Dropdown SHALL 在面板顶部显示用户头像（圆形，带边框）
2. THE User_Dropdown SHALL 在头像旁显示用户名称
3. THE User_Dropdown SHALL 在用户名称下方显示用户邮箱地址
4. IF 用户头像加载失败，THEN THE User_Dropdown SHALL 显示默认头像（/default-avatar.svg）

### 需求 3：快捷导航链接

**用户故事：** 作为已登录用户，我希望通过下拉面板快速跳转到常用页面，以便提高操作效率。

#### 验收标准

1. THE User_Dropdown SHALL 提供指向个人主页（/profile）的链接
2. THE User_Dropdown SHALL 提供指向我的项目（/profile，项目标签页）的链接
3. WHEN 用户点击任一快捷链接时，THE User_Dropdown SHALL 关闭面板并导航到目标页面
4. THE User_Dropdown SHALL 为每个链接显示对应的 SVG 图标和国际化文本标签

### 需求 4：退出登录功能

**用户故事：** 作为已登录用户，我希望通过下拉面板退出登录，以便安全地结束会话。

#### 验收标准

1. THE User_Dropdown SHALL 在面板底部提供退出登录按钮，与快捷链接区域通过分隔线视觉分离
2. WHEN 用户点击退出登录按钮时，THE User_Dropdown SHALL 调用 logout 函数并将用户导航到首页
3. WHEN 退出登录按钮从导航栏移入 User_Dropdown 后，THE Navigation_Bar SHALL 不再单独显示退出按钮

### 需求 5：设计系统一致性

**用户故事：** 作为用户，我希望下拉面板的视觉风格与平台整体设计一致，以获得统一的使用体验。

#### 验收标准

1. THE User_Dropdown SHALL 使用 Design_System 的深色背景（var(--ink-light)）和边框（var(--ink-border)）
2. THE User_Dropdown SHALL 使用 Design_System 的文字颜色层级（--text-primary、--text-secondary、--text-muted）
3. WHEN 鼠标悬停在链接项上时，THE User_Dropdown SHALL 使用 var(--ink-lighter) 作为悬停背景色
4. THE User_Dropdown SHALL 使用 DM Sans 字体，与 Navigation_Bar 其他元素保持一致

### 需求 6：国际化支持

**用户故事：** 作为用户，我希望下拉面板的文本内容支持中英文切换，以便使用我偏好的语言。

#### 验收标准

1. THE User_Dropdown SHALL 通过 react-i18next 加载所有文本标签
2. WHEN 语言切换时，THE User_Dropdown SHALL 立即更新所有文本标签为对应语言
3. THE User_Dropdown SHALL 在 i18n 资源文件中同时提供中文和英文翻译

### 需求 7：组件复用与集成

**用户故事：** 作为开发者，我希望下拉菜单作为独立组件实现，以便在首页导航栏和共享头部组件中复用。

#### 验收标准

1. THE User_Dropdown SHALL 作为独立的 React 组件实现（UserDropdown.tsx）
2. WHEN User_Dropdown 集成到 Navigation_Bar 中时，THE User_Dropdown SHALL 替换当前的用户头像链接和独立退出按钮
3. THE User_Dropdown SHALL 同时集成到首页导航栏（page.tsx）和共享头部组件（HeaderSimple.tsx）中
