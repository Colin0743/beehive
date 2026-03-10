import { supabase } from '../supabase';
import { Project, mapDbProject, Notification, mapDbNotification } from '../../types';

// ==================== 项目关注 ====================

/** 关注项目 */
export async function followProject(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('project_follows')
        .insert({ user_id: userId, project_id: projectId });
    if (error) throw error;
}

/** 取消关注项目 */
export async function unfollowProject(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('project_follows')
        .delete()
        .eq('user_id', userId)
        .eq('project_id', projectId);
    if (error) throw error;
}

/** 检查是否关注了项目 */
export async function isFollowing(projectId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('project_follows')
        .select('user_id')
        .eq('user_id', userId)
        .eq('project_id', projectId);
    if (error) return false;
    return (data ?? []).length > 0;
}

/** 获取用户关注的项目列表 */
export async function getFollowedProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
        .from('project_follows')
        .select('project_id, projects(*)')
        .eq('user_id', userId);

    if (error) {
        console.error('[relations.getFollowedProjects]', error);
        return [];
    }
    return (data ?? [])
        .map((row: any) => row.projects)
        .filter(Boolean)
        .map(mapDbProject);
}

// ==================== 项目参与 ====================

/** 参与项目（工蜂角色） */
export async function participateInProject(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('project_participations')
        .insert({ user_id: userId, project_id: projectId, role: 'worker_bee' });
    if (error) throw error;
}

/** 检查是否参与了项目 */
export async function isParticipating(projectId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('project_participations')
        .select('user_id')
        .eq('user_id', userId)
        .eq('project_id', projectId);
    if (error) return false;
    return (data ?? []).length > 0;
}

/** 获取用户参与的项目列表 */
export async function getParticipatedProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
        .from('project_participations')
        .select('project_id, projects(*)')
        .eq('user_id', userId);

    if (error) {
        console.error('[relations.getParticipatedProjects]', error);
        return [];
    }
    return (data ?? [])
        .map((row: any) => row.projects)
        .filter(Boolean)
        .map(mapDbProject);
}

// ==================== 通知 ====================

/** 获取用户通知列表 */
export async function getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[relations.getNotifications]', error);
        return [];
    }
    return (data ?? []).map(mapDbNotification);
}

/** 获取用户未读通知数量 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) return 0;
    return count ?? 0;
}

/** 标记通知为已读 */
export async function markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    if (error) throw error;
}

// ==================== 余额 ====================

/** 获取用户余额（分） */
export async function getUserBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
        .from('user_balances')
        .select('balance_cents')
        .eq('user_id', userId)
        .single();

    if (error) return 0;
    return data?.balance_cents ?? 0;
}
