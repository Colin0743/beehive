// ==================== 用户相关 ====================

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role?: UserRole;
    isActive?: boolean;
    createdAt: string;
}

// ==================== 项目相关 ====================

export interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    targetDuration: number;
    currentDuration: number;
    telegramGroup: string;
    coverImage: string;
    videoFile?: string;
    creatorId: string;
    creatorName: string;
    participantsCount: number;
    status: 'active' | 'completed' | 'paused';
    createdAt: string;
    logs?: ProjectLog[];
    tasks?: Task[];
}

export interface ProjectLog {
    id: string;
    type: 'update' | 'milestone' | 'announcement';
    content: string;
    createdAt: string;
    creatorName: string;
}

// ==================== 任务相关 ====================

export type TaskStatus = 'draft' | 'published' | 'completed';

export interface Task {
    id: string;
    projectId: string;
    prompt: string;
    referenceImages: string[];
    requirements: string;
    creatorEmail: string;
    status: TaskStatus;
    contributorName?: string;
    duration: number;
    order: number;
    createdAt: string;
    updatedAt: string;
    // join 时可能带上的项目信息
    projectName?: string;
    projectCategory?: string;
    projectCoverImage?: string;
}

export interface TaskAcceptance {
    id: string;
    taskId: string;
    userId: string;
    acceptedAt: string;
}

// ==================== 通知相关 ====================

export interface Notification {
    id: string;
    type: 'task_completed' | 'contribution_accepted' | 'feedback_replied';
    message: string;
    taskId: string;
    projectId: string;
    isRead: boolean;
    createdAt: string;
}

// ==================== 余额相关 ====================

export interface UserBalance {
    userId: string;
    balanceCents: number;
    updatedAt: string;
}

export interface BalanceTransaction {
    id: string;
    userId: string;
    amountCents: number;
    type: 'recharge' | 'task_publish';
    relatedId?: string;
    createdAt: string;
}

// ==================== DB 行映射工具 ====================

/** 将 Supabase 返回的 snake_case project 行转为前端 Project */
export function mapDbProject(row: Record<string, any>): Project {
    return {
        id: row.id,
        title: row.title ?? '',
        description: row.description ?? '',
        category: row.category ?? '',
        targetDuration: row.target_duration ?? 0,
        currentDuration: row.current_duration ?? 0,
        telegramGroup: row.telegram_group ?? '',
        coverImage: row.cover_image ?? '',
        videoFile: row.video_file,
        creatorId: row.creator_id ?? '',
        creatorName: row.creator_name ?? '',
        participantsCount: row.participants_count ?? 0,
        status: row.status ?? 'active',
        createdAt: row.created_at ?? '',
        logs: Array.isArray(row.project_logs)
            ? row.project_logs.map(mapDbProjectLog)
            : undefined,
        tasks: Array.isArray(row.tasks)
            ? row.tasks.map(mapDbTask)
            : undefined,
    };
}

/** 将前端 Project 转为 Supabase 写入的 snake_case 对象 */
export function mapProjectToDb(data: Partial<Project>): Record<string, any> {
    const r: Record<string, any> = {};
    if (data.title !== undefined) r.title = data.title;
    if (data.description !== undefined) r.description = data.description;
    if (data.category !== undefined) r.category = data.category;
    if (data.targetDuration !== undefined) r.target_duration = data.targetDuration;
    if (data.currentDuration !== undefined) r.current_duration = data.currentDuration;
    if (data.telegramGroup !== undefined) r.telegram_group = data.telegramGroup;
    if (data.coverImage !== undefined) r.cover_image = data.coverImage;
    if (data.videoFile !== undefined) r.video_file = data.videoFile;
    if (data.status !== undefined) r.status = data.status;
    return r;
}

export function mapDbProjectLog(row: Record<string, any>): ProjectLog {
    return {
        id: row.id,
        type: row.type,
        content: row.content ?? '',
        createdAt: row.created_at ?? '',
        creatorName: row.creator_name ?? '',
    };
}

export function mapDbTask(row: Record<string, any>): Task {
    const project = row.projects as Record<string, any> | null;
    return {
        id: row.id,
        projectId: row.project_id ?? project?.id ?? '',
        prompt: row.prompt ?? '',
        referenceImages: row.reference_images ?? [],
        requirements: row.requirements ?? '',
        creatorEmail: row.creator_email ?? '',
        status: row.status ?? 'draft',
        contributorName: row.contributor_name,
        duration: row.duration ?? 0,
        order: row.order_index ?? 0,
        createdAt: row.created_at ?? '',
        updatedAt: row.updated_at ?? '',
        projectName: project?.title,
        projectCategory: project?.category,
        projectCoverImage: project?.cover_image,
    };
}

export function mapDbProfile(row: Record<string, any>): User {
    return {
        id: row.id,
        name: row.name ?? '',
        email: row.email ?? '',
        avatar: row.avatar ?? '',
        role: row.role ?? 'user',
        isActive: row.is_active ?? true,
        createdAt: row.created_at ?? '',
    };
}

export function mapDbNotification(row: Record<string, any>): Notification {
    return {
        id: row.id,
        type: row.type,
        message: row.message ?? '',
        taskId: row.task_id ?? '',
        projectId: row.project_id ?? '',
        isRead: row.is_read ?? false,
        createdAt: row.created_at ?? '',
    };
}
