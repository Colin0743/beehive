'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const sampleProjects = [
  {
    id: 'proj_001',
    title: '星际迷航：量子黎明',
    description: '<p>一部关于人类首次穿越量子隧道抵达仙女座星系的科幻短片。通过AI生成的壮丽宇宙景观，展现人类探索未知的勇气与智慧。</p>',
    category: '电影',
    targetDuration: 480,
    currentDuration: 180,
    coverImage: '',
    creatorId: 'seed_user_1',
    creatorName: '星辰导演',
    createdAt: '2025-12-01T08:00:00.000Z',
    status: 'active',
    participantsCount: 28,
    logs: [],
    tasks: [
      {
        id: 'task_001_1',
        prompt: '生成一段宇宙飞船穿越量子隧道的特效镜头，要求有强烈的光线扭曲效果和粒子拖尾，色调以蓝紫色为主',
        referenceImages: [],
        requirements: '分辨率不低于1080p，时长10秒，需要包含飞船从正常空间进入隧道的过渡效果',
        creatorEmail: 'stardirector@example.com',
        status: 'published' as const,
        duration: 10,
        order: 0,
        createdAt: '2025-12-05T10:00:00.000Z',
        updatedAt: '2025-12-05T10:00:00.000Z',
      },
      {
        id: 'task_001_2',
        prompt: '制作仙女座星系全景镜头，从远处缓慢推进到星系核心，展现壮丽的星云和恒星群',
        referenceImages: [],
        requirements: '画面需要有纵深感，星云色彩丰富，建议参考哈勃望远镜拍摄的真实星系照片风格',
        creatorEmail: 'stardirector@example.com',
        status: 'published' as const,
        duration: 15,
        order: 1,
        createdAt: '2025-12-06T14:30:00.000Z',
        updatedAt: '2025-12-06T14:30:00.000Z',
      },
      {
        id: 'task_001_3',
        prompt: '生成宇航员在外星球表面行走的镜头，地面是紫色晶体结构，天空有双星',
        referenceImages: [],
        requirements: '宇航员动作要自然流畅，环境光照要符合双星光源的特点',
        creatorEmail: 'stardirector@example.com',
        status: 'draft' as const,
        duration: 12,
        order: 2,
        createdAt: '2025-12-08T09:00:00.000Z',
        updatedAt: '2025-12-08T09:00:00.000Z',
      },
    ],
  },
  {
    id: 'proj_002',
    title: '墨韵山水：AI水墨动画',
    description: '<p>将传统中国水墨画与AI动画技术结合，创作一部展现四季变换的艺术短片。每一帧都是一幅流动的水墨画。</p>',
    category: '动画',
    targetDuration: 240,
    currentDuration: 168,
    coverImage: '',
    creatorId: 'seed_user_2',
    creatorName: '墨客工作室',
    createdAt: '2025-11-15T10:30:00.000Z',
    status: 'active',
    participantsCount: 15,
    logs: [],
    tasks: [
      {
        id: 'task_002_1',
        prompt: '创作春季场景：桃花盛开的山谷，溪水潺潺，远山如黛，水墨晕染风格，需要有花瓣飘落的动态效果',
        referenceImages: [],
        requirements: '严格遵循传统水墨画的留白美学，墨色浓淡变化要自然',
        creatorEmail: 'inkstudio@example.com',
        status: 'completed' as const,
        contributorName: '水墨小生',
        duration: 15,
        order: 0,
        createdAt: '2025-11-20T08:00:00.000Z',
        updatedAt: '2025-12-01T16:00:00.000Z',
      },
      {
        id: 'task_002_2',
        prompt: '创作夏季场景：荷塘月色，蛙声阵阵，荷叶上有露珠滚动，月光洒在水面形成粼粼波光',
        referenceImages: [],
        requirements: '夜景氛围，月光要柔和，荷花用淡粉色点缀，整体保持水墨基调',
        creatorEmail: 'inkstudio@example.com',
        status: 'published' as const,
        duration: 15,
        order: 1,
        createdAt: '2025-11-25T11:00:00.000Z',
        updatedAt: '2025-11-25T11:00:00.000Z',
      },
      {
        id: 'task_002_3',
        prompt: '创作秋季场景：枫叶满山，孤舟泊于江面，渔翁独钓，远处雁阵南飞',
        referenceImages: [],
        requirements: '秋色以赭石和朱砂色为主，保持水墨画的意境感，渔翁形象要有古典韵味',
        creatorEmail: 'inkstudio@example.com',
        status: 'published' as const,
        duration: 15,
        order: 2,
        createdAt: '2025-12-02T09:30:00.000Z',
        updatedAt: '2025-12-02T09:30:00.000Z',
      },
    ],
  },
  {
    id: 'proj_003',
    title: '深海之歌：海洋纪录片',
    description: '<p>利用AI技术还原深海生态系统，展现马里亚纳海沟中从未被人类目睹的奇异生物和壮观景象。</p>',
    category: '公益',
    targetDuration: 360,
    currentDuration: 360,
    coverImage: '',
    creatorId: 'seed_user_3',
    creatorName: '蓝色星球',
    createdAt: '2025-10-20T14:00:00.000Z',
    status: 'completed',
    participantsCount: 52,
    logs: [],
    tasks: [
      {
        id: 'task_003_1',
        prompt: '生成深海热泉口的生态场景，管虫群落在热泉周围摇曳，各种奇异甲壳类生物穿梭其间',
        referenceImages: [],
        requirements: '光源仅来自热泉口的微弱红光和生物自身的荧光，营造神秘深海氛围',
        creatorEmail: 'blueplanet@example.com',
        status: 'completed' as const,
        contributorName: '深海探索者',
        duration: 20,
        order: 0,
        createdAt: '2025-10-25T10:00:00.000Z',
        updatedAt: '2025-11-10T15:00:00.000Z',
      },
      {
        id: 'task_003_2',
        prompt: '制作巨型鱿鱼在深海中游弋的镜头，触手优雅舒展，身体表面有生物发光的图案变化',
        referenceImages: [],
        requirements: '鱿鱼体型要有压迫感，发光图案要有节奏变化，背景是无尽的深蓝色海水',
        creatorEmail: 'blueplanet@example.com',
        status: 'completed' as const,
        contributorName: '海洋之心',
        duration: 15,
        order: 1,
        createdAt: '2025-10-28T13:00:00.000Z',
        updatedAt: '2025-11-15T11:00:00.000Z',
      },
    ],
  },
  {
    id: 'proj_004',
    title: '赛博朋克2099：霓虹暗影',
    description: '<p>在一个被巨型企业统治的未来都市中，一名黑客少女发现了改变世界的秘密。充满霓虹灯光和雨夜氛围的赛博朋克视觉盛宴。</p>',
    category: '电影',
    targetDuration: 600,
    currentDuration: 268,
    coverImage: '',
    creatorId: 'seed_user_4',
    creatorName: 'NeonDream',
    createdAt: '2025-12-10T09:00:00.000Z',
    status: 'active',
    participantsCount: 41,
    logs: [],
    tasks: [
      {
        id: 'task_004_1',
        prompt: '生成赛博朋克城市的雨夜全景，高楼林立，霓虹广告牌闪烁，飞行汽车穿梭在建筑之间',
        referenceImages: [],
        requirements: '色调以青色、品红和金色为主，雨滴要有反射霓虹灯光的效果，整体氛围要压抑而华丽',
        creatorEmail: 'neondream@example.com',
        status: 'published' as const,
        duration: 20,
        order: 0,
        createdAt: '2025-12-12T10:00:00.000Z',
        updatedAt: '2025-12-12T10:00:00.000Z',
      },
      {
        id: 'task_004_2',
        prompt: '制作黑客少女在暗巷中奔跑的追逐镜头，身后是企业安保无人机的追光，地面积水反射出霓虹色彩',
        referenceImages: [],
        requirements: '运镜要有紧迫感，少女穿着带有发光线条的夹克，无人机的探照灯要有体积光效果',
        creatorEmail: 'neondream@example.com',
        status: 'published' as const,
        duration: 12,
        order: 1,
        createdAt: '2025-12-15T14:00:00.000Z',
        updatedAt: '2025-12-15T14:00:00.000Z',
      },
      {
        id: 'task_004_3',
        prompt: '生成地下黑客酒吧的内景，全息投影菜单，改造人调酒师，角落里有人在进行数据交易',
        referenceImages: [],
        requirements: '室内光线昏暗，以紫色和蓝色为主调，全息投影要有轻微的闪烁和噪点效果',
        creatorEmail: 'neondream@example.com',
        status: 'published' as const,
        duration: 18,
        order: 2,
        createdAt: '2025-12-18T16:30:00.000Z',
        updatedAt: '2025-12-18T16:30:00.000Z',
      },
      {
        id: 'task_004_4',
        prompt: '制作少女入侵企业数据中心的虚拟现实场景，数据流化为光河，防火墙化为巨大的几何屏障',
        referenceImages: [],
        requirements: '虚拟空间风格参考《攻壳机动队》，数据可视化要有科技美感，少女的虚拟化身要酷炫',
        creatorEmail: 'neondream@example.com',
        status: 'draft' as const,
        duration: 25,
        order: 3,
        createdAt: '2025-12-20T11:00:00.000Z',
        updatedAt: '2025-12-20T11:00:00.000Z',
      },
    ],
  },
  {
    id: 'proj_005',
    title: '小狐狸的奇幻旅程',
    description: '<p>一只小狐狸穿越四季森林寻找传说中的星光花。温暖治愈的AI动画短片，适合全年龄观众。</p>',
    category: '动画',
    targetDuration: 180,
    currentDuration: 120,
    coverImage: '',
    creatorId: 'seed_user_5',
    creatorName: '童话工坊',
    createdAt: '2026-01-05T11:00:00.000Z',
    status: 'active',
    participantsCount: 19,
    logs: [],
    tasks: [
      {
        id: 'task_005_1',
        prompt: '小狐狸在雪地中发现一朵发光的花苞，好奇地用鼻子轻触，花苞绽放出星光碎片飘向天空',
        referenceImages: [],
        requirements: '画风温暖可爱，小狐狸毛发蓬松，雪地要有柔和的蓝色阴影，星光碎片是暖金色',
        creatorEmail: 'fairytale@example.com',
        status: 'published' as const,
        duration: 10,
        order: 0,
        createdAt: '2026-01-08T09:00:00.000Z',
        updatedAt: '2026-01-08T09:00:00.000Z',
      },
      {
        id: 'task_005_2',
        prompt: '小狐狸跟随萤火虫群穿过夜晚的竹林，竹叶间洒下月光，萤火虫形成一条发光的引路线',
        referenceImages: [],
        requirements: '氛围要梦幻宁静，竹林有轻微的风吹动效果，萤火虫的光要有温暖的黄绿色',
        creatorEmail: 'fairytale@example.com',
        status: 'published' as const,
        duration: 12,
        order: 1,
        createdAt: '2026-01-10T15:00:00.000Z',
        updatedAt: '2026-01-10T15:00:00.000Z',
      },
    ],
  },
  {
    id: 'proj_006',
    title: 'AI时代的教育革命',
    description: '<p>探索人工智能如何重塑全球教育体系的纪录片。从乡村学校到顶尖大学，AI正在改变每一个课堂。</p>',
    category: '商业制作',
    targetDuration: 320,
    currentDuration: 220,
    coverImage: '',
    creatorId: 'seed_user_6',
    creatorName: '未来教育',
    createdAt: '2025-11-28T16:00:00.000Z',
    status: 'active',
    participantsCount: 33,
    logs: [],
    tasks: [
      {
        id: 'task_006_1',
        prompt: '生成未来教室的概念场景：学生佩戴AR眼镜，虚拟恐龙在教室中行走，老师通过手势控制全息教学内容',
        referenceImages: [],
        requirements: '教室设计要现代但不过于科幻，学生表情要专注而兴奋，AR内容要有半透明质感',
        creatorEmail: 'futureedu@example.com',
        status: 'published' as const,
        duration: 15,
        order: 0,
        createdAt: '2025-12-01T10:00:00.000Z',
        updatedAt: '2025-12-01T10:00:00.000Z',
      },
      {
        id: 'task_006_2',
        prompt: '制作AI辅导机器人与学生一对一互动的温馨场景，机器人用全息投影展示数学公式的可视化解释',
        referenceImages: [],
        requirements: '机器人设计要友善可爱不吓人，学生是一个约10岁的孩子，场景在温馨的家庭书房中',
        creatorEmail: 'futureedu@example.com',
        status: 'published' as const,
        duration: 12,
        order: 1,
        createdAt: '2025-12-05T14:00:00.000Z',
        updatedAt: '2025-12-05T14:00:00.000Z',
      },
    ],
  },
  {
    id: 'proj_007',
    title: '时间旅行者的日记',
    description: '<p>一位物理学家意外发明了时间机器，却发现每次旅行都会改变现实。一部关于选择与命运的科幻哲思短片。</p>',
    category: '电影',
    targetDuration: 400,
    currentDuration: 48,
    coverImage: '',
    creatorId: 'seed_user_7',
    creatorName: '时空工作室',
    createdAt: '2026-01-20T07:30:00.000Z',
    status: 'active',
    participantsCount: 8,
    logs: [],
    tasks: [
      {
        id: 'task_007_1',
        prompt: '生成时间机器启动的瞬间：实验室中央的球形装置开始旋转，周围的空气扭曲，时钟指针疯狂倒转',
        referenceImages: [],
        requirements: '实验室风格偏复古科学家工作室，时间扭曲效果要有视觉冲击力，色调从暖色渐变到冷色',
        creatorEmail: 'timespace@example.com',
        status: 'published' as const,
        duration: 15,
        order: 0,
        createdAt: '2026-01-22T10:00:00.000Z',
        updatedAt: '2026-01-22T10:00:00.000Z',
      },
      {
        id: 'task_007_2',
        prompt: '物理学家穿越到古代中国长安城的街道上，身着现代衣物与唐朝行人擦肩而过，周围是繁华的市集',
        referenceImages: [],
        requirements: '古今对比要鲜明，长安城的还原要有历史感，物理学家表情要有震惊和好奇',
        creatorEmail: 'timespace@example.com',
        status: 'published' as const,
        duration: 18,
        order: 1,
        createdAt: '2026-01-25T08:30:00.000Z',
        updatedAt: '2026-01-25T08:30:00.000Z',
      },
    ],
  },
  {
    id: 'proj_008',
    title: '丝绸之路：千年回响',
    description: '<p>用AI重现古代丝绸之路的繁华景象，从长安到罗马，跨越千年的文明交汇。</p>',
    category: '公益',
    targetDuration: 440,
    currentDuration: 440,
    coverImage: '',
    creatorId: 'seed_user_8',
    creatorName: '历史光影',
    createdAt: '2025-09-15T12:00:00.000Z',
    status: 'completed',
    participantsCount: 67,
    logs: [],
    tasks: [
      {
        id: 'task_008_1',
        prompt: '重现唐代长安城西市的繁忙景象，各国商人交易丝绸、香料和珠宝，驼队正在装货准备出发',
        referenceImages: [],
        requirements: '场景要宏大热闹，人物服饰要符合唐代特征，商品种类丰富多样',
        creatorEmail: 'historylight@example.com',
        status: 'completed' as const,
        contributorName: '丝路行者',
        duration: 20,
        order: 0,
        createdAt: '2025-09-20T10:00:00.000Z',
        updatedAt: '2025-10-15T14:00:00.000Z',
      },
      {
        id: 'task_008_2',
        prompt: '驼队穿越塔克拉玛干沙漠的壮观镜头，夕阳下驼铃声声，沙丘绵延至天际线',
        referenceImages: [],
        requirements: '光影效果要突出沙漠的壮美，驼队规模要大，有航拍俯瞰的视角感',
        creatorEmail: 'historylight@example.com',
        status: 'completed' as const,
        contributorName: '大漠孤烟',
        duration: 15,
        order: 1,
        createdAt: '2025-09-25T11:00:00.000Z',
        updatedAt: '2025-10-20T09:00:00.000Z',
      },
    ],
  },
];

