'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Figma 设计的 Logo 组件
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

function HeaderContent() {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 跳转到搜索结果页面
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = ["全部", "科幻", "动画", "纪录片", "教育", "其他"];
  const currentCategory = searchParams.get('category') || '全部';

  const handleCategoryClick = (category: string) => {
    if (category === '全部') {
      router.push('/');
    } else {
      router.push(`/?category=${category}`);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50">
      {/* Navigation - 完全按照 Figma 设计 */}
      <nav className="border-b border-neutral-200 shadow-sm">
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

      {/* Category Tabs - 完全按照 Figma 设计（仅在首页显示） */}
      {pathname === '/' && (
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="flex gap-8 h-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`relative text-sm transition-colors ${
                    currentCategory === category
                      ? "text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {category}
                  {currentCategory === category && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default function HeaderSimple() {
  return (
    <Suspense fallback={
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="medium" />
            <div className="text-neutral-500 text-sm">加载中...</div>
          </div>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  );
}
