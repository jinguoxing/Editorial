/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingTopic } from '../data/mockData';
import { SocialPlatform } from '../dsh/engine';
import { Compass, Flame, ArrowUpRight, Sparkles, Send, PlusCircle } from 'lucide-react';

interface TrendRadarProps {
  topics: TrendingTopic[];
  onSelectTopicForStudio: (topic: TrendingTopic) => void;
  onSendTopicToCopilot: (topic: TrendingTopic) => void;
}

export const TrendRadarView: React.FC<TrendRadarProps> = ({
  topics,
  onSelectTopicForStudio,
  onSendTopicToCopilot
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | SocialPlatform>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customKeyword, setCustomKeyword] = useState('');

  const filteredTopics = topics.filter(t => {
    const matchesPlatform = platformFilter === 'all' || t.platform === platformFilter;
    const matchesQuery = !searchQuery || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.angleSuggestion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesQuery;
  });

  const getPlatformLabel = (platform: SocialPlatform) => {
    switch (platform) {
      case 'xiaohongshu': return '小红书';
      case 'douyin': return '抖音';
      case 'wechat': return '微信公众号';
      case 'bilibili': return 'B站';
      case 'weibo': return '微博';
    }
  };

  const handleCustomKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyword.trim()) return;
    onSendTopicToCopilot({
      id: `custom-${Date.now()}`,
      platform: platformFilter === 'all' ? 'xiaohongshu' : platformFilter,
      title: customKeyword.trim(),
      category: '自定义检索',
      heatValue: '实时热度飙升',
      growthRate: '+150%',
      angleSuggestion: `围绕【${customKeyword.trim()}】挖掘用户痛点与反常识反差`,
      exampleHook: `关于【${customKeyword.trim()}】，大部分人都被误导了！今天揭秘真相。`,
      suggestedTags: [`#${customKeyword.trim()}`, '#自媒体运营', '#深度拆解']
    });
    setCustomKeyword('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Hero Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            热点雷达 · 跨平台趋势追踪
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            实时抓取中文社媒飙升风向，结合账号人设一键提炼黄金前3秒钩子与切入视角。
          </p>
        </div>

        {/* Custom brainstorm search */}
        <form onSubmit={handleCustomKeywordSubmit} className="flex items-center gap-2 max-w-md w-full">
          <input
            type="text"
            value={customKeyword}
            onChange={e => setCustomKeyword(e.target.value)}
            placeholder="输入赛道或关键词（如：一人团队、AI硬件）..."
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>智能构思</span>
          </button>
        </form>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Interactive segmented controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              platformFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全部平台
          </button>
          <button
            onClick={() => setPlatformFilter('xiaohongshu')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              platformFilter === 'xiaohongshu'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            小红书
          </button>
          <button
            onClick={() => setPlatformFilter('douyin')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              platformFilter === 'douyin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            抖音
          </button>
          <button
            onClick={() => setPlatformFilter('wechat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              platformFilter === 'wechat'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            微信公众号
          </button>
          <button
            onClick={() => setPlatformFilter('bilibili')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              platformFilter === 'bilibili'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            B站
          </button>
        </div>

        {/* In-view search */}
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="筛选热点标题或赛道..."
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      {/* Topics Grid */}
      {filteredTopics.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-white">
          <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">未找到匹配的热点主题</p>
          <p className="text-xs text-slate-500 mt-1">尝试调整平台筛选或自定义输入关键词</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map(topic => (
            <div
              key={topic.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-shadow hover:shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Clean unboxed metadata with typographic separators */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">{getPlatformLabel(topic.platform)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{topic.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono tabular-nums text-rose-600 font-semibold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{topic.growthRate}</span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
                  {topic.title}
                </h3>

                <div className="mt-3.5 space-y-2.5 text-xs">
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                    <span className="text-slate-500 block mb-1">建议切入视角</span>
                    <p className="text-slate-800 leading-relaxed">{topic.angleSuggestion}</p>
                  </div>

                  <div className="bg-amber-50/70 rounded-lg p-2.5 border border-amber-100/80">
                    <span className="text-amber-800/80 block mb-1 font-medium">黄金前3秒钩子范式</span>
                    <p className="text-slate-800 italic leading-relaxed">“{topic.exampleHook}”</p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSendTopicToCopilot(topic)}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  title="呼叫搭档生成详细大纲"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>与搭档研讨</span>
                </button>

                <button
                  onClick={() => onSelectTopicForStudio(topic)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>转入创作工坊</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
