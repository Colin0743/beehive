'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 示例图片 URL（使用 picsum.photos 占位图服务）
const SAMPLE_IMAGES = [
  'https://picsum.photos/seed/task1/400/600',
  'https://picsum.photos/seed/task2/400/600',
  'https://picsum.photos/seed/task3/400/600',
  'https://picsum.photos/seed/task4/400/600',
  'https://picsum.photos/seed/task5/400/600',
  'https://picsum.photos/seed/task6/400/600',
  'https://picsum.photos/seed/task7/400/600',
  'https://picsum.photos/seed/task8/400/600',
  'https://picsum.photos/seed/task9/400/600',
  'https://picsum.photos/seed/task10/400/600',
  'https://picsum.photos/seed/task11/400/600',
  'https://picsum.photos/seed/task12/400/600',
  'https://picsum.photos/seed/task13/400/600',
  'https://picsum.photos/seed/task14/400/600',
  'https://picsum.photos/seed/task15/400/600',
  'https://picsum.photos/seed/task16/400/600',
  'https://picsum.photos/seed/task17/400/600',
  'https://picsum.photos/seed/task18/400/600',
  'https://picsum.photos/seed/task19/400/600',
  'https://picsum.photos/seed/task20/400/600',
];

const COVER_IMAGES = [
  'https://picsum.photos/seed/cover1/800/450',
  'https://picsum.photos/seed/cover2/800/450',
  'https://picsum.photos/seed/cover3/800/450',
  'https://picsum.photos/seed/cover4/800/450',
  'https://picsum.photos/seed/cover5/800/450',
  'https://picsum.photos/seed/cover6/800/450',
  'https://picsum.photos/seed/cover7/800/450',
  'https://picsum.photos/seed/cover8/800/450',
  'https://picsum.photos/seed/cover9/800/450',
  'https://picsum.photos/seed/cover10/800/450',
  'https://picsum.photos/seed/cover11/800/450',
  'https://picsum.photos/seed/cover12/800/450',
  'https://picsum.photos/seed/cover13/800/450',
  'https://picsum.photos/seed/cover14/800/450',
  'https://picsum.photos/seed/cover15/800/450',
  'https://picsum.photos/seed/cover16/800/450',
];

const CATEGORIES = ['电影', '动画', '商业制作', '公益', '其他'];

const TASK_PROMPTS = [
  '一艘巨大的星际飞船缓缓驶入未知星系，周围漂浮着神秘的紫色星云',
  '机器人在废弃的城市中独自行走，夕阳的余晖洒在锈迹斑斑的建筑上',
  '深海中发光的水母群，在黑暗中形成梦幻般的光带',
  '古老的图书馆里，书籍自动飞舞，魔法光芒四溢',
  '未来都市的空中交通，飞行汽车穿梭在摩天大楼之间',
  '森林中的精灵村落，树屋之间有发光的藤蔓连接',
  '火山喷发的壮观场景，岩浆流入大海形成蒸汽',
  '北极光下的冰川，五彩斑斓的光芒映照在冰面上',
  '赛博朋克风格的街道，霓虹灯和全息广告交织',
  '宇航员在月球表面行走，地球在远处升起',
  '童话城堡在云端漂浮，彩虹桥连接各个塔楼',
  '沙漠中的绿洲，骆驼商队在夕阳下休息',
  '海底古城遗迹，鱼群在断壁残垣间游弋',
  '魔法森林的入口，巨大的古树形成天然拱门',
  '太空站内部，宇航员在零重力下工作',
  '樱花盛开的日本庭院，花瓣随风飘落',
  '蒸汽朋克风格的工厂，齿轮和管道错综复杂',
  '极地科考站，暴风雪中的温暖灯光',
  '热带雨林的瀑布，彩虹横跨水雾之上',
  '外星球的奇异地貌，双太阳在地平线上',
];

const PROJECT_TITLES = [
  '星际迷航：新纪元',
  '机械之心',
  '深海奇遇',
  '魔法学院',
  '未来都市',
  '精灵传说',
  '银河护卫队',
  '梦幻动画',
  '地球脉动',
  '科学探索',
  '奇幻世界',
  '太空漫游',
  '童话王国',
  '海洋纪实',
  '知识星球',
  '神秘冒险',
];

