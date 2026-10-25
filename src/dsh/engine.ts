/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DeepSeek Harness (dsh) Core Logic Engine
 * Pure logic for audit rules, attribution metrics, and command parsing.
 */

export type SocialPlatform = 'xiaohongshu' | 'douyin' | 'wechat' | 'bilibili' | 'weibo';

export type AuthStatus = 'authenticated' | 'expired' | 'unauthenticated';

export interface SocialAccount {
  id: string;
  accountName: string;
  platformType: SocialPlatform;
  authStatus: AuthStatus;
  handle: string;
  followerCount: number;
  lastSyncedAt: string;
  authExpiresAt: string;
  avatarUrl?: string;
  notes?: string;
}

export interface AccountStats {
  total: number;
  authenticated: number;
  expired: number;
  unauthenticated: number;
  totalFollowers: number;
}

export interface AuditViolation {
  word: string;
  category: 'advertising_law' | 'absolute_claim' | 'platform_sensitive' | 'over_promise';
  severity: 'danger' | 'warning' | 'info';
  reason: string;
  suggestion: string;
  index: number;
}

export interface QualityReport {
  score: number;
  passed: boolean;
  canPublish: boolean;
  violations: AuditViolation[];
  hookStrength: {
    hookText: string;
    level: 'excellent' | 'adequate' | 'weak';
    score: number;
    tip: string;
  };
  metrics: {
    wordCount: number;
    emojiCount: number;
    paragraphCount: number;
    estimatedReadSeconds: number;
  };
  safeText: string;
}

export interface AccountPersona {
  id: string;
  name: string;
  handle: string;
  niche: string;
  avatarUrl: string;
  tone: 'humorous' | 'sharp_professional' | 'warm_companion' | 'storytelling' | 'analytical';
  targetAudience: string;
  catchphrases: string[];
  tabooTopics: string[];
  memoryFewShots: Array<{
    id: string;
    topic: string;
    hook: string;
    keyLearning: string;
    viralMetric: string;
    timestamp: string;
  }>;
}

export interface PostAttributionData {
  id: string;
  title: string;
  platform: SocialPlatform;
  publishTime: string;
  views: number;
  likes: number;
  comments: number;
  favorites: number;
  shares: number;
  newFollowers: number;
  retentionRate?: number; // 完播率 (0-100)
}

export interface AttributionInsight {
  engagementRate: number; // 互动率 %
  likeToViewRatio: number; // 点赞率 %
  saveToLikeRatio: number; // 藏赞比 (小红书核心爆款指标)
  conversionRate: number; // 涨粉转化率 ‱
  grade: 'S' | 'A' | 'B' | 'C';
  viralDrivers: string[];
  dragFactors: string[];
  keyActionableRule: string;
}

// 广告法违禁词与社媒敏感词词典
const FORBIDDEN_RULES: Array<{
  pattern: RegExp;
  category: AuditViolation['category'];
  severity: AuditViolation['severity'];
  reason: string;
  suggestion: string;
}> = [
  {
    pattern: /(国家级|世界级|最高级|第一品牌|全网第一|顶尖首位)/g,
    category: 'advertising_law',
    severity: 'danger',
    reason: '违反《新广告法》第九条：使用“国家级”、“最高级”、“最佳”等绝对化用语',
    suggestion: '业界好评 / 头部梯队 / 广受认可'
  },
  {
    pattern: /(100%有效|根治|治愈|永不复发|包治百病)/g,
    category: 'over_promise',
    severity: 'danger',
    reason: '虚假与绝对化承诺，极易触发平台降权与下架',
    suggestion: '显著改善 / 大概率缓解 / 经验证有效'
  },
  {
    pattern: /(最优秀|顶级|极致|首选|唯一|史无前例|绝无仅有)/g,
    category: 'absolute_claim',
    severity: 'warning',
    reason: '涉及绝对化宣传极限词，平台审核可能限制流量',
    suggestion: '出色 / 深度打磨 / 难得一见'
  },
  {
    pattern: /(保本保收益|稳赚不赔|日入过万|零风险暴富)/g,
    category: 'over_promise',
    severity: 'danger',
    reason: '金融/创富类违规承诺，容易导致账号被封禁',
    suggestion: '建立可持续复利 / 探索副业路径'
  },
  {
    pattern: /(全网首发|独家内幕|惊天秘密)/g,
    category: 'platform_sensitive',
    severity: 'warning',
    reason: '低俗夸大党与标题党用语，平台算法可能降权',
    suggestion: '抢先拆解 / 深度观察'
  },
  {
    pattern: /(赶紧转发给朋友|强制点赞|不点赞不是中国人)/g,
    category: 'platform_sensitive',
    severity: 'danger',
    reason: '违规诱导分享与道德绑架互动，违背各平台社区规范',
    suggestion: '如果对你有帮助，欢迎收藏备用'
  }
];

