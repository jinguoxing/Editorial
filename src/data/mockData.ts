/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccountPersona, PostAttributionData, SocialPlatform, SocialAccount } from '../dsh/engine';

export interface TrendingTopic {
  id: string;
  platform: SocialPlatform;
  title: string;
  category: string;
  heatValue: string;
  growthRate: string;
  angleSuggestion: string;
  exampleHook: string;
  suggestedTags: string[];
}

export interface ContentDraft {
  id: string;
  title: string;
  platform: SocialPlatform;
  personaId: string;
  content: string;
  status: 'drafting' | 'audited' | 'approved' | 'published';
  updatedAt: string;
  hookStrength: 'excellent' | 'adequate' | 'weak';
  coverText: string;
  storyboard: Array<{ scene: number; visual: string; audioVoiceover: string }>;
  tags?: string[];
}

export const INITIAL_PERSONAS: AccountPersona[] = [
  {
    id: 'persona-lin',
    name: '职场干货林学姐',
    handle: '@LinWorkMaster',
    niche: '职场成长 / 效率工具 / 知识管理',
    avatarUrl: '/src/assets/images/creator_avatar_lin_1792028033207.jpg',
    tone: 'sharp_professional',
    targetAudience: '22-35岁一二线城市白领、数字游民、追求自驱成长的青年',
    catchphrases: ['底层逻辑', '低阻力闭环', '抄作业流程', '拒绝无效内卷'],
    tabooTopics: ['虚假暴富鸡汤', '过度煽动职场对立', '绝对化极限宣传'],
    memoryFewShots: [
      {
        id: 'mem-01',
        topic: '为什么聪明人从不把时间浪费在无意义汇报？',
        hook: '别把“听话”当竞争力！为什么大厂升职最快的，永远是懂得向上管理的狠人？',
        keyLearning: '前3秒直戳痛点与委屈，中段给具体行动框架（STAR模型），藏赞比高达 0.92',
        viralMetric: '12.4万播放 · 8400收藏',
        timestamp: '2026-09-18'
      },
      {
        id: 'mem-02',
        topic: '一人团队的一周时间分配SOP',
        hook: '不是你不够努力，而是你的精力管理还停留在学生时代。',
        keyLearning: '用对比表格呈现“精力充沛期 vs 低潮期”工作安排，受众截屏率极高',
        viralMetric: '8.9万播放 · 6100赞',
        timestamp: '2026-10-02'
      }
    ]
  },
  {
    id: 'persona-tech',
    name: '极客开箱喵',
    handle: '@GeekMeowLab',
    niche: '数码硬件 / AI黑科技 / 桌面美学',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tone: 'humorous',
    targetAudience: '18-30岁科技极客、数码爱好者、对前沿AI软硬件敏感人群',
    catchphrases: ['劝退还是冲？', '刀法精准', '纯主观实测', '话不多说直接上机'],
    tabooTopics: ['云评测', '过度吹捧无缺点软文'],
    memoryFewShots: [
      {
        id: 'mem-03',
        topic: 'AI本地化部署避坑指南',
        hook: '千万别信某些博主推荐的智商税配置！实测6套配置后的真金白银血泪史。',
        keyLearning: '前置跑分对比条形图，突出“少花2000元体验提升50%”，评论区争论热度极高',
        viralMetric: '23.8万播放 · 1.6万赞',
        timestamp: '2026-08-20'
      }
    ]
  }
];

