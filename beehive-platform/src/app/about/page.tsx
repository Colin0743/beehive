'use client';

import LayoutSimple from '@/components/LayoutSimple';

export default function AboutPage() {
  return (
    <LayoutSimple>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium text-[#111827] mb-8">关于我们</h1>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6">
          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-4">🐝 蜜蜂AI电影制片厂是什么？</h2>
            <p className="text-[#4B5563] leading-relaxed">
              蜜蜂AI电影制片厂是一个专为AI视频创作者打造的协作平台。我们的使命是连接全球的AI视频创作者，
              让每一个创意都能找到志同道合的伙伴，共同完成令人惊叹的AI视频作品。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-4">💡 我们的愿景</h2>
            <p className="text-[#4B5563] leading-relaxed">
              在AI技术飞速发展的今天，视频创作的门槛正在被重新定义。我们相信，
              通过协作的力量，每个人都可以参与到专业级AI视频的创作中来。
              蜜蜂AI电影制片厂致力于成为AI视频创作领域最活跃、最有价值的社区。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-4">🎯 核心价值</h2>
            <ul className="space-y-3 text-[#4B5563]">
              <li className="flex items-start gap-3">
                <span className="text-[#FFD700]">✦</span>
                <span><strong>协作共创</strong> - 汇聚创意与算力，让优秀作品诞生</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FFD700]">✦</span>
                <span><strong>开放透明</strong> - 项目进度公开，参与者共同见证成长</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FFD700]">✦</span>
                <span><strong>创意至上</strong> - 尊重每一个创意，支持每一次尝试</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-4">📧 联系我们</h2>
            <p className="text-[#4B5563] leading-relaxed">
              如有任何问题或建议，欢迎通过以下方式联系我们：<br />
              邮箱：contact@beehive.ai<br />
              Telegram：@beehive_official
            </p>
          </section>
        </div>
      </div>
    </LayoutSimple>
  );
}
