'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import InlineEditFile from './InlineEditFile';

interface MediaCarouselProps {
  coverImage: string;
  videoFile?: string;
  canEdit: boolean;
  onSaveCover: (url: string) => Promise<boolean>;
  onSaveVideo: (url: string) => Promise<boolean>;
}

export default function MediaCarousel({
  coverImage,
  videoFile,
  canEdit,
  onSaveCover,
  onSaveVideo
}: MediaCarouselProps) {
  const { t } = useTranslation('common');
  // 如果有视频则默认显示视频,否则显示封面图
  const [activeIndex, setActiveIndex] = useState(videoFile ? 0 : 1);

  // 当videoFile变化时更新activeIndex
  useEffect(() => {
    if (videoFile && activeIndex === 1) {
      setActiveIndex(0);
    } else if (!videoFile && activeIndex === 0) {
      setActiveIndex(1);
    }
  }, [videoFile]);

  // 是否显示导航控件(只有同时有视频和封面图时才显示)
  const showNavigation = !!videoFile && !!coverImage;
  const totalItems = videoFile ? 2 : 1;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
  };

  return (
    <div className="relative w-full animate-fade-up">
      {/* 媒体内容区域 */}
      <div className="relative w-full rounded-lg overflow-hidden aspect-video">
        {activeIndex === 0 && videoFile && (
          <div className="w-full h-full animate-fade-in">
            <InlineEditFile
              value={videoFile}
              onSave={onSaveVideo}
              canEdit={canEdit}
              accept="video/mp4,video/quicktime"
              fileType="video"
            />
          </div>
        )}
        
        {activeIndex === 1 && (
          <div className="w-full h-full animate-fade-in">
            <InlineEditFile
              value={coverImage}
              onSave={onSaveCover}
              canEdit={canEdit}
              accept="image/jpeg,image/png,image/gif"
              fileType="image"
            />
          </div>
        )}

        {/* 左右箭头按钮 - 只在有多个媒体项时显示 */}
        {showNavigation && (
          <>
            {/* 左箭头 */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 z-10"
              aria-label={t('previous', '上一个')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* 右箭头 */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 z-10"
              aria-label={t('next', '下一个')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* 底部圆点指示器 - 只在有多个媒体项时显示 */}
        {showNavigation && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            <button
              onClick={() => setActiveIndex(0)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                activeIndex === 0 ? 'bg-[var(--gold)] w-6' : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={t('video', '视频')}
            />
            <button
              onClick={() => setActiveIndex(1)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                activeIndex === 1 ? 'bg-[var(--gold)] w-6' : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={t('coverImage', '封面图')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
