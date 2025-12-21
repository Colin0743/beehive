import { ProjectCard } from "./ProjectCard";

const projects = [
  {
    category: "科幻",
    title: "太空探索",
    description: "探索宇宙的奥秘，展示人类对未知的向往和探索精神。通过AI技术呈现壮丽的星际场景。",
    currentMinutes: 1000,
    targetMinutes: 5000,
    supporters: 45,
    progress: 20,
    daysLeft: 15,
  },
  {
    category: "动画",
    title: "童话世界",
    description: "用AI动画技术讲述经典童话故事，为孩子们创造一个充满想象力的魔法世界。",
    currentMinutes: 2500,
    targetMinutes: 5000,
    supporters: 89,
    progress: 50,
    daysLeft: 22,
  },
  {
    category: "纪录片",
    title: "自然奇观",
    description: "记录大自然的壮美景观和生物多样性，呼吁人们保护我们共同的家园。",
    currentMinutes: 4000,
    targetMinutes: 5000,
    supporters: 156,
    progress: 80,
    daysLeft: 8,
  },
  {
    category: "教育",
    title: "编程入门",
    description: "通过生动有趣的AI视频教学，让编程学习变得简单有趣，适合所有年龄段的初学者。",
    currentMinutes: 5000,
    targetMinutes: 5000,
    supporters: 234,
    progress: 100,
    daysLeft: 0,
    isCompleted: true,
  },
  {
    category: "科幻",
    title: "未来城市",
    description: "想象2050年的智慧城市，展示科技如何改变我们的生活方式和城市面貌。",
    currentMinutes: 1750,
    targetMinutes: 5000,
    supporters: 67,
    progress: 35,
    daysLeft: 18,
  },
  {
    category: "其他",
    title: "创意实验",
    description: "大胆的艺术实验和创新尝试，探索AI视频创作的无限可能性和新的表达方式。",
    currentMinutes: 3000,
    targetMinutes: 5000,
    supporters: 112,
    progress: 60,
    daysLeft: 12,
  },
];

export function ProjectGrid() {
  return (
    <section className="max-w-[1200px] mx-auto px-8 py-16">
      <h2 className="text-3xl text-[#111827] mb-8">精选项目</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </section>
  );
}
