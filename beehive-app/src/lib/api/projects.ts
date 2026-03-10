import { supabase } from '../supabase';
import { Project, mapDbProject, mapProjectToDb, mapDbProjectLog, ProjectLog } from '../../types';

/** 获取所有项目（公开，按创建时间倒序） */
export async function getProjects(category?: string): Promise<Project[]> {
    let query = supabase
        .from('projects')
        .select('*, project_logs(id, type, content, creator_name, created_at)')
        .order('created_at', { ascending: false });

    if (category && category !== '全部' && category !== 'all') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
        console.error('[projects.getProjects]', error);
        return [];
    }
    return (data ?? []).map(mapDbProject);
}

/** 根据 ID 获取项目详情（含日志和任务） */
export async function getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
        .from('projects')
        .select(`
      *,
      project_logs(id, type, content, creator_name, created_at),
      tasks(id, prompt, reference_images, requirements, creator_email, status, contributor_name, duration, order_index, created_at, updated_at)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('[projects.getProjectById]', error);
        return null;
    }
    return data ? mapDbProject(data) : null;
}

/** 获取用户创建的项目 */
export async function getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[projects.getUserProjects]', error);
        return [];
    }
    return (data ?? []).map(mapDbProject);
}

/** 创建项目 */
export async function createProject(
    project: Partial<Project> & { title: string; description: string; category: string },
    userId: string,
    userName: string
): Promise<Project | null> {
    const dbData = {
        ...mapProjectToDb(project),
        creator_id: userId,
        creator_name: userName,
    };

    const { data, error } = await supabase
        .from('projects')
        .insert(dbData)
        .select()
        .single();

    if (error) {
        console.error('[projects.createProject]', error);
        throw error;
    }
    return data ? mapDbProject(data) : null;
}

/** 更新项目 */
export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const dbData = mapProjectToDb(updates);
    const { data, error } = await supabase
        .from('projects')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[projects.updateProject]', error);
        throw error;
    }
    return data ? mapDbProject(data) : null;
}

/** 添加项目日志 */
export async function addProjectLog(
    projectId: string,
    log: { type: ProjectLog['type']; content: string },
    creatorName: string
): Promise<ProjectLog | null> {
    const { data, error } = await supabase
        .from('project_logs')
        .insert({
            project_id: projectId,
            type: log.type,
            content: log.content,
            creator_name: creatorName,
        })
        .select()
        .single();

    if (error) {
        console.error('[projects.addProjectLog]', error);
        throw error;
    }
    return data ? mapDbProjectLog(data) : null;
}
