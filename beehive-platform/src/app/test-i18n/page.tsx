'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function TestI18nPage() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">
              i18n 测试页面
            </h1>
            <LanguageSwitcher />
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800">导航相关</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>登录:</strong> {t('login')}</p>
                  <p><strong>注册:</strong> {t('register')}</p>
                  <p><strong>退出:</strong> {t('logout')}</p>
                  <p><strong>开始创作:</strong> {t('startCreating')}</p>
                  <p><strong>搜索占位符:</strong> {t('searchPlaceholder')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800">分类</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>全部:</strong> {t('all')}</p>
                  <p><strong>科幻:</strong> {t('sciFi')}</p>
                  <p><strong>动画:</strong> {t('animation')}</p>
                  <p><strong>纪录片:</strong> {t('documentary')}</p>
                  <p><strong>教育:</strong> {t('education')}</p>
                  <p><strong>其他:</strong> {t('other')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800">Hero 区域</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>标题:</strong> {t('heroTitle')}</p>
                  <p><strong>副标题:</strong> {t('heroSubtitle')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800">项目卡片</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>支持者:</strong> {t('supporters')}</p>
                  <p><strong>完成:</strong> {t('completed')}</p>
                  <p><strong>天:</strong> {t('days')}</p>
                  <p><strong>分钟:</strong> {t('minutes')}</p>
                  <p><strong>目标:</strong> {t('target')}</p>
                  <p><strong>已完成徽章:</strong> {t('completedBadge')}</p>
                  <p><strong>加入项目:</strong> {t('joinProject')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800">分页</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>上一页:</strong> {t('previousPage')}</p>
                  <p><strong>下一页:</strong> {t('nextPage')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800">空状态</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>没有项目:</strong> {t('noProjects')}</p>
                  <p><strong>该分类暂无项目:</strong> {t('noCategoryProjects')}</p>
                  <p><strong>尝试其他分类:</strong> {t('tryOtherCategories')}</p>
                  <p><strong>创建第一个项目:</strong> {t('createFirstProject')}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">页脚</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p><strong>描述:</strong> {t('footerDescription')}</p>
                  <p><strong>快速链接:</strong> {t('quickLinks')}</p>
                  <p><strong>关于我们:</strong> {t('aboutUs')}</p>
                  <p><strong>如何运作:</strong> {t('howItWorks')}</p>
                </div>
                <div>
                  <p><strong>创作指南:</strong> {t('creationGuide')}</p>
                  <p><strong>帮助中心:</strong> {t('helpCenter')}</p>
                  <p><strong>项目分类:</strong> {t('projectCategories')}</p>
                  <p><strong>社区:</strong> {t('community')}</p>
                </div>
                <div>
                  <p><strong>博客:</strong> {t('blog')}</p>
                  <p><strong>创作者故事:</strong> {t('creatorStories')}</p>
                  <p><strong>合作伙伴:</strong> {t('partners')}</p>
                  <p><strong>联系我们:</strong> {t('contactUs')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}