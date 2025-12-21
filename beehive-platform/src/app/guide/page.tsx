'use client';

import LayoutSimple from '@/components/LayoutSimple';

export default function GuidePage() {
  return (
    <LayoutSimple>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium text-[#111827] mb-8">创作指南</h1>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-8">
            <h2 className="text-xl font-medium text-[#111827] mb-4">📝 发起项目指南</h2>
            <div className="space-y-4 text-[#4B5563]">
              <div>
                <h3 className="font-medium text-[#111827] mb-2">1. 准备项目资料</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>项目标题：简洁有力，能够吸引眼球</li>
                  <li>项目描述：详细说明创意构想、风格定位</li>
                  <li>Demo视频：展示你期望的效果（可选）</li>
                  <li>封面图片：高质量的项目封面</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-[#111827] mb-2">2. 设定合理目标</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>时长目标：根据项目复杂度设定，建议5-15分钟</li>
                  <li>预估周期：给参与者足够的创作时间</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-[#111827] mb-2">3. 建立沟通渠道</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>创建Telegram群组用于日常沟通</li>
                  <li>准备清晰的任务分配流程</li>
                  <li>制定提示词模板供工蜂使用</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-8">
            <h2 className="text-xl font-medium text-[#111827] mb-4">🐝 参与项目指南</h2>
            <div className="space-y-4 text-[#4B5563]">
              <div>
                <h3 className="font-medium text-[#111827] mb-2">1. 选择合适的项目</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>选择你感兴趣的题材和风格</li>
                  <li>查看项目进度，了解当前状态</li>
                  <li>阅读项目描述，确保理解创作方向</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-[#111827] mb-2">2. 积极参与协作</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>加入Telegram群组后主动打招呼</li>
                  <li>认真阅读发起人提供的创作指南</li>
                  <li>按时完成分配的任务</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-[#111827] mb-2">3. 提交高质量作品</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>遵循项目的风格要求</li>
                  <li>多次迭代，追求最佳效果</li>
                  <li>及时反馈遇到的问题</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-8">
            <h2 className="text-xl font-medium text-[#111827] mb-4">🛠️ 推荐AI工具</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-[#4B5563]">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-[#111827] mb-1">视频生成</h4>
                <p>Runway, Pika, Sora, Kling等</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-[#111827] mb-1">图像生成</h4>
                <p>Midjourney, DALL-E, Stable Diffusion</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-[#111827] mb-1">音频处理</h4>
                <p>ElevenLabs, Suno, Udio</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-[#111827] mb-1">视频编辑</h4>
                <p>剪映, Premiere Pro, DaVinci</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutSimple>
  );
}