/**
 * 文本质量与合规性审查
 */
export function auditContentQuality(text: string, platform: SocialPlatform = 'xiaohongshu'): QualityReport {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      passed: false,
      canPublish: false,
      violations: [],
      hookStrength: {
        hookText: '',
        level: 'weak',
        score: 0,
        tip: '请输入文案内容进行检测'
      },
      metrics: {
        wordCount: 0,
        emojiCount: 0,
        paragraphCount: 0,
        estimatedReadSeconds: 0
      },
      safeText: ''
    };
  }

  const violations: AuditViolation[] = [];
  let safeText = text;

  // 1. 规则词匹配
  for (const rule of FORBIDDEN_RULES) {
    const matches = [...text.matchAll(rule.pattern)];
    for (const match of matches) {
      if (match.index !== undefined) {
        violations.push({
          word: match[0],
          category: rule.category,
          severity: rule.severity,
          reason: rule.reason,
          suggestion: rule.suggestion,
          index: match.index
        });
      }
    }
  }

  // 排序并替换建议
  violations.sort((a, b) => b.index - a.index);
  for (const v of violations) {
    if (v.severity === 'danger' || v.severity === 'warning') {
      const regex = new RegExp(v.word, 'g');
      safeText = safeText.replace(regex, v.suggestion.split('/')[0].trim());
    }
  }

  // 2. 钩子评估（前60个字符）
  const hookCandidate = text.slice(0, 60).split('\n')[0] || '';
  const hasQuestion = /[？?]|怎么|为什么|凭什么|真的吗/i.test(hookCandidate);
  const hasContrast = /但是|原来|居然|千万别|反差|避坑|真相/i.test(hookCandidate);
  const hasNumbers = /\d+/.test(hookCandidate);
  
  let hookScore = 50;
  if (hasQuestion) hookScore += 18;
  if (hasContrast) hookScore += 20;
  if (hasNumbers) hookScore += 12;
  if (hookCandidate.length >= 10 && hookCandidate.length <= 32) hookScore += 10;
  hookScore = Math.min(100, Math.max(30, hookScore));

  const hookLevel: QualityReport['hookStrength']['level'] = 
    hookScore >= 80 ? 'excellent' : hookScore >= 60 ? 'adequate' : 'weak';

  const hookTip = hookLevel === 'excellent' 
    ? '前置钩子具有强烈悬念与反差，黄金3秒抓人效果优秀。'
    : hookLevel === 'adequate'
    ? '钩子信息传达明确，可尝试加入数字佐证或更强的痛点对比。'
    : '前三秒吸引力偏弱，建议使用“反常识结论”、“数字避坑”或“高共鸣提问”开头。';

  // 3. 统计基础指标
  const wordCount = text.length;
  // Emoji regex
  const emojiMatches = text.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu);
  const emojiCount = emojiMatches ? emojiMatches.length : 0;
  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;
  const estimatedReadSeconds = Math.max(5, Math.round(wordCount / 5)); // 约每秒5字

  // 4. 平台特化加减分
  let baseScore = 95;
  const dangerCount = violations.filter(v => v.severity === 'danger').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;

  baseScore -= dangerCount * 30;
  baseScore -= warningCount * 12;

  // 小红书偏好适当Emoji与合理段落
  if (platform === 'xiaohongshu') {
    if (emojiCount < 2 && wordCount > 80) baseScore -= 6;
    if (paragraphCount < 3 && wordCount > 150) baseScore -= 8;
  }

  // 抖音短视频口播不宜过长
  if (platform === 'douyin' && wordCount > 800) {
    baseScore -= 10;
  }

  const finalScore = Math.max(10, Math.min(100, Math.round(baseScore * 0.7 + hookScore * 0.3)));
  const canPublish = dangerCount === 0 && finalScore >= 60;
  const passed = dangerCount === 0 && warningCount === 0;

  return {
    score: finalScore,
    passed,
    canPublish,
    violations,
    hookStrength: {
      hookText: hookCandidate,
      level: hookLevel,
      score: hookScore,
      tip: hookTip
    },
    metrics: {
      wordCount,
      emojiCount,
      paragraphCount,
      estimatedReadSeconds
    },
    safeText
  };
}

