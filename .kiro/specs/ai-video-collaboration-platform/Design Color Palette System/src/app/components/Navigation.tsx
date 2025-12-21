import { Search } from "lucide-react";
import { Button } from "./Button";
import { Logo } from "./Logo";

export function Navigation() {
  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <Logo size="medium" />

          {/* Center: Search */}
          <div className="flex-1 max-w-[600px] mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="搜索项目..."
                className="w-full h-11 pl-12 pr-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right: Links and Button */}
          <div className="flex items-center gap-6">
            <button className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              登录
            </button>
            <button className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              注册
            </button>
            <Button variant="primary" size="medium">
              开始创作
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}