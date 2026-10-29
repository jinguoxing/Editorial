/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  auditContentQuality, 
  calculateAttributionInsight, 
  parsePluginCommand,
  validateSocialAccount,
  filterSocialAccounts,
  calculateAccountStats,
  loadDraftsFromStorage,
  sanitizeDraftIndex,
  serializeDraftsForStorage,
  toggleDraftTag,
  filterDraftsByTag,
  getDraftTagCounts
} from './engine.ts';

test('auditContentQuality flags dangerous advertising law violations', () => {
  const text = '这是全国第一品牌的自媒体课程，100%有效带你日入过万，赶紧转发给朋友！';
  const report = auditContentQuality(text, 'xiaohongshu');

  assert.equal(report.passed, false, 'Report should fail due to forbidden words');
  assert.equal(report.canPublish, false, 'Cannot publish with danger severity');
  assert.ok(report.violations.length >= 3, 'Should catch at least 3 violations');
  
  const hasFirstBrand = report.violations.some(v => v.word.includes('第一品牌'));
  assert.ok(hasFirstBrand, 'Should catch 第一品牌');

  assert.ok(report.safeText.includes('业界好评') || !report.safeText.includes('第一品牌'), 'Safe text should replace danger words');
});

test('auditContentQuality passes clean content with a good hook', () => {
  const text = `普通人做自媒体，为什么90%都死在第1个月？今天拆解真相。
很多人一上来就砸钱买设备，但是真正拉开差距的是选题的网感与复盘！
这里整理了3个关键动作：
1. 建立垂直对标库
2. 每天追踪10个飙升词
3. 严格把关前3秒黄金钩子
如果你也在摸索，欢迎收藏备用。`;

  const report = auditContentQuality(text, 'xiaohongshu');
  assert.ok(report.canPublish, 'Clean content should be publishable');
  assert.equal(report.violations.filter(v => v.severity === 'danger').length, 0);
  assert.ok(report.hookStrength.score >= 70, 'Good hook with question and numbers should score high');
});

test('calculateAttributionInsight correctly rates viral post and provides insights', () => {
  const post = {
    id: 'post-101',
    title: '为什么小红书高粉博主都在偷偷用的5个提效神器？',
    platform: 'xiaohongshu' as const,
    publishTime: '2026-10-10 18:30',
    views: 45000,
    likes: 3200,
    comments: 480,
    favorites: 2900,
    shares: 800,
    newFollowers: 320,
    retentionRate: 52
  };

  const insight = calculateAttributionInsight(post);
  assert.equal(insight.grade, 'S', 'High engagement post should receive S grade');
  assert.ok(insight.engagementRate > 10, 'Engagement rate should be > 10%');
  assert.ok(insight.saveToLikeRatio > 0.8, 'Save-to-like ratio should be high');
  assert.ok(insight.viralDrivers.length > 0, 'Should have positive viral drivers');
  assert.ok(insight.keyActionableRule.includes('爆款范式'), 'Rule should formulate a winning paradigm');
});

test('parsePluginCommand handles slash commands accurately', () => {
  const cmd1 = parsePluginCommand('/trend 小红书 美妆护肤');
  assert.equal(cmd1.isCommand, true);
  assert.equal(cmd1.plugin, 'trend_radar');
  assert.equal(cmd1.args, '小红书 美妆护肤');

  const cmd2 = parsePluginCommand('/craft 职场干货 人设口播');
  assert.equal(cmd2.isCommand, true);
  assert.equal(cmd2.plugin, 'content_engine');

  const cmd3 = parsePluginCommand('我想写一篇关于AI提效的小红书笔记');
  assert.equal(cmd3.isCommand, false);
  assert.equal(cmd3.plugin, null);
  assert.equal(cmd3.args, '我想写一篇关于AI提效的小红书笔记');
});

