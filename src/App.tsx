/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TrendRadarView } from './components/TrendRadarView';
import { ContentStudioView } from './components/ContentStudioView';
import { QualityGateView } from './components/QualityGateView';
import { PersonaMemoryView } from './components/PersonaMemoryView';
import { AttributionLabView } from './components/AttributionLabView';
import { AccountManagementView } from './components/AccountManagementView';
import { DshCopilotDrawer } from './components/DshCopilotDrawer';

import { 
  INITIAL_PERSONAS, 
  TRENDING_TOPICS_SEED, 
  INITIAL_DRAFTS, 
  INITIAL_ATTRIBUTION_POSTS,
  INITIAL_ACCOUNTS,
  TrendingTopic,
  ContentDraft
} from './data/mockData';
import { 
  AccountPersona, 
  PostAttributionData, 
  SocialAccount,
  loadDraftsFromStorage,
  sanitizeDraftIndex,
  serializeDraftsForStorage
} from './dsh/engine';
import { 
  Sparkles, 
  MessageSquare,
  Save,
  CheckCircle,
  RefreshCw,
  Plus,
  RotateCcw,
  FileText
} from 'lucide-react';

const STORAGE_KEY_DRAFTS = 'moce_dsh_content_drafts_v1';
const STORAGE_KEY_CURRENT_DRAFT_INDEX = 'moce_dsh_current_draft_idx_v1';
const STORAGE_KEY_LAST_SAVED_AT = 'moce_dsh_draft_last_saved_at_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'trend' | 'studio' | 'gate' | 'persona' | 'attribution' | 'accounts'>('trend');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Core Data States with localStorage persistence
  const [personas, setPersonas] = useState<AccountPersona[]>(INITIAL_PERSONAS);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(INITIAL_PERSONAS[0].id);
  const [topics] = useState<TrendingTopic[]>(TRENDING_TOPICS_SEED);
  const [drafts, setDrafts] = useState<ContentDraft[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DRAFTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DRAFTS);
      return loadDraftsFromStorage(stored, INITIAL_DRAFTS);
    } catch (err) {
      console.warn('Failed to load drafts from localStorage:', err);
      return INITIAL_DRAFTS;
    }
  });
  const [currentDraftIndex, setCurrentDraftIndex] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const storedIdx = localStorage.getItem(STORAGE_KEY_CURRENT_DRAFT_INDEX);
      const parsed = storedIdx !== null ? parseInt(storedIdx, 10) : 0;
      return sanitizeDraftIndex(parsed, INITIAL_DRAFTS.length);
    } catch {
      return 0;
    }
  });
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY_LAST_SAVED_AT) || null;
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');

  const [attributionPosts, setAttributionPosts] = useState<PostAttributionData[]>(INITIAL_ATTRIBUTION_POSTS);
  const [accounts, setAccounts] = useState<SocialAccount[]>(INITIAL_ACCOUNTS);

  const safeDraftIndex = sanitizeDraftIndex(currentDraftIndex, drafts.length);
  const currentPersona = personas.find(p => p.id === selectedPersonaId) || personas[0];
  const currentDraft = drafts[safeDraftIndex] || drafts[0];

  // Auto-save drafts to localStorage with debounce
  useEffect(() => {
    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_DRAFTS, serializeDraftsForStorage(drafts));
        localStorage.setItem(STORAGE_KEY_CURRENT_DRAFT_INDEX, String(safeDraftIndex));
        const nowStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        localStorage.setItem(STORAGE_KEY_LAST_SAVED_AT, nowStr);
        setLastSavedAt(nowStr);
        setAutoSaveStatus('saved');
      } catch (error) {
        console.warn('Auto-save to localStorage failed:', error);
        setAutoSaveStatus('idle');
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [drafts, safeDraftIndex]);

  // Synchronous flush on page reload, window close, or visibility change to guarantee no loss
  useEffect(() => {
    const saveImmediately = () => {
      try {
        localStorage.setItem(STORAGE_KEY_DRAFTS, serializeDraftsForStorage(drafts));
        localStorage.setItem(STORAGE_KEY_CURRENT_DRAFT_INDEX, String(safeDraftIndex));
        const nowStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        localStorage.setItem(STORAGE_KEY_LAST_SAVED_AT, nowStr);
      } catch (err) {
        console.warn('Immediate save on departure failed:', err);
      }
    };

    const handleBeforeUnload = () => {
      saveImmediately();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveImmediately();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [drafts, safeDraftIndex]);

  // Manual save trigger
  const handleManualSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAFTS, serializeDraftsForStorage(drafts));
      localStorage.setItem(STORAGE_KEY_CURRENT_DRAFT_INDEX, String(safeDraftIndex));
      const nowStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      localStorage.setItem(STORAGE_KEY_LAST_SAVED_AT, nowStr);
      setLastSavedAt(nowStr);
      setAutoSaveStatus('saved');
    } catch (err) {
      console.warn('Manual save failed:', err);
    }
  };

  // Reset to default sample drafts
  const handleResetDrafts = () => {
    if (window.confirm('确定要恢复为默认示例草稿吗？当前编辑的内容将被重置为系统预置示例。')) {
      setDrafts(INITIAL_DRAFTS);
      setCurrentDraftIndex(0);
      try {
        localStorage.setItem(STORAGE_KEY_DRAFTS, serializeDraftsForStorage(INITIAL_DRAFTS));
        localStorage.setItem(STORAGE_KEY_CURRENT_DRAFT_INDEX, '0');
        const nowStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        localStorage.setItem(STORAGE_KEY_LAST_SAVED_AT, nowStr);
        setLastSavedAt(nowStr);
        setAutoSaveStatus('saved');
      } catch (err) {
        console.warn('Reset drafts save failed:', err);
      }
    }
  };

  // Create new blank draft
  const handleCreateNewDraft = () => {
    const newDraft: ContentDraft = {
      id: `draft-${Date.now()}`,
      title: '未命名灵感草稿',
      platform: 'xiaohongshu',
      personaId: selectedPersonaId,
      coverText: '在此输入封面核心钩子...',
      content: '开始撰写你的爆款文案内容...',
      status: 'drafting',
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      hookStrength: 'adequate',
      storyboard: [
        { scene: 1, visual: '封面大字主图', audioVoiceover: '在此输入开场第一句台词...' },
        { scene: 2, visual: '核心干货对比拆解', audioVoiceover: '为什么大部分人做不好？核心误区拆解。' },
        { scene: 3, visual: '思维导图与行动号召 (CTA)', audioVoiceover: '总结复盘，欢迎评论区开麦交流。' }
      ]
    };
    setDrafts(prev => [newDraft, ...prev]);
    setCurrentDraftIndex(0);
    setActiveTab('studio');
  };

  // Draft updates
  const handleUpdateDraft = (updated: Partial<ContentDraft>) => {
    setDrafts(prev => {
      const copy = [...prev];
      const targetIndex = sanitizeDraftIndex(currentDraftIndex, copy.length);
      copy[targetIndex] = { 
        ...copy[targetIndex], 
        ...updated, 
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) 
      };
      return copy;
    });
  };

  const handleUpdateDraftContent = (newContent: string, status?: ContentDraft['status']) => {
    handleUpdateDraft({
      content: newContent,
      ...(status ? { status } : {})
    });
  };

  // Convert topic to draft
  const handleSelectTopicForStudio = (topic: TrendingTopic) => {
    const newDraft: ContentDraft = {
      id: `draft-${Date.now()}`,
      title: topic.title,
      platform: topic.platform,
      personaId: selectedPersonaId,
      coverText: topic.exampleHook,
      content: `关于【${topic.title}】，很多人都在跟风，但真正看透本质的少之又少！💡\n\n很多人以为自媒体拼的是体力，但真正拉开差距的是对用户心理的洞察。\n\n今天整理了3个核心干货：\n1️⃣ **别抓虚假流量，抓真实痛点**：${topic.angleSuggestion}；\n2️⃣ **前3秒就要给到确定性**：文案开头切忌废话，直接抛出反差；\n3️⃣ **发完及时做数据复盘**：藏赞比超过0.5，果断复制同类框架！\n\n如果对你也有启发，欢迎收藏备用！📌\n\n${topic.suggestedTags.join(' ')}`,
      status: 'drafting',
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      hookStrength: 'excellent',
      storyboard: [
        { scene: 1, visual: `封面大字：“${topic.exampleHook.slice(0, 20)}...”`, audioVoiceover: topic.exampleHook },
        { scene: 2, visual: '痛点对比表格与实操数据支撑', audioVoiceover: '为什么大部分人做不好？核心误区拆解。' },
        { scene: 3, visual: '结构化思维导图与行动号召 (CTA)', audioVoiceover: '总结复盘，欢迎评论区开麦交流。' }
      ]
    };

    setDrafts(prev => [newDraft, ...prev]);
    setCurrentDraftIndex(0);
    setActiveTab('studio');
  };

  // Bridge topic to copilot
  const handleSendTopicToCopilot = (topic: TrendingTopic) => {
    setIsCopilotOpen(true);
  };

  // Copilot text insertion into draft
  const handleApplyTextToDraft = (text: string, title?: string) => {
    handleUpdateDraft({
      content: text,
      ...(title ? { title } : {})
    });
  };

  // Feed Attribution Insight into Persona Memory
  const handleFeedIntoMemory = (learning: { topic: string; hook: string; keyLearning: string; viralMetric: string }) => {
    const newEntry = {
      id: `mem-${Date.now()}`,
      topic: learning.topic,
      hook: learning.hook,
      keyLearning: learning.keyLearning,
      viralMetric: learning.viralMetric,
      timestamp: new Date().toISOString().split('T')[0]
    };

    setPersonas(prev => prev.map(p => {
      if (p.id === selectedPersonaId) {
        return {
          ...p,
          memoryFewShots: [newEntry, ...p.memoryFewShots]
        };
      }
      return p;
    }));
  };

  // Update Persona
  const handleUpdatePersona = (updatedPersona: AccountPersona) => {
    setPersonas(prev => prev.map(p => p.id === updatedPersona.id ? updatedPersona : p));
  };

  // Add Attribution Post Data
  const handleAddPostData = (newPost: PostAttributionData) => {
    setAttributionPosts(prev => [newPost, ...prev]);
  };

  // Social Account CRUD & Refresh handlers
  const handleAddAccount = (newAccount: SocialAccount) => {
    setAccounts(prev => [newAccount, ...prev]);
  };

  const handleUpdateAccount = (updatedAccount: SocialAccount) => {
    setAccounts(prev => prev.map(a => a.id === updatedAccount.id ? updatedAccount : a));
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleRefreshAuth = (id: string) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === id) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 60);
        return {
          ...a,
          authStatus: 'authenticated',
          lastSyncedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          authExpiresAt: futureDate.toISOString().split('T')[0]
        };
      }
      return a;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
        selectedPersonaName={currentPersona.name}
        selectedPersonaRole={currentPersona.niche}
        personas={personas}
        selectedPersonaId={selectedPersonaId}
        onSelectPersona={setSelectedPersonaId}
        drafts={drafts}
        currentDraftIndex={safeDraftIndex}
        onSelectDraftIndex={(idx) => {
          setCurrentDraftIndex(idx);
          setActiveTab('studio');
        }}
        onCreateNewDraft={handleCreateNewDraft}
      />

      {/* Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Workspace Top Header & Auto-Save Status Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* View Breadcrumb / Title */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                {activeTab === 'trend' && '趋势雷达 (Trend Radar)'}
                {activeTab === 'studio' && '内容工坊 (Content Studio)'}
                {activeTab === 'gate' && '合规质检门禁 (Quality Gate)'}
                {activeTab === 'persona' && '人设记忆库 (Persona Memory)'}
                {activeTab === 'attribution' && '归因洞察实验室 (Attribution Lab)'}
                {activeTab === 'accounts' && '多平台账号矩阵 (Accounts)'}
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {drafts.length} 篇草稿受本地持久保护
              </span>
            </div>

            {/* Auto-Save & Storage Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Auto-save status indicator */}
              <div 
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-emerald-50 border-emerald-200 text-emerald-800"
                title="所有草稿编辑与分镜改动均已实时自动持久化至浏览器 localStorage，刷新页面或意外离开不丢失"
              >
                {autoSaveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span className="text-amber-700">正在保存草稿...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>草稿已自动保存</span>
                    {lastSavedAt && (
                      <span className="text-emerald-700 font-mono text-[11px]">({lastSavedAt})</span>
                    )}
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <button
                onClick={handleManualSave}
                title="立即保存当前草稿到本地存储"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              >
                <Save className="w-3 h-3 text-slate-500" />
                <span>存盘</span>
              </button>

              <button
                onClick={handleCreateNewDraft}
                title="新建一篇空白草稿"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 text-slate-600" />
                <span>新建草稿</span>
              </button>

              <button
                onClick={handleResetDrafts}
                title="恢复为系统默认初始示例草稿"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden md:inline">重置示例</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 transition-all">
        {activeTab === 'trend' && (
          <TrendRadarView
            topics={topics}
            onSelectTopicForStudio={handleSelectTopicForStudio}
            onSendTopicToCopilot={handleSendTopicToCopilot}
          />
        )}

        {activeTab === 'studio' && (
          <ContentStudioView
            currentDraft={currentDraft}
            personas={personas}
            onUpdateDraft={handleUpdateDraft}
            onSendToQualityGate={() => setActiveTab('gate')}
            onAskCopilotToRefine={(prompt) => {
              setIsCopilotOpen(true);
            }}
            drafts={drafts}
            currentDraftIndex={safeDraftIndex}
            onSelectDraftIndex={setCurrentDraftIndex}
            onCreateNewDraft={handleCreateNewDraft}
            lastSavedAt={lastSavedAt}
            autoSaveStatus={autoSaveStatus}
            onManualSave={handleManualSave}
          />
        )}

        {activeTab === 'gate' && (
          <QualityGateView
            draft={currentDraft}
            onUpdateDraftContent={handleUpdateDraftContent}
            onNavigateToStudio={() => setActiveTab('studio')}
            onNavigateToAttribution={() => setActiveTab('attribution')}
          />
        )}

        {activeTab === 'persona' && (
          <PersonaMemoryView
            personas={personas}
            selectedPersonaId={selectedPersonaId}
            onSelectPersona={setSelectedPersonaId}
            onUpdatePersona={handleUpdatePersona}
            onAskCopilotWithPersona={(persona, prompt) => {
              setSelectedPersonaId(persona.id);
              setIsCopilotOpen(true);
            }}
          />
        )}

        {activeTab === 'attribution' && (
          <AttributionLabView
            posts={attributionPosts}
            onAddPostData={handleAddPostData}
            onFeedIntoMemory={handleFeedIntoMemory}
            currentPersona={currentPersona}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountManagementView
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onRefreshAuth={handleRefreshAuth}
          />
        )}
      </main>
      </div>

      {/* Floating Copilot Toggle for Convenient Access */}
      {!isCopilotOpen && (
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-30 px-4 py-3 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-800 transition-transform active:scale-95 flex items-center gap-2.5 text-xs font-semibold cursor-pointer border border-slate-700"
          aria-label="打开DeepSeek Harness搭档对话"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>呼叫 AI 内容搭档 (dsh)</span>
        </button>
      )}

      {/* DeepSeek Harness Conversational Core Panel */}
      <DshCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        currentPersona={currentPersona}
        currentDraft={currentDraft}
        onApplyTextToDraft={handleApplyTextToDraft}
        onNavigateToTab={setActiveTab}
      />
    </div>
  );
}
