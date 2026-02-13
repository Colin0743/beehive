'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Project, ProjectLog, Task } from '@/types';
import { projectStorage, taskStorage, taskAcceptanceStorage, achievementStorage, balanceStorage } from '@/lib/api';
import { completeTask } from '@/lib/taskActions';
import { useToast } from '@/components/Toast';
import TaskForm from '@/components/TaskForm';
import TaskCard from '@/components/TaskCard';
import TaskDetailModal from '@/components/TaskDetailModal';
import AchievementList from '@/components/AchievementList';
import type { Achievement } from '@/types';
import InlineEditText from '@/components/InlineEditText';
import InlineEditRichText from '@/components/InlineEditRichText';
import InlineEditSelect from '@/components/InlineEditSelect';
import MediaCarousel from '@/components/MediaCarousel';
import ProgressSidebar from '@/components/ProgressSidebar';
import { isAdmin } from '@/lib/admin';
import { validateTitle } from '@/lib/validators';
import { clickTracker } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation('common');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState<'update' | 'milestone' | 'announcement'>('update');

  // 任务相关状态
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [taskFormMode, setTaskFormMode] = useState<'create' | 'edit'>('create');
  const [acceptedTaskIds, setAcceptedTaskIds] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string>('');
  const [contributorNameInput, setContributorNameInput] = useState('');
  
  // 任务详情弹窗状态
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [publishFeeYuan, setPublishFeeYuan] = useState<string>('1.00');
  const [submittingTask, setSubmittingTask] = useState(false);
  const [completingTask, setCompletingTask] = useState(false);

  const projectId = params.id as string;

  // 加载项目数据
  useEffect(() => {
    const loadProject = async () => {
      const result = await projectStorage.getProjectById(projectId);
      if (result.success && result.data) {
        setProject(result.data);
        setTasks(result.data.tasks || []);
      }
      setLoading(false);
    };
    loadProject();
  }, [projectId]);

  // 记录项目点击（用于排序算法的热度计算）
  useEffect(() => {
    if (projectId) {
      // 传入用户ID用于5分钟去重（如已登录）
      clickTracker.recordClick(projectId);
    }
  }, [projectId]);

  // 加载成就和接受记录
  useEffect(() => {
    const loadAchievementsAndAcceptances = async () => {
      const achResult = await achievementStorage.getByProject(projectId);
      if (achResult.success && achResult.data) setAchievements(achResult.data);

      if (user) {
        const acceptedResult = await taskAcceptanceStorage.getUserAcceptedTaskIds(user.id);
        if (acceptedResult.success && acceptedResult.data) setAcceptedTaskIds(acceptedResult.data);
      }
    };
    loadAchievementsAndAcceptances();
  }, [projectId, user]);

  const isOwner = user && project && user.id === project.creatorId;

  // 加载发布费用（项目创建者）
  useEffect(() => {
    if (isOwner) {
      balanceStorage.getBalance().then((r) => {
        if (r.success && r.data) setPublishFeeYuan(r.data.task_publish_fee_yuan);
      });
    }
  }, [isOwner]);
  const isAdminUser = isAdmin(user);
  const canEdit = !!(isOwner || isAdminUser);

  // 分类选项
  const categories = [
    { value: '电影', label: t('film') },
    { value: '动画', label: t('animation') },
    { value: '商业制作', label: t('commercial') },
    { value: '公益', label: t('publicWelfare') },
    { value: '其他', label: t('other') },
  ];

  // 通用字段保存处理函数
  const handleFieldSave = async (field: string, value: any): Promise<boolean> => {
    const result = await projectStorage.updateProject(projectId, { [field]: value });
    if (result.success && result.data) {
      setProject(result.data);
      showToast('success', t('saved'));
      return true;
    }
    showToast('error', result.error || t('saveFailed'));
    return false;
  };

  // 刷新任务列表
  const refreshTasks = async () => {
    const result = await taskStorage.getTasksByProject(projectId);
    if (result.success && result.data) setTasks(result.data);
  };

  // 刷新成就
  const refreshAchievements = async () => {
    const achResult = await achievementStorage.getByProject(projectId);
    if (achResult.success && achResult.data) setAchievements(achResult.data);
  };

  // 创建/编辑任务提交
  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    setSubmittingTask(true);
    try {
    if (taskFormMode === 'create') {
      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        prompt: taskData.prompt || '',
        referenceImages: taskData.referenceImages || [],
        requirements: taskData.requirements || '',
        creatorEmail: taskData.creatorEmail || '',
        status: taskData.status || 'published', // 使用表单传来的status,默认published
        duration: taskData.duration || 10,
        order: tasks.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const result = await taskStorage.createTask(projectId, newTask);
      if (result.success) {
        showToast('success', t('taskCreated'));
        await refreshTasks();
      } else {
        showToast('error', result.error || t('createFailed'));
        if (result.error && (result.error.includes('余额不足') || result.error.includes('请先充值'))) {
          router.push('/recharge');
        }
      }
    } else if (editingTask) {
      const result = await taskStorage.updateTask(projectId, editingTask.id, {
        ...taskData,
        updatedAt: new Date().toISOString(),
      });
      if (result.success) {
        showToast('success', t('taskUpdated'));
        await refreshTasks();
      }
    }
    } finally {
      setSubmittingTask(false);
      setShowTaskForm(false);
      setEditingTask(undefined);
    }
  };

  // 编辑任务
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskFormMode('edit');
    setShowTaskForm(true);
  }, []);

  // 删除任务
  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!confirm(t('confirmDeleteTask'))) return;
    const result = await taskStorage.deleteTask(projectId, taskId);
    if (result.success) {
      showToast('success', t('taskDeleted'));
      await refreshTasks();
    }
  }, [projectId, t, showToast]);

  // 发布任务
  const handlePublishTask = useCallback(async (taskId: string) => {
    const balanceRes = await balanceStorage.getBalance();
    if (balanceRes.success && balanceRes.data) {
      if (balanceRes.data.balance_cents < balanceRes.data.task_publish_fee_cents) {
        setShowInsufficientModal(true);
        return;
      }
    }
    const result = await taskStorage.updateTask(projectId, taskId, {
      status: 'published',
      updatedAt: new Date().toISOString(),
    });
    if (result.success) {
      showToast('success', t('taskPublishedSuccess'));
      await refreshTasks();
    } else {
      showToast('error', result.error || t('updateFailed'));
      if (result.error && (result.error.includes('余额不足') || result.error.includes('请先充值'))) {
        setShowInsufficientModal(true);
      }
    }
  }, [projectId, t, showToast]);

  // 打开完成任务模态框
  const handleOpenComplete = useCallback((taskId: string) => {
    setCompletingTaskId(taskId);
    setContributorNameInput('');
    setShowCompleteModal(true);
  }, []);

  // 确认完成任务
  const handleConfirmComplete = async () => {
    if (!contributorNameInput.trim() || !project) return;
    const task = tasks.find(t => t.id === completingTaskId);
    if (!task) return;

    setCompletingTask(true);
    const result = await completeTask(
      projectId, completingTaskId, contributorNameInput.trim(),
      project.title, task.prompt.slice(0, 50),
    );
    if (result.success) {
      showToast('success', t('taskCompletedSuccess'));
      await refreshTasks();
      await refreshAchievements();
      setShowCompleteModal(false);
    }
    setCompletingTask(false);
  };

  // 接受任务
  const handleAcceptTask = async (task: Task) => {
    if (!isLoggedIn || !user) {
      router.push('/auth/login');
      return;
    }
    const result = await taskAcceptanceStorage.acceptTask(task.id, user.id);
    if (result.success) {
      setAcceptedTaskIds(prev => [...prev, task.id]);
      showToast('success', t('taskAccepted'));
    }
  };

  // 管理员删除项目
  const handleDeleteProject = async () => {
    if (!confirm(t('confirmDeleteProject', '确定要删除此项目吗？此操作不可撤销。'))) return;
    const result = await projectStorage.deleteProject(projectId);
    if (result.success) {
      showToast('success', t('projectDeleted', '项目已删除'));
      router.push('/');
    } else {
      showToast('error', result.error || t('deleteFailed', '删除失败'));
    }
  };

  // 添加日志
  const handleAddLog = async () => {
    if (!logContent.trim() || !user) return;
    const newLog: ProjectLog = {
      id: `log_${Date.now()}`, type: logType, content: logContent.trim(),
      createdAt: new Date().toISOString(), creatorName: user.name
    };
    const result = await projectStorage.addProjectLog(projectId, newLog);
    if (result.success && result.data && project) {
      setProject({ ...project, logs: [...(project.logs || []), result.data] });
      setShowLogModal(false); setLogContent(''); setLogType('update');
    }
  };

  if (loading) {
    return (
      <LayoutSimple>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <LoadingSpinner size="lg" />
          <span className="text-[var(--text-muted)]">{t('loading')}</span>
        </div>
      </LayoutSimple>
    );
  }

  if (!project) {
    return (
      <LayoutSimple>
        <div className="text-center py-20">
          <h2 className="text-2xl text-[var(--text-primary)] mb-4">{t('projectNotFound')}</h2>
          <p className="text-[var(--text-muted)] mb-8">{t('projectNotFoundDesc')}</p>
          <Link href="/"><button className="btn-primary">{t('backToHome')}</button></Link>
        </div>
      </LayoutSimple>
    );
  }

  const sortedTasks = [...tasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => a.order - b.order);

  return (
    <LayoutSimple>
      <div className="max-w-7xl mx-auto px-4">
        {/* 顶部：分类 + 标题 + 创建者信息 */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <InlineEditSelect
                value={project.category}
                options={categories}
                onSave={(v) => handleFieldSave('category', v)}
                canEdit={canEdit}
              />
            </div>
            
            {/* 右侧：创建者信息 */}
            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span>{t('createdBy')} <span className="text-[var(--text-primary)]">{project.creatorName}</span></span>
              </div>
              <span>·</span>
              <span>{new Date(project.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <InlineEditText
              value={project.title}
              onSave={(v) => handleFieldSave('title', v)}
              canEdit={canEdit}
              validate={validateTitle}
              displayClassName="text-3xl lg:text-5xl text-[var(--text-primary)] font-bold"
            />
            
            {isAdminUser && (
              <button
                onClick={handleDeleteProject}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors whitespace-nowrap"
              >
                {t('deleteProject', '删除项目')}
              </button>
            )}
          </div>
        </div>

        {/* 主体区域:左侧媒体 + 右侧进度 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* 左侧:媒体展示区域(占2/3宽度) */}
          <div className="lg:col-span-2">
            {/* 媒体容器 - 自适应高度 */}
            <MediaCarousel
              coverImage={project.coverImage}
              videoFile={project.videoFile}
              canEdit={canEdit}
              onSaveCover={(v) => handleFieldSave('coverImage', v)}
              onSaveVideo={(v) => handleFieldSave('videoFile', v)}
            />
          </div>

          {/* 右侧：项目进度信息卡片（占1/3宽度） */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <ProgressSidebar
                project={project}
                tasks={tasks}
                achievementsCount={achievements.length}
                canEdit={canEdit}
                onFieldSave={handleFieldSave}
              />
            </div>
          </div>
        </div>

        {/* 下方内容区域：左右两栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：项目描述 + 成就 + 动态 */}
          <div className="space-y-8">
            {/* 项目描述 */}
            <div className="card p-8 animate-fade-up">
              <h2 className="text-2xl text-[var(--text-primary)] mb-4">{t('aboutThisProject')}</h2>
              <InlineEditRichText
                value={project.description}
                onSave={(v) => handleFieldSave('description', v)}
                canEdit={canEdit}
              />
            </div>

            {/* 成就区域 */}
            {achievements.length > 0 && (
              <div className="card p-8 animate-fade-up delay-1">
                <h2 className="text-2xl text-[var(--text-primary)] mb-6">{t('achievements')}</h2>
                <AchievementList achievements={achievements} mode="project" />
              </div>
            )}

            {/* 项目动态 */}
            <div className="card p-8 animate-fade-up delay-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl text-[var(--text-primary)]">{t('projectUpdates')}</h2>
                {isOwner && (
                  <button onClick={() => setShowLogModal(true)} className="btn-primary h-10 px-4 text-sm">
                    {t('publishUpdate')}
                  </button>
                )}
              </div>

              {project.logs && project.logs.length > 0 ? (
                <div className="space-y-6">
                  {project.logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((log) => (
                    <div key={log.id} className="border-l-2 border-[var(--gold)] pl-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-[var(--text-primary)]">{log.creatorName}</span>
                        <span className="text-sm text-[var(--text-muted)]">
                          {new Date(log.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                        </span>
                        {log.type !== 'update' && <span className="tag tag-gold text-xs">{log.type === 'milestone' ? t('milestone') : t('announcement')}</span>}
                      </div>
                      <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{log.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-[var(--text-muted)]">{t('noUpdatesYet')}</p>
              )}
            </div>
          </div>

          {/* 右侧：任务列表 */}
          <div>
            <div className="card p-8 animate-fade-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl text-[var(--text-primary)]">{t('tasks')}</h2>
                {isOwner && tasks.length < 10 && (
                  <button
                    onClick={() => { setTaskFormMode('create'); setEditingTask(undefined); setShowTaskForm(true); }}
                    className="btn-primary h-10 px-4 text-sm"
                  >
                    {t('publishTaskWithFee', { fee: publishFeeYuan })}
                  </button>
                )}
                {isOwner && tasks.length >= 10 && (
                  <span className="text-xs text-[var(--text-muted)]">{t('maxTasksReached')}</span>
                )}
              </div>

              {sortedTasks.length > 0 ? (
                <div className="space-y-2">
                  {sortedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projectId={projectId}
                      isCreator={!!isOwner}
                      isLoggedIn={isLoggedIn}
                      currentUserId={user?.id}
                      hasAccepted={acceptedTaskIds.includes(task.id)}
                      onClick={(task) => setSelectedTask(task)}
                      onEdit={isOwner ? handleEditTask : undefined}
                      onDelete={isOwner ? handleDeleteTask : undefined}
                      onPublish={isOwner ? handlePublishTask : undefined}
                      onComplete={isOwner ? handleOpenComplete : undefined}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-[var(--text-muted)]">{t('noTasks')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 任务表单模态框 */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditingTask(undefined); }}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        mode={taskFormMode}
        defaultCreatorEmail={user?.email || ''}
      />

      {/* 完成任务模态框 - 输入贡献者名称 */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCompleteModal(false)}>
          <div className="card max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--ink-border)]">
              <h3 className="text-xl text-[var(--text-primary)]">{t('completeTask')}</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('contributorName')}</label>
              <input
                type="text"
                value={contributorNameInput}
                onChange={e => setContributorNameInput(e.target.value)}
                placeholder={t('enterContributorName')}
                className="input"
                name="contributorName"
                autoFocus
              />
            </div>
            <div className="p-6 border-t border-[var(--ink-border)] flex gap-3">
              <button onClick={() => setShowCompleteModal(false)} className="btn-secondary flex-1" disabled={completingTask}>{t('cancel')}</button>
              <button
                onClick={handleConfirmComplete}
                disabled={!contributorNameInput.trim() || completingTask}
                className="btn-primary flex-1 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {completingTask ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {t('loading')}
                  </>
                ) : (
                  t('confirm')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 发布日志模态框 */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowLogModal(false)}>
          <div className="card max-w-lg w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--ink-border)]">
              <h3 className="text-xl text-[var(--text-primary)]">{t('publishProjectUpdate')}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('updateType')}</label>
                <select value={logType} onChange={e => setLogType(e.target.value as any)} className="input">
                  <option value="update">{t('progressUpdate')}</option>
                  <option value="milestone">{t('milestone')}</option>
                  <option value="announcement">{t('announcement')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('updateContent')}</label>
                <textarea
                  value={logContent}
                  onChange={e => setLogContent(e.target.value)}
                  placeholder={t('shareProgressPlaceholder')}
                  rows={6}
                  className="input resize-none py-3"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[var(--ink-border)] flex gap-3">
              <button onClick={() => setShowLogModal(false)} className="btn-secondary flex-1">{t('cancel')}</button>
              <button onClick={handleAddLog} disabled={!logContent.trim()} className="btn-primary flex-1 disabled:opacity-50">
                {t('publishUpdateButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 余额不足弹窗 */}
      {showInsufficientModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowInsufficientModal(false)}>
          <div className="card max-w-sm w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('insufficientBalanceTitle')}</h3>
              <button
                onClick={() => { setShowInsufficientModal(false); router.push('/recharge'); }}
                className="btn-primary w-full"
              >
                {t('goToRecharge')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 任务详情弹窗 */}
      {selectedTask && project && (
        <TaskDetailModal
          task={selectedTask}
          projectName={project.title}
          projectCategory={project.category}
          isCreator={!!isOwner}
          isLoggedIn={isLoggedIn}
          hasAccepted={acceptedTaskIds.includes(selectedTask.id)}
          onClose={() => setSelectedTask(null)}
          onEdit={(task) => {
            setSelectedTask(null);
            handleEditTask(task);
          }}
          onDelete={(taskId) => {
            setSelectedTask(null);
            handleDeleteTask(taskId);
          }}
          onPublish={(taskId) => {
            handlePublishTask(taskId);
          }}
          onComplete={(taskId) => {
            setSelectedTask(null);
            handleOpenComplete(taskId);
          }}
          onAccept={handleAcceptTask}
        />
      )}
    </LayoutSimple>
  );
}
