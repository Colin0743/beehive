import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from '@/app/api/_helpers';

// ============================================================
// 任务接受 API
// POST: 接受任务（需认证）
// GET: 查询任务接受记录（需认证）
// ============================================================

/**
 * POST /api/task-acceptances
 * 接受任务（需认证）
 * 必填字段：task_id
 * user_id 自动设为当前用户
 * 如果已接受过（唯一约束冲突），返回已有记录而非错误
 */
export async function POST(request: NextRequest) {
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

  // 验证必填字段
  const missing = validateRequiredFields(body, ['task_id']);
  if (missing) {
    return errorResponse(`缺少必填字段：${missing.join(', ')}`, 400);
  }

  // 插入接受记录
  const { data, error } = await supabase
    .from('task_acceptances')
    .insert({ task_id: body.task_id, user_id: userId })
    .select()
    .single();

  if (error) {
    // 唯一约束冲突（PostgreSQL 错误码 23505）：返回已有记录
    if (error.code === '23505') {
      const { data: existing, error: fetchError } = await supabase
        .from('task_acceptances')
        .select()
        .eq('task_id', body.task_id as string)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existing) {
        return errorResponse('查询已有接受记录失败', 500);
      }

      return successResponse(existing);
    }

    return errorResponse('接受任务失败', 500);
  }

  return successResponse(data, 201);
}

/**
 * GET /api/task-acceptances
 * 查询任务接受记录（需认证）
 * 可选查询参数：
 *   - task_id: 查询某任务的所有接受记录
 *   - user_id: 查询某用户的所有接受记录
 * 不传参数时默认返回当前用户的所有接受记录
 */
export async function GET(request: NextRequest) {
  // 认证检查
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;
  const { searchParams } = new URL(request.url);

  // 构建查询
  let query = supabase.from('task_acceptances').select('*');

  const taskId = searchParams.get('task_id');
  const queryUserId = searchParams.get('user_id');

  if (taskId) {
    query = query.eq('task_id', taskId);
  }

  if (queryUserId) {
    query = query.eq('user_id', queryUserId);
  }

  // 未指定任何筛选条件时，默认查询当前用户的记录
  if (!taskId && !queryUserId) {
    query = query.eq('user_id', userId);
  }

  query = query.order('accepted_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return errorResponse('查询接受记录失败', 500);
  }

  return successResponse(data);
}
