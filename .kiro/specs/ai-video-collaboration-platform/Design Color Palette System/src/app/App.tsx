import { Navigation } from "./components/Navigation";
import { CategoryTabs } from "./components/CategoryTabs";
import { HeroSection } from "./components/HeroSection";
import { ProjectGrid } from "./components/ProjectGrid";
import { Logo } from "./components/Logo";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <Navigation />

      {/* Category Tabs */}
      <CategoryTabs />

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Projects Grid */}
      <ProjectGrid />

      {/* Footer */}
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
                <li><a href="#" className="hover:text-neutral-900 transition-colors">科幻</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">动画</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">纪录片</a></li>
                <li><a href="#" className="hover:text-neutral-900 transition-colors">教育</a></li>
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
    </div>
  );
}