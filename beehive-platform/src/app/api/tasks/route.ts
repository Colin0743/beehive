import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cachedSuccessResponse, errorResponse } from '@/app/api/_helpers';

// ============================================================
// 任务大厅 API
// GET: 获取所有已发布任务（聚合所有项目，公开访问）
// ============================================================

/**
 * GET /api/tasks
 * 获取所有 status 为 'published' 的任务，同时返回关联的项目信息
 * 不需要认证（公开数据）
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();

  // 查询已发布任务，join projects 表获取项目名称和分类
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      projects:project_id (
        id,
        title,
        category
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    return errorResponse('获取任务列表失败', 500);
  }

  return cachedSuccessResponse(data);
}
