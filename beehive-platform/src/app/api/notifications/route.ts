import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from '@/app/api/_helpers';

// ============================================================
// 通知 API
// GET: 获取当前用户通知列表
// POST: 创建通知
// PUT: 标记通知为已读
// ============================================================

/**
 * GET /api/notifications
 * 获取当前用户的通知列表（需认证）
 * 可选查询参数：
 *   - unread_only=true: 只返回未读通知
 * 按 created_at 倒序排列
 */
export async function GET(request: NextRequest) {
  // 认证检查
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;
  const { searchParams } = new URL(request.url);

  // 构建查询：只查询当前用户的通知
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId);

  // 可选：只返回未读通知
  const unreadOnly = searchParams.get('unread_only');
  if (unreadOnly === 'true') {
    query = query.eq('is_read', false);
  }

  // 按创建时间倒序
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return errorResponse('获取通知列表失败', 500);
  }

  return successResponse(data);
}

/**
 * POST /api/notifications
 * 创建通知（需认证）
 * 必填字段：user_id, type, message
 * 可选字段：task_id, project_id
 */
export async function POST(request: NextRequest) {
  // 认证检查
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase } = auth;

  // 解析请求体
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('请求体格式错误', 400);
  }

  // 验证必填字段
  const missing = validateRequiredFields(body, ['user_id', 'type', 'message']);
  if (missing) {
    return errorResponse(`缺少必填字段：${missing.join(', ')}`, 400);
  }

  // 插入通知记录
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: body.user_id,
      type: body.type,
      message: body.message,
      task_id: body.task_id || null,
      project_id: body.project_id || null,
    })
    .select()
    .single();

  if (error) {
    return errorResponse('创建通知失败', 500);
  }

  return successResponse(data, 201);
}

/**
 * PUT /api/notifications
 * 标记通知为已读（需认证）
 * 请求体：
 *   - { notification_id: string } 标记单条通知为已读
 *   - { mark_all: true } 标记当前用户所有通知为已读
 */
export async function PUT(request: NextRequest) {
  // 认证检查
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;

  // 解析请求体
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('请求体格式错误', 400);
  }

  // 标记所有通知为已读
  if (body.mark_all === true) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) {
      return errorResponse('标记所有通知为已读失败', 500);
    }

    return successResponse(data);
  }

  // 标记单条通知为已读
  if (!body.notification_id) {
    return errorResponse('缺少必填字段：notification_id 或 mark_all', 400);
  }

  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', body.notification_id as string)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return errorResponse('标记通知为已读失败', 500);
  }

  return successResponse(data);
}
