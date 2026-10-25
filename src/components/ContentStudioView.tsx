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
  Check
} from 'lucide-react';

interface ContentStudioProps {
  currentDraft: ContentDraft;
  personas: AccountPersona[];
  onUpdateDraft: (updated: Partial<ContentDraft>) => void;
  onSendToQualityGate: () => void;
  onAskCopilotToRefine: (instruction: string) => void;
}

export const ContentStudioView: React.FC<ContentStudioProps> = ({
  currentDraft,
  personas,
  onUpdateDraft,
  onSendToQualityGate,
  onAskCopilotToRefine
}) => {
  const [copied, setCopied] = useState(false);
  const [activePreviewMode, setActivePreviewMode] = useState<'mobile' | 'storyboard'>('mobile');
  
  const currentPersona = personas.find(p => p.id === currentDraft.personaId) || personas[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(`${currentDraft.title}\n\n${currentDraft.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制全文' : '复制图文文本'}</span>
            </button>

            <button
              onClick={onSendToQualityGate}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>送审质量门禁 (Quality Gate)</span>
            </button>
          </div>
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
    </div>
  );
};
