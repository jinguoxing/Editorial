/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { AccountPersona, parsePluginCommand } from '../dsh/engine';
import { ContentDraft } from '../data/mockData';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  Command, 
  Compass, 
  PenTool, 
  ShieldCheck, 
  BarChart2, 
  Check, 
  ArrowRight
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  pluginUsed?: string;
  actionPayload?: {
    type: 'apply_to_draft' | 'jump_to_gate' | 'save_memory';
    data?: any;
  };
}

interface DshCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: AccountPersona;
  currentDraft: ContentDraft;
  onApplyTextToDraft: (text: string, title?: string) => void;
  onNavigateToTab: (tab: 'trend' | 'studio' | 'gate' | 'persona' | 'attribution' | 'accounts') => void;
}

export const DshCopilotDrawer: React.FC<DshCopilotDrawerProps> = ({
  isOpen,
  onClose,
  currentPersona,
  currentDraft,
  onApplyTextToDraft,
  onNavigateToTab
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `你好！我是你的私有社媒创作搭档，底座为 **DeepSeek Harness (dsh)** 插件体系。\n\n当前已自动加载你的账号人设：【**${currentPersona.name}**】（垂直定位：${currentPersona.niche}）。\n\n你可以随时：\n- 输入 \`/trend 选题赛道\` 扫描热点与前3秒钩子\n- 输入 \`/craft 核心亮点\` 生成适配小红书/抖音的成稿\n- 输入 \`/check\` 审查当前草稿的合规风险与广告法极限词\n- 输入 \`/recap\` 诊断最新发布数据并闭环沉淀进记忆库`,
      timestamp: '刚刚',
      pluginUsed: 'dsh.core'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePlugin, setActivePlugin] = useState<string>('dsh.core');
  const [appliedMsgId, setAppliedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputValue;
    if (!rawText.trim() || isLoading) return;

    const parsed = parsePluginCommand(rawText);
    const chosenPlugin = parsed.isCommand ? `dsh.${parsed.plugin}` : activePlugin;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: rawText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/dsh/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: parsed.args || rawText,
          persona: currentPersona,
          plugin: chosenPlugin,
          platform: currentDraft.platform,
          currentText: currentDraft.content
        })
      });

      const data = await response.json();
      const replyText = data.text || '已为你完成生成与解析。';

      const assistantMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pluginUsed: chosenPlugin,
        actionPayload: replyText.includes('【爆款主标题】') || replyText.includes('【正文结构】') || replyText.length > 120
          ? { type: 'apply_to_draft' }
          : undefined
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Graceful fallback
      const fallbackMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'assistant',
        text: `收到！已根据【${currentPersona.name}】的语言习惯优化完成。\n\n建议结合小红书用户“抄作业”心理，把前3秒的利益点反差放大。你可以直接点击下方按钮填入草稿箱。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pluginUsed: chosenPlugin,
        actionPayload: { type: 'apply_to_draft' }
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToStudio = (msg: ChatMessage) => {
    // Extract title if present
    const titleMatch = msg.text.match(/【爆款主标题】[：:]\s*(.+)/);
    const title = titleMatch ? titleMatch[1].trim() : undefined;
    onApplyTextToDraft(msg.text, title);
    setAppliedMsgId(msg.id);
    onNavigateToTab('studio');
    setTimeout(() => setAppliedMsgId(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-white border-l border-slate-200 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight">DeepSeek Harness 搭档</h2>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                {activePlugin}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span>人设记忆:</span>
              <span className="font-semibold text-amber-300">{currentPersona.name}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="关闭搭档对话"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Plugin Switcher Quick Pills */}
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-400 shrink-0">插件挂载:</span>
        <button
          onClick={() => setActivePlugin('dsh.trend_radar')}
          className={`px-2 py-1 rounded text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
            activePlugin === 'dsh.trend_radar' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          雷达 (/trend)
        </button>
        <button
          onClick={() => setActivePlugin('dsh.content_engine')}
          className={`px-2 py-1 rounded text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
            activePlugin === 'dsh.content_engine' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          创作 (/craft)
        </button>
        <button
          onClick={() => setActivePlugin('dsh.quality_gate')}
          className={`px-2 py-1 rounded text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
            activePlugin === 'dsh.quality_gate' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          质检 (/check)
        </button>
        <button
          onClick={() => setActivePlugin('dsh.attribution_lab')}
          className={`px-2 py-1 rounded text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
            activePlugin === 'dsh.attribution_lab' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          归因 (/recap)
        </button>
      </div>

      {/* Messages Flow */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
              <span>{msg.sender === 'user' ? '我' : 'DeepSeek Harness'}</span>
              {msg.pluginUsed && (
                <span className="font-mono text-[10px] text-slate-500">· {msg.pluginUsed}</span>
              )}
              <span>· {msg.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[92%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-br-xs'
                  : 'bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200/60'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              {/* Actionable Bridge inside AI message */}
              {msg.actionPayload?.type === 'apply_to_draft' && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleApplyToStudio(msg)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {appliedMsgId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>已填入创作工坊草稿</span>
                      </>
                    ) : (
                      <>
                        <PenTool className="w-3 h-3" />
                        <span>一键填入创作工坊</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onNavigateToTab('gate')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-[11px] font-medium flex items-center gap-1 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>送审质量门禁</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
            <span>DeepSeek Harness 正在结合账号人设推理与生成...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSendMessage('/trend 分析当前赛道爆款选题')}
          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap cursor-pointer"
        >
          /trend 选题
        </button>
        <button
          onClick={() => handleSendMessage('/craft 生成黄金前3秒文案')}
          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap cursor-pointer"
        >
          /craft 前3秒
        </button>
        <button
          onClick={() => handleSendMessage('/check 审核当前文案违禁词')}
          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap cursor-pointer"
        >
          /check 违禁词
        </button>
        <button
          onClick={() => handleSendMessage('/recap 复盘最新发布笔记')}
          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap cursor-pointer"
        >
          /recap 归因
        </button>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="输入对话或指令（如 /craft、/check）..."
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
              inputValue.trim() && !isLoading
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            aria-label="发送消息给AI搭档"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
