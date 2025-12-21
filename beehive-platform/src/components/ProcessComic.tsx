'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ProcessComic() {
  const { isLoggedIn } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  // 精简为3个关键步骤
  const steps = [
    {
      emoji: '🎯',
      title: '发起人创建项目',
      description: '提出创意蓝图，设定视频时长目标，吸引工蜂加入',
      image: '📝',
    },
    {
      emoji: '🐝',
      title: '工蜂加入项目',
      description: '浏览项目，关注感兴趣的项目，以工蜂身份加入并提供算力支持',
      image: '⚡',
    },
    {
      emoji: '🎬',
      title: '协作完成作品',
      description: '在Telegram群组中接收任务，生成AI视频片段，发起人整合完成最终作品',
      image: '✨',
    },
  ];

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % steps.length);
    }, 5000); // 每5秒切换

    return () => clearInterval(timer);
  }, [steps.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentStep = steps[currentIndex];

  return (
    <div className="w-full py-3 px-4 relative overflow-hidden" style={{
      minHeight: '180px',
    }}>
      <div className="max-w-3xl mx-auto relative z-10">
        {/* 轮播内容 */}
        <div className="relative">
          {/* 当前步骤卡片 - 手绘风格 */}
          <div 
            key={currentIndex}
            className="bg-white rounded-xl shadow-lg p-5 border-3 border-yellow-400 relative transform transition-all duration-700 ease-in-out"
            style={{
              boxShadow: '6px 6px 0px rgba(0,0,0,0.1)',
              transform: 'rotate(-0.5deg)',
              borderWidth: '3px',
            }}
          >
            {/* 手绘装饰角落 */}
            <div className="absolute top-2 right-2 text-lg opacity-30">✏️</div>

            {/* 步骤编号 */}
            <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg z-20" style={{
              background: 'linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%)',
              border: '3px solid #FFD700',
              boxShadow: '3px 3px 0px rgba(0,0,0,0.15)',
              transform: 'rotate(-5deg)',
              fontFamily: 'Georgia, serif',
            }}>
              {currentIndex + 1}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Emoji 图标 */}
              <div className="w-16 h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center text-4xl flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%)',
                border: '3px solid #FFD700',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.15)',
                transform: 'rotate(-3deg)',
              }}>
                <span style={{ 
                  filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))',
                  transform: 'rotate(3deg)',
                }}>{currentStep.emoji}</span>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900" style={{
                  fontFamily: 'Georgia, serif',
                  textShadow: '2px 2px 0px rgba(255,215,0,0.2)',
                }}>
                  {currentStep.title}
                </h3>
                <p className="text-gray-700 mb-3 text-sm leading-relaxed" style={{
                  fontFamily: 'Georgia, serif',
                }}>
                  {currentStep.description}
                </p>
                {/* 装饰图标 */}
                <div className="text-2xl opacity-50">
                  {currentStep.image}
                </div>
              </div>
            </div>
          </div>

          {/* 轮播指示器 */}
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-yellow-500 w-8' 
                    : 'bg-yellow-300 hover:bg-yellow-400 w-2'
                }`}
                style={{
                  boxShadow: index === currentIndex ? '0 0 8px rgba(255,215,0,0.6)' : 'none',
                }}
                aria-label={`跳转到步骤 ${index + 1}`}
              />
            ))}
          </div>

          {/* 导航箭头 */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + steps.length) % steps.length)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:shadow-xl transition-all border-2 border-yellow-400 text-lg font-bold"
            style={{ transform: 'translateY(-50%) translateX(-16px) rotate(-5deg)' }}
            aria-label="上一个步骤"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % steps.length)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:shadow-xl transition-all border-2 border-yellow-400 text-lg font-bold"
            style={{ transform: 'translateY(-50%) translateX(16px) rotate(5deg)' }}
            aria-label="下一个步骤"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
