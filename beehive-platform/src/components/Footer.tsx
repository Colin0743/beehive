'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function Footer() {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/?category=${category}`);
  };

  return (
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
              <li><a href="#" className="hover:text-neutral-900 transition-colors">关于我们</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">如何运作</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">创作指南</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">帮助中心</a></li>
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
              <li><a href="#" className="hover:text-neutral-900 transition-colors">联系我们</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © 2025 蜂巢平台. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-neutral-900 transition-colors">隐私政策</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">服务条款</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Cookie设置</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

