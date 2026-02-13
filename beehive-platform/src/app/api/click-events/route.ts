import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from '@/app/api/_helpers';

// ============================================================
// 点击事件 API
// POST: 记录点击事件（需认证，5分钟去重）
// GET: 查询项目点击统计（公开，支持单个/批量查询）
// ============================================================

/**
 * POST /api/click-events
 * 记录点击事件（需认证）
 * 必填字段：project_id
 * user_id 自动取当前认证用户
 * 5分钟内同一用户对同一项目的重复点击会被去重（静默成功）
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

  // 5分钟去重：查询最近5分钟内是否有该用户对该项目的点击记录
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: recentClick, error: checkError } = await supabase
    .from('click_events')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .gte('timestamp', fiveMinutesAgo)
    .limit(1)
    .maybeSingle();

  if (checkError) {
    return errorResponse('检查重复点击失败', 500);
  }

  // 重复点击，静默成功（不记录新事件）
  if (recentClick) {
    return successResponse({ deduplicated: true });
  }

  // 插入新的点击事件
  const { data, error } = await supabase
    .from('click_events')
    .insert({
      project_id: projectId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    return errorResponse('记录点击事件失败', 500);
  }

  return successResponse(data, 201);
}

/**
 * GET /api/click-events
 * 查询项目点击统计（公开接口，无需认证）
 * 查询参数：
 *   - project_id: 单个项目的点击数，返回 { count: number }
 *   - project_ids: 逗号分隔的多个项目ID，批量查询，返回 { [project_id]: count }
 *   - hours: 时间窗口（小时），默认24小时
 */
export async function GET(request: NextRequest) {
  // 公开接口，使用匿名客户端
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const projectId = searchParams.get('project_id');
  const projectIdsParam = searchParams.get('project_ids');
  const hoursParam = searchParams.get('hours');

  // 解析时间窗口，默认24小时
  const hours = hoursParam ? parseInt(hoursParam, 10) : 24;
  if (isNaN(hours) || hours <= 0) {
    return errorResponse('hours 参数必须为正整数', 400);
  }

  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  // 单个项目查询
  if (projectId) {
    const { count, error } = await supabase
      .from('click_events')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .gte('timestamp', cutoff);

    if (error) {
      return errorResponse('查询点击统计失败', 500);
    }

    return successResponse({ count: count ?? 0 });
  }

  // 批量项目查询
  if (projectIdsParam) {
    const projectIds = projectIdsParam.split(',').map(id => id.trim()).filter(Boolean);

    if (projectIds.length === 0) {
      return errorResponse('project_ids 参数不能为空', 400);
    }

    // 查询所有相关点击事件的 project_id
    const { data, error } = await supabase
      .from('click_events')
      .select('project_id')
      .in('project_id', projectIds)
      .gte('timestamp', cutoff);

    if (error) {
      return errorResponse('查询批量点击统计失败', 500);
    }

    // 统计每个项目的点击数，未查到的项目默认为0
    const counts: Record<string, number> = {};
    for (const id of projectIds) {
      counts[id] = 0;
    }
    for (const row of data) {
      counts[row.project_id] = (counts[row.project_id] || 0) + 1;
    }

    return successResponse(counts);
  }

  // 未提供任何项目ID参数
  return errorResponse('请提供 project_id 或 project_ids 参数', 400);
}
