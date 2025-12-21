'use client';

import LayoutSimple from '@/components/LayoutSimple';
import { useState, useEffect } from 'react';

export default function CookiesPage() {
  const [cookieConsent, setCookieConsent] = useState<string | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    setCookieConsent(consent);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setCookieConsent('all');
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setCookieConsent('essential');
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setCookieConsent('rejected');
  };

  return (
    <LayoutSimple>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium text-[#111827] mb-8">Cookie 设置</h1>
        
        <div className="space-y-6">
          {/* Cookie 设置面板 */}
          <div className="bg-white rounded-xl border border-neutral-200 p-8">
            <h2 className="text-xl font-medium text-[#111827] mb-4">管理您的 Cookie 偏好</h2>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-[#111827]">必要 Cookie</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">始终启用</span>
                </div>
                <p className="text-sm text-[#4B5563]">
                  这些 Cookie 是网站正常运行所必需的，无法关闭。它们用于保存您的登录状态和偏好设置。
                </p>
              </div>

              <div className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-[#111827]">功能 Cookie</h3>
                  <span className={`text-xs px-2 py-1 rounded ${cookieConsent === 'all' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'}`}>
                    {cookieConsent === 'all' ? '已启用' : '已禁用'}
                  </span>
                </div>
                <p className="text-sm text-[#4B5563]">
                  这些 Cookie 用于记住您的偏好设置，提供更个性化的体验。
                </p>
              </div>

              <div className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-[#111827]">分析 Cookie</h3>
                  <span className={`text-xs px-2 py-1 rounded ${cookieConsent === 'all' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'}`}>
                    {cookieConsent === 'all' ? '已启用' : '已禁用'}
                  </span>
                </div>
                <p className="text-sm text-[#4B5563]">
                  这些 Cookie 帮助我们了解用户如何使用网站，以便改进服务。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2.5 bg-[#FFD700] text-[#111827] rounded-lg font-semibold hover:bg-[#E6C200] transition-colors"
              >
                接受全部
              </button>
              <button
                onClick={handleAcceptEssential}
                className="px-6 py-2.5 border-2 border-[#FFD700] text-[#111827] rounded-lg font-semibold hover:bg-[#FFF9E6] transition-colors"
              >
                仅必要 Cookie
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-2.5 border border-neutral-300 text-neutral-600 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
              >
                拒绝非必要
              </button>
            </div>

            {cookieConsent && (
              <p className="mt-4 text-sm text-green-600">
                ✓ 您的 Cookie 偏好已保存
              </p>
            )}
          </div>

          {/* Cookie 政策说明 */}
          <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6 text-[#4B5563]">
            <h2 className="text-xl font-medium text-[#111827]">关于 Cookie</h2>
            
            <section>
              <h3 className="font-medium text-[#111827] mb-2">什么是 Cookie？</h3>
              <p className="text-sm leading-relaxed">
                Cookie 是存储在您设备上的小型文本文件，用于记住您的偏好设置和改善您的浏览体验。
              </p>
            </section>

            <section>
              <h3 className="font-medium text-[#111827] mb-2">我们如何使用 Cookie？</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>保持您的登录状态</li>
                <li>记住您的语言和显示偏好</li>
                <li>分析网站流量和使用情况</li>
                <li>改进我们的服务</li>
              </ul>
            </section>

            <section>
              <h3 className="font-medium text-[#111827] mb-2">如何管理 Cookie？</h3>
              <p className="text-sm leading-relaxed">
                您可以通过上方的设置面板管理 Cookie 偏好，也可以在浏览器设置中删除或阻止 Cookie。
                请注意，禁用某些 Cookie 可能会影响网站的功能。
              </p>
            </section>
          </div>
        </div>
      </div>
    </LayoutSimple>
  );
}
