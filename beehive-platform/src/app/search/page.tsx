'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/types';
import { projectStorage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

// Logo 组件
function Logo({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
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
      <span className={`${currentSize.text} font-semibold text-[#FFD700]`}>蜂巢</span>
    </div>
  );
}

// 按钮组件
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
  const baseStyles = "font-semibold rounded-lg transition-all active:scale-[0.98]";
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


// 项目卡片组件
function ProjectCard({ project, daysLeft }: { project: Project; daysLeft: number }) {
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
  const plainDescription = project.description.replace(/<[^>]*>/g, '');

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group w-full bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
        <div className="relative h-48 flex items-center justify-center" style={{ backgroundColor: categoryStyle.bg }}>
          {project.coverImage ? (
            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-6xl opacity-20">📹</div>
          )}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-md text-xs" style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}>
            {project.category}
          </div>
          {isCompleted && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-md text-xs bg-[#10B981] text-white">已完成</div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl text-[#111827] mb-2 truncate">{project.title}</h3>
          <p className="text-sm text-[#4B5563] mb-4 line-clamp-2 leading-relaxed">{plainDescription}</p>
          <div className="mb-1">
            <span className="text-3xl text-[#111827]">{project.currentDuration}</span>
            <span className="text-sm text-[#6B7280] ml-1">分钟</span>
          </div>
          <div className="text-sm text-[#6B7280] mb-3">目标 {project.targetDuration} 分钟</div>
          <div className="h-0.5 bg-neutral-200 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-[#10B981] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
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


// 搜索结果页面内容
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 12; // 每页显示12个项目

  const categories = ["全部", "科幻", "动画", "纪录片", "教育", "其他"];
  const keyword = searchParams.get('keyword') || '';

  useEffect(() => {
    const result = projectStorage.getAllProjects();
    if (result.success && result.data) {
      setProjects(result.data);
    }
  }, []);

  // 从 URL 读取搜索关键词
  useEffect(() => {
    if (keyword) {
      setSearchQuery(keyword);
    }
  }, [keyword]);

  // 过滤项目
  useEffect(() => {
    let filtered = projects;

    // 按关键词搜索
    if (keyword.trim()) {
      const query = keyword.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // 按分类过滤
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProjects(filtered);
    setCurrentPage(1); // 切换筛选条件时重置到第一页
  }, [projects, keyword, selectedCategory]);

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
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getDaysLeft = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="h-16 flex items-center justify-between">
            <Link href="/"><Logo size="medium" /></Link>
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
                  className="w-full h-11 pl-12 pr-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </form>
            </div>
            <div className="flex items-center gap-6">
              {isLoggedIn ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
                    <img src={user?.avatar || '/default-avatar.svg'} alt={user?.name} className="w-8 h-8 rounded-full border-2 border-neutral-200" />
                    <span>{user?.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-neutral-600 hover:text-neutral-900">退出</button>
                  <Link href="/projects/new"><Button variant="primary" size="medium">开始创作</Button></Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm text-neutral-600 hover:text-neutral-900">登录</Link>
                  <Link href="/auth/register" className="text-sm text-neutral-600 hover:text-neutral-900">注册</Link>
                  <Link href="/projects/new"><Button variant="primary" size="medium">开始创作</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>


      {/* 搜索结果区域 */}
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        {/* 搜索信息 */}
        <div className="mb-6">
          <h1 className="text-2xl text-[#111827] mb-2">
            搜索结果：<span className="text-[#FFD700]">"{keyword}"</span>
          </h1>
          <p className="text-sm text-[#6B7280]">
            共找到 {filteredProjects.length} 个相关项目
          </p>
        </div>

        {/* 分类筛选 */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === category
                  ? "bg-[#FFD700] text-[#111827]"
                  : "bg-white border border-neutral-300 text-neutral-600 hover:border-[#FFD700]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 搜索结果列表 */}
        {filteredProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} daysLeft={getDaysLeft(project.createdAt)} />
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
            <div className="text-6xl mb-4 opacity-30">🔍</div>
            <h3 className="text-xl text-[#111827] mb-2">没有找到相关项目</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              尝试使用其他关键词搜索，或浏览全部项目
            </p>
            <Link href="/">
              <Button variant="primary" size="medium">浏览全部项目</Button>
            </Link>
          </div>
        )}
      </div>

      {/* 页脚 */}
      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="max-w-[1440px] mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-500">© 2025 蜂巢平台. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-neutral-500">
              <a href="#" className="hover:text-neutral-900">隐私政策</a>
              <a href="#" className="hover:text-neutral-900">服务条款</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex justify-center items-center">
        <div className="text-neutral-500">搜索中...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
