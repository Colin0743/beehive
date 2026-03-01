'use client';

import LayoutSimple from '@/components/LayoutSimple';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <LayoutSimple>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium text-[#111827] mb-8">如何运作</h1>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-8">
          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-4">🎬 蜂巢协作模式</h2>
            <p className="text-[#4B5563] leading-relaxed mb-4">
              蜂巢采用独特的“导演+参与者”协作模式，让AI视频创作变得简单高效。
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#FFF9E6] rounded-xl p-6">
              <div className="text-3xl mb-3">👑</div>
              <h3 className="text-lg font-medium text-[#111827] mb-2">项目发起人（导演）</h3>
              <ul className="text-sm text-[#4B5563] space-y-2">
                <li>• 提出创意构想和项目蓝图</li>
                <li>• 设定视频时长目标</li>
                <li>• 提供标准化的创作流程</li>
                <li>• 管理项目进度和成员</li>
                <li>• 负责最终的视频剪辑</li>
              </ul>
            </div>

            <div className="bg-[#FEF3C7] rounded-xl p-6">
              <div className="text-3xl mb-3">🐝</div>
              <h3 className="text-lg font-medium text-[#111827] mb-2">参与者（参与者）</h3>
              <ul className="text-sm text-[#4B5563] space-y-2">
                <li>• 加入感兴趣的项目</li>
                <li>• 在Telegram群组接收任务</li>
                <li>• 使用AI工具生成视频片段</li>
                <li>• 提交作品给发起人</li>
                <li>• 共同见证作品诞生</li>
              </ul>
            </div>
          </div>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-4">📋 参与流程</h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-[#111827] font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-[#111827]">浏览项目</h4>
                  <p className="text-sm text-[#4B5563]">在首页浏览各类AI视频项目，找到你感兴趣的创意</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-[#111827] font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-[#111827]">加入项目</h4>
                  <p className="text-sm text-[#4B5563]">点击“加入项目”按钮，进入项目的Telegram群组</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-[#111827] font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-[#111827]">协作创作</h4>
                  <p className="text-sm text-[#4B5563]">在群组中接收任务，使用AI工具生成视频片段并提交</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white font-medium flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-medium text-[#111827]">完成作品</h4>
                  <p className="text-sm text-[#4B5563]">发起人整合所有片段，完成最终的AI视频作品</p>
                </div>
              </div>
            </div>
          </section>

          <div className="text-center pt-4">
            <Link 
              href="/projects/new"
              className="inline-block px-8 py-3 bg-[#FFD700] text-[#111827] rounded-lg font-semibold hover:bg-[#E6C200] transition-colors"
            >
              开始创建项目
            </Link>
          </div>
        </div>
      </div>
    </LayoutSimple>
  );
}
