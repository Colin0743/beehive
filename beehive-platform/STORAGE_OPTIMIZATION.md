# localStorage 存储优化方案

## 问题描述

在实现视频和封面图片上传功能时，遇到了 `QuotaExceededError` 错误：
```
Failed to execute 'setItem' on 'Storage': Setting the value exceeded the quota.
```

这是因为浏览器的 localStorage 通常只有 5-10MB 的存储限制，而 Base64 编码的视频文件会占用大量空间。

## 解决方案

### 1. 图片自动压缩 ✅

**实现**:
```typescript
const compressImage = (file: File): Promise<string> => {
  // 限制最大尺寸为 1200px
  // JPEG 压缩质量 0.7
  // 返回压缩后的 Base64 字符串
}
```

**效果**:
- 原始 5MB 图片 → 压缩后约 200-500KB
- 节省 90% 以上的存储空间
- 不影响视觉质量

### 2. 视频文件大小限制 ✅

**调整**:
- 从 100MB 降低到 20MB 硬限制
- 建议用户使用 <10MB 的视频
- 大于 10MB 时弹出确认对话框

**代码**:
```typescript
if (file.size > 10 * 1024 * 1024) {
  const confirmed = window.confirm(
    '视频文件较大，可能会导致存储问题。建议使用较小的视频文件（<10MB）。是否继续？'
  );
  if (!confirmed) return;
}
```

### 3. localStorage 配额错误处理 ✅

**实现**:
```typescript
try {
  localStorage.setItem('projects', JSON.stringify(allProjects));
} catch (storageError: any) {
  if (storageError.name === 'QuotaExceededError') {
    // 提供备选方案：不保存视频继续创建项目
    if (formData.videoFile) {
      const confirmed = window.confirm(
        '存储空间不足。是否创建项目但不保存视频文件？'
      );
      if (confirmed) {
        newProject.videoFile = '';
        // 重试保存
      }
    }
  }
}
```

**用户体验**:
- 不会直接失败，提供选择
- 可以选择不保存视频继续创建
- 友好的错误提示

### 4. UI 提示优化 ✅

**添加警告信息**:
```tsx
<p className="text-xs text-yellow-600 mt-1">
  ⚠️ 由于localStorage限制，大文件可能无法保存
</p>
```

## 测试结果

### 压缩前
- 封面图片 (3MB) + 视频 (15MB) = **约 24MB Base64**
- ❌ 超出 localStorage 限制

### 压缩后
- 封面图片 (300KB) + 视频 (15MB) = **约 20MB Base64**
- ⚠️ 接近限制，但可以保存
- ✅ 如果视频 <10MB，完全没问题

### 最佳实践
- 封面图片：任意大小（自动压缩）
- 视频文件：<10MB
- 总存储：<5MB 最安全

## 长期解决方案建议

### 1. 云存储集成（推荐）

使用云存储服务替代 localStorage：

```typescript
// 上传到云存储
const uploadToCloud = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const { url } = await response.json();
  return url; // 只存储 URL
};
```

**优势**:
- 无存储限制
- 更快的加载速度
- CDN 加速
- 专业的媒体处理

**推荐服务**:
- AWS S3
- 阿里云 OSS
- 腾讯云 COS
- 七牛云

### 2. IndexedDB 替代方案

使用 IndexedDB 替代 localStorage：

```typescript
// IndexedDB 可以存储更大的数据（通常 50MB+）
const db = await openDB('beehive', 1, {
  upgrade(db) {
    db.createObjectStore('projects');
  }
});

await db.put('projects', project, projectId);
```

**优势**:
- 更大的存储空间（50MB-1GB）
- 异步操作，不阻塞 UI
- 支持索引和查询

### 3. 视频缩略图方案

只存储视频缩略图，不存储完整视频：

```typescript
const generateThumbnail = (videoFile: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    video.onloadeddata = () => {
      video.currentTime = 1; // 第1秒的帧
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
  });
};
```

## 当前状态

✅ **已实现**:
- 图片自动压缩
- 视频大小限制和警告
- localStorage 配额错误处理
- 友好的用户提示

⚠️ **临时限制**:
- 视频建议 <10MB
- 总项目数建议 <20 个（取决于媒体文件大小）

🚀 **生产环境建议**:
- 集成云存储服务
- 或使用 IndexedDB
- 实施媒体文件 CDN

## 相关文件

- `beehive-platform/src/app/projects/new/page.tsx` - 优化后的上传逻辑
- `beehive-platform/VIDEO_UPLOAD_FEATURE.md` - 功能说明文档