const PROJECT_DESCRIPTIONS = [
  '探索未知宇宙的科幻史诗，讲述人类在星际间的冒险故事',
  '一个关于人工智能觉醒的动画短片，探讨机器与人类的关系',
  '记录深海生物的纪录片项目，展现海洋的神秘与美丽',
  '奇幻风格的教育动画，通过魔法世界教授科学知识',
  '赛博朋克风格的城市生活，展现科技与人性的碰撞',
  '童话风格的冒险故事，讲述精灵与人类的友谊',
  '星际战争与和平的史诗故事',
  '充满想象力的动画短片集',
  '探索地球自然奇观的纪录片',
  '寓教于乐的科普动画系列',
  '奇幻世界的冒险之旅',
  '人类探索太空的壮丽篇章',
  '经典童话的现代演绎',
  '深入海洋探索未知生物',
  '趣味知识科普系列',
  '神秘事件的探索之旅',
];

// 生成示例数据
function generateSeedData() {
  const now = new Date().toISOString();
  const userId = 'seed-user-001';
  
  // 创建示例用户
  const users = [
    {
      id: userId,
      name: '示例创作者',
      email: 'creator@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
      passwordHash: 'demo_hash_12345',
      role: 'user',
      isActive: true,
      createdAt: now,
    },
  ];

  // 创建示例项目（每个分类一个）
  const projects = PROJECT_TITLES.map((title, index) => {
    const category = CATEGORIES[index % CATEGORIES.length];
    const tasks = generateTasksForProject(index, userId, now);
    
    return {
      id: `project-${index + 1}`,
      title,
      description: PROJECT_DESCRIPTIONS[index],
      category,
      targetDuration: 120,
      currentDuration: Math.floor(Math.random() * 60),
      telegramGroup: 'https://t.me/example',
      coverImage: COVER_IMAGES[index],
      creatorId: userId,
      creatorName: '示例创作者',
      participantsCount: Math.floor(Math.random() * 50) + 5,
      status: 'active',
      createdAt: now,
      logs: [],
      tasks,
    };
  });

  return { users, projects };
}

// 为每个项目生成 3-4 个任务
function generateTasksForProject(projectIndex: number, creatorId: string, now: string) {
  const taskCount = 3 + Math.floor(Math.random() * 2); // 3-4 个任务
  const tasks = [];
  
  for (let i = 0; i < taskCount; i++) {
    const taskIndex = projectIndex * 4 + i;
    const promptIndex = taskIndex % TASK_PROMPTS.length;
    const imageIndex = taskIndex % SAMPLE_IMAGES.length;
    
    tasks.push({
      id: `task-${projectIndex + 1}-${i + 1}`,
      prompt: TASK_PROMPTS[promptIndex],
      referenceImages: [
        SAMPLE_IMAGES[imageIndex],
        SAMPLE_IMAGES[(imageIndex + 1) % SAMPLE_IMAGES.length],
      ],
      requirements: '请根据提示词创作 5-10 秒的视频片段，风格要与项目整体保持一致。',
      creatorEmail: 'creator@example.com',
      status: 'published', // 全部设为已发布，方便在任务墙查看
      duration: 5 + Math.floor(Math.random() * 26), // 5-30 秒
      order: i,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  return tasks;
}

export default function SeedPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSeed = () => {
    setStatus('loading');
    setMessage('正在生成示例数据...');

    try {
      const { users, projects } = generateSeedData();

      // 清除旧数据
      localStorage.removeItem('registeredUsers');
      localStorage.removeItem('projects');

      // 写入新数据
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      localStorage.setItem('projects', JSON.stringify(projects));

      setStatus('success');
      setMessage(`成功创建 ${users.length} 个用户和 ${projects.length} 个项目（共 ${projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0)} 个任务）`);
    } catch (error: any) {
      setStatus('error');
      setMessage(`错误: ${error.message}`);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('registeredUsers');
    localStorage.removeItem('projects');
    setStatus('success');
    setMessage('已清除所有项目和用户数据');
  };

  return (
    <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center p-8">
      <div className="card p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          数据种子工具
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          生成带图片的示例项目和任务数据，用于测试任务墙效果。
        </p>

        <div className="space-y-4">
          <button
            onClick={handleSeed}
            disabled={status === 'loading'}
            className="btn-primary w-full"
          >
            {status === 'loading' ? '生成中...' : '生成示例数据'}
          </button>

          <button
            onClick={handleClear}
            disabled={status === 'loading'}
            className="btn-secondary w-full"
          >
            清除所有数据
          </button>

          <button
            onClick={() => router.push('/tasks')}
            className="w-full px-4 py-2 text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
          >
            前往任务大厅查看 →
          </button>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-lg ${
            status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
            status === 'error' ? 'bg-red-500/10 text-red-400' :
            'bg-[var(--ink-lighter)] text-[var(--text-secondary)]'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