export const TRENDING_TOPICS_SEED: TrendingTopic[] = [
  {
    id: 'trend-1',
    platform: 'xiaohongshu',
    title: 'AI工具重构自媒体全流程',
    category: '科技与自媒体',
    heatValue: '96.8万热度',
    growthRate: '+340%',
    angleSuggestion: '从“替代焦虑”转为“私有一人公司协同”，分享可落地的生产流',
    exampleHook: '别再到处搜AI指令了！真正拉开差距的，是这套把你人设喂饱的私有搭档工作流。',
    suggestedTags: ['#自媒体创业', '#AI生产力', '#一人公司', '#效率工具']
  },
  {
    id: 'trend-2',
    platform: 'xiaohongshu',
    title: '职场“情绪稳定”背后是流程兜底',
    category: '职场与心理',
    heatValue: '85.2万热度',
    growthRate: '+210%',
    angleSuggestion: '拒绝假装不生气，拆解如何建立工作防火墙与拒绝模板',
    exampleHook: '你不是脾气好，你只是习惯了当软柿子。今天教你体面拒绝不合理需求的3句话。',
    suggestedTags: ['#职场智慧', '#向上管理', '#打工人嘴替', '#深度思考']
  },
  {
    id: 'trend-3',
    platform: 'douyin',
    title: '普通人做个人IP的最少必要知识',
    category: '短视频运营',
    heatValue: '124.5万热度',
    growthRate: '+180%',
    angleSuggestion: '黄金3秒口播脚本 + 完播率设计，直击新人“有内容但没人看”痛点',
    exampleHook: '为什么你拍的视频没人看？因为你前3秒还在做自我介绍！快停手！',
    suggestedTags: ['#短视频干货', '#个人IP', '#自媒体起步', '#运营避坑']
  },
  {
    id: 'trend-4',
    platform: 'wechat',
    title: '为什么深度思考在这个时代成为稀缺资产？',
    category: '深度商业观察',
    heatValue: '54.0万阅读',
    growthRate: '+95%',
    angleSuggestion: '从碎片化消费反思，提供建立深度阅读与长内容笔记闭环的方法',
    exampleHook: '信息茧房越来越厚，懂得主动建立“高质量信息过滤器”的人正在默默拉开壁垒。',
    suggestedTags: ['#深度阅读', '#认知认知', '#长文精选', '#商业认知']
  },
  {
    id: 'trend-5',
    platform: 'bilibili',
    title: '从0打造桌面工作流：我的私有工作站搭建全记录',
    category: '数码装机/工作流',
    heatValue: '78.2万播放',
    growthRate: '+125%',
    angleSuggestion: '软硬件联动，强调“不是为了装机而装机，而是为了生产力无感流转”',
    exampleHook: '花了三个月迭代，终于搞定了这套无感切换的桌面工作台，带你看看我的私有配置。',
    suggestedTags: ['#桌面美学', '#生产力工具', '#极客日常', '#数字游民']
  }
];

export const INITIAL_DRAFTS: ContentDraft[] = [
  {
    id: 'draft-01',
    title: '自媒体新人常犯的3个致命误区（含排坑指南）',
    platform: 'xiaohongshu',
    personaId: 'persona-lin',
    hookStrength: 'excellent',
    coverText: '自媒体新手必看！\n为什么你天天日更还是0收益？',
    content: `普通人做自媒体，为什么90%都死在第1个月？今天拆解真相。 💡

很多人一上来就花几千块买设备、无脑日更，但是真正拉开差距的是“选题网感与闭环归因”！

整理了我的3个核心动作：
1️⃣ **别抓虚假热点，抓“情绪痛点”**：热榜不是拿来抄的，而是提炼读者在这个热点下的槽点；
2️⃣ **把广告法违禁词刻在脑子里**：千万别在文案写“最顶级”、“100%包过”，极易被平台隐形限流；
3️⃣ **发完必须算藏赞比**：藏赞比超过0.5，果断复制这套钩子再拆解3个相关选题！

如果对你也有启发，建议收藏备用，下期拆解我的工作流模板！📌

#自媒体干货 #新手自媒体 #内容创作者 #一人团队 #运营SOP`,
    status: 'audited',
    updatedAt: '2026-10-14 17:30',
    tags: ['Inspiration', 'Review Needed'],
    storyboard: [
      { scene: 1, visual: '高反差黑底白字封面：“为什么天天日更还是0流量？”', audioVoiceover: '普通人做自媒体，为什么90%都死在第1个月？' },
      { scene: 2, visual: '展示日常数据后台曲线图与红绿对比避坑点', audioVoiceover: '很多人拼体力日更，真正差距是这3个底层动作。' },
      { scene: 3, visual: '拆解藏赞比计算公式与行动SOP框架卡片', audioVoiceover: '发完必须做归因，藏赞比大于0.5就值得批量复制。' }
    ]
  },
  {
    id: 'draft-02',
    title: '【商单方案】某智能降噪耳机30秒口播脚本与实测',
    platform: 'douyin',
    personaId: 'persona-tech',
    hookStrength: 'excellent',
    coverText: '戴上它的瞬间，整条街的施工声都消失了？',
    content: `【前3秒吸睛】戴上它的瞬间，整条街的电钻声和地铁轰鸣直接消失了！
很多人问我千元内兼顾音质和降噪该选哪款？
今天不做云评测，直接去最吵的咖啡馆和施工现场实录给你听。
核心亮点拆解：
1. 双馈主动降噪深度达48dB，低频噪音过滤95%以上；
2. 单次续航10小时，搭配充电舱可连用4天；
3. 人体工学入耳设计，佩戴3小时毫无胀痛感。
下方小黄车有专属首发粉丝满减券，手慢无！`,
    status: 'drafting',
    updatedAt: '2026-10-15 11:20',
    tags: ['Commercial', 'Review Needed'],
    storyboard: [
      { scene: 1, visual: '室外嘈杂马路与戴上耳机的特写画面切换', audioVoiceover: '戴上它的瞬间，世界瞬间安静下来。' },
      { scene: 2, visual: '分贝仪实测波形图展示降噪效果', audioVoiceover: '实测降噪深度对比，数据不讲假话。' }
    ]
  },
  {
    id: 'draft-03',
    title: '北漂第5年：写给20岁自己的几句实话与职场复盘',
    platform: 'xiaohongshu',
    personaId: 'persona-lin',
    hookStrength: 'adequate',
    coverText: '如果能回到5年前，我绝不会把精力浪费在这3件事上',
    content: `北漂第5年，从刚毕业住合租隔断间，到如今搭建起自己的自由职业闭环。
这5年踩过的坑、流过的泪，总结成3句写给过去的实话：
🌱 1. **拒绝无意义讨好**：职场里真正能救你的，永远是你的不可替代性与专业闭环，而不是陪笑和随叫随到；
🌱 2. **建立属于自己的资产**：工资只是现金流，技能、人脉和个人IP才是能持续复利的底牌；
🌱 3. **保护你的注意力**：不要在消耗你的人事物上多看一眼，把精力留给自我迭代。
祝愿每一位赶路的你，都能在这个春天找到自己的节奏。`,
    status: 'approved',
    updatedAt: '2026-10-16 09:45',
    tags: ['Personal', 'Inspiration'],
    storyboard: [
      { scene: 1, visual: '深夜工位咖啡与城市夜景剪影', audioVoiceover: '如果能回到5年前，我想对那个焦虑的女孩说几句心里话。' },
      { scene: 2, visual: '手写笔记本与成长节点时间轴', audioVoiceover: '时间会淘汰伪勤奋，但不会亏待有目标的坚持。' }
    ]
  }
];

