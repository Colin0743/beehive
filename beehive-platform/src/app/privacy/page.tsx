'use client';

import LayoutSimple from '@/components/LayoutSimple';

export default function PrivacyPage() {
  return (
    <LayoutSimple>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium text-[#111827] mb-8">隐私政策</h1>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6 text-[#4B5563]">
          <p className="text-sm">最后更新日期：2025年1月</p>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">1. 信息收集</h2>
            <p className="leading-relaxed">
              我们收集您在使用蜂巢平台时提供的信息，包括：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>账户信息：用户名、邮箱地址</li>
              <li>项目信息：您创建或参与的项目内容</li>
              <li>使用数据：浏览记录、操作日志</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">2. 信息使用</h2>
            <p className="leading-relaxed">
              我们使用收集的信息用于：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>提供、维护和改进我们的服务</li>
              <li>处理您的请求和交易</li>
              <li>发送服务相关的通知</li>
              <li>防止欺诈和滥用行为</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">3. 信息共享</h2>
            <p className="leading-relaxed">
              我们不会出售您的个人信息。我们可能在以下情况下共享信息：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>经您同意</li>
              <li>与服务提供商合作（如云存储服务）</li>
              <li>法律要求或保护权益需要</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">4. 数据安全</h2>
            <p className="leading-relaxed">
              我们采取合理的技术和组织措施来保护您的个人信息，包括数据加密、访问控制等。
              但请注意，没有任何互联网传输或电子存储方法是100%安全的。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">5. 您的权利</h2>
            <p className="leading-relaxed">
              您有权：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>访问和获取您的个人信息副本</li>
              <li>更正不准确的信息</li>
              <li>删除您的账户和相关数据</li>
              <li>撤回同意（如适用）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">6. 联系我们</h2>
            <p className="leading-relaxed">
              如果您对本隐私政策有任何疑问，请通过 contact@beehive.ai 联系我们。
            </p>
          </section>
        </div>
      </div>
    </LayoutSimple>
  );
}
