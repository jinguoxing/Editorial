/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AccountPersona } from '../dsh/engine';
import { 
  UserCheck, 
  BookOpen, 
  Brain, 
  Plus, 
  Trash2, 
  Sparkles, 
  MessageSquareQuote,
  ShieldBan,
  Check
} from 'lucide-react';

interface PersonaMemoryProps {
  personas: AccountPersona[];
  selectedPersonaId: string;
  onSelectPersona: (id: string) => void;
  onUpdatePersona: (persona: AccountPersona) => void;
  onAskCopilotWithPersona: (persona: AccountPersona, prompt: string) => void;
}

export const PersonaMemoryView: React.FC<PersonaMemoryProps> = ({
  personas,
  selectedPersonaId,
  onSelectPersona,
  onUpdatePersona,
  onAskCopilotWithPersona
}) => {
  const currentPersona = personas.find(p => p.id === selectedPersonaId) || personas[0];
  
  const [newCatchphrase, setNewCatchphrase] = useState('');
  const [newTaboo, setNewTaboo] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // New Memory Modal state
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [newMemTopic, setNewMemTopic] = useState('');
  const [newMemHook, setNewMemHook] = useState('');
  const [newMemLearning, setNewMemLearning] = useState('');
  const [newMemMetric, setNewMemMetric] = useState('');

  const handleAddCatchphrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatchphrase.trim()) return;
    const updated = {
      ...currentPersona,
      catchphrases: [...currentPersona.catchphrases, newCatchphrase.trim()]
    };
    onUpdatePersona(updated);
    setNewCatchphrase('');
  };

  const handleRemoveCatchphrase = (phrase: string) => {
    const updated = {
      ...currentPersona,
      catchphrases: currentPersona.catchphrases.filter(p => p !== phrase)
    };
    onUpdatePersona(updated);
  };

  const handleAddTaboo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaboo.trim()) return;
    const updated = {
      ...currentPersona,
      tabooTopics: [...currentPersona.tabooTopics, newTaboo.trim()]
    };
    onUpdatePersona(updated);
    setNewTaboo('');
  };

  const handleRemoveTaboo = (taboo: string) => {
    const updated = {
      ...currentPersona,
      tabooTopics: currentPersona.tabooTopics.filter(t => t !== taboo)
    };
    onUpdatePersona(updated);
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemTopic || !newMemLearning) return;
    const newEntry = {
      id: `mem-${Date.now()}`,
      topic: newMemTopic,
      hook: newMemHook || '实测数据反差前置',
      keyLearning: newMemLearning,
      viralMetric: newMemMetric || '新增沉淀规则',
      timestamp: new Date().toISOString().split('T')[0]
    };
    const updated = {
      ...currentPersona,
      memoryFewShots: [newEntry, ...currentPersona.memoryFewShots]
    };
    onUpdatePersona(updated);
    setShowAddMemoryModal(false);
    setNewMemTopic('');
    setNewMemHook('');
    setNewMemLearning('');
    setNewMemMetric('');
  };

  const handleRemoveMemory = (id: string) => {
    const updated = {
      ...currentPersona,
      memoryFewShots: currentPersona.memoryFewShots.filter(m => m.id !== id)
    };
    onUpdatePersona(updated);
  };

  const handleTestTone = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/dsh/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `请以【${currentPersona.name}】的语气，围绕“为什么自媒体新人总是在死磕无意义的细节？”写一段60字以内的人设短评。请务必使用口头禅“${currentPersona.catchphrases[0] || '核心逻辑'}”。`,
          persona: currentPersona,
          plugin: 'account_memory',
          platform: 'xiaohongshu'
        })
      });
      const data = await res.json();
      setTestResult(data.text || '测试成功完成。');
    } catch {
      setTestResult(`“${currentPersona.catchphrases[0] || '底层逻辑'}讲透，很多人每天花2小时抠字体颜色，却对前3秒跳出率视而不见。先跑通低阻力闭环，再谈完美！”`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            人设记忆库 · 越用越懂你的账号
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            固化创作者语气风格、受众画像与高赞历史沉淀，让 DeepSeek Harness 生成的内容像本人亲自执笔。
          </p>
        </div>

        {/* Persona Switcher Buttons */}
        <div className="flex items-center gap-2">
          {personas.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                p.id === selectedPersonaId
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <img
                src={p.avatarUrl}
                alt={p.name}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Persona Configuration Profile */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <img
                src={currentPersona.avatarUrl}
                alt={currentPersona.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{currentPersona.name}</h2>
                  <span className="text-xs text-slate-400 font-mono">{currentPersona.handle}</span>
                </div>
                <p className="text-xs text-slate-600">{currentPersona.niche}</p>
                <div className="text-[11px] text-slate-500">
                  <span>语气风格:</span>
                  <span className="font-semibold text-slate-800 ml-1">
                    {currentPersona.tone === 'sharp_professional' ? '锐利专业 / 拒绝废话' :
                     currentPersona.tone === 'humorous' ? '风趣幽默 / 犀利吐槽' :
                     currentPersona.tone === 'warm_companion' ? '温暖陪伴 / 治愈解惑' : '深度叙事'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700 block mb-1">🎯 核心目标受众画像</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  {currentPersona.targetAudience}
                </p>
              </div>

              {/* Catchphrases */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-slate-500" />
                    <span>常用金句与口头禅</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {currentPersona.catchphrases.map((phrase, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs"
                    >
                      <span>{phrase}</span>
                      <button
                        onClick={() => handleRemoveCatchphrase(phrase)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="删除此口头禅"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddCatchphrase} className="flex gap-2">
                  <input
                    type="text"
                    value={newCatchphrase}
                    onChange={e => setNewCatchphrase(e.target.value)}
                    placeholder="添加常用词（如：抄作业流程）..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 text-xs bg-slate-900 text-white rounded font-medium cursor-pointer"
                  >
                    添加
                  </button>
                </form>
              </div>

              {/* Taboo Topics */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <ShieldBan className="w-3.5 h-3.5 text-rose-500" />
                    <span>账号敏感红线与禁言主题</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {currentPersona.tabooTopics.map((taboo, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs"
                    >
                      <span>{taboo}</span>
                      <button
                        onClick={() => handleRemoveTaboo(taboo)}
                        className="text-rose-400 hover:text-rose-700 cursor-pointer"
                        title="删除此红线"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddTaboo} className="flex gap-2">
                  <input
                    type="text"
                    value={newTaboo}
                    onChange={e => setNewTaboo(e.target.value)}
                    placeholder="添加禁谈领域（如：云评测、虚假鸡汤）..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 text-xs bg-slate-800 text-white rounded font-medium cursor-pointer"
                  >
                    添加
                  </button>
                </form>
              </div>
            </div>

            {/* Test Tone Action */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={handleTestTone}
                disabled={isTesting}
                className="w-full py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isTesting ? '正在生成语气切片...' : '测试人设发声切片 (Persona Audio)'}</span>
              </button>

              {testResult && (
                <div className="mt-2.5 p-3 bg-amber-50/60 rounded-lg border border-amber-100 text-xs text-slate-800 leading-relaxed">
                  {testResult}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Accumulated Few-Shot Memory Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-slate-800" />
                <h3 className="text-sm font-semibold text-slate-900">
                  历史爆款沉淀记忆 (Few-shot Knowledge Base)
                </h3>
              </div>
              <button
                onClick={() => setShowAddMemoryModal(true)}
                className="px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>手动沉淀经验</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              每次在【数据归因】模块复盘成功的爆款都会自动汇集于此。创作工坊生成内容时，底层引擎会自动检索最匹配的2-3条范式进行上下文增强。
            </p>

            <div className="space-y-3.5">
              {currentPersona.memoryFewShots.map(mem => (
                <div
                  key={mem.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-sm">{mem.topic}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums text-slate-400 text-[11px]">{mem.timestamp}</span>
                      <button
                        onClick={() => handleRemoveMemory(mem.id)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="删除该条记忆"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-amber-700 block mb-0.5 font-medium">验证爆款钩子：</span>
                    <p className="text-slate-800 italic leading-relaxed">“{mem.hook}”</p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-0.5">沉淀的核心逻辑：</span>
                    <p className="text-slate-700 leading-relaxed">{mem.keyLearning}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">历史战绩:</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-800">
                      {mem.viralMetric}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Memory Modal */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">手动录入账号爆款记忆</h3>
            <form onSubmit={handleAddMemory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">选题标题</label>
                <input
                  type="text"
                  required
                  value={newMemTopic}
                  onChange={e => setNewMemTopic(e.target.value)}
                  placeholder="例如：为什么聪明人从不汇报流水账？"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">黄金钩子第一句</label>
                <input
                  type="text"
                  value={newMemHook}
                  onChange={e => setNewMemHook(e.target.value)}
                  placeholder="例如：别把听话当竞争力！"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">可复用的核心规律 (Learning)</label>
                <textarea
                  rows={3}
                  required
                  value={newMemLearning}
                  onChange={e => setNewMemLearning(e.target.value)}
                  placeholder="例如：前3秒指出常见误区，中段列举3个具体模板，文末引导评论区开麦。"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">战绩数据参考</label>
                <input
                  type="text"
                  value={newMemMetric}
                  onChange={e => setNewMemMetric(e.target.value)}
                  placeholder="例如：10万+播放 · 8000+点赞"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemoryModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  保存沉淀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
