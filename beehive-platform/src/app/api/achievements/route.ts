import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from '@/app/api/_helpers';

// ============================================================
// 成就 API
// GET: 获取成就列表（公开，支持 project_id 和 contributor_name 筛选）
// POST: 创建成就记录（需认证）
// ============================================================

/**
 * GET /api/achievements
 * 获取成就列表（公开接口，无需认证）
 * 可选查询参数：
 *   - project_id: 按项目筛选
 *   - contributor_name: 按贡献者名称筛选
 * 按 completed_at 倒序排列
 */
export async function GET(request: NextRequest) {
  // 公开接口，使用匿名客户端即可
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isMissingResourceError = (error: { message?: string } | null) => {
    const message = error?.message ?? '';
    return (
      message.includes('does not exist') ||
      message.includes('relation') ||
      message.includes('column')
    );
  };

  // 构建查询
  let query = supabase.from('achievements').select('*');

  // 可选：按项目筛选
  const projectId = searchParams.get('project_id');
  if (projectId) {
    if (!uuidRegex.test(projectId)) {
      return successResponse([]);
    }
    query = query.eq('project_id', projectId);
  }

  // 可选：按贡献者名称筛选
  const contributorName = searchParams.get('contributor_name');
  if (contributorName) {
    query = query.eq('contributor_name', contributorName);
  }

  // 按完成时间倒序
  query = query.order('completed_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    if (isMissingResourceError(error)) {
      return successResponse([]);
    }
    return errorResponse('获取成就列表失败', 500);
  }

  return successResponse(data);
}

/**
 * POST /api/achievements
 * 创建成就记录（需认证）
 * 必填字段：task_id, project_id
 * 可选字段：task_name, contributor_name, project_name, completed_at
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
  const missing = validateRequiredFields(body, ['task_id', 'project_id']);
  if (missing) {
    return errorResponse(`缺少必填字段：${missing.join(', ')}`, 400);
  }

  // 插入成就记录
  const { data, error } = await supabase
    .from('achievements')
    .insert({
      task_id: body.task_id,
      task_name: body.task_name || null,
      contributor_name: body.contributor_name || null,
      project_id: body.project_id,
      project_name: body.project_name || null,
      completed_at: body.completed_at || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return errorResponse('创建成就记录失败', 500);
  }

  return successResponse(data, 201);
}
