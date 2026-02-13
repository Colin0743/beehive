import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from '@/app/api/_helpers';

// ============================================================
// 项目关注 API
// POST: 关注项目（需认证）
// DELETE: 取消关注（需认证）
// GET: 查询关注状态（需认证）
// ============================================================

/**
 * POST /api/project-follows
 * 关注项目（需认证）
 * 必填字段：project_id
 * user_id 自动设为当前用户
 * 唯一约束冲突时返回"已经关注过该项目"
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
  const missing = validateRequiredFields(body, ['project_id']);
  if (missing) {
    return errorResponse(`缺少必填字段：${missing.join(', ')}`, 400);
  }

  // 插入关注记录
  const { data, error } = await supabase
    .from('project_follows')
    .insert({ user_id: userId, project_id: body.project_id })
    .select()
    .single();

  if (error) {
    // 唯一约束冲突（PostgreSQL 错误码 23505）
    if (error.code === '23505') {
      return errorResponse('已经关注过该项目', 409);
    }
    return errorResponse('关注项目失败', 500);
  }

  return successResponse(data, 201);
}

/**
 * DELETE /api/project-follows?project_id=xxx
 * 取消关注项目（需认证）
 * 查询参数：project_id
 */
export async function DELETE(request: NextRequest) {
  // 认证检查
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');

  if (!projectId) {
    return errorResponse('缺少必填参数：project_id', 400);
  }

  // 删除关注记录
  const { error } = await supabase
    .from('project_follows')
    .delete()
    .eq('user_id', userId)
    .eq('project_id', projectId);

  if (error) {
    return errorResponse('取消关注失败', 500);
  }

  return successResponse({ message: '已取消关注' });
}

/**
 * GET /api/project-follows?project_id=xxx
 * 查询关注状态（需认证）
 * - 传 project_id：返回 { isFollowing: boolean }
 * - 不传：返回当前用户所有关注的 project_id 列表
 */
export async function GET(request: NextRequest) {
  // 认证检查
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');

  // 查询特定项目的关注状态
  if (projectId) {
    const { data, error } = await supabase
      .from('project_follows')
      .select('user_id')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) {
      return errorResponse('查询关注状态失败', 500);
    }

    return successResponse({ isFollowing: !!data });
  }

  // 返回当前用户所有关注的 project_id 列表
  const { data, error } = await supabase
    .from('project_follows')
    .select('project_id')
    .eq('user_id', userId)
    .order('followed_at', { ascending: false });

  if (error) {
    return errorResponse('查询关注列表失败', 500);
  }

  const projectIds = data.map((row: { project_id: string }) => row.project_id);
  return successResponse(projectIds);
}
