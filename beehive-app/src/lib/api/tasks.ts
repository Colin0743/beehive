import { supabase } from '../supabase';
import { Task, mapDbTask } from '../../types';

/** 获取所有已发布任务（含项目信息，用于任务大厅） */
export async function getAllPublishedTasks(): Promise<Task[]> {
    const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(id, title, category, cover_image)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[tasks.getAllPublishedTasks]', error);
        return [];
    }
    return (data ?? []).map(mapDbTask);
}

/** 获取项目的所有任务 */
export async function getTasksByProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('[tasks.getTasksByProject]', error);
        return [];
    }
    return (data ?? []).map(mapDbTask);
}

/** 接受任务 */
export async function acceptTask(taskId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('task_acceptances')
        .insert({ task_id: taskId, user_id: userId });

    if (error) {
        console.error('[tasks.acceptTask]', error);
        throw error;
    }
}

/** 检查用户是否已接受某任务 */
export async function hasUserAcceptedTask(taskId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('task_acceptances')
        .select('id')
        .eq('task_id', taskId)
        .eq('user_id', userId);

    if (error) {
        console.error('[tasks.hasUserAcceptedTask]', error);
        return false;
    }
    return (data ?? []).length > 0;
}

/** 获取用户接受的所有任务 ID */
export async function getUserAcceptedTaskIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('task_acceptances')
        .select('task_id')
        .eq('user_id', userId);

    if (error) {
        console.error('[tasks.getUserAcceptedTaskIds]', error);
        return [];
    }
    return (data ?? []).map((row) => row.task_id);
}
