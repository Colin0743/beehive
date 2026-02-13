import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from '@/app/api/_helpers';

// ============================================================
// 项目列表 / 创建 API
// GET: 获取项目列表（公开，支持筛选）
// POST: 创建新项目（需认证）
// ============================================================

/**
 * GET /api/projects
 * 获取项目列表，支持可选查询参数筛选
 * 不需要认证（公开数据，RLS 允许匿名读取）
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  // 构建查询（列表接口排除 video_file 大字段以提升性能）
  let query = supabase.from('projects').select('id, title, description, category, target_duration, current_duration, telegram_group, cover_image, creator_id, creator_name, participants_count, status, created_at');

  // 可选筛选参数
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const creatorId = searchParams.get('creator_id');

  if (category) {
    query = query.eq('category', category);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (creatorId) {
    query = query.eq('creator_id', creatorId);
  }

  // 按创建时间倒序排列
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return errorResponse('获取项目列表失败', 500);
  }

  return successResponse(data);
}


/**
 * POST /api/projects
 * 创建新项目（需认证）
 * 必填字段：title、description、category
 * creator_id 自动设为当前用户 ID
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
  const missing = validateRequiredFields(body, ['title', 'description', 'category']);
  if (missing) {
    return errorResponse(`缺少必填字段：${missing.join(', ')}`, 400);
  }

  // 获取创建者名称
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single();

  // 构建插入数据
  const insertData = {
    title: body.title,
    description: body.description,
    category: body.category,
    target_duration: body.target_duration ?? null,
    telegram_group: body.telegram_group ?? null,
    cover_image: body.cover_image ?? null,
    video_file: body.video_file ?? null,
    creator_id: userId,
    creator_name: profile?.name ?? '',
    status: 'active',
  };

  const { data, error } = await supabase
    .from('projects')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return errorResponse('创建项目失败', 500);
  }

  return successResponse(data, 201);
}