export default function SeedPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [seeded, setSeeded] = useState(false);

  const seedData = () => {
    try {
      // 读取现有项目
      const existing = localStorage.getItem('projects');
      const existingProjects = existing ? JSON.parse(existing) : [];
      
      // 过滤掉已存在的种子项目
      const newProjects = sampleProjects.filter(
        sp => !existingProjects.some((ep: any) => ep.id === sp.id)
      );

      if (newProjects.length === 0) {
        setStatus('示例数据已存在，无需重复添加');
        setSeeded(true);
        return;
      }

      const merged = [...existingProjects, ...newProjects];
      localStorage.setItem('projects', JSON.stringify(merged));
      setStatus(`成功添加 ${newProjects.length} 个示例项目`);
      setSeeded(true);
    } catch (err) {
      setStatus('添加失败: ' + String(err));
    }
  };

  const clearSeedData = () => {
    try {
      const existing = localStorage.getItem('projects');
      const existingProjects = existing ? JSON.parse(existing) : [];
      const seedIds = sampleProjects.map(p => p.id);
      const filtered = existingProjects.filter((p: any) => !seedIds.includes(p.id));
      localStorage.setItem('projects', JSON.stringify(filtered));
      setStatus('已清除示例数据');
      setSeeded(false);
    } catch (err) {
      setStatus('清除失败: ' + String(err));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#e8e6e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>填充示例数据</h1>
        <p style={{ color: '#8a8880', marginBottom: 32 }}>向页面注入 {sampleProjects.length} 个示例项目（含 {sampleProjects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0)} 个任务），用于预览页面效果</p>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
          <button
            onClick={seedData}
            style={{ padding: '12px 32px', background: '#c9a227', color: '#0a0a0b', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
          >
            注入示例数据
          </button>
          <button
            onClick={clearSeedData}
            style={{ padding: '12px 32px', background: 'transparent', color: '#8a8880', border: '1px solid #2a2a2d', borderRadius: 8, cursor: 'pointer' }}
          >
            清除示例数据
          </button>
        </div>

        {status && (
          <p style={{ color: '#c9a227', marginBottom: 24 }}>{status}</p>
        )}

        {seeded && (
          <button
            onClick={() => router.push('/')}
            style={{ padding: '12px 32px', background: 'transparent', color: '#c9a227', border: '1px solid #c9a227', borderRadius: 8, cursor: 'pointer' }}
          >
            返回首页查看效果
          </button>
        )}
      </div>
    </div>
  );
}
