'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/types';
import { projectStorage, projectRelationStorage } from '@/lib/storage';
import { ErrorHandler } from '@/lib/errorHandler';
import { useAuth } from '@/contexts/AuthContext';
import ProcessComic from '@/components/ProcessComic';

// Figma 设计的 Logo 组件
function Logo({ size = "medium", showText = true }: { size?: "small" | "medium" | "large"; showText?: boolean }) {
  const sizes = {
    small: { icon: 20, text: "text-base" },
    medium: { icon: 28, text: "text-xl" },
    large: { icon: 40, text: "text-3xl" },
  };
  const currentSize = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFD700"
          strokeWidth="2.5"
        >
          <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" fill="#FFD700" fillOpacity="0.1" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-[1px]">
            <div className="w-[3px] h-[3px] bg-[#FFD700] rounded-full" />
            <div className="w-[3px] h-[3px] bg-[#FFD700] rounded-full" />
            <div className="w-[3px] h-[3px] bg-[#FFD700] rounded-full" />
            <div className="w-[3px] h-[3px] bg-[#FFD700] rounded-full" />
          </div>
        </div>
      </div>
      {showText && (
        <span className={`${currentSize.text} font-semibold text-[#FFD700]`}>蜂巢</span>
      )}
    </div>
  );
}

