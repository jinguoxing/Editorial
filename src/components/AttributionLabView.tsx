/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PostAttributionData, SocialPlatform, calculateAttributionInsight, AttributionInsight, AccountPersona } from '../dsh/engine';
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  Share2, 
  Eye, 
  Heart, 
  Bookmark, 
  MessageCircle,
  HelpCircle
} from 'lucide-react';

interface AttributionLabProps {
  posts: PostAttributionData[];
  onAddPostData: (post: PostAttributionData) => void;
  onFeedIntoMemory: (learning: { topic: string; hook: string; keyLearning: string; viralMetric: string }) => void;
  currentPersona: AccountPersona;
}

export const AttributionLabView: React.FC<AttributionLabProps> = ({
  posts,
  onAddPostData,
  onFeedIntoMemory,
  currentPersona
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string>(posts[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [memorySavedPostId, setMemorySavedPostId] = useState<string | null>(null);

  // New Post Form
  const [formTitle, setFormTitle] = useState('');
  const [formPlatform, setFormPlatform] = useState<SocialPlatform>('xiaohongshu');
  const [formViews, setFormViews] = useState(15000);
  const [formLikes, setFormLikes] = useState(820);
  const [formFavorites, setFormFavorites] = useState(740);
  const [formComments, setFormComments] = useState(95);
  const [formShares, setFormShares] = useState(120);
  const [formFollowers, setFormFollowers] = useState(110);
  const [formRetention, setFormRetention] = useState(48);

  const selectedPost = posts.find(p => p.id === selectedPostId) || posts[0];
  const insight: AttributionInsight | null = selectedPost ? calculateAttributionInsight(selectedPost) : null;

  const handleSaveToMemory = () => {
    if (!selectedPost || !insight) return;
    onFeedIntoMemory({
      topic: selectedPost.title,
      hook: `基于【${selectedPost.title.slice(0, 16)}】的反差钩子`,
      keyLearning: insight.keyActionableRule,
      viralMetric: `${(selectedPost.views / 10000).toFixed(1)}万阅读 · 藏赞比 ${insight.saveToLikeRatio}`
    });
    setMemorySavedPostId(selectedPost.id);
    setTimeout(() => setMemorySavedPostId(null), 3000);
  };

  const handleCreatePostData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    const newPost: PostAttributionData = {
      id: `post-${Date.now()}`,
      title: formTitle.trim(),
      platform: formPlatform,
      publishTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      views: Number(formViews),
      likes: Number(formLikes),
      favorites: Number(formFavorites),
      comments: Number(formComments),
      shares: Number(formShares),
      newFollowers: Number(formFollowers),
      retentionRate: Number(formRetention)
    };
    onAddPostData(newPost);
    setSelectedPostId(newPost.id);
    setShowAddModal(false);
    setFormTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            数据归因实验室 · 发了要知道为什么
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            录入各平台发布数据，智能逆向推导“为什么爆、为什么凉”，并一键把成功经验反哺至账号人设记忆库。
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>录入发布数据复盘</span>
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 block mb-1">跟踪作品数</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {posts.length} <span className="text-xs font-normal text-slate-500">篇</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 block mb-1">平均互动率 (Likes+Fav+Comm)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {posts.length > 0 
              ? (posts.reduce((acc, p) => acc + ((p.likes + p.favorites + p.comments) / Math.max(1, p.views)), 0) / posts.length * 100).toFixed(1)
              : 0}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 block mb-1">小红书藏赞比均值 (爆款锚点)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            {posts.length > 0
              ? (posts.reduce((acc, p) => acc + (p.likes > 0 ? p.favorites / p.likes : 0), 0) / posts.length).toFixed(2)
              : 0}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 block mb-1">闭环沉淀规则数</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600">
            {currentPersona.memoryFewShots.length} <span className="text-xs font-normal text-slate-500">条</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Posts Table */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">历史发布记录</h3>
            <div className="space-y-2.5">
              {posts.map(post => {
                const isSelected = post.id === selectedPostId;
                const postInsight = calculateAttributionInsight(post);
                return (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPostId(post.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5 opacity-80">
                      <span className="font-mono tabular-nums">{post.publishTime.slice(0, 10)}</span>
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : postInsight.grade === 'S'
                          ? 'bg-rose-100 text-rose-800'
                          : postInsight.grade === 'A'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        评级: {postInsight.grade} 级
                      </span>
                    </div>

                    <h4 className="text-xs font-bold line-clamp-1 leading-snug mb-2">
                      {post.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums opacity-90">
                      <span>👁️ {(post.views / 10000).toFixed(1)}w</span>
                      <span>❤️ {post.likes}</span>
                      <span>⭐ {post.favorites}</span>
                      <span>藏赞比: {postInsight.saveToLikeRatio}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Attribution Diagnostic Card */}
        {selectedPost && insight && (
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {selectedPost.platform === 'xiaohongshu' ? '小红书' : '抖音'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      发布于 {selectedPost.publishTime}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedPost.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">综合爆发力</span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {insight.grade} 级
                    </span>
                  </div>
                </div>
              </div>

              {/* Engagement Rates Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">总互动率</span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                    {insight.engagementRate}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">藏赞比 (干货度)</span>
                  <span className="text-base font-bold font-mono tabular-nums text-emerald-600">
                    {insight.saveToLikeRatio}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">点赞率</span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                    {insight.likeToViewRatio}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">涨粉转化率</span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                    {insight.conversionRate} ‱
                  </span>
                </div>
              </div>

              {/* Attribution Analysis: Why it exploded / stalled */}
              <div className="space-y-3 pt-2">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 mb-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>正向归因要素 (为什么火？)</span>
                  </span>
                  <div className="space-y-1.5">
                    {insight.viralDrivers.map((driver, idx) => (
                      <div key={idx} className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                        ✓ {driver}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5 mb-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>留存/转化拖累诊断 (哪儿还有遗憾？)</span>
                  </span>
                  <div className="space-y-1.5">
                    {insight.dragFactors.map((drag, idx) => (
                      <div key={idx} className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-100 text-xs text-amber-900 leading-relaxed">
                        ⚠️ {drag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feed Back to Persona Memory (The Core Closed Loop) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>闭环沉淀：提取出的账号成功规则</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {insight.keyActionableRule}
                  </p>
                </div>

                <button
                  onClick={handleSaveToMemory}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Brain className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {memorySavedPostId === selectedPost.id 
                      ? '✓ 已成功沉淀进账号人设记忆库！' 
                      : '一键将本次归因沉淀入【账号记忆库】 (闭环反哺)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Post Data Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">录入社媒发布实际表现数据</h3>
            <form onSubmit={handleCreatePostData} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">推文/视频标题</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="例如：为什么聪明人从不汇报流水账？"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">发布平台</label>
                  <select
                    value={formPlatform}
                    onChange={e => setFormPlatform(e.target.value as SocialPlatform)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="xiaohongshu">小红书</option>
                    <option value="douyin">抖音</option>
                    <option value="wechat">微信公众号</option>
                    <option value="bilibili">B站</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">总曝光 / 播放量</label>
                  <input
                    type="number"
                    value={formViews}
                    onChange={e => setFormViews(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">点赞量</label>
                  <input
                    type="number"
                    value={formLikes}
                    onChange={e => setFormLikes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">收藏量</label>
                  <input
                    type="number"
                    value={formFavorites}
                    onChange={e => setFormFavorites(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">评论量</label>
                  <input
                    type="number"
                    value={formComments}
                    onChange={e => setFormComments(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">新增关注粉丝数</label>
                  <input
                    type="number"
                    value={formFollowers}
                    onChange={e => setFormFollowers(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">完播率 / 完读率 (%)</label>
                  <input
                    type="number"
                    value={formRetention}
                    onChange={e => setFormRetention(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  开始智能归因
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
