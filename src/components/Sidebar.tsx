/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  PenTool, 
  ShieldCheck, 
  Brain, 
  BarChart3, 
  Share2, 
  Sparkles, 
  Menu, 
  X, 
  ChevronRight,
  Bot,
  Zap,
  CheckCircle2,
  FileText,
  Tag,
  Plus
} from 'lucide-react';
import { 
  AccountPersona, 
  PresetDraftTag, 
  PRESET_DRAFT_TAGS, 
  PRESET_TAG_KEYS, 
  getTagMeta, 
  filterDraftsByTag, 
  getDraftTagCounts 
} from '../dsh/engine';
import { ContentDraft } from '../data/mockData';

export type NavTabId = 'trend' | 'studio' | 'gate' | 'persona' | 'attribution' | 'accounts';

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  selectedPersonaName: string;
  selectedPersonaRole?: string;
  personas?: AccountPersona[];
  selectedPersonaId?: string;
  onSelectPersona?: (id: string) => void;
  drafts?: ContentDraft[];
  currentDraftIndex?: number;
  onSelectDraftIndex?: (index: number) => void;
  onCreateNewDraft?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCopilotOpen,
  onToggleCopilot,
  selectedPersonaName,
  selectedPersonaRole,
  personas,
  selectedPersonaId,
  onSelectPersona,
  drafts = [],
  currentDraftIndex = 0,
  onSelectDraftIndex,
  onCreateNewDraft
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | 'all'>('all');

  const tagCounts = getDraftTagCounts(drafts);
  const filteredDrafts = filterDraftsByTag(drafts, selectedTagFilter);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems: {
    id: NavTabId;
    label: string;
    english: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: 'trend',
      label: '热点雷达',
      english: 'Trend Radar',
      icon: TrendingUp,
      badge: '实时'
    },
    {
      id: 'studio',
      label: '创作工坊',
      english: 'Content Studio',
      icon: PenTool,
    },
    {
      id: 'gate',
      label: '质量门禁',
      english: 'Quality Gate',
      icon: ShieldCheck,
      badge: '5维'
    },
    {
      id: 'persona',
      label: '人设记忆',
      english: 'Persona Memory',
      icon: Brain,
    },
    {
      id: 'attribution',
      label: '数据归因',
      english: 'Attribution Lab',
      icon: BarChart3,
    },
    {
      id: 'accounts',
      label: '账号管理',
      english: 'Accounts',
      icon: Share2,
      badge: '矩阵'
    }
  ];

  const handleTabClick = (tab: NavTabId) => {
    onSelectTab(tab);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div 
          onClick={() => handleTabClick('trend')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-slate-800 transition-colors">
            墨
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>墨策 AI</span>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                DSH
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">社媒内容全链路搭档</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          aria-label="关闭侧边栏菜单"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Persona Info Card */}
      <div className="px-4 py-3.5 mx-3 mt-3.5 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            当前执笔人设
          </span>
          {personas && personas.length > 1 && (
            <button
              onClick={() => handleTabClick('persona')}
              className="text-slate-600 hover:text-slate-900 font-normal hover:underline cursor-pointer"
            >
              切换
            </button>
          )}
        </div>
        <div className="font-semibold text-xs text-slate-900 truncate">
          {selectedPersonaName}
        </div>
        {selectedPersonaRole && (
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            {selectedPersonaRole}
          </div>
        )}
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          工作台模块
        </div>
        
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon 
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-700'
                  }`} 
                />
                <div className="flex flex-col text-left truncate">
                  <span className="truncate leading-tight">{item.label}</span>
                  <span className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {item.english}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span 
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    isActive 
                      ? 'bg-slate-800 text-amber-300' 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Drafts Management Section with Tag Badges & Filters */}
        <div className="pt-3 mt-2 border-t border-slate-100">
          <div className="flex items-center justify-between px-3 pb-1.5">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>草稿管理 Drafts</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full font-mono">
                {drafts.length}
              </span>
            </span>
            {onCreateNewDraft && (
              <button
                type="button"
                onClick={() => {
                  onCreateNewDraft();
                  onSelectTab('studio');
                  setIsMobileOpen(false);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-900 font-medium flex items-center gap-0.5 hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                title="新建空白草稿"
              >
                <Plus className="w-3 h-3" />
                <span>新建</span>
              </button>
            )}
          </div>

          {/* Tag Filter Pills */}
          <div className="px-2 pb-2">
            <div className="flex items-center gap-1 overflow-x-auto py-1 text-[10px] no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedTagFilter('all')}
                className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedTagFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                全部 ({tagCounts.all})
              </button>

              {PRESET_TAG_KEYS.map((key) => {
                const meta = PRESET_DRAFT_TAGS[key];
                const count = tagCounts[key] || 0;
                const isSelected = selectedTagFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTagFilter(isSelected ? 'all' : key)}
                    className={`px-1.5 py-0.5 rounded-md font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? meta.activeClass
                        : `${meta.bgLightClass} ${meta.textClass} ${meta.borderClass} hover:opacity-85`
                    }`}
                  >
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : meta.dotClass}`} />
                    <span>{key === 'Inspiration' ? '灵感' : key === 'Commercial' ? '商单' : key === 'Personal' ? '个人' : '待审'}</span>
                    <span className="opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtered Drafts List in Sidebar */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto px-1">
            {filteredDrafts.length === 0 ? (
              <div className="px-3 py-3 text-center text-slate-400 text-[11px] bg-slate-50/70 rounded-lg">
                无匹配分类的草稿
              </div>
            ) : (
              filteredDrafts.map((d) => {
                const originalIndex = drafts.findIndex(item => item.id === d.id);
                const isCurrent = activeTab === 'studio' && originalIndex === currentDraftIndex;

                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      if (onSelectDraftIndex && originalIndex >= 0) {
                        onSelectDraftIndex(originalIndex);
                      }
                      onSelectTab('studio');
                      setIsMobileOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-all cursor-pointer border ${
                      isCurrent
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50/70 hover:bg-slate-100/90 text-slate-800 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                        isCurrent ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-500 border border-slate-200'
                      }`}>
                        {d.platform === 'xiaohongshu' ? '小红书' : d.platform === 'douyin' ? '抖音' : d.platform === 'wechat' ? '公众号' : 'B站'}
                      </span>
                      <span className={`text-[10px] font-mono truncate ${isCurrent ? 'text-slate-400' : 'text-slate-400'}`}>
                        {d.updatedAt ? d.updatedAt.slice(5) : ''}
                      </span>
                    </div>

                    <div className={`font-medium line-clamp-1 leading-snug mb-1.5 ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                      {d.title || '未命名草稿'}
                    </div>

                    {/* Tags Pills Displayed in Sidebar Item */}
                    {d.tags && d.tags.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {d.tags.map((t) => {
                          const meta = getTagMeta(t);
                          return (
                            <span
                              key={t}
                              className={`text-[9px] px-1.5 py-0.2 rounded font-medium border flex items-center gap-1 ${
                                isCurrent
                                  ? 'bg-slate-800 text-slate-200 border-slate-700'
                                  : `${meta.badgeClass}`
                              }`}
                            >
                              <span className={`w-1 h-1 rounded-full ${meta.dotClass}`} />
                              <span>{t}</span>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={`text-[10px] italic ${isCurrent ? 'text-slate-400' : 'text-slate-400'}`}>
                        无分类标签
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* AI Copilot & Status Bottom Card */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button
          onClick={onToggleCopilot}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
            isCopilotOpen
              ? 'bg-slate-900 text-white border-slate-800 shadow-md'
              : 'bg-gradient-to-br from-amber-50 to-orange-50/50 hover:from-amber-100/70 hover:to-orange-100/70 border-amber-200/70 text-slate-900'
          }`}
          aria-label="打开DeepSeek Harness搭档对话"
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isCopilotOpen ? 'bg-slate-800 text-amber-400' : 'bg-amber-400 text-slate-950 shadow-xs'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold leading-tight flex items-center gap-1">
                <span>AI 内容搭档</span>
                <span className="text-[10px] px-1 py-0.2 bg-amber-400/20 text-amber-800 rounded font-normal">
                  dsh
                </span>
              </div>
              <p className={`text-[10px] ${isCopilotOpen ? 'text-slate-300' : 'text-slate-500'}`}>
                {isCopilotOpen ? '点击收起侧边窗口' : '随时唤起协同生成'}
              </p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isCopilotOpen ? 'rotate-90 text-slate-400' : 'text-slate-400'}`} />
        </button>

        {/* Engine metadata note */}
        <div className="px-2 py-1 text-[10px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            DeepSeek Harness
          </span>
          <span className="text-[9px] bg-slate-100 px-1 py-0.5 rounded text-slate-500">v2.4 Ready</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header with Hamburger */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="打开左侧菜单栏"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              墨
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">
              墨策 AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCopilot}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              isCopilotOpen
                ? 'bg-slate-900 text-white'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI 搭档</span>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