/**
 * 计算社媒数据归因洞察
 */
export function calculateAttributionInsight(data: PostAttributionData): AttributionInsight {
  const views = Math.max(1, data.views);
  const engagementSum = data.likes + data.comments + data.favorites + data.shares;
  const engagementRate = Number(((engagementSum / views) * 100).toFixed(2));
  const likeToViewRatio = Number(((data.likes / views) * 100).toFixed(2));
  const saveToLikeRatio = data.likes > 0 ? Number((data.favorites / data.likes).toFixed(2)) : 0;
  const conversionRate = Number(((data.newFollowers / views) * 10000).toFixed(2));

  const viralDrivers: string[] = [];
  const dragFactors: string[] = [];

  // 判断等级与驱动力
  if (engagementRate >= 8.0 || saveToLikeRatio >= 0.8) {
    viralDrivers.push('超高收藏点赞比：干货密度与工具价值极强，受众有高意向存留');
  }
  if (likeToViewRatio >= 5.0) {
    viralDrivers.push('高点击认同率：视觉封面与第一句反差引起强烈正向认同');
  }
  if (data.comments > data.likes * 0.15) {
    viralDrivers.push('热烈评论互动区：文案结尾留白或争议点引发粉丝主动开麦');
  }
  if (data.shares > data.likes * 0.2) {
    viralDrivers.push('高裂变社交币：内容提供了极强的社交谈资或替用户表达心声');
  }
  if (data.retentionRate && data.retentionRate >= 45) {
    viralDrivers.push('黄金完播留存：前3秒钩子强，中段节奏紧凑无尿点');
  }

  // 瓶颈排查
  if (likeToViewRatio < 1.5) {
    dragFactors.push('点赞转化率偏低：封面选题被点入后内容不及预期，或未在痛点给解药');
  }
  if (saveToLikeRatio < 0.2 && data.platform === 'xiaohongshu') {
    dragFactors.push('收藏比偏弱：内容偏泛娱乐观赏，缺乏“抄作业”式的结构化步骤');
  }
  if (data.retentionRate && data.retentionRate < 20) {
    dragFactors.push('中段流失严重：开头前5秒后信息密度下降，废话或铺垫过长');
  }
  if (data.newFollowers < 5 && views > 2000) {
    dragFactors.push('吸粉转化乏力：缺乏鲜明人设记忆点，未引导关注同类系列');
  }

  // 评级
  let grade: AttributionInsight['grade'] = 'B';
  if (engagementRate >= 7.5 || (views > 10000 && likeToViewRatio >= 4.0)) {
    grade = 'S';
  } else if (engagementRate >= 4.5 || saveToLikeRatio >= 0.5) {
    grade = 'A';
  } else if (engagementRate < 2.0 && likeToViewRatio < 1.0) {
    grade = 'C';
  }

  // 总结提炼一条可沉淀进记忆库的经验
  let keyActionableRule = '';
  if (grade === 'S' || grade === 'A') {
    keyActionableRule = `验证成功的爆款范式：结合“${data.title.slice(0, 14)}”的${saveToLikeRatio >= 0.5 ? '高密度干货拆解' : '反差悬念叙事'}，同类选题后续可复制该钩子结构。`;
  } else {
    keyActionableRule = `优化迭代项：下次创作需在前3秒直接抛出“明确利益点/痛点反差”，并在文末增加“提问开麦互动”。`;
  }

  return {
    engagementRate,
    likeToViewRatio,
    saveToLikeRatio,
    conversionRate,
    grade,
    viralDrivers: viralDrivers.length > 0 ? viralDrivers : ['数据表现稳定，符合日常基准流量池'],
    dragFactors: dragFactors.length > 0 ? dragFactors : ['未发现显著致命拖累项'],
    keyActionableRule
  };
}

