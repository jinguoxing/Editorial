/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { AccountPersona, PostAttributionData, SocialAccount } from './dsh/engine';
import { Sparkles, MessageSquare } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'trend' | 'studio' | 'gate' | 'persona' | 'attribution' | 'accounts'>('trend');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Core Data States
  const [personas, setPersonas] = useState<AccountPersona[]>(INITIAL_PERSONAS);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(INITIAL_PERSONAS[0].id);
  const [topics] = useState<TrendingTopic[]>(TRENDING_TOPICS_SEED);
  const [drafts, setDrafts] = useState<ContentDraft[]>(INITIAL_DRAFTS);
  const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
  const [attributionPosts, setAttributionPosts] = useState<PostAttributionData[]>(INITIAL_ATTRIBUTION_POSTS);
  const [accounts, setAccounts] = useState<SocialAccount[]>(INITIAL_ACCOUNTS);

  const currentPersona = personas.find(p => p.id === selectedPersonaId) || personas[0];
  const currentDraft = drafts[currentDraftIndex] || drafts[0];

  // Draft updates
  const handleUpdateDraft = (updated: Partial<ContentDraft>) => {
    setDrafts(prev => {
      const copy = [...prev];
      copy[currentDraftIndex] = { ...copy[currentDraftIndex], ...updated, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
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
      />

      {/* Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
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
