/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ContentDraft } from '../data/mockData';
import { auditContentQuality, QualityReport } from '../dsh/engine';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Wand2, 
  Lock, 
  Unlock, 
  Copy, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface QualityGateProps {
  draft: ContentDraft;
  onUpdateDraftContent: (newContent: string, status?: ContentDraft['status']) => void;
  onNavigateToStudio: () => void;
  onNavigateToAttribution: () => void;
}

export const QualityGateView: React.FC<QualityGateProps> = ({
  draft,
  onUpdateDraftContent,
  onNavigateToStudio,
  onNavigateToAttribution
}) => {
  const [factChecked, setFactChecked] = useState(false);
  const [lawChecked, setLawChecked] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Compute live quality report
  const report: QualityReport = useMemo(() => {
    return auditContentQuality(draft.content, draft.platform);
  }, [draft.content, draft.platform]);

  const handleApplySafeReplacements = () => {
    onUpdateDraftContent(report.safeText);
  };

  const handleSignOff = () => {
    if (!factChecked || !lawChecked) return;
    onUpdateDraftContent(draft.content, 'approved');
  };

  const handleCopyCleanText = () => {
    navigator.clipboard.writeText(`${draft.title}\n\n${draft.content}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const isApproved = draft.status === 'approved' || draft.status === 'published';

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            质量门禁 · 敢发布安全中枢
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            基于《广告法》及社媒社区规范，自动扫描极限词与过度承诺，结合人工双重确认锁，杜绝违规降权。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToStudio}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            返回草稿修改
          </button>
          {isApproved && (
            <button
              onClick={onNavigateToAttribution}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>转入发布与数据归因</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Overview Status Banner */}
      <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        !report.canPublish
          ? 'bg-rose-50/70 border-rose-200'
          : isApproved
          ? 'bg-emerald-50/70 border-emerald-200'
          : 'bg-amber-50/70 border-amber-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            !report.canPublish
              ? 'bg-rose-100 text-rose-600'
              : isApproved
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-amber-100 text-amber-600'
          }`}>
            {!report.canPublish ? (
              <ShieldAlert className="w-6 h-6" />
            ) : isApproved ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {!report.canPublish
                  ? '检测到高危合规风险 · 门禁拦截中'
                  : isApproved
                  ? '已完成人工终审核准 · 发布状态已锁定'
                  : '合规基本达标 · 等待人工签名放行'}
              </h2>
              <span className="text-xs text-slate-500">
                综合质量分: <span className="font-mono font-bold tabular-nums text-slate-800">{report.score}</span> / 100
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {!report.canPublish
                ? '文案中存在违反新广告法或过度承诺的极限用语，发布极易导致笔记降权甚至封号。请先点击“一键安全替换”或手动修正。'
                : isApproved
                ? '双重人工责任确认已签署，草稿文案已加锁，可直接复制或推向发布排期。'
                : '系统已完成机审，未发现阻断性违禁词。依照团队工作流，必须勾选人工复核项后方可放行。'}
            </p>
          </div>
        </div>

        {/* Quick safe fix action */}
        {report.violations.length > 0 && !isApproved && (
          <button
            onClick={handleApplySafeReplacements}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap self-start md:self-auto shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>一键安全替换 ({report.violations.length}处)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Violations List & Details */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span>合规风险点清单</span>
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  ({report.violations.length} 项发现)
                </span>
              </h3>
              {report.violations.length === 0 && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>未发现违规违禁词</span>
                </span>
              )}
            </div>

            {report.violations.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">词汇安全审核全部通过</p>
                <p className="text-[11px] text-slate-500 mt-1">未检测到广告法极限词、绝对化承诺或违规诱导分享词。</p>
              </div>
            ) : (
              <div className="space-y-3">
                {report.violations.map((v, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                      v.severity === 'danger'
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] font-mono ${
                          v.severity === 'danger' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                        }`}>
                          “{v.word}”
                        </span>
                        <span className="text-slate-500">
                          {v.category === 'advertising_law'
                            ? '新广告法极限词'
                            : v.category === 'over_promise'
                            ? '虚假绝对化承诺'
                            : '平台敏感/违规诱导'}
                        </span>
                      </div>
                      <span className={`font-semibold ${
                        v.severity === 'danger' ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        {v.severity === 'danger' ? '高危阻断' : '建议规避'}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed">{v.reason}</p>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-slate-500">建议合规替换方案:</span>
                      <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {v.suggestion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Golden Hook & Readability Diagnostics */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>黄金前3秒吸引力与内容体检</span>
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">识别的首句钩子 (Hook):</span>
                <span className={`font-semibold ${
                  report.hookStrength.level === 'excellent' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  评分: {report.hookStrength.score} / 100 ({report.hookStrength.level === 'excellent' ? '极佳' : '及格'})
                </span>
              </div>
              <p className="text-xs text-slate-800 bg-white p-2.5 rounded border border-slate-200 italic leading-relaxed">
                “{report.hookStrength.hookText || '未抓取到有效首句'}”
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                💡 优化建议: {report.hookStrength.tip}
              </p>
            </div>

            {/* Readability Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">全文字数</span>
                <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                  {report.metrics.wordCount}
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">Emoji 密度</span>
                <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                  {report.metrics.emojiCount} 个
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">段落留白</span>
                <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                  {report.metrics.paragraphCount} 段
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">预估朗读耗时</span>
                <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                  {report.metrics.estimatedReadSeconds} 秒
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Human Sign-off & Lock Mechanism */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                {isApproved ? <Lock className="w-4 h-4 text-emerald-600" /> : <Unlock className="w-4 h-4 text-amber-600" />}
                <span>人工确认与发布责任锁 (Human-in-the-Loop)</span>
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              AI 可以提效，但最终发布责任在创作者。通过“双人/双因素复核”，确保每篇推文都经得起读者推敲与法务审核。
            </p>

            {/* Checkbox Gates */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={factChecked || isApproved}
                  disabled={isApproved}
                  onChange={e => setFactChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <span className="leading-snug">
                  我已对文案涉及的数据、真实经历与案例进行人工核查，不存在捏造与虚构。
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lawChecked || isApproved}
                  disabled={isApproved}
                  onChange={e => setLawChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <span className="leading-snug">
                  我已复核《新广告法》条款，确认无违规极限词，无诱导刷赞与违规外链导流。
                </span>
              </label>
            </div>

            {/* Sign Off Button */}
            {!isApproved ? (
              <button
                onClick={handleSignOff}
                disabled={!report.canPublish || !factChecked || !lawChecked}
                className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                  report.canPublish && factChecked && lawChecked
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>人工终审签字 · 锁定允许发布</span>
              </button>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>已完成人工签字核准，草稿已进入“安全发布库”</span>
                </div>

                <button
                  onClick={handleCopyCleanText}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copySuccess ? '已复制合规发布文案' : '一键复制全平台合规稿'}</span>
                </button>

                <button
                  onClick={() => onUpdateDraftContent(draft.content, 'drafting')}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  解除锁定并重新编辑
                </button>
              </div>
            )}
          </div>

          {/* Current Monitored Draft Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <span className="font-semibold text-slate-700 block mb-2">当前受检草稿：</span>
            <h4 className="font-bold text-slate-900 mb-1">{draft.title}</h4>
            <p className="text-slate-600 line-clamp-6 whitespace-pre-line leading-relaxed">
              {draft.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
