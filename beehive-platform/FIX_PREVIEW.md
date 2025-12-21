# 修复预览功能

## 问题：Ctrl+Shift+V 无反应

### 可能的原因
1. Live Preview 插件未正确安装
2. 快捷键被其他功能占用
3. 插件需要重新加载

## 解决方案

### 方案一：使用命令面板（最可靠）

1. **按 `Ctrl+Shift+P`** 打开命令面板
2. **输入**：`Live Preview`
3. **选择**：`Live Preview: Show Preview`
4. **回车**
5. 在地址栏输入：`http://localhost:3000`

### 方案二：检查插件是否安装

1. **按 `Ctrl+Shift+X`** 打开扩展面板
2. **搜索**：`Live Preview`
3. **确认** Microsoft 的 `Live Preview` 插件已安装并启用
4. 如果未安装，点击"安装"
5. 安装后重启 Cursor

### 方案三：使用 Simple Browser（内置功能）

1. **按 `Ctrl+Shift+P`**
2. **输入**：`Simple Browser: Show`
3. **回车**
4. **输入URL**：`http://localhost:3000`
5. **回车**

### 方案四：检查快捷键设置

1. **按 `Ctrl+K Ctrl+S`** 打开快捷键设置
2. **搜索**：`Live Preview`
3. **检查**快捷键是否被设置
4. 可以重新设置快捷键

### 方案五：使用浏览器打开（临时方案）

如果以上都不行，可以在浏览器中打开：
- 直接访问：`http://localhost:3000`
- 或运行：`Start-Process "http://localhost:3000"`

## 推荐操作步骤

1. **先尝试命令面板**：
   - `Ctrl+Shift+P` → `Live Preview: Show Preview`

2. **如果不行，检查插件**：
   - `Ctrl+Shift+X` → 搜索 `Live Preview` → 确认已安装

3. **最后尝试 Simple Browser**：
   - `Ctrl+Shift+P` → `Simple Browser: Show` → 输入URL

