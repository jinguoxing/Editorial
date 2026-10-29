/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  generateCleanMarkdown, 
  sanitizeMarkdownFilename, 
  PLATFORM_NAMES 
} from './markdownExporter.ts';
import { ContentDraft } from '../data/mockData.ts';
import { AccountPersona } from './engine.ts';

test('sanitizeMarkdownFilename cleans illegal characters and formats filename', () => {
  // Test special characters, slashes, illegal chars
  const fn1 = sanitizeMarkdownFilename('AI自媒体/爆款*标题?：如何做<测试>|', 'xiaohongshu');
  assert.equal(fn1, 'AI自媒体爆款标题如何做测试-xiaohongshu.md');

  // Test empty title fallback
  const fn2 = sanitizeMarkdownFilename('', 'douyin');
  assert.equal(fn2, 'content-draft-douyin.md');

  // Test undefined title and platform
  const fn3 = sanitizeMarkdownFilename(undefined, undefined);
  assert.equal(fn3, 'content-draft.md');

  // Test spaces replaced with dashes
  const fn4 = sanitizeMarkdownFilename('How to create 10x viral content in 2026', 'bilibili');
  assert.equal(fn4, 'How-to-create-10x-viral-content-in-2026-bilibili.md');
});

test('generateCleanMarkdown creates clean YAML frontmatter, headers, and sections', () => {
  const mockDraft: ContentDraft = {
    id: 'draft-test-1',
    title: '普通人做自媒体如何快速突破第1个万粉？',
    platform: 'xiaohongshu',
    personaId: 'persona-lin',
    content: `自媒体的核心不是死磕时长，而是建立高复用的人设和敏锐网感。\n\n1. 找到垂直赛道\n2. 做好数据复盘\n3. 持续打磨黄金钩子`,
    status: 'drafting',
    updatedAt: '2026-10-28 12:00',
    hookStrength: 'excellent',
    coverText: '90%自媒体新人踩过的死穴，看完少走半年弯路！',
    storyboard: [
      { scene: 1, visual: '醒目大字封面', audioVoiceover: '为什么你的笔记播放量总卡在500？' },
      { scene: 2, visual: '数据漏斗对比图', audioVoiceover: '重点看藏赞比与完播率指标。' }
    ]
  };

  const mockPersona: AccountPersona = {
    id: 'persona-lin',
    name: '职场干货林学姐',
    handle: '@LinWorkMaster',
    niche: '职场成长 / 效率工具',
    avatarUrl: '/avatar.jpg',
    tone: 'sharp_professional',
    targetAudience: '22-35岁职场青年',
    catchphrases: ['底层逻辑', '低阻力闭环'],
    tabooTopics: ['虚假暴富', '过度煽动对立'],
    memoryFewShots: []
  };

  const md = generateCleanMarkdown(mockDraft, mockPersona);

  // YAML Frontmatter checks
  assert.ok(md.startsWith('---'), 'Markdown should begin with YAML frontmatter delimiters');
  assert.ok(md.includes('title: "普通人做自媒体如何快速突破第1个万粉？"'), 'Frontmatter should contain title');
  assert.ok(md.includes('platform: "小红书 (Xiaohongshu)"'), 'Frontmatter should contain platform label');
  assert.ok(md.includes('author: "职场干货林学姐"'), 'Frontmatter should contain author name');
  assert.ok(md.includes('author_handle: "@LinWorkMaster"'), 'Frontmatter should contain author handle');
  assert.ok(md.includes('word_count:'), 'Frontmatter should contain word count');

  // Title and headers check
  assert.ok(md.includes('# 普通人做自媒体如何快速突破第1个万粉？'), 'Should contain main title heading');
  assert.ok(md.includes('## 🎯 封面焦点 / 黄金前3秒钩子 (Hook)'), 'Should contain hook section');
  assert.ok(md.includes('90%自媒体新人踩过的死穴'), 'Should contain hook text');
  assert.ok(md.includes('## 📝 正文内容 / 口播逐字稿 (Content Body)'), 'Should contain body section');
  assert.ok(md.includes('自媒体的核心不是死磕时长'), 'Should contain content body');

  // Storyboard table check
  assert.ok(md.includes('## 🎬 视觉分镜与连环卡大纲 (Storyboard)'), 'Should contain storyboard heading');
  assert.ok(md.includes('| **P1** | 醒目大字封面 | 为什么你的笔记播放量总卡在500？ |'), 'Should format storyboard table');
  assert.ok(md.includes('| **P2** | 数据漏斗对比图 | 重点看藏赞比与完播率指标。 |'), 'Should format second slide');

  // Persona guardrails check
  assert.ok(md.includes('## 👤 创作者人设与调性约束 (Persona)'), 'Should contain persona section');
  assert.ok(md.includes('`底层逻辑`'), 'Should include catchphrases');
  assert.ok(md.includes('`虚假暴富`'), 'Should include taboo topics');

  // Clean footer
  assert.ok(md.includes('DeepSeek Harness Content Studio 导出'), 'Should include clean footer');
});

test('generateCleanMarkdown handles minimal draft without storyboard or persona safely', () => {
  const minimalDraft: ContentDraft = {
    id: 'draft-min',
    title: '简易备忘录草稿',
    platform: 'wechat',
    personaId: 'none',
    content: '简单的一段正文测试。',
    status: 'drafting',
    updatedAt: '2026-10-28 14:00',
    hookStrength: 'adequate',
    coverText: '',
    storyboard: []
  };

  const md = generateCleanMarkdown(minimalDraft);
  assert.ok(md.includes('# 简易备忘录草稿'));
  assert.ok(md.includes('简单的一段正文测试。'));
  // Should not crash and should not render empty table
  assert.ok(!md.includes('## 🎬 视觉分镜与连环卡大纲 (Storyboard)'));
  assert.ok(!md.includes('## 👤 创作者人设与调性约束 (Persona)'));
});
