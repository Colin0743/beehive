'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Project, ProjectLog } from '@/types';
import { projectStorage, projectRelationStorage } from '@/lib/storage';
import { ErrorHandler } from '@/lib/errorHandler';
import { useToast } from '@/components/Toast';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isParticipating, setIsParticipating] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState<'update' | 'milestone' | 'announcement'>('update');

  const projectId = params.id as string;

  useEffect(() => {
    loadProject();
    if (user) {
      checkParticipationStatus();
    }
  }, [projectId, user]);

  const loadProject = () => {
    const result = projectStorage.getProjectById(projectId);
    if (result.success && result.data) {
      setProject(result.data);
    } else if (!result.success) {
      ErrorHandler.logError(new Error(result.error || '加载项目失败'));
    }
    setLoading(false);
  };

  const checkParticipationStatus = () => {
    if (!user) return;
    
    const result = projectRelationStorage.isParticipating(user.id, projectId);
    if (result.success && result.data !== undefined) {
      setIsParticipating(result.data);
    }
  };

  // 加入项目 - 跳转到 Telegram 群组并增加参与者数量
  const handleJoinProject = () => {
    if (!project) return;

    // 检查是否有 Telegram 群组链接
    if (!project.telegramGroup) {
      showToast('error', '该项目暂无群组链接');
      return;
    }

    // 如果用户已登录且未参与过，增加参与者数量
    if (isLoggedIn && user && !isParticipating) {
      const result = projectRelationStorage.participateInProject(user.id, projectId, 'worker_bee');
      if (result.success) {
        setIsParticipating(true);
        // 更新项目参与者数量
        const updatedProject = { ...project, participantsCount: (project.participantsCount || 0) + 1 };
        setProject(updatedProject);
        // 同时更新存储中的项目数据
        projectStorage.updateProject(projectId, { participantsCount: updatedProject.participantsCount });
      }
    }

    // 打开 Telegram 群组链接
    window.open(project.telegramGroup, '_blank', 'noopener,noreferrer');
    showToast('success', '正在跳转到 Telegram 群组...');
  };

  const handleParticipate = () => {
    if (!isLoggedIn || !user) {
      router.push('/auth/login');
      return;
    }

    const result = projectRelationStorage.participateInProject(user.id, projectId, 'worker_bee');
    
    if (result.success) {
      setIsParticipating(true);
      if (project) {
        setProject({ ...project, participantsCount: (project.participantsCount || 0) + 1 });
      }
      showToast('success', '已加入项目');
    } else {
      ErrorHandler.logError(new Error(result.error || '参与操作失败'));
      showToast('error', result.error || '操作失败');
    }
  };

  const handleAddLog = () => {
    if (!logContent.trim() || !user) return;

    const newLog: ProjectLog = {
      id: `log_${Date.now()}`,
      type: logType,
      content: logContent.trim(),
      createdAt: new Date().toISOString(),
      creatorName: user.name
    };

    const result = projectStorage.addProjectLog(projectId, newLog);
    
    if (result.success && result.data) {
      if (project) {
        setProject({ ...project, logs: [...(project.logs || []), result.data!] });
      }
      setShowLogModal(false);
      setLogContent('');
      setLogType('update');
      showToast('success', '日志发布成功');
    } else {
      ErrorHandler.logError(new Error(result.error || '添加日志失败'));
      showToast('error', result.error || '发布失败');
    }
  };

  const isOwner = user && project && user.id === project.creatorId;

  if (loading) {
    return <LayoutSimple><div className="text-center py-12">加载中...</div></LayoutSimple>;
  }

  if (!project) {
    return (
      <LayoutSimple>
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-30">⚠️</div>
          <h3 className="text-xl font-medium mb-2" style={{ color: '#111827' }}>项目不存在</h3>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>该项目可能已被删除或链接无效</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 rounded-lg font-semibold text-sm transition-all"
            style={{ backgroundColor: '#FFD700', color: '#111827' }}
          >
            返回首页
          </Link>
        </div>
      </LayoutSimple>
    );
  }

  const progress = Math.min((project.currentDuration / project.targetDuration) * 100, 100);
  const remainingDuration = Math.max(0, project.targetDuration - project.currentDuration);

  return (
    <LayoutSimple>
      <div className="max-w-7xl mx-auto">
        {/* 顶部媒体展示 - 全宽 */}
        {(project.coverImage || (project as any).videoFile) && (
          <div className="mb-6 rounded-lg overflow-hidden shadow-lg bg-black">
            {(project as any).videoFile ? (
              <video 
                src={(project as any).videoFile} 
                controls 
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-auto max-h-[600px] object-contain"
                poster={project.coverImage}
              />
            ) : project.coverImage ? (
              <img 
                src={project.coverImage} 
                alt={project.title}
                className="w-full h-auto max-h-[600px] object-cover"
              />
            ) : null}
          </div>
        )}

        {/* 主要内容区域 - 左右分栏布局 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧主要内容区 */}
          <div className="flex-1 space-y-6">
            {/* 项目标题和基本信息 - Figma 设计风格 */}
            <div 
              className="rounded-xl p-6 lg:p-8"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  {(() => {
                    const categoryColors: { [key: string]: { bg: string; text: string } } = {
                      '科幻': { bg: '#EDE9FE', text: '#5B21B6' },
                      '动画': { bg: '#FEF3C7', text: '#92400E' },
                      '纪录片': { bg: '#D1FAE5', text: '#065F46' },
                      '教育': { bg: '#DBEAFE', text: '#1E40AF' },
                      '其他': { bg: '#FCE7F3', text: '#831843' },
                    };
                    const style = categoryColors[project.category] || categoryColors['其他'];
                    return (
                      <span 
                        className="inline-block px-4 py-1.5 rounded-md text-sm font-medium"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        {project.category}
                      </span>
                    );
                  })()}
                  {isOwner && (
                    <Link
                      href={`/projects/edit/${project.id}`}
                      className="text-sm flex items-center gap-1 transition-colors"
                      style={{ color: '#6B7280' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                    >
                      <span>✏️</span>
                      <span>编辑项目</span>
                    </Link>
                  )}
                </div>
                <h1 
                  className="text-3xl lg:text-4xl font-medium mb-3 leading-tight"
                  style={{ color: '#111827' }}
                >
                  {project.title}
                </h1>
                <p className="text-base" style={{ color: '#6B7280' }}>
                  由 <span className="font-medium" style={{ color: '#111827' }}>{project.creatorName}</span> 发起
                  <span className="mx-2">·</span>
                  <span>{new Date(project.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </p>
              </div>
            </div>

            {/* 项目描述 - Figma 设计风格 */}
            <div 
              className="rounded-xl p-6 lg:p-8"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2 className="text-xl font-medium mb-4" style={{ color: '#111827' }}>关于这个项目</h2>
              <div 
                className="prose max-w-none rich-text-content"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </div>

            {/* 项目日志 - Figma 设计风格 */}
            <div 
              className="rounded-xl p-6 lg:p-8"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium" style={{ color: '#111827' }}>项目动态</h2>
                {isOwner && (
                  <button
                    onClick={() => setShowLogModal(true)}
                    className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
                    style={{ backgroundColor: '#FFD700', color: '#111827' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E6C200'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
                  >
                    + 发布更新
                  </button>
                )}
              </div>

              {project.logs && project.logs.length > 0 ? (
                <div className="space-y-6">
                  {project.logs.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  ).map((log) => (
                    <div key={log.id} className="border-l-4 pl-6 pb-6 last:pb-0" style={{ borderColor: '#FFD700' }}>
                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-3xl">
                          {log.type === 'milestone' ? '🏆' : log.type === 'announcement' ? '📢' : '📝'}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{log.creatorName}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(log.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {log.type === 'milestone' && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium">
                                里程碑
                              </span>
                            )}
                            {log.type === 'announcement' && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                                公告
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{log.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg">还没有项目动态</p>
                  {isOwner && (
                    <p className="text-sm mt-2">点击上方按钮发布第一条更新</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 右侧固定栏 - 进度和行动 */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              {/* 时长进度卡片 - Figma 设计风格 */}
              <div 
                className="rounded-xl p-6"
                style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #FFD700',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-medium" style={{ color: '#111827' }}>{project.currentDuration}</span>
                    <span className="text-lg" style={{ color: '#6B7280' }}>分钟</span>
                  </div>
                  <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                    目标 <span className="font-medium" style={{ color: '#111827' }}>{project.targetDuration} 分钟</span>
                  </p>
                  
                  {/* 进度条 */}
                  <div className="mb-4">
                    <div 
                      className="w-full rounded-full h-2 overflow-hidden"
                      style={{ backgroundColor: '#E5E7EB' }}
                    >
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: '#10B981'
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-2" style={{ color: '#6B7280' }}>
                      <span>{progress.toFixed(1)}% 已完成</span>
                      {remainingDuration > 0 && (
                        <span>还需 {remainingDuration} 分钟</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="pt-4 space-y-3" style={{ borderTop: '1px solid #E5E7EB' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#6B7280' }}>参与者</span>
                    <span className="font-medium" style={{ color: '#111827' }}>{project.participantsCount || 0} 人</span>
                  </div>
                </div>
              </div>

              {/* 行动按钮卡片 - Figma 设计风格 */}
              <div 
                className="rounded-xl p-6"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <button
                  onClick={handleJoinProject}
                  className="w-full py-4 px-6 rounded-lg text-lg font-semibold transition-all"
                  style={{
                    backgroundColor: '#FFD700',
                    color: '#111827',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E6C200';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFD700';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  📱 加入项目
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 发布日志模态框 */}
      {showLogModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLogModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">发布项目更新</h3>
              <p className="text-gray-600 text-sm mt-1">与参与者分享项目进展</p>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">更新类型</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="update">📝 进度更新</option>
                  <option value="milestone">🏆 里程碑</option>
                  <option value="announcement">📢 公告</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">更新内容</label>
                <textarea
                  placeholder="分享项目进展、成果或重要通知..."
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowLogModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddLog}
                disabled={!logContent.trim()}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  logContent.trim()
                    ? 'text-gray-900 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                }`}
                style={logContent.trim() ? { background: '#FFD700' } : {}}
              >
                发布更新
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutSimple>
  );
}
