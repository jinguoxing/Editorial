/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Clean Markdown Exporter for Content Studio drafts
 */

import { ContentDraft } from '../data/mockData';
import { AccountPersona, SocialPlatform } from './engine';

export const PLATFORM_NAMES: Record<SocialPlatform, string> = {
  xiaohongshu: '小红书 (Xiaohongshu)',
  douyin: '抖音 (Douyin)',
  wechat: '微信公众号 (WeChat)',
  bilibili: '哔哩哔哩 (Bilibili)',
  weibo: '微博 (Weibo)',
};

/**
 * Sanitizes a title string into a safe file name across Windows/macOS/Linux.
 */
export function sanitizeMarkdownFilename(title?: string, platform?: SocialPlatform): string {
  const cleanTitle = (title || '')
    .trim()
    .replace(/[\\/:*?"<>|#\r\n\t：？“”‘’/]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);

  const base = cleanTitle || 'content-draft';
  const platformSuffix = platform ? `-${platform}` : '';
  return `${base}${platformSuffix}.md`;
}

/**
 * Formats a clean, standard Markdown document from a ContentDraft.
 * Designed to be imported seamlessly into Obsidian, Notion, Typora, GitHub, or static site generators.
 */
export function generateCleanMarkdown(draft: ContentDraft, persona?: AccountPersona): string {
  const platformLabel = PLATFORM_NAMES[draft.platform] || draft.platform;
  const wordCount = (draft.content || '').length;
  const readSeconds = Math.max(5, Math.round(wordCount / 5));
  const safeTitle = (draft.title || '未命名草稿').trim();
  const dateStr = draft.updatedAt || new Date().toISOString().replace('T', ' ').slice(0, 16);

  const sections: string[] = [];

  // 1. Clean YAML Frontmatter
  sections.push('---');
  sections.push(`title: "${safeTitle.replace(/"/g, '\\"')}"`);
  sections.push(`platform: "${platformLabel}"`);
  if (persona) {
    sections.push(`author: "${persona.name.replace(/"/g, '\\"')}"`);
    sections.push(`author_handle: "${persona.handle || ''}"`);
    sections.push(`author_niche: "${persona.niche.replace(/"/g, '\\"')}"`);
  }
  sections.push(`status: "${draft.status || 'drafting'}"`);
  sections.push(`hook_strength: "${draft.hookStrength || 'adequate'}"`);
  if (draft.tags && draft.tags.length > 0) {
    sections.push(`tags: [${draft.tags.map(t => `"${t}"`).join(', ')}]`);
  }
  sections.push(`word_count: ${wordCount}`);
  sections.push(`estimated_read_seconds: ${readSeconds}`);
  sections.push(`exported_at: "${dateStr}"`);
  sections.push('---');
  sections.push('');

  // 2. Document Heading
  sections.push(`# ${safeTitle}`);
  sections.push('');

  // Quick Metadata Badges
  const badges: string[] = [
    `**平台**：${platformLabel}`,
    persona ? `**创作者**：${persona.name}` : null,
    draft.tags && draft.tags.length > 0 ? `**分类标签**：${draft.tags.join(', ')}` : null,
    `**字数统计**：约 ${wordCount} 字 (预估阅读 ${readSeconds} 秒)`,
    `**更新时间**：${dateStr}`
  ].filter(Boolean) as string[];

  sections.push(`> ${badges.join(' | ')}`);
  sections.push('');

  // 3. Golden 3-Second Hook / Cover Text
  if (draft.coverText && draft.coverText.trim()) {
    sections.push('## 🎯 封面焦点 / 黄金前3秒钩子 (Hook)');
    sections.push('');
    sections.push(`> 💡 **核心抓手**：${draft.coverText.trim()}`);
    sections.push('');
  }

  // 4. Main Body Content
  sections.push('## 📝 正文内容 / 口播逐字稿 (Content Body)');
  sections.push('');
  if (draft.content && draft.content.trim()) {
    sections.push(draft.content.trim());
  } else {
    sections.push('*（暂无正文内容）*');
  }
  sections.push('');

  // 5. Visual Storyboard Carousel (if provided)
  if (draft.storyboard && draft.storyboard.length > 0) {
    sections.push('## 🎬 视觉分镜与连环卡大纲 (Storyboard)');
    sections.push('');
    sections.push('| 序号 (Scene) | 画面视觉设计 (Visual) | 配乐 / 口播旁白 (Voiceover) |');
    sections.push('| :---: | :--- | :--- |');
    draft.storyboard.forEach((slide) => {
      const cleanVisual = (slide.visual || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      const cleanAudio = (slide.audioVoiceover || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      sections.push(`| **P${slide.scene}** | ${cleanVisual} | ${cleanAudio} |`);
    });
    sections.push('');
  }

  // 6. Persona Memory & Voice Guardrails (if provided)
  if (persona) {
    sections.push('## 👤 创作者人设与调性约束 (Persona)');
    sections.push('');
    sections.push(`- **定位赛道**：${persona.niche}`);
    sections.push(`- **受众人群**：${persona.targetAudience}`);
    if (persona.catchphrases && persona.catchphrases.length > 0) {
      sections.push(`- **特色口头禅**：${persona.catchphrases.map(c => `\`${c}\``).join('、')}`);
    }
    if (persona.tabooTopics && persona.tabooTopics.length > 0) {
      sections.push(`- **违禁避坑词**：${persona.tabooTopics.map(t => `\`${t}\``).join('、')}`);
    }
    sections.push('');
  }

  // 7. Footer
  sections.push('---');
  sections.push('*由 DeepSeek Harness Content Studio 导出 · 支持 Obsidian / Notion / VS Code 直接编辑*');

  return sections.join('\n');
}

/**
 * Triggers a browser file download with the specified text content.
 * Safe for client-side environments.
 */
export function triggerFileDownload(filename: string, content: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error('Failed to trigger file download:', err);
    return false;
  }
}