test('validateSocialAccount validates required fields', () => {
  const invalid = validateSocialAccount({ accountName: '' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.length >= 2, 'Should fail for missing name, platform and status');

  const valid = validateSocialAccount({
    accountName: '林学姐职场日记',
    platformType: 'xiaohongshu',
    authStatus: 'authenticated'
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
});

test('filterSocialAccounts filters by query, platform, and authStatus', () => {
  const accounts = [
    {
      id: 'acc-1',
      accountName: '极客喵玩数码',
      platformType: 'douyin' as const,
      authStatus: 'authenticated' as const,
      handle: '@geekmeow',
      followerCount: 125000,
      lastSyncedAt: '2026-10-14',
      authExpiresAt: '2026-12-31'
    },
    {
      id: 'acc-2',
      accountName: '林学姐职场笔记',
      platformType: 'xiaohongshu' as const,
      authStatus: 'expired' as const,
      handle: '@linmaster',
      followerCount: 84000,
      lastSyncedAt: '2026-10-12',
      authExpiresAt: '2026-10-13'
    },
    {
      id: 'acc-3',
      accountName: '每日科技观察',
      platformType: 'weibo' as const,
      authStatus: 'unauthenticated' as const,
      handle: '@techdaily',
      followerCount: 42000,
      lastSyncedAt: '2026-10-10',
      authExpiresAt: '2026-10-10'
    }
  ];

  const filteredByPlatform = filterSocialAccounts(accounts, '', 'douyin', 'all');
  assert.equal(filteredByPlatform.length, 1);
  assert.equal(filteredByPlatform[0].id, 'acc-1');

  const filteredByStatus = filterSocialAccounts(accounts, '', 'all', 'expired');
  assert.equal(filteredByStatus.length, 1);
  assert.equal(filteredByStatus[0].id, 'acc-2');

  const filteredByQuery = filterSocialAccounts(accounts, '极客', 'all', 'all');
  assert.equal(filteredByQuery.length, 1);
  assert.equal(filteredByQuery[0].accountName, '极客喵玩数码');

  const stats = calculateAccountStats(accounts);
  assert.equal(stats.total, 3);
  assert.equal(stats.authenticated, 1);
  assert.equal(stats.expired, 1);
  assert.equal(stats.unauthenticated, 1);
  assert.equal(stats.totalFollowers, 251000);
});

test('loadDraftsFromStorage recovers valid drafts and falls back safely', () => {
  const fallback = [{ id: 'd-1', content: '默认内容', title: '草稿1' }];

  // Null or empty string returns fallback
  assert.deepEqual(loadDraftsFromStorage(null, fallback), fallback);
  assert.deepEqual(loadDraftsFromStorage('', fallback), fallback);

  // Corrupted JSON returns fallback
  assert.deepEqual(loadDraftsFromStorage('{bad_json', fallback), fallback);

  // Empty array returns fallback
  assert.deepEqual(loadDraftsFromStorage('[]', fallback), fallback);

  // Valid draft JSON recovers correctly
  const saved = [
    { id: 'd-saved-1', title: '小红书爆款标题', content: '这是用户编辑过的正文内容，自动保存成功！' }
  ];
  const serialized = serializeDraftsForStorage(saved);
  const loaded = loadDraftsFromStorage(serialized, fallback);
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].id, 'd-saved-1');
  assert.equal(loaded[0].content, '这是用户编辑过的正文内容，自动保存成功！');
});

test('sanitizeDraftIndex keeps index bounded and valid', () => {
  assert.equal(sanitizeDraftIndex(undefined, 3), 0);
  assert.equal(sanitizeDraftIndex(null, 3), 0);
  assert.equal(sanitizeDraftIndex(-5, 3), 0);
  assert.equal(sanitizeDraftIndex(1, 3), 1);
  assert.equal(sanitizeDraftIndex(2, 3), 2);
  assert.equal(sanitizeDraftIndex(99, 3), 2);
  assert.equal(sanitizeDraftIndex(0, 0), 0);
});

test('toggleDraftTag adds, removes, and deduplicates tags correctly', () => {
  const initial: string[] = ['Inspiration'];
  
  // Adding Commercial tag
  const step1 = toggleDraftTag(initial, 'Commercial');
  assert.deepEqual(step1, ['Inspiration', 'Commercial']);

  // Adding Review Needed
  const step2 = toggleDraftTag(step1, 'Review Needed');
  assert.deepEqual(step2, ['Inspiration', 'Commercial', 'Review Needed']);

  // Removing Inspiration
  const step3 = toggleDraftTag(step2, 'Inspiration');
  assert.deepEqual(step3, ['Commercial', 'Review Needed']);

  // Empty string does not mutate
  const step4 = toggleDraftTag(step3, '  ');
  assert.deepEqual(step4, ['Commercial', 'Review Needed']);

  // Undefined tags handles safely
  const step5 = toggleDraftTag(undefined, 'Personal');
  assert.deepEqual(step5, ['Personal']);
});

test('filterDraftsByTag filters drafts by category correctly', () => {
  const mockDrafts = [
    { id: '1', tags: ['Inspiration', 'Review Needed'] },
    { id: '2', tags: ['Commercial'] },
    { id: '3', tags: ['Personal', 'Inspiration'] },
    { id: '4', tags: [] }
  ];

  assert.equal(filterDraftsByTag(mockDrafts, 'all').length, 4);
  assert.equal(filterDraftsByTag(mockDrafts, 'Inspiration').length, 2);
  assert.equal(filterDraftsByTag(mockDrafts, 'Commercial').length, 1);
  assert.equal(filterDraftsByTag(mockDrafts, 'Review Needed').length, 1);
  assert.equal(filterDraftsByTag(mockDrafts, 'Personal').length, 1);
  assert.equal(filterDraftsByTag(mockDrafts, 'Nonexistent').length, 0);
});

test('getDraftTagCounts accurately summarizes category distributions', () => {
  const mockDrafts = [
    { id: '1', tags: ['Inspiration', 'Review Needed'] },
    { id: '2', tags: ['Commercial', 'Review Needed'] },
    { id: '3', tags: ['Personal'] }
  ];

  const counts = getDraftTagCounts(mockDrafts);
  assert.equal(counts.all, 3);
  assert.equal(counts['Inspiration'], 1);
  assert.equal(counts['Commercial'], 1);
  assert.equal(counts['Personal'], 1);
  assert.equal(counts['Review Needed'], 2);
});