/**
 * 插件快捷命令解析器 (DeepSeek Harness Slash Commands)
 */
export function parsePluginCommand(rawInput: string): {
  isCommand: boolean;
  plugin: 'trend_radar' | 'content_engine' | 'quality_gate' | 'publisher' | 'attribution_lab' | null;
  commandName: string;
  args: string;
} {
  const trimmed = rawInput.trim();
  if (!trimmed.startsWith('/')) {
    return {
      isCommand: false,
      plugin: null,
      commandName: '',
      args: trimmed
    };
  }

  const parts = trimmed.slice(1).split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  switch (cmd) {
    case 'trend':
    case 'radar':
    case 'hot':
      return { isCommand: true, plugin: 'trend_radar', commandName: 'trend', args };
    case 'craft':
    case 'write':
    case 'generate':
      return { isCommand: true, plugin: 'content_engine', commandName: 'craft', args };
    case 'check':
    case 'audit':
    case 'gate':
      return { isCommand: true, plugin: 'quality_gate', commandName: 'check', args };
    case 'publish':
    case 'preview':
      return { isCommand: true, plugin: 'publisher', commandName: 'publish', args };
    case 'recap':
    case 'attr':
    case 'review':
      return { isCommand: true, plugin: 'attribution_lab', commandName: 'recap', args };
    default:
      return { isCommand: true, plugin: null, commandName: cmd, args };
  }
}

/**
 * 校验社交账号输入表单
 */
export function validateSocialAccount(account: Partial<SocialAccount>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!account.accountName || account.accountName.trim().length === 0) {
    errors.push('账号名称不能为空');
  } else if (account.accountName.trim().length > 30) {
    errors.push('账号名称不能超过30个字符');
  }

  if (!account.platformType) {
    errors.push('请选择社媒平台类型');
  }

  if (!account.authStatus) {
    errors.push('请指定账号授权状态');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 过滤与排序社交账号列表
 */
export function filterSocialAccounts(
  accounts: SocialAccount[],
  query: string,
  platform: 'all' | SocialPlatform = 'all',
  status: 'all' | AuthStatus = 'all'
): SocialAccount[] {
  const q = query.trim().toLowerCase();
  return accounts.filter(acc => {
    const matchesPlatform = platform === 'all' || acc.platformType === platform;
    const matchesStatus = status === 'all' || acc.authStatus === status;
    const matchesQuery = !q || 
      acc.accountName.toLowerCase().includes(q) ||
      acc.handle.toLowerCase().includes(q) ||
      (acc.notes && acc.notes.toLowerCase().includes(q));

    return matchesPlatform && matchesStatus && matchesQuery;
  });
}

/**
 * 汇总多账号健康度统计指标
 */
export function calculateAccountStats(accounts: SocialAccount[]): AccountStats {
  const stats: AccountStats = {
    total: accounts.length,
    authenticated: 0,
    expired: 0,
    unauthenticated: 0,
    totalFollowers: 0
  };

  for (const acc of accounts) {
    if (acc.authStatus === 'authenticated') {
      stats.authenticated += 1;
    } else if (acc.authStatus === 'expired') {
      stats.expired += 1;
    } else {
      stats.unauthenticated += 1;
    }
    stats.totalFollowers += acc.followerCount || 0;
  }

  return stats;
}