export const INITIAL_ATTRIBUTION_POSTS: PostAttributionData[] = [
  {
    id: 'post-01',
    title: '为什么聪明人从不把时间浪费在无意义汇报？',
    platform: 'xiaohongshu',
    publishTime: '2026-09-18 20:15',
    views: 124000,
    likes: 6200,
    comments: 890,
    favorites: 5800,
    shares: 1450,
    newFollowers: 1280,
    retentionRate: 58
  },
  {
    id: 'post-02',
    title: '建议收藏！一人团队做爆款的5个私藏神器',
    platform: 'xiaohongshu',
    publishTime: '2026-10-02 12:00',
    views: 89000,
    likes: 4100,
    comments: 320,
    favorites: 4900,
    shares: 780,
    newFollowers: 720,
    retentionRate: 46
  },
  {
    id: 'post-03',
    title: '最新AI数码开箱测评：这次真的把大厂干懵了？',
    platform: 'douyin',
    publishTime: '2026-10-08 19:40',
    views: 45000,
    likes: 1200,
    comments: 110,
    favorites: 240,
    shares: 90,
    newFollowers: 85,
    retentionRate: 22
  }
];

export const INITIAL_ACCOUNTS: SocialAccount[] = [
  {
    id: 'acc-1',
    accountName: '林学姐的职场干货',
    platformType: 'xiaohongshu',
    authStatus: 'authenticated',
    handle: '@LinWorkMaster',
    followerCount: 84200,
    lastSyncedAt: '2026-10-14 18:20',
    authExpiresAt: '2026-12-15',
    avatarUrl: '/src/assets/images/creator_avatar_lin_1792028033207.jpg',
    notes: '主理小红书职场生产力与知识管理赛道'
  },
  {
    id: 'acc-2',
    accountName: '林学姐说职场',
    platformType: 'douyin',
    authStatus: 'authenticated',
    handle: '@lin_career_pro',
    followerCount: 168000,
    lastSyncedAt: '2026-10-14 16:45',
    authExpiresAt: '2026-11-20',
    avatarUrl: '/src/assets/images/creator_avatar_lin_1792028033207.jpg',
    notes: '抖音短视频口播与直播切片同步'
  },
  {
    id: 'acc-3',
    accountName: '极客喵玩数码',
    platformType: 'bilibili',
    authStatus: 'authenticated',
    handle: 'UID: 39482910',
    followerCount: 92500,
    lastSyncedAt: '2026-10-13 21:10',
    authExpiresAt: '2026-12-31',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    notes: '长视频与深度软硬件评测大纲同步'
  },
  {
    id: 'acc-4',
    accountName: '墨策商业观察',
    platformType: 'wechat',
    authStatus: 'expired',
    handle: 'gh_8f93b2a8d1',
    followerCount: 35400,
    lastSyncedAt: '2026-10-10 11:30',
    authExpiresAt: '2026-10-12',
    avatarUrl: '',
    notes: '微信服务号公众号接口，授权已过期需要重新登录'
  },
  {
    id: 'acc-5',
    accountName: '极客数码前哨站',
    platformType: 'weibo',
    authStatus: 'unauthenticated',
    handle: '@GeekMeowWeibo',
    followerCount: 21800,
    lastSyncedAt: '2026-10-08 09:15',
    authExpiresAt: '2026-10-08',
    avatarUrl: '',
    notes: '微博开放平台待绑定 API Key'
  }
];
