import { Rocket, Palette, Video, BookOpen, Sparkles } from "lucide-react";

interface ProjectCardProps {
  category: string;
  title: string;
  description: string;
  currentMinutes: number;
  targetMinutes: number;
  supporters: number;
  progress: number;
  daysLeft: number;
  isCompleted?: boolean;
}

const categoryColors: { [key: string]: { bg: string; text: string; Icon: any } } = {
  科幻: { bg: "#EDE9FE", text: "#5B21B6", Icon: Rocket },
  动画: { bg: "#FEF3C7", text: "#92400E", Icon: Palette },
  纪录片: { bg: "#D1FAE5", text: "#065F46", Icon: Video },
  教育: { bg: "#DBEAFE", text: "#1E40AF", Icon: BookOpen },
  其他: { bg: "#FCE7F3", text: "#831843", Icon: Sparkles },
};

export function ProjectCard({
  category,
  title,
  description,
  currentMinutes,
  targetMinutes,
  supporters,
  progress,
  daysLeft,
  isCompleted = false,
}: ProjectCardProps) {
  const categoryStyle = categoryColors[category] || categoryColors["其他"];
  const Icon = categoryStyle.Icon;

  return (
    <div className="group w-full max-w-[360px] bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
      {/* Cover Image */}
      <div
        className="relative h-48 flex items-center justify-center"
        style={{ backgroundColor: categoryStyle.bg }}
      >
        <Icon size={64} className="opacity-20" style={{ color: categoryStyle.text }} strokeWidth={1.5} />
        
        {/* Category Tag */}
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-md text-xs"
          style={{
            backgroundColor: categoryStyle.bg,
            color: categoryStyle.text,
          }}
        >
          {category}
        </div>

        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-md text-xs bg-[#10B981] text-white">
            已完成
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl text-[#111827] mb-2 truncate">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#4B5563] mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Current Value */}
        <div className="mb-1">
          <span className="text-3xl text-[#111827]">{currentMinutes}</span>
          <span className="text-sm text-[#6B7280] ml-1">分钟</span>
        </div>

        {/* Target Value */}
        <div className="text-sm text-[#6B7280] mb-3">
          目标 {targetMinutes} 分钟
        </div>

        {/* Progress Bar */}
        <div className="h-0.5 bg-neutral-200 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-[#10B981] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <span>{supporters} 支持者</span>
          <span>•</span>
          <span>{progress}% 完成</span>
          <span>•</span>
          <span>{daysLeft} 天</span>
        </div>
      </div>
    </div>
  );
}