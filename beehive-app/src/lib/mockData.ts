export const MOCK_USERS = [
    { id: 'u1', username: 'Colincao', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' },
    { id: 'u2', username: 'AliceWang', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { id: 'u3', username: 'NeoTech', avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150' },
    { id: 'u4', username: 'Artisan_X', avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=150' }
];

export const MOCK_PROJECTS = [
    {
        id: 'p1',
        title: '赛博朋克城市宣传动画片',
        description: '我们需要一支能够制作赛博朋克城市背景和角色动作的团队...',
        category: '动画',
        status: 'in_progress',
        current_duration: 120,
        target_duration: 300,
        participantsCount: 12,
        cover_image: 'https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&q=80&w=500', // Neon city
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: MOCK_USERS[1]
    },
    {
        id: 'p2',
        title: '「归心」大电影概念预告',
        description: '一个关于家庭和远方的微电影预告片募集镜头...',
        category: '电影',
        status: 'in_progress',
        current_duration: 80,
        target_duration: 120,
        participantsCount: 5,
        cover_image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=500', // Film camera
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: MOCK_USERS[0]
    },
    {
        id: 'p3',
        title: '品牌年度发布会视觉包装',
        description: '急需懂C4D和AE的特效师，包装5个产品的出场动画。',
        category: '商业制作',
        status: 'completed',
        current_duration: 60,
        target_duration: 60,
        participantsCount: 3,
        cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=500', // Event stage
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: MOCK_USERS[2]
    },
    {
        id: 'p4',
        title: '极地环境保护公益短剧',
        description: '号召关注冰川融化问题，招募志愿者配音。',
        category: '公益',
        status: 'in_progress',
        current_duration: 15,
        target_duration: 180,
        participantsCount: 8,
        cover_image: 'https://images.unsplash.com/photo-1588602656910-449e7cf9336d?auto=format&fit=crop&q=80&w=500', // Glacier
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: MOCK_USERS[3]
    },
    {
        id: 'p5',
        title: '独立游戏《矩阵降临》开头CG',
        description: '寻求原画师和分镜师的合作。',
        category: '动画',
        status: 'in_progress',
        current_duration: 0,
        target_duration: 90,
        participantsCount: 1,
        cover_image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=500', // Retro games
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: MOCK_USERS[0]
    },
    {
        id: 'p6',
        title: '「夏日狂想曲」音乐MV',
        description: '招募剪辑师将大量海边碎片混剪成唯美MV。',
        category: '其他',
        status: 'in_progress',
        current_duration: 30,
        target_duration: 200,
        participantsCount: 4,
        cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=500', // beach
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        profiles: MOCK_USERS[1]
    }
];

export const MOCK_TASKS = [
    {
        id: 't1',
        title: '场景3D建模 (科幻城市)',
        cover_image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=500',
    },
    {
        id: 't2',
        title: '电影预告片混剪 (要求节奏感强)',
        cover_image: 'https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?auto=format&fit=crop&q=80&w=500',
    },
    {
        id: 't3',
        title: '5秒钟水滴特效流体模拟 (Houdini)',
        cover_image: 'https://images.unsplash.com/photo-1500673322473-b541ba3dd0b1?auto=format&fit=crop&q=80&w=500',
    },
    {
        id: 't4',
        title: '外星语环境音效设计',
        cover_image: 'https://images.unsplash.com/photo-1516280440502-a1b7da268ea8?auto=format&fit=crop&q=80&w=500',
    },
    {
        id: 't5',
        title: '2D女主角奔跑循环动画 (帧动画)',
        cover_image: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&q=80&w=500',
    },
    {
        id: 't6',
        title: '大促广告：金币掉落合成 (AE)',
        cover_image: 'https://images.unsplash.com/photo-1579621970588-a3f5ce599ac9?auto=format&fit=crop&q=80&w=500',
    },
    {
        id: 't7',
        title: '角色配音：清冷大女主声线',
        cover_image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80&w=500',
    },
    {
        id: 't8',
        title: '短片最终调色 (达芬奇)',
        cover_image: 'https://images.unsplash.com/photo-1620023136893-6bda7d3c52a3?auto=format&fit=crop&q=80&w=500',
    }
];
