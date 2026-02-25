import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
} from '@/app/api/_helpers';

// ============================================================
// 内容审核管理 API
// GET: 获取待审核内容列表（需管理员权限）
// POST: 审核内容（需管理员权限）
// ============================================================

/**
 * 检查用户是否为管理员
 */
async function checkAdminPermission(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  return data?.role === 'admin' || data?.role === 'super_admin';
}

/**
 * GET /api/admin/review
 * 获取待审核内容列表
 * Query params:
 *   - type: 'projects' | 'tasks' (默认 'projects')
 *   - status: 'pending' | 'approved' | 'rejected' (默认 'pending')
 */
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;

  // 检查管理员权限
  const isAdmin = await checkAdminPermission(supabase, userId);
  if (!isAdmin) {
    return errorResponse('没有管理员权限', 403);
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'projects';
  const status = searchParams.get('status') || 'pending';

  if (type === 'projects') {
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, description, category, cover_image, creator_id, creator_name, created_at, review_status')
      .eq('review_status', status)
      .order('created_at', { ascending: false });

    if (error) {
      return errorResponse('获取项目列表失败', 500);
    }
    return successResponse({ type: 'projects', items: data });
  }

  if (type === 'tasks') {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        id, prompt, reference_images, requirements, created_at, review_status,
        projects:project_id (id, title)
      `)
      .eq('review_status', status)
      .order('created_at', { ascending: false });

    if (error) {
      return errorResponse('获取任务列表失败', 500);
    }
    return successResponse({ type: 'tasks', items: data });
  }

  return errorResponse('无效的类型参数', 400);
}

/**
 * POST /api/admin/review
 * 审核内容
 * Body:
 *   - type: 'project' | 'task'
 *   - id: string (项目或任务ID)
 *   - status: 'approved' | 'rejected'
 *   或
 *   - type: 'projects' | 'tasks' (批量审核)
 *   - ids: string[] (ID数组)
 *   - status: 'approved' | 'rejected'
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;

  // 检查管理员权限
  const isAdmin = await checkAdminPermission(supabase, userId);
  if (!isAdmin) {
    return errorResponse('没有管理员权限', 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('请求体格式错误', 400);
  }

  const { type, id, ids, status } = body as {
    type: string;
    id?: string;
    ids?: string[];
    status: string;
  };

  if (!['approved', 'rejected'].includes(status)) {
    return errorResponse('无效的审核状态', 400);
  }

  // 单个审核
  if (id) {
    if (type === 'project') {
      const { data, error } = await supabase.rpc('review_project', {
        p_project_id: id,
        p_status: status,
        p_admin_id: userId,
      });

      if (error || !data) {
        return errorResponse('审核失败', 500);
      }
      return successResponse({ success: true, type: 'project', id, status });
    }

    if (type === 'task') {
      const { data, error } = await supabase.rpc('review_task', {
        p_task_id: id,
        p_status: status,
        p_admin_id: userId,
      });

      if (error || !data) {
        return errorResponse('审核失败', 500);
      }
      return successResponse({ success: true, type: 'task', id, status });
    }
  }

  // 批量审核
  if (ids && Array.isArray(ids) && ids.length > 0) {
    if (type === 'projects') {
      const { data, error } = await supabase.rpc('batch_review_projects', {
        p_project_ids: ids,
        p_status: status,
        p_admin_id: userId,
      });

      if (error) {
        return errorResponse('批量审核失败', 500);
      }
      return successResponse({ success: true, type: 'projects', count: data, status });
    }

    if (type === 'tasks') {
      const { data, error } = await supabase.rpc('batch_review_tasks', {
        p_task_ids: ids,
        p_status: status,
        p_admin_id: userId,
      });

      if (error) {
        return errorResponse('批量审核失败', 500);
      }
      return successResponse({ success: true, type: 'tasks', count: data, status });
    }
  }

  return errorResponse('无效的请求参数', 400);
}
