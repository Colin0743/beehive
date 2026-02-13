import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from '@/app/api/_helpers';

// ============================================================
// 项目参与 API
// POST: 参与项目（需认证）
// GET: 查询参与状态（需认证）
// ============================================================

/**
 * POST /api/project-participations
 * 参与项目（需认证）
 * 必填字段：project_id
 * user_id 自动设为当前用户，role 默认 'worker_bee'
 * 唯一约束冲突时返回"已经参与过该项目"
 * 成功后更新 projects 表的 participants_count +1
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

  const projectId = body.project_id as string;

  // 插入参与记录
  const { data, error } = await supabase
    .from('project_participations')
    .insert({ user_id: userId, project_id: projectId })
    .select()
    .single();

  if (error) {
    // 唯一约束冲突（PostgreSQL 错误码 23505）
    if (error.code === '23505') {
      return errorResponse('已经参与过该项目', 409);
    }
    return errorResponse('参与项目失败', 500);
  }

  // 更新 projects 表的 participants_count +1
  // 使用 rpc 调用或直接查询当前值后更新
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('participants_count')
    .eq('id', projectId)
    .single();

  if (!fetchError && project) {
    const currentCount = project.participants_count ?? 0;
    await supabase
      .from('projects')
      .update({ participants_count: currentCount + 1 })
      .eq('id', projectId);
  }

  return successResponse(data, 201);
}

/**
 * GET /api/project-participations?project_id=xxx
 * 查询参与状态（需认证）
 * - 传 project_id：返回 { isParticipating: boolean }
 * - 不传：返回当前用户所有参与的 project_id 列表
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

  // 查询特定项目的参与状态
  if (projectId) {
    const { data, error } = await supabase
      .from('project_participations')
      .select('user_id')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) {
      return errorResponse('查询参与状态失败', 500);
    }

    return successResponse({ isParticipating: !!data });
  }

  // 返回当前用户所有参与的 project_id 列表
  const { data, error } = await supabase
    .from('project_participations')
    .select('project_id')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) {
    return errorResponse('查询参与列表失败', 500);
  }

  const projectIds = data.map((row: { project_id: string }) => row.project_id);
  return successResponse(projectIds);
}
