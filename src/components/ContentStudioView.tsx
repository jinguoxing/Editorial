/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AccountPersona, SocialPlatform } from '../dsh/engine';
import { ContentDraft } from '../data/mockData';
import { 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Plus, 
  Trash2, 
  Eye, 
  Share2, 
  Heart, 
  Bookmark, 
  MessageCircle,
  Copy,
  Check,
  FileText,
  RotateCcw,
  Download,
  FileCode,
  X,
  Tag
} from 'lucide-react';
import { 
  generateCleanMarkdown, 
  sanitizeMarkdownFilename, 
  triggerFileDownload 
} from '../dsh/markdownExporter';
import { 
  PresetDraftTag, 
  PRESET_DRAFT_TAGS, 
  PRESET_TAG_KEYS, 
  getTagMeta, 
  toggleDraftTag 
} from '../dsh/engine';

interface ContentStudioProps {
  currentDraft: ContentDraft;
  personas: AccountPersona[];
  onUpdateDraft: (updated: Partial<ContentDraft>) => void;
  onSendToQualityGate: () => void;
  onAskCopilotToRefine: (instruction: string) => void;
  drafts?: ContentDraft[];
  currentDraftIndex?: number;
  onSelectDraftIndex?: (index: number) => void;
  onCreateNewDraft?: () => void;
  lastSavedAt?: string | null;
  autoSaveStatus?: 'saved' | 'saving' | 'idle';
  onManualSave?: () => void;
}

