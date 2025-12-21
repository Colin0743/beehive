'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🐝</div>
          <h1 className="text-4xl font-bold mb-4">欢迎来到蜜蜂AI电影制片厂</h1>
          <p className="text-xl text-gray-600 mb-8">
            AI视频创作者的协作平台，汇聚创意与算力
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/auth/register"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
            >
              注册
            </Link>
            <Link 
              href="/auth/login"
              className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-lg"
            >
              登录
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">功能特性</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ 用户注册和登录</li>
            <li>✅ 创建和管理项目</li>
            <li>✅ 项目搜索和筛选</li>
            <li>✅ 关注和参与项目</li>
            <li>✅ 发布项目日志</li>
            <li>✅ 个人中心</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
