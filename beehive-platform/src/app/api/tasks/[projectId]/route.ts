import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from '@/app/api/_helpers';

/**
 * 扣除发布任务费用（调用 DB 原子函数），余额不足返回 false
 */
async function deductPublishFee(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase-server').createServerSupabaseClient>>,
  userId: string,
  taskId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('deduct_task_publish_fee', {
    p_user_id: userId,
    p_task_id: taskId,
    p_fee_cents: TASK_PUBLISH_FEE_CENTS,
  });
  if (error) return false;
  return data === true;
}

// ============================================================
// 项目任务 API
// GET: 获取项目的所有任务
// POST: 创建任务（需认证，限制每项目最多 10 个）
// PUT: 更新任务（需认证）
// DELETE: 删除任务（需认证）
// ============================================================

/** 每个项目最多允许的任务数量 */
const MAX_TASKS_PER_PROJECT = 10;

/** 发布任务费用（分），默认 0.5 元，可通过环境变量 TASK_PUBLISH_FEE_CENTS 覆盖 */
const TASK_PUBLISH_FEE_CENTS = parseInt(
  process.env.TASK_PUBLISH_FEE_CENTS ?? '50',
  10
);

type RouteContext = { params: Promise<{ projectId: string }> };

/**
 * GET /api/tasks/[projectId]
 * 获取项目的所有任务
 * 认证用户可看所有状态，匿名用户只能看 published
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { projectId } = await context.params;

  // 尝试获取认证信息（非必须）
  const auth = await getAuthenticatedClient();

  const supabase = auth
    ? auth.supabase
    : await createServerSupabaseClient();

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  // 未认证用户只能看已发布任务
  if (!auth) {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse('获取任务列表失败', 500);
  }

  return successResponse(data);
}


/**
 * POST /api/tasks/[projectId]
 * 创建任务（需认证）
 * 必填字段：prompt
 * 校验同一项目下任务数量不超过 10 个
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { projectId } = await context.params;

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
  const missing = validateRequiredFields(body, ['prompt']);
  if (missing) {
    return errorResponse(`缺少必填字段：${missing.join(', ')}`, 400);
  }

  // 校验任务数量上限
  const { count, error: countError } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  if (countError) {
    return errorResponse('查询任务数量失败', 500);
  }

  if ((count ?? 0) >= MAX_TASKS_PER_PROJECT) {
    return errorResponse('每个项目最多只能创建 10 个任务', 400);
  }

  // 构建插入数据
  const insertData = {
    project_id: projectId,
    prompt: body.prompt,
    reference_images: body.reference_images ?? null,
    requirements: body.requirements ?? null,
    creator_email: body.creator_email ?? null,
    status: body.status ?? 'draft',
    contributor_name: body.contributor_name ?? null,
    duration: body.duration ?? null,
    order_index: body.order_index ?? (count ?? 0),
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return errorResponse('创建任务失败', 500);
  }

  const status = (body.status as string) ?? 'draft';
  if (status === 'published' && data) {
    const deducted = await deductPublishFee(supabase, auth.userId, data.id);
    if (!deducted) {
      await supabase.from('tasks').delete().eq('id', data.id).eq('project_id', projectId);
      return errorResponse(
        `余额不足，发布任务需支付 ${(TASK_PUBLISH_FEE_CENTS / 100).toFixed(2)} 元，请先充值`,
        402
      );
    }
  }

  return successResponse(data, 201);
}

/**
 * PUT /api/tasks/[projectId]
 * 更新任务（需认证，RLS 限制项目创建者）
 * 请求体需包含 task_id 指定要更新的任务
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { projectId } = await context.params;

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

  // task_id 必填
  if (!body.task_id) {
    return errorResponse('缺少必填字段：task_id', 400);
  }

  const taskId = body.task_id as string;

  // 构建更新数据（只允许更新特定字段）
  const updateData: Record<string, unknown> = {};

  if (body.prompt !== undefined) updateData.prompt = body.prompt;
  if (body.reference_images !== undefined) updateData.reference_images = body.reference_images;
  if (body.requirements !== undefined) updateData.requirements = body.requirements;
  if (body.creator_email !== undefined) updateData.creator_email = body.creator_email;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.contributor_name !== undefined) updateData.contributor_name = body.contributor_name;
  if (body.duration !== undefined) updateData.duration = body.duration;
  if (body.order_index !== undefined) updateData.order_index = body.order_index;

  // 自动更新 updated_at
  updateData.updated_at = new Date().toISOString();

  // 若状态从 draft 变为 published，需先扣款
  if (body.status === 'published') {
    const { data: current } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single();

    if (current?.status !== 'published') {
      const deducted = await deductPublishFee(supabase, auth.userId, taskId);
      if (!deducted) {
        return errorResponse(
          `余额不足，发布任务需支付 ${(TASK_PUBLISH_FEE_CENTS / 100).toFixed(2)} 元，请先充值`,
          402
        );
      }
    }
  }

  // 执行更新（RLS 会限制只有项目创建者可更新）
  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) {
    return errorResponse('更新任务失败', 500);
  }

  if (!data) {
    return errorResponse('任务不存在或无权限更新', 404);
  }

  return successResponse(data);
}

/**
 * DELETE /api/tasks/[projectId]
 * 删除任务（需认证，RLS 限制项目创建者）
 * 通过查询参数 task_id 指定要删除的任务
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { projectId } = await context.params;

  // 认证检查
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase } = auth;

  // 从查询参数获取 task_id
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('task_id');

  if (!taskId) {
    return errorResponse('缺少查询参数：task_id', 400);
  }

  // 执行删除（RLS 会限制只有项目创建者可删除）
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('project_id', projectId);

  if (error) {
    return errorResponse('删除任务失败', 500);
  }

  return successResponse({ deleted: true });
}
