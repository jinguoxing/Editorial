/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

interface NavbarProps {
  activeTab: 'trend' | 'studio' | 'gate' | 'persona' | 'attribution' | 'accounts';
  onSelectTab: (tab: 'trend' | 'studio' | 'gate' | 'persona' | 'attribution' | 'accounts') => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  selectedPersonaName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  isCopilotOpen,
  onToggleCopilot,
  selectedPersonaName
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            墨
          </div>
          <button 
            onClick={() => onSelectTab('trend')}
            className="text-lg font-bold tracking-tight text-slate-900 hover:text-slate-700 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            墨策 AI · 社媒搭档
          </button>
        </div>

        {/* Zone 2: 5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('trend')}
            className={`cursor-pointer whitespace-nowrap shrink-0 py-1 transition-colors ${
              activeTab === 'trend'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            热点雷达
          </button>
          <button
            onClick={() => onSelectTab('studio')}
            className={`cursor-pointer whitespace-nowrap shrink-0 py-1 transition-colors ${
              activeTab === 'studio'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            创作工坊
          </button>
          <button
            onClick={() => onSelectTab('gate')}
            className={`cursor-pointer whitespace-nowrap shrink-0 py-1 transition-colors ${
              activeTab === 'gate'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            质量门禁
          </button>
          <button
            onClick={() => onSelectTab('persona')}
            className={`cursor-pointer whitespace-nowrap shrink-0 py-1 transition-colors ${
              activeTab === 'persona'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            人设记忆
          </button>
          <button
            onClick={() => onSelectTab('attribution')}
            className={`cursor-pointer whitespace-nowrap shrink-0 py-1 transition-colors ${
              activeTab === 'attribution'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            数据归因
          </button>
          <button
            onClick={() => onSelectTab('accounts')}
            className={`cursor-pointer whitespace-nowrap shrink-0 py-1 transition-colors ${
              activeTab === 'accounts'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            账号管理 (Accounts)
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
            <span>当前人设</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-700">{selectedPersonaName}</span>
          </div>

          <button
            onClick={onToggleCopilot}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isCopilotOpen
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
            aria-label="切换DeepSeek Harness对话搭档"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isCopilotOpen ? '收起搭档对话' : '呼叫 AI 搭档 (dsh)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
