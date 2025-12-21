'use client';

import LayoutSimple from '@/components/LayoutSimple';

export default function TermsPage() {
  return (
    <LayoutSimple>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium text-[#111827] mb-8">服务条款</h1>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6 text-[#4B5563]">
          <p className="text-sm">最后更新日期：2025年1月</p>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">1. 服务说明</h2>
            <p className="leading-relaxed">
              蜂巢是一个AI视频创作者协作平台，为用户提供项目发布、浏览和参与的功能。
              使用本平台即表示您同意遵守以下条款。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">2. 用户账户</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>您必须提供准确、完整的注册信息</li>
              <li>您有责任保护账户安全，不得与他人共享账户</li>
              <li>您对账户下的所有活动负责</li>
              <li>如发现未授权使用，请立即通知我们</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">3. 用户行为规范</h2>
            <p className="leading-relaxed mb-2">使用本平台时，您同意不会：</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>发布违法、有害、威胁、辱骂、骚扰性内容</li>
              <li>侵犯他人知识产权或隐私权</li>
              <li>发布虚假或误导性信息</li>
              <li>干扰或破坏平台的正常运行</li>
              <li>未经授权收集其他用户的信息</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">4. 内容所有权</h2>
            <p className="leading-relaxed">
              您保留您在平台上发布的原创内容的所有权。但您授予蜂巢非独占、免版税的许可，
              允许我们在平台上展示、分发您的内容。您确保您有权发布所提交的所有内容。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">5. 免责声明</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>平台按"现状"提供，不提供任何明示或暗示的保证</li>
              <li>我们不对用户之间的协作结果负责</li>
              <li>我们不对第三方链接（如Telegram群组）的内容负责</li>
              <li>我们不保证服务不会中断或无错误</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">6. 责任限制</h2>
            <p className="leading-relaxed">
              在法律允许的最大范围内，蜂巢及其关联方不对任何间接、附带、特殊、
              后果性或惩罚性损害承担责任。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">7. 条款修改</h2>
            <p className="leading-relaxed">
              我们保留随时修改本条款的权利。修改后的条款将在平台上公布，
              继续使用服务即表示您接受修改后的条款。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">8. 联系方式</h2>
            <p className="leading-relaxed">
              如有任何问题，请通过 contact@beehive.ai 联系我们。
            </p>
          </section>
        </div>
      </div>
    </LayoutSimple>
  );
}
