/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  SocialAccount, 
  SocialPlatform, 
  AuthStatus, 
  filterSocialAccounts, 
  calculateAccountStats,
  validateSocialAccount 
} from '../dsh/engine';
import { 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ExternalLink,
  Users,
  Clock,
  Sparkles,
  X
} from 'lucide-react';

interface AccountManagementProps {
  accounts: SocialAccount[];
  onAddAccount: (account: SocialAccount) => void;
  onUpdateAccount: (account: SocialAccount) => void;
  onDeleteAccount: (id: string) => void;
  onRefreshAuth: (id: string) => void;
}

export const AccountManagementView: React.FC<AccountManagementProps> = ({
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onRefreshAuth
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | SocialPlatform>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AuthStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<SocialAccount | null>(null);
  const [refreshSuccessId, setRefreshSuccessId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPlatform, setFormPlatform] = useState<SocialPlatform>('xiaohongshu');
  const [formStatus, setFormStatus] = useState<AuthStatus>('authenticated');
  const [formHandle, setFormHandle] = useState('');
  const [formFollowers, setFormFollowers] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Computed filtered list and stats
  const filteredAccounts = useMemo(() => {
    return filterSocialAccounts(accounts, searchQuery, platformFilter, statusFilter);
  }, [accounts, searchQuery, platformFilter, statusFilter]);

  const stats = useMemo(() => {
    return calculateAccountStats(accounts);
  }, [accounts]);

  const getPlatformLabel = (platform: SocialPlatform) => {
    switch (platform) {
      case 'xiaohongshu': return '小红书';
      case 'douyin': return '抖音';
      case 'weibo': return '微博';
      case 'wechat': return '微信公众号';
      case 'bilibili': return 'B站';
    }
  };

  const openCreateModal = () => {
    setEditingAccountId(null);
    setFormName('');
    setFormPlatform('xiaohongshu');
    setFormStatus('authenticated');
    setFormHandle('');
    setFormFollowers(10000);
    setFormNotes('');
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const openEditModal = (acc: SocialAccount) => {
    setEditingAccountId(acc.id);
    setFormName(acc.accountName);
    setFormPlatform(acc.platformType);
    setFormStatus(acc.authStatus);
    setFormHandle(acc.handle);
    setFormFollowers(acc.followerCount);
    setFormNotes(acc.notes || '');
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      accountName: formName,
      platformType: formPlatform,
      authStatus: formStatus,
      handle: formHandle.trim() || `@${formName.replace(/\s+/g, '')}`,
      followerCount: Number(formFollowers) || 0,
      notes: formNotes
    };

    const validation = validateSocialAccount(payload);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);
    const expiresStr = futureDate.toISOString().split('T')[0];

    if (editingAccountId) {
      const existing = accounts.find(a => a.id === editingAccountId);
      if (existing) {
        onUpdateAccount({
          ...existing,
          ...payload,
          lastSyncedAt: nowStr,
          authExpiresAt: formStatus === 'authenticated' ? expiresStr : existing.authExpiresAt
        });
      }
    } else {
      const newAcc: SocialAccount = {
        id: `acc-${Date.now()}`,
        ...payload,
        lastSyncedAt: nowStr,
        authExpiresAt: formStatus === 'authenticated' ? expiresStr : nowStr.slice(0, 10),
        avatarUrl: ''
      };
      onAddAccount(newAcc);
    }

    setIsModalOpen(false);
  };

  const handleTriggerRefresh = (id: string) => {
    onRefreshAuth(id);
    setRefreshSuccessId(id);
    setTimeout(() => setRefreshSuccessId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            账号管理 · 社媒矩阵授权 (Accounts)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            集中管理抖音、小红书、微博、微信公众号及 B 站等平台账号、绑定凭据及授权生命周期。
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>绑定新社媒账号</span>
        </button>
      </div>

      {/* Aggregate Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 block mb-1">已连接账号总数</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {stats.total} <span className="text-xs font-normal text-slate-500">个矩阵账号</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 block mb-1">正常授权生效中</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>{stats.authenticated}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 block mb-1">急需重新授权</span>
          <div className={`text-2xl font-bold font-mono tabular-nums flex items-center gap-1.5 ${
            stats.expired > 0 ? 'text-amber-600' : 'text-slate-700'
          }`}>
            <AlertTriangle className={`w-5 h-5 ${stats.expired > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>{stats.expired}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 block mb-1">矩阵总覆盖粉丝</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {(stats.totalFollowers / 10000).toFixed(1)} <span className="text-xs font-normal text-slate-500">万粉丝</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Segmented Tabs */}
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
              onClick={() => setPlatformFilter('weibo')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                platformFilter === 'weibo'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              微博
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

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="all">所有状态</option>
            <option value="authenticated">仅显示：正常授权</option>
            <option value="expired">仅显示：已过期</option>
            <option value="unauthenticated">仅显示：待授权</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索账号名、Handle 或备注..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Accounts List / Cards Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-white space-y-2">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-medium text-slate-700">未找到符合条件的社媒账号</p>
          <p className="text-xs text-slate-500">尝试调整筛选条件或点击右上角添加新账号</p>
          <button
            onClick={openCreateModal}
            className="mt-2 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            绑定第一个账号
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAccounts.map(acc => {
            const isAuth = acc.authStatus === 'authenticated';
            const isExpired = acc.authStatus === 'expired';
            return (
              <div
                key={acc.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-shadow hover:shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Platform & Status Header */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {getPlatformLabel(acc.platformType)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-400 text-[11px]">{acc.handle}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1 font-medium text-[11px]">
                      {isAuth ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>正常授权</span>
                        </span>
                      ) : isExpired ? (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>授权已过期</span>
                        </span>
                      ) : (
                        <span className="text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>待绑定授权</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {acc.accountName}
                  </h3>

                  {acc.notes && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {acc.notes}
                    </p>
                  )}

                  {/* Account Metrics info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">粉丝体量</span>
                      <span className="font-mono font-semibold tabular-nums text-slate-800">
                        {acc.followerCount.toLocaleString()} 关注
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">最后同步</span>
                      <span className="font-mono tabular-nums text-slate-600 text-[11px]">
                        {acc.lastSyncedAt.slice(5)}
                      </span>
                    </div>
                  </div>

                  {/* Expiration date notice */}
                  <div className="mt-2 text-[11px] text-slate-400 font-mono tabular-nums">
                    授权到期日: {acc.authExpiresAt}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTriggerRefresh(acc.id)}
                    className="px-2.5 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    title="刷新或重新授予凭据有效期"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshSuccessId === acc.id ? 'animate-spin text-emerald-600' : ''}`} />
                    <span>{refreshSuccessId === acc.id ? '已刷新授权' : isAuth ? '刷新授权' : '重新授权'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(acc)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="编辑账号信息"
                      aria-label={`编辑 ${acc.accountName}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingAccount(acc)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="解绑/删除账号"
                      aria-label={`删除 ${acc.accountName}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingAccountId ? '编辑社媒账号' : '绑定新社媒账号'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="关闭弹窗"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formErrors.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 space-y-1">
                {formErrors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  账号名称 (Account Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="例如：林学姐职场干货"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    平台类型 (Platform) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formPlatform}
                    onChange={e => setFormPlatform(e.target.value as SocialPlatform)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="douyin">抖音 (Douyin)</option>
                    <option value="xiaohongshu">小红书 (Xiaohongshu)</option>
                    <option value="weibo">微博 (Weibo)</option>
                    <option value="wechat">微信公众号 (WeChat)</option>
                    <option value="bilibili">B站 (Bilibili)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    授权状态 (Status) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as AuthStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="authenticated">正常授权 (Active)</option>
                    <option value="expired">授权已过期 (Expired)</option>
                    <option value="unauthenticated">待授权 (Pending)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    账号唯一标识 (Handle / UID)
                  </label>
                  <input
                    type="text"
                    value={formHandle}
                    onChange={e => setFormHandle(e.target.value)}
                    placeholder="例如：@LinWorkMaster"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    当前粉丝量
                  </label>
                  <input
                    type="number"
                    value={formFollowers}
                    onChange={e => setFormFollowers(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  备注说明 (Notes)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="例如：主理职场生产力与知识管理，同步小红书图文..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  {editingAccountId ? '保存修改' : '确认绑定'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">确认解除该账号绑定？</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  即将解除【{deletingAccount.accountName}】（{getPlatformLabel(deletingAccount.platformType)}）的授权绑定。解绑后将停止自动同步该账号的发布排期与数据归因。
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAccount(deletingAccount.id);
                  setDeletingAccount(null);
                }}
                className="px-3.5 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                确认解除绑定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
