import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from '@/app/api/_helpers';

// ============================================================
// 单个项目 API
// GET: 获取项目详情（公开，同时返回 tasks 和 logs）
// PUT: 更新项目（需认证，RLS 限制创建者）
// DELETE: 删除项目（需认证，RLS 限制创建者）
// ============================================================

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]
 * 获取单个项目详情，同时返回关联的 tasks 和 logs
 * 不需要认证（公开数据）
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = await createServerSupabaseClient();

  // 查询项目基本信息
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (projectError || !project) {
    return errorResponse('项目不存在', 404);
  }

  // 并行查询关联的 tasks 和 logs
  const [tasksResult, logsResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('project_id', id)
      .order('order_index', { ascending: true }),
    supabase
      .from('project_logs')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
  ]);

  return successResponse({
    ...project,
    tasks: tasksResult.data ?? [],
    logs: logsResult.data ?? [],
  });
}


/**
 * PUT /api/projects/[id]
 * 更新项目（需认证，RLS 会限制只有创建者可更新）
 * 必填字段：title、description、category
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

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
  const missing = validateRequiredFields(body, ['title', 'description', 'category']);
  if (missing) {
    return errorResponse(`缺少必填字段：${missing.join(', ')}`, 400);
  }

  // 构建更新数据（只允许更新特定字段）
  const updateData: Record<string, unknown> = {
    title: body.title,
    description: body.description,
    category: body.category,
  };

  // 可选字段
  if (body.target_duration !== undefined) updateData.target_duration = body.target_duration;
  if (body.current_duration !== undefined) updateData.current_duration = body.current_duration;
  if (body.telegram_group !== undefined) updateData.telegram_group = body.telegram_group;
  if (body.cover_image !== undefined) updateData.cover_image = body.cover_image;
  if (body.video_file !== undefined) updateData.video_file = body.video_file;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.participants_count !== undefined) updateData.participants_count = body.participants_count;

  // 执行更新（RLS 会自动限制只有创建者可更新）
  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return errorResponse('更新项目失败', 500);
  }

  if (!data) {
    return errorResponse('项目不存在或无权限更新', 404);
  }

  return successResponse(data);
}

/**
 * DELETE /api/projects/[id]
 * 删除项目（需认证，RLS 会限制只有创建者可删除）
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  // 认证检查
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase } = auth;

  // 执行删除（RLS 会自动限制只有创建者可删除）
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    return errorResponse('删除项目失败', 500);
  }

  return successResponse({ deleted: true });
}
