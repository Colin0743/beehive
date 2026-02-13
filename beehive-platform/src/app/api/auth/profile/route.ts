import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
} from '@/app/api/_helpers';

// ============================================================
// 用户 Profile API
// GET: 获取当前用户 profile
// PUT: 更新当前用户 profile（仅允许更新 name、avatar）
// ============================================================

/**
 * GET /api/auth/profile
 * 获取当前认证用户的 profile 数据
 */
export async function GET() {
  // 认证检查
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;

  // 查询当前用户的 profile
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return errorResponse('获取用户信息失败', 500);
  }

  return successResponse(data);
}

/**
 * PUT /api/auth/profile
 * 更新当前认证用户的 profile（仅允许更新 name 和 avatar）
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

  // 仅允许更新 name 和 avatar，过滤其他字段（安全考虑，不允许修改 role 等）
  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) {
    updateData.name = body.name;
  }
  if (body.avatar !== undefined) {
    updateData.avatar = body.avatar;
  }

  // 至少需要一个可更新字段
  if (Object.keys(updateData).length === 0) {
    return errorResponse('请提供需要更新的字段（name 或 avatar）', 400);
  }

  // 执行更新
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return errorResponse('更新用户信息失败', 500);
  }

  return successResponse(data);
}
