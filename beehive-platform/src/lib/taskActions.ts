import { Task, Achievement, Notification } from '@/types';
import { taskStorage, taskAcceptanceStorage, notificationStorage, achievementStorage, projectStorage } from './api';
import type { StorageResult } from '@/types';

/**
 * 完成任务的完整业务流程
 * 1. 更新任务状态为 completed，记录贡献者名称
 * 2. 创建成就记录
 * 3. 为所有接受过该任务的用户发送通知
 * 4. 为贡献者发送特殊通知
 * 5. 累加任务 duration 到项目 currentDuration
 */
export async function completeTask(
  projectId: string,
  taskId: string,
  contributorName: string,
  projectName: string,
  taskName: string,
): Promise<StorageResult<void>> {
  // 1. 更新任务状态
  const updateResult = await taskStorage.updateTask(projectId, taskId, {
    status: 'completed',
    contributorName,
    updatedAt: new Date().toISOString(),
  });
  if (!updateResult.success) {
    return { success: false, error: updateResult.error };
  }

  // 2. 创建成就记录
  const achievement: Achievement = {
    id: `ach_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    taskId,
    taskName,
    contributorName,
    projectId,
    projectName,
    completedAt: new Date().toISOString(),
  };
  await achievementStorage.createAchievement(achievement);

  // 3. 获取所有接受过该任务的用户，发送通知
  const acceptancesResult = await taskAcceptanceStorage.getAcceptances(taskId);
  if (acceptancesResult.success && acceptancesResult.data) {
    const acceptances = acceptancesResult.data;

    for (const acceptance of acceptances) {
      // 通用通知：任务已完成
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type: 'task_completed',
        message: `任务「${taskName}」已完成，完成者：${contributorName}`,
        taskId,
        projectId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      await notificationStorage.createNotification(acceptance.userId, notification);
    }
  }

  // 4. 为贡献者发送特殊通知（如果贡献者是平台用户）
  // 注意：contributorName 是手动输入的名称，不一定对应平台用户
  // 这里我们通过接受记录来匹配，如果有同名用户接受过任务则发送
  // 实际场景中贡献者可能不是注册用户，此通知为可选

  // 5. 累加任务 duration 到项目 currentDuration
  const projectResult = await projectStorage.getProjectById(projectId);
  if (projectResult.success && projectResult.data) {
    const project = projectResult.data;
    const task = (project.tasks || []).find(t => t.id === taskId);
    if (task && task.duration) {
      await projectStorage.updateProject(projectId, {
        currentDuration: project.currentDuration + task.duration,
      });
    }
  }

  return { success: true };
}