export const ContentStudioView: React.FC<ContentStudioProps> = ({
  currentDraft,
  personas,
  onUpdateDraft,
  onSendToQualityGate,
  onAskCopilotToRefine,
  drafts,
  currentDraftIndex = 0,
  onSelectDraftIndex,
  onCreateNewDraft,
  lastSavedAt,
  autoSaveStatus = 'saved',
  onManualSave
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [activePreviewMode, setActivePreviewMode] = useState<'mobile' | 'storyboard'>('mobile');
  const [customTagInput, setCustomTagInput] = useState('');
  
  const currentPersona = personas.find(p => p.id === currentDraft.personaId) || personas[0];
  const markdownContent = generateCleanMarkdown(currentDraft, currentPersona);
  const markdownFilename = sanitizeMarkdownFilename(currentDraft.title, currentDraft.platform);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${currentDraft.title}\n\n${currentDraft.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleTag = (tag: string) => {
    const nextTags = toggleDraftTag(currentDraft.tags, tag);
    onUpdateDraft({ tags: nextTags });
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!(currentDraft.tags || []).includes(trimmed)) {
      const nextTags = [...(currentDraft.tags || []), trimmed];
      onUpdateDraft({ tags: nextTags });
    }
    setCustomTagInput('');
  };

  const handleExportMarkdown = () => {
    const success = triggerFileDownload(markdownFilename, markdownContent);
    if (success) {
      setExportNotice(markdownFilename);
      setTimeout(() => setExportNotice(null), 3500);
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const addStoryboardSlide = () => {
    const nextScene = (currentDraft.storyboard?.length || 0) + 1;
    const newBoard = [
      ...(currentDraft.storyboard || []),
      {
        scene: nextScene,
        visual: `第 ${nextScene} 张卡片：关键数据对比或流程拆解`,
        audioVoiceover: '在此输入该分镜对应的口播/说明文案...'
      }
    ];
    onUpdateDraft({ storyboard: newBoard });
  };

  const removeStoryboardSlide = (index: number) => {
    const updated = currentDraft.storyboard.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      scene: idx + 1
    }));
    onUpdateDraft({ storyboard: updated });
  };

  const updateStoryboardSlide = (index: number, field: 'visual' | 'audioVoiceover', value: string) => {
    const updated = [...currentDraft.storyboard];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateDraft({ storyboard: updated });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Comprehensive Content Editor */}
      <div className="lg:col-span-7 space-y-5">
        {/* Multi-Draft Switcher Bar */}
        {drafts && drafts.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                草稿箱 ({drafts.length})：
              </span>
              {drafts.map((d, idx) => (
                <button
                  key={d.id}
                  onClick={() => onSelectDraftIndex && onSelectDraftIndex(idx)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer truncate max-w-[180px] flex items-center gap-1.5 ${
                    idx === currentDraftIndex
                      ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                  title={`${d.title || '未命名草稿'}${d.tags && d.tags.length > 0 ? ` [${d.tags.join(', ')}]` : ''}`}
                >
                  {d.tags && d.tags.length > 0 && (
                    <span className="flex items-center gap-0.5 shrink-0">
                      {d.tags.slice(0, 2).map((t) => {
                        const meta = getTagMeta(t);
                        return (
                          <span
                            key={t}
                            className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`}
                            title={t}
                          />
                        );
                      })}
                    </span>
                  )}
                  <span className="truncate">
                    {d.title ? (d.title.length > 10 ? `${d.title.slice(0, 10)}...` : d.title) : `草稿 ${idx + 1}`}
                  </span>
                </button>
              ))}
              {onCreateNewDraft && (
                <button
                  onClick={onCreateNewDraft}
                  className="px-2.5 py-1 text-xs rounded-lg border border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="新建空白草稿"
                >
                  <Plus className="w-3 h-3" />
                  <span>新建</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{autoSaveStatus === 'saving' ? '正在保存...' : `已自动保存 ${lastSavedAt || ''}`}</span>
              </span>
              {onManualSave && (
                <button
                  onClick={onManualSave}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title="强制立即同步当前修改至本地存储"
                >
                  立即存盘
                </button>
              )}
              <button
                onClick={handleExportMarkdown}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-medium px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                title={`将当前草稿导出为 Markdown 文件 (${markdownFilename})`}
              >
                <Download className="w-3 h-3 text-emerald-600" />
                <span>导出 .md</span>
              </button>
            </div>
          </div>
        )}

        {/* Editor Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Platform Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => onUpdateDraft({ platform: 'xiaohongshu' })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  currentDraft.platform === 'xiaohongshu'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                小红书图文
              </button>
              <button
                onClick={() => onUpdateDraft({ platform: 'douyin' })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  currentDraft.platform === 'douyin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                抖音口播
              </button>
              <button
                onClick={() => onUpdateDraft({ platform: 'wechat' })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  currentDraft.platform === 'wechat'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                公众号深度
              </button>
              <button
                onClick={() => onUpdateDraft({ platform: 'bilibili' })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  currentDraft.platform === 'bilibili'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                B站大纲
              </button>
            </div>

            {/* Persona Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">作者人设:</span>
              <select
                value={currentDraft.personaId}
                onChange={e => onUpdateDraft({ personaId: e.target.value })}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {personas.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.niche})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick AI Refine Chips */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">搭档赋能：</span>
            <button
              onClick={() => onAskCopilotToRefine('请重写当前文案的前3秒黄金钩子，使其具备强悬念与反差感。')}
              className="px-2.5 py-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>加强前3秒悬念</span>
            </button>
            <button
              onClick={() => onAskCopilotToRefine('请结合小红书图文排版，为文案增补恰当Emoji、分段留白与互动提问。')}
              className="px-2.5 py-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
            >
              优化排版与Emoji
            </button>
            <button
              onClick={() => onAskCopilotToRefine('请检查并消除文案中可能触犯广告法的词汇，替换为安全合规表述。')}
              className="px-2.5 py-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
            >
              广告法合规润色
            </button>
            <button
              onClick={() => onAskCopilotToRefine('请在文末设计一个高互动率的评论区留白问题 (CTA)。')}
              className="px-2.5 py-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
            >
              添加互动CTA
            </button>
          </div>
        </div>

        {/* Inputs Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              内容主标题 (Title)
            </label>
            <input
              type="text"
              value={currentDraft.title}
              onChange={e => onUpdateDraft({ title: e.target.value })}
              placeholder="输入爆款主标题..."
              className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          {/* Tagging System Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>分类标签 (Tags)</span>
              </label>
              <span className="text-[11px] text-slate-400">点击标签切换，多维度分类草稿并同步侧边栏展示</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_TAG_KEYS.map((key) => {
                const meta = PRESET_DRAFT_TAGS[key];
                const isSelected = (currentDraft.tags || []).includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggleTag(key)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? meta.activeClass
                        : `${meta.bgLightClass} ${meta.textClass} ${meta.borderClass} hover:opacity-85`
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : meta.dotClass}`} />
                    <span>{meta.name}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}

              {/* Custom tags */}
              {(currentDraft.tags || [])
                .filter(t => !PRESET_TAG_KEYS.includes(t as PresetDraftTag))
                .map(customTag => (
                  <span
                    key={customTag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    <span>#{customTag}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleTag(customTag)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer p-0.5"
                      title="移除标签"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

              {/* Add custom tag input */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={e => setCustomTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="+ 自定义标签..."
                  className="px-2.5 py-1 text-xs border border-dashed border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-28 focus:w-36 transition-all"
                />
                {customTagInput.trim() && (
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-2 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-xs font-medium cursor-pointer transition-colors"
                  >
                    添加
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>封面焦点文案 / 黄金前3秒第一句 (Hook)</span>
              <span className="text-[11px] text-amber-700 font-normal">决定90%的点击率与跳出率</span>
            </label>
            <textarea
              rows={2}
              value={currentDraft.coverText}
              onChange={e => onUpdateDraft({ coverText: e.target.value })}
              placeholder="醒目的大字封面或视频第一句台词..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-amber-50/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                正文内容 / 口播逐字稿 (Body)
              </label>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                <span>{currentDraft.content.length} 字</span>
                <span aria-hidden="true">·</span>
                <span>约 {Math.max(5, Math.round(currentDraft.content.length / 5))} 秒读完</span>
              </div>
            </div>
            <textarea
              rows={14}
              value={currentDraft.content}
              onChange={e => onUpdateDraft({ content: e.target.value })}
              placeholder="在此撰写或由AI生成正文..."
              className="w-full p-3.5 text-xs leading-relaxed border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                title="复制纯文本格式到剪贴板"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制文本' : '复制正文'}</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                data-testid="export-markdown-btn"
                className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title={`下载格式规范的 Markdown 文档 (${markdownFilename})`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>导出 Markdown (.md)</span>
              </button>

              <button
                onClick={() => setIsPreviewModalOpen(true)}
                data-testid="preview-markdown-btn"
                className="px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                title="在线预览或复制代码格式的 Markdown 文档"
              >
                <FileCode className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">预览源码</span>
              </button>
            </div>

            <button
              onClick={onSendToQualityGate}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>送审质量门禁 (Quality Gate)</span>
            </button>
          </div>

          {/* Export Toast Banner */}
          {exportNotice && (
            <div 
              role="alert"
              className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold">已成功导出 Markdown 文件：</span>
                  <span className="font-mono underline ml-1">{exportNotice}</span>
                  <span className="text-emerald-700 ml-2">已触发本地文件下载，支持在 Obsidian / Notion / VS Code 中无缝打开</span>
                </div>
              </div>
              <button 
                onClick={() => setExportNotice(null)}
                className="text-emerald-500 hover:text-emerald-800 cursor-pointer p-0.5"
                aria-label="关闭导出提示"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Visual Storyboard & Carousel Deck */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">视觉卡片与分镜大纲 (Storyboard)</h3>
            </div>
            <button
              onClick={addStoryboardSlide}
              className="px-2.5 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>添加分镜卡片</span>
            </button>
          </div>

          <div className="space-y-3">
            {(currentDraft.storyboard || []).map((slide, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 font-mono tabular-nums">卡片 P{slide.scene}</span>
                  {(currentDraft.storyboard?.length || 0) > 1 && (
                    <button
                      onClick={() => removeStoryboardSlide(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="删除此分镜"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">画面视觉设计</span>
                    <input
                      type="text"
                      value={slide.visual}
                      onChange={e => updateStoryboardSlide(idx, 'visual', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">配乐/口播旁白</span>
                    <input
                      type="text"
                      value={slide.audioVoiceover}
                      onChange={e => updateStoryboardSlide(idx, 'audioVoiceover', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Platform Preview Simulator */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>多平台效果实时模拟</span>
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md text-xs">
              <button
                onClick={() => setActivePreviewMode('mobile')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  activePreviewMode === 'mobile' ? 'bg-white shadow-xs font-medium text-slate-900' : 'text-slate-500'
                }`}
              >
                手机端视觉
              </button>
              <button
                onClick={() => setActivePreviewMode('storyboard')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  activePreviewMode === 'storyboard' ? 'bg-white shadow-xs font-medium text-slate-900' : 'text-slate-500'
                }`}
              >
                连环卡预览
              </button>
            </div>
          </div>

          {activePreviewMode === 'mobile' ? (
            /* Simulated Mobile Frame */
            <div className="mx-auto w-full max-w-[340px] bg-slate-900 rounded-3xl p-3 shadow-lg border border-slate-800">
              <div className="bg-white rounded-2xl overflow-hidden flex flex-col min-h-[520px]">
                {/* Simulated Top Status */}
                <div className="px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100">
                  <span className="font-mono tabular-nums">19:42</span>
                  <span>5G 📶 100%</span>
                </div>

                {/* Cover Image Placeholder with Catchy Text */}
                <div className="relative aspect-4/3 bg-slate-900 p-4 flex flex-col justify-between text-white overflow-hidden">
                  <div className="flex items-center justify-between text-xs opacity-80">
                    <span>{currentPersona.niche}</span>
                    <span className="bg-rose-500/80 px-2 py-0.5 rounded text-[10px]">精选干货</span>
                  </div>
                  <div className="my-auto text-center px-2">
                    <p className="text-base font-bold leading-tight drop-shadow-md text-amber-300">
                      {currentDraft.coverText || currentDraft.title}
                    </p>
                  </div>
                  <div className="text-[11px] opacity-75 text-right font-mono tabular-nums">
                    @ {currentPersona.name}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                      {currentDraft.title || '尚未拟定标题'}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                      <img
                        src={currentPersona.avatarUrl}
                        alt={currentPersona.name}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-700">{currentPersona.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>关注</span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-6 mt-2 leading-relaxed whitespace-pre-line">
                      {currentDraft.content || '请输入正文以预览排版效果...'}
                    </p>
                  </div>

                  {/* Simulated Engagement Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs font-mono tabular-nums">
                    <span className="flex items-center gap-1 hover:text-rose-500 cursor-pointer">
                      <Heart className="w-3.5 h-3.5" /> 3.2k
                    </span>
                    <span className="flex items-center gap-1 hover:text-amber-500 cursor-pointer">
                      <Bookmark className="w-3.5 h-3.5" /> 2.8k
                    </span>
                    <span className="flex items-center gap-1 cursor-pointer">
                      <MessageCircle className="w-3.5 h-3.5" /> 482
                    </span>
                    <span className="flex items-center gap-1 cursor-pointer">
                      <Share2 className="w-3.5 h-3.5" /> 分享
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Carousel Storyboard Grid */
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {(currentDraft.storyboard || []).map((slide, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-700 font-mono tabular-nums">第 {slide.scene} 张卡片</span>
                    <span>视觉预览</span>
                  </div>
                  <div className="aspect-16/9 bg-slate-800 text-white p-3 rounded flex items-center justify-center text-center text-xs">
                    <p className="font-medium text-slate-200">{slide.visual}</p>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 italic leading-relaxed">
                    🗣️ 口播配合: {slide.audioVoiceover}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Safety & Pre-check Reminder Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>发布前闭环建议</span>
          </div>
          <p className="leading-relaxed">
            根据账号以往爆款归因数据，带有明确数字拆解的干货长图收藏比高出日常 42%。在发布前务必执行质量门禁，排查极限广告用词与诱导分享风险。
          </p>
        </div>
      </div>

      {/* Markdown Export & Preview Modal */}
      {isPreviewModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="markdown-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="markdown-modal-title" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>草稿 Markdown 源码与本地导出</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-normal">
                      {markdownFilename}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    规范包含 YAML 前置元数据、黄金钩子、分镜大纲与风格约束，兼容各类主流笔记软件
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-1.5 rounded-lg transition-colors cursor-pointer"
                aria-label="关闭预览弹窗"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Markdown Text Container */}
            <div className="p-5 overflow-y-auto flex-1 font-mono text-xs bg-slate-900 text-slate-100 leading-relaxed selection:bg-emerald-500 selection:text-white">
              <pre className="whitespace-pre-wrap break-words">{markdownContent}</pre>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 flex items-center gap-2">
                <span>文件大小：约 {(new Blob([markdownContent]).size / 1024).toFixed(1)} KB</span>
                <span aria-hidden="true">·</span>
                <span>字数：{markdownContent.length} 字符</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMarkdown}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedMarkdown ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">已复制 Markdown</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>复制源码</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleExportMarkdown();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>立即下载 .md 文件</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
