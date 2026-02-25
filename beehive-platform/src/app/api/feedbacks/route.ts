import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from '@/app/api/_helpers';

// ============================================================
// 反馈 API
// GET: 获取反馈列表（管理员获取全部，普通用户获取自己的）
// POST: 提交反馈
// PUT: 管理员处理反馈（标记已处理 + 自动发通知）
// ============================================================

/**
 * GET /api/feedbacks
 * 获取反馈列表（需认证）
 * 管理员：获取所有反馈（可选 ?status=pending 筛选）
 * 普通用户：获取自己的反馈
 */
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;
  const { searchParams } = new URL(request.url);

  // 检查用户角色
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  let query = supabase
    .from('feedbacks')
    .select('*, profiles(name, email, avatar)');

  // 非管理员只能看自己的反馈
  if (!isAdmin) {
    query = query.eq('user_id', userId);
  }

  // 可选：按状态筛选
  const status = searchParams.get('status');
  if (status === 'pending' || status === 'resolved') {
    query = query.eq('status', status);
  }

  // 按创建时间倒序
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return errorResponse('获取反馈列表失败', 500);
  }

  // 将关联的 profiles 数据展平到反馈记录中
  const feedbacks = (data ?? []).map((row: Record<string, unknown>) => {
    const profileData = row.profiles as Record<string, unknown> | null;
    return {
      ...row,
      profiles: undefined,
      user_name: profileData?.name ?? '',
      user_email: profileData?.email ?? '',
      user_avatar: profileData?.avatar ?? '',
    };
  });

  return successResponse(feedbacks);
}

/**
 * POST /api/feedbacks
 * 提交反馈（需认证）
 * 必填字段：category, description
 * 可选字段：images (string[])
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('请求体格式错误', 400);
  }

  const missing = validateRequiredFields(body, ['category', 'description']);
  if (missing) {
    return errorResponse(`缺少必填字段：${missing.join(', ')}`, 400);
  }

  // 验证图片数量
  const images = Array.isArray(body.images) ? body.images : [];
  if (images.length > 3) {
    return errorResponse('最多只能上传3张图片', 400);
  }

  const { data, error } = await supabase
    .from('feedbacks')
    .insert({
      user_id: userId,
      category: body.category,
      description: body.description,
      images: images,
    })
    .select()
    .single();

  if (error) {
    return errorResponse('提交反馈失败', 500);
  }

  return successResponse(data, 201);
}

/**
 * PUT /api/feedbacks
 * 管理员处理反馈（需认证，仅管理员）
 * 必填字段：feedback_id
 * 可选字段：admin_reply
 * 处理后自动给用户发送通知
 */
export async function PUT(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;

  // 检查管理员权限
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return errorResponse('无权限执行此操作', 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('请求体格式错误', 400);
  }

  if (!body.feedback_id) {
    return errorResponse('缺少必填字段：feedback_id', 400);
  }

  // 获取反馈详情（需要 user_id 来发通知）
  const { data: feedback } = await supabase
    .from('feedbacks')
    .select('user_id, category')
    .eq('id', body.feedback_id as string)
    .single();

  if (!feedback) {
    return errorResponse('反馈不存在', 404);
  }

  // 更新反馈状态
  const { data, error } = await supabase
    .from('feedbacks')
    .update({
      status: 'resolved',
      admin_reply: (body.admin_reply as string) || '感谢您的反馈，我们已收到并处理。',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', body.feedback_id as string)
    .select()
    .single();

  if (error) {
    return errorResponse('处理反馈失败', 500);
  }

  // 自动给用户发送通知
  await supabase
    .from('notifications')
    .insert({
      user_id: feedback.user_id,
      type: 'feedback_replied',
      message: `您提交的反馈「${feedback.category}」已收到处理，感谢您的反馈！`,
    });

  return successResponse(data);
}
