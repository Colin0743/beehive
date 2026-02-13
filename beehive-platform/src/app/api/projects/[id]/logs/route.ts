import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
} from '@/app/api/_helpers';

// ============================================================
// 项目日志 API
// GET: 获取项目日志列表（公开）
// POST: 创建项目日志（需认证）
// ============================================================

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/logs
 * 获取指定项目的日志列表
 * 不需要认证（公开数据）
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('project_logs')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return errorResponse('获取项目日志失败', 500);
  }

  return successResponse(data);
}

/**
 * POST /api/projects/[id]/logs
 * 创建项目日志（需认证）
 * 必填字段：type、content
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

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
  if (!body.type || !body.content) {
    return errorResponse('缺少必填字段：type, content', 400);
  }

  // 验证 type 值
  const validTypes = ['update', 'milestone', 'announcement'];
  if (!validTypes.includes(body.type as string)) {
    return errorResponse('type 必须为 update、milestone 或 announcement', 400);
  }

  // 获取创建者名称
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single();

  const insertData = {
    project_id: id,
    type: body.type,
    content: body.content,
    creator_name: profile?.name ?? '',
  };

  const { data, error } = await supabase
    .from('project_logs')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return errorResponse('创建项目日志失败', 500);
  }

  return successResponse(data, 201);
}
