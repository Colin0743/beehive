import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
} from '@/app/api/_helpers';

// ============================================================
// 文件上传 API
// POST: 接收 FormData，上传文件到 Supabase Storage，返回公开 URL
// ============================================================

// Next.js App Router route segment config，支持大文件上传
export const runtime = 'nodejs';

// ==================== 常量定义 ====================

/** 允许的文件 MIME 类型白名单 */
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime',
]);

/** 图片类型集合 */
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif']);

/** 图片大小限制：5MB */
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024;

/** 视频大小限制：50MB */
const VIDEO_SIZE_LIMIT = 50 * 1024 * 1024;

/** MIME 类型到文件扩展名的映射 */
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};

// ==================== 工具函数 ====================

/**
 * 生成随机 ID（5 位字母数字）
 */
function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 7);
}

/**
 * 生成唯一的文件存储路径
 * 格式: {userId}/{timestamp}_{randomId}.{ext}
 * @param userId 用户 ID
 * @param mimeType 文件 MIME 类型
 * @returns 唯一的文件路径
 */
function generateFilePath(userId: string, mimeType: string): string {
  const timestamp = Date.now();
  const randomId = generateRandomId();
  const ext = MIME_TO_EXT[mimeType] || 'bin';
  return `${userId}/${timestamp}_${randomId}.${ext}`;
}

// ==================== POST Handler ====================

/**
 * POST /api/upload
 * 接收 FormData（包含 file 字段），上传到 Supabase Storage media bucket
 * 返回 { success: true, data: { url: string } }
 */
export async function POST(request: NextRequest) {
  // 1. 用户认证检查
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;

  // 2. 解析 FormData
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse('请求格式错误，需要 FormData', 400);
  }

  // 3. 获取文件
  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return errorResponse('缺少 file 字段', 400);
  }

  // 4. 验证文件类型
  if (!ALLOWED_TYPES.has(file.type)) {
    return errorResponse(
      '不支持的文件格式，仅支持 JPEG、PNG、GIF 图片和 MP4、MOV 视频',
      400
    );
  }

  // 5. 验证文件大小
  const isImage = IMAGE_TYPES.has(file.type);
  const sizeLimit = isImage ? IMAGE_SIZE_LIMIT : VIDEO_SIZE_LIMIT;
  const sizeLimitLabel = isImage ? '5MB' : '50MB';

  if (file.size > sizeLimit) {
    return errorResponse(`文件大小超过限制，最大允许 ${sizeLimitLabel}`, 400);
  }

  // 6. 生成唯一文件路径
  const filePath = generateFilePath(userId, file.type);

  // 7. 将 File 转为 Buffer 并上传到 Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, buffer, {
      contentType: file.type,
    });

  if (uploadError) {
    console.error('Supabase Storage 上传失败:', uploadError);
    return errorResponse('上传失败，请重试', 500);
  }

  // 8. 获取公开 URL
  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);

  return successResponse({ url: urlData.publicUrl });
}