// Figma 设计的按钮组件
function Button({ 
  children, 
  variant = "primary", 
  size = "medium",
  onClick,
  className = ""
}: { 
  children: React.ReactNode; 
  variant?: "primary" | "secondary" | "text";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
  className?: string;
}) {
  const baseStyles = "font-semibold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles = {
    primary: "bg-[#FFD700] text-[#111827] hover:bg-[#E6C200] shadow-sm",
    secondary: "bg-transparent border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFF9E6]",
    text: "bg-transparent text-[#4A90E2] hover:underline",
  };
  const sizeStyles = {
    small: "h-9 px-4 text-sm",
    medium: "h-11 px-6 text-sm",
    large: "h-[52px] px-8 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}


// Figma 设计的项目卡片组件
function ProjectCard({
  project,
  daysLeft,
}: {
  project: Project;
  daysLeft: number;
}) {
  const categoryColors: { [key: string]: { bg: string; text: string } } = {
    科幻: { bg: "#EDE9FE", text: "#5B21B6" },
    动画: { bg: "#FEF3C7", text: "#92400E" },
    纪录片: { bg: "#D1FAE5", text: "#065F46" },
    教育: { bg: "#DBEAFE", text: "#1E40AF" },
    其他: { bg: "#FCE7F3", text: "#831843" },
  };

  const categoryStyle = categoryColors[project.category] || categoryColors["其他"];
  const progress = Math.min((project.currentDuration / project.targetDuration) * 100, 100);
  const isCompleted = progress === 100;
  
  // 移除 HTML 标签获取纯文本描述
  const plainDescription = project.description.replace(/<[^>]*>/g, '');

  // 分类图标
  const CategoryIcon = () => {
    const iconProps = { size: 64, className: "opacity-20", style: { color: categoryStyle.text }, strokeWidth: 1.5 };
    switch (project.category) {
      case '科幻':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
      case '动画':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
      case '纪录片':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
      case '教育':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
      default:
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
    }
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group w-full max-w-[360px] bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
        {/* Cover Image */}
        <div
          className="relative h-48 flex items-center justify-center"
          style={{ backgroundColor: categoryStyle.bg }}
        >
          {project.coverImage ? (
            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <CategoryIcon />
          )}
          
          {/* Category Tag */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-md text-xs"
            style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}
          >
            {project.category}
          </div>

          {/* Completed Badge */}
          {isCompleted && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-md text-xs bg-[#10B981] text-white">
              已完成
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl text-[#111827] mb-2 truncate">{project.title}</h3>

          {/* Description */}
          <p className="text-sm text-[#4B5563] mb-4 line-clamp-2 leading-relaxed">{plainDescription}</p>

          {/* Current Value */}
          <div className="mb-1">
            <span className="text-3xl text-[#111827]">{project.currentDuration}</span>
            <span className="text-sm text-[#6B7280] ml-1">分钟</span>
          </div>

          {/* Target Value */}
          <div className="text-sm text-[#6B7280] mb-3">目标 {project.targetDuration} 分钟</div>

          {/* Progress Bar */}
          <div className="h-0.5 bg-neutral-200 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span>{project.participantsCount || 0} 支持者</span>
            <span>•</span>
            <span>{progress.toFixed(0)}% 完成</span>
            <span>•</span>
            <span>{daysLeft} 天</span>
          </div>
        </div>
      </div>
    </Link>
  );
}


// 主页内容组件
function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasParticipated, setHasParticipated] = useState(false);
  const projectsPerPage = 12; // 每页显示12个项目

  const categories = ["全部", "科幻", "动画", "纪录片", "教育", "其他"];

  useEffect(() => {
    const result = projectStorage.getAllProjects();
    if (result.success && result.data) {
      setProjects(result.data);
      setFilteredProjects(result.data);
    } else if (!result.success) {
      ErrorHandler.logError(new Error(result.error || '加载项目失败'));
    }
  }, []);

  // 检查用户是否参与过项目
  useEffect(() => {
    if (user) {
      const participatedResult = projectRelationStorage.getParticipatedProjectIds(user.id);
      if (participatedResult.success && participatedResult.data && participatedResult.data.length > 0) {
        setHasParticipated(true);
      }
    }
  }, [user]);

  // 从URL参数读取分类
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl === 'all' ? '全部' : categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = projects;

    if (selectedCategory !== '全部') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProjects(filtered);
    setCurrentPage(1); // 切换分类时重置到第一页
  }, [projects, selectedCategory]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // 切换分类时重置到第一页
    if (category === '全部') {
      router.push('/');
    } else {
      router.push(`/?category=${category}`);
    }
  };

  // 分页逻辑
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 跳转到搜索结果页面
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // 计算剩余天数
  const getDaysLeft = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation - 完全按照 Figma 设计 */}
      <nav className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Left: Logo */}
            <Link href="/">
              <Logo size="medium" />
            </Link>

            {/* Center: Search */}
            <div className="flex-1 max-w-[600px] mx-8">
              <form onSubmit={handleSearch} className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索项目..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-12 pr-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </form>
            </div>

            {/* Right: Links and Button */}
            <div className="flex items-center gap-6">
              {isLoggedIn ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                    <img src={user?.avatar || '/default-avatar.svg'} alt={user?.name} className="w-8 h-8 rounded-full border-2 border-neutral-200" />
                    <span>{user?.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                    退出
                  </button>
                  <Link href="/projects/new">
                    <Button variant="primary" size="medium">开始创作</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                    登录
                  </Link>
                  <Link href="/auth/register" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                    注册
                  </Link>
                  <Link href="/projects/new">
                    <Button variant="primary" size="medium">开始创作</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Category Tabs - 完全按照 Figma 设计 */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex gap-8 h-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`relative text-sm transition-colors ${
                  selectedCategory === category
                    ? "text-neutral-900"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {category}
                {selectedCategory === category && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section - 完全按照 Figma 设计（除了流程漫画） */}
      {/* 只在第一页且用户未参与过项目时显示 */}
      {selectedCategory === '全部' && currentPage === 1 && !hasParticipated && (
        <section
          className="relative overflow-hidden rounded-b-3xl"
          style={{
            background: "linear-gradient(135deg, #FFF9E6 0%, #FFD700 100%)",
            height: "400px",
          }}
        >
          {/* Background Hexagons */}
          <div className="absolute top-8 left-12 rotate-[-12deg] opacity-[0.08]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.5">
              <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" />
            </svg>
          </div>
          <div className="absolute top-12 right-16 rotate-[12deg] opacity-[0.08]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.5">
              <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" />
            </svg>
          </div>
          <div className="absolute bottom-16 left-20 rotate-[8deg] opacity-[0.08]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.5">
              <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" />
            </svg>
          </div>
          <div className="absolute bottom-12 right-24 rotate-[-8deg] opacity-[0.08]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.5">
              <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative h-full max-w-[1440px] mx-auto px-8 pt-12 flex flex-col items-center">
            <h1
              className="text-5xl text-center text-[#111827] mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              让创意在蜂巢中绽放
            </h1>
            <p className="text-lg text-center text-[#1F2937] max-w-[800px] mb-8">
              蜂巢是AI视频创作者的协作平台，加入蜂巢，与优秀创作者一起完成AI视频作品
            </p>

            {/* Process Comic - 保留原有组件 */}
            <div className="w-full max-w-[900px] h-[200px] bg-white/40 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/60 shadow-lg">
              <ProcessComic />
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects Grid - 完全按照 Figma 设计 */}
      <section className="max-w-[1200px] mx-auto px-8 py-16">
        <h2 className="text-3xl text-[#111827] mb-8">
          {selectedCategory !== '全部' ? `${selectedCategory}项目` : '精选项目'}
        </h2>
        
        {filteredProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  daysLeft={getDaysLeft(project.createdAt)}
                />
              ))}
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  上一页
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-[#FFD700] text-[#111827]'
                          : 'border border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-30">📹</div>
            <h3 className="text-xl text-[#111827] mb-2">
              {selectedCategory !== '全部' ? '该分类暂无项目' : '还没有项目'}
            </h3>
            <p className="text-sm text-[#6B7280] mb-6">
              {selectedCategory !== '全部' 
                ? '尝试查看其他分类' 
                : '成为第一个在蜂巢平台创建AI视频项目的创作者！'}
            </p>
            {selectedCategory === '全部' && (
              <Link href="/projects/new">
                <Button variant="primary" size="medium">创建第一个项目</Button>
              </Link>
            )}
          </div>
        )}
      </section>


      {/* Footer - 完全按照 Figma 设计 */}
      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="max-w-[1440px] mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="mb-4">
                <Logo size="medium" />
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                AI视频创作者的协作平台，让创意在蜂巢中绽放
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm text-neutral-900 mb-4">快速链接</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><Link href="/about" className="hover:text-neutral-900 transition-colors">关于我们</Link></li>
                <li><Link href="/how-it-works" className="hover:text-neutral-900 transition-colors">如何运作</Link></li>
                <li><Link href="/guide" className="hover:text-neutral-900 transition-colors">创作指南</Link></li>
                <li><Link href="/help" className="hover:text-neutral-900 transition-colors">帮助中心</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm text-neutral-900 mb-4">项目分类</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><button onClick={() => handleCategoryClick('科幻')} className="hover:text-neutral-900 transition-colors">科幻</button></li>
                <li><button onClick={() => handleCategoryClick('动画')} className="hover:text-neutral-900 transition-colors">动画</button></li>
                <li><button onClick={() => handleCategoryClick('纪录片')} className="hover:text-neutral-900 transition-colors">纪录片</button></li>
                <li><button onClick={() => handleCategoryClick('教育')} className="hover:text-neutral-900 transition-colors">教育</button></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="text-sm text-neutral-900 mb-4">社区</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900 transition-colors">博客</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">创作者故事</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">合作伙伴</a></li>
                <li><a href="mailto:contact@beehive.ai" className="hover:text-neutral-900 transition-colors">联系我们</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-500">
              © 2025 蜂巢平台. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-neutral-500">
              <Link href="/privacy" className="hover:text-neutral-900 transition-colors">隐私政策</Link>
              <Link href="/terms" className="hover:text-neutral-900 transition-colors">服务条款</Link>
              <Link href="/cookies" className="hover:text-neutral-900 transition-colors">Cookie设置</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex justify-center items-center">
        <div className="text-neutral-500">加载中...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
