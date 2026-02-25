import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server';
import {
  getAuthenticatedClient,
  successResponse,
  cachedSuccessResponse,
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
 * 公开列表只显示已审核通过的项目
 * 创建者可以看到自己的待审核项目
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // 尝试获取认证信息
  const auth = await getAuthenticatedClient();
  const supabase = auth ? auth.supabase : await createServerSupabaseClient();
  const currentUserId = auth?.userId;

  const baseSelect =
    'id, title, description, category, target_duration, current_duration, telegram_group, cover_image, creator_id, creator_name, participants_count, status, created_at';
  const extendedSelect = `${baseSelect}, review_status, is_expired, expires_at`;

  const isMissingColumnError = (error: { message?: string } | null, columns: string[]) => {
    const message = error?.message ?? '';
    return columns.some((column) =>
      message.includes(`column "${column}"`) ||
      message.includes(`column ${column}`) ||
      message.includes(`${column} does not exist`)
    );
  };

  // 可选筛选参数
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const creatorId = searchParams.get('creator_id');
  const includeAll = searchParams.get('include_all'); // 管理员查询所有
  const buildQuery = (useExtended: boolean) => {
    let query = supabase.from('projects').select(useExtended ? extendedSelect : baseSelect);
    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (creatorId) {
      query = query.eq('creator_id', creatorId);
    }
    if (useExtended) {
      if (!creatorId || creatorId !== currentUserId) {
        query = query.eq('is_expired', false);
      }
      if (includeAll !== 'true') {
        if (!creatorId || creatorId !== currentUserId) {
          query = query.eq('review_status', 'approved');
        }
      }
    }
    return query.order('created_at', { ascending: false });
  };

  let { data, error } = await buildQuery(true);
  if (error && isMissingColumnError(error, ['review_status', 'is_expired', 'expires_at'])) {
    const fallback = await buildQuery(false);
    if (fallback.error) {
      return errorResponse('获取项目列表失败', 500);
    }
    return cachedSuccessResponse(fallback.data);
  }

  if (error) {
    return errorResponse('获取项目列表失败', 500);
  }

  return cachedSuccessResponse(data);
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

  const { supabase, userId, user } = auth;
  const upsertProfile = async (client: SupabaseClient, name: string) => {
    return client
      .from('profiles')
      .upsert({ id: userId, name }, { onConflict: 'id' })
      .select('name')
      .maybeSingle();
  };

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
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .maybeSingle();

  const fallbackName =
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim() !== '' ? user.user_metadata.name : '') ||
    (typeof user.email === 'string' && user.email.includes('@') ? user.email.split('@')[0] : '') ||
    '用户';

  let creatorName = profile?.name ?? '';
  const ensureProfile = async () => {
    if (creatorName) return creatorName;
    const { data: upserted, error: upsertError } = await upsertProfile(supabase, fallbackName);
    if (!upsertError && upserted?.name) {
      creatorName = upserted.name;
      return creatorName;
    }
    try {
      const serviceClient = createServiceRoleClient();
      const { data: serviceUpserted, error: serviceError } = await upsertProfile(serviceClient, fallbackName);
      if (!serviceError && serviceUpserted?.name) {
        creatorName = serviceUpserted.name;
        return creatorName;
      }
    } catch {}
    creatorName = fallbackName;
    return creatorName;
  };

  if (profileError || !creatorName) {
    await ensureProfile();
  }

  const normalizeNumber = (value: unknown, fallback: number | null = null) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
  };

  const targetDuration = normalizeNumber(body.target_duration);
  const currentDuration = normalizeNumber(body.current_duration, 0);
  const participantsCount = normalizeNumber(body.participants_count, 0);

  // 构建插入数据
  const insertData = {
    title: body.title,
    description: body.description,
    category: body.category,
    target_duration: targetDuration,
    current_duration: currentDuration ?? 0,
    telegram_group: body.telegram_group ?? null,
    cover_image: body.cover_image ?? null,
    video_file: body.video_file ?? null,
    creator_id: userId,
    creator_name: creatorName,
    participants_count: participantsCount ?? 0,
    status: 'active',
    review_status: 'pending', // 新项目默认待审核
  };

  const isMissingColumnError = (error: { message?: string } | null, columns: string[]) => {
    const message = error?.message ?? '';
    return columns.some((column) =>
      message.includes(`column "${column}"`) ||
      message.includes(`column ${column}`) ||
      message.includes(`${column} does not exist`)
    );
  };

  const insertProject = async (withReviewStatus: boolean) => {
    const payload = withReviewStatus ? insertData : { ...insertData, review_status: undefined };
    if (!withReviewStatus) {
      delete (payload as Partial<typeof insertData>).review_status;
    }
    return supabase
      .from('projects')
      .insert(payload)
      .select()
      .single();
  };

  let supportsReviewStatus = true;
  let { data, error } = await insertProject(true);
  if (error && isMissingColumnError(error, ['review_status'])) {
    supportsReviewStatus = false;
    const fallback = await insertProject(false);
    data = fallback.data;
    error = fallback.error;
  }

  if (error && (error.code === '23503' || error.message?.includes('foreign key'))) {
    await ensureProfile();
    const retry = await insertProject(supportsReviewStatus);
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return errorResponse(error.message || '创建项目失败', 500);
  }

  if (!data) {
    return errorResponse('创建项目失败', 500);
  }

  return successResponse(data, 201);
}
