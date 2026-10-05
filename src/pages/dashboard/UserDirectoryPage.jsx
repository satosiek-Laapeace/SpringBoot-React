import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Ellipsis,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UnlockKeyhole,
  UserRound,
  UserPlus,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import { forgotPasswordAPI } from '../../features/auth/services/authApi';
import { createUserAPI, deleteUserAPI, fetchUsersAPI, setUserEnabledAPI, unlockUserAPI, updateUserRoleAPI } from '../../features/user-profile/services/profileApi';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';

const ROLE_META = {
  ADMIN: { labelKey: 'roleAdmin', color: '#8b5cf6', badge: 'border-violet-200 bg-violet-50 text-violet-700' },
  SELLER: { labelKey: 'roleSeller', color: '#399365', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  BUYER: { labelKey: 'roleBuyer', color: '#4a83c5', badge: 'border-blue-200 bg-blue-50 text-blue-700' },
};

const ROLE_OPTIONS = Object.keys(ROLE_META);

const normalizeRole = role => String(role ?? 'BUYER').replace(/^ROLE_/, '').toUpperCase();
const userId = user => user?.id ?? user?.userId ?? user?.user_id;
const userName = user => user?.fullName || user?.full_name || user?.displayName || user?.name || user?.username || 'Unnamed user';
const userEmail = user => user?.email || '';
const isLocked = user => Boolean(user?.lockTime ?? user?.lock_time);
const isEnabled = user => user?.enabled ?? user?.isEnabled ?? user?.is_enabled ?? true;

const getInitials = name => String(name || 'User')
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map(part => part[0]?.toUpperCase() || '')
  .join('');

const menuActionClass = 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600';

export const UserDirectoryPage = () => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedRole, setSelectedRole] = useState('BUYER');
  const [working, setWorking] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'BUYER' });

  const refreshUsers = useCallback(async (showLoader = true) => {
    if (showLoader) setRefreshing(true);
    setLoadError('');
    try {
      const result = await fetchUsersAPI();
      if (!Array.isArray(result)) throw new Error('The user service returned an unexpected response.');
      setUsers(result);
    } catch (error) {
      setLoadError(error.message || 'User records could not be loaded. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshUsers(false);
  }, [refreshUsers]);

  const distribution = useMemo(() => ROLE_OPTIONS.map(role => ({
    role,
    name: t(ROLE_META[role].labelKey),
    value: users.filter(user => normalizeRole(user.role) === role).length,
    color: ROLE_META[role].color,
  })), [users, t]);

  const lockedUsers = useMemo(() => users.filter(isLocked), [users]);
  const enabledCount = useMemo(() => users.filter(isEnabled).length, [users]);

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return users.filter(user => {
      const role = normalizeRole(user.role);
      const matchesRole = roleFilter === 'ALL' || role === roleFilter;
      const matchesSearch = !needle || [
        userId(user),
        userName(user),
        userEmail(user),
        role,
      ].some(value => String(value ?? '').toLowerCase().includes(needle));
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);
  const userPage = usePagination(filteredUsers);

  const beginRoleChange = user => {
    setSelectedRole(normalizeRole(user.role));
    setPendingAction({ type: 'role', user });
    setActionError('');
    setNotice('');
  };

  const beginUnlock = user => {
    setPendingAction({ type: 'unlock', user });
    setActionError('');
    setNotice('');
  };

  const beginEnabledChange = user => {
    setPendingAction({ type: 'enabled', user, enabled: !isEnabled(user) });
    setActionError('');
    setNotice('');
  };

  const beginDelete = user => {
    setPendingAction({ type: 'delete', user });
    setActionError('');
    setNotice('');
  };

  const createUser = async event => {
    event.preventDefault();
    setWorking(true);
    setActionError('');
    setNotice('');
    try {
      const created = await createUserAPI({ ...newUser, name: newUser.name.trim(), email: newUser.email.trim() });
      setUsers(current => [created, ...current]);
      setCreateOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'BUYER' });
      setNotice(`${t('usersCreated')} ${userName(created)} · ${t(ROLE_META[normalizeRole(created.role)]?.labelKey || 'roleBuyer')}`);
    } catch (error) {
      setActionError(error.message || 'The user account could not be created.');
    } finally {
      setWorking(false);
    }
  };

  const sendResetLink = async user => {
    setActionError('');
    setNotice('');
    try {
      await forgotPasswordAPI(userEmail(user));
      setNotice(`If an account exists for ${userEmail(user)}, a password reset link has been sent.`);
    } catch (error) {
      setActionError(error.message || 'The password reset request could not be sent.');
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    const id = userId(pendingAction.user);
    setWorking(true);
    setActionError('');
    setNotice('');
    try {
      const updated = pendingAction.type === 'role'
        ? await updateUserRoleAPI(id, selectedRole)
        : pendingAction.type === 'unlock'
          ? await unlockUserAPI(id)
          : pendingAction.type === 'enabled'
            ? await setUserEnabledAPI(id, pendingAction.enabled)
            : await deleteUserAPI(id);
      if (pendingAction.type === 'delete') {
        setUsers(current => current.filter(user => String(userId(user)) !== String(id)));
      } else {
        setUsers(current => current.map(user =>
          String(userId(user)) === String(id) ? { ...user, ...updated } : user
        ));
      }
      setNotice(pendingAction.type === 'delete'
        ? `${userName(pendingAction.user)}'s account was deleted.`
        : pendingAction.type === 'role'
        ? `${userName(pendingAction.user)} · ${t('usersRoleUpdated')} ${t(ROLE_META[selectedRole].labelKey)}`
        : pendingAction.type === 'unlock'
          ? `The login lock has been cleared for ${userName(pendingAction.user)}. Account enabled status was not changed.`
          : `${userName(pendingAction.user)}'s account is now ${pendingAction.enabled ? 'enabled' : 'disabled'}.`);
      setPendingAction(null);
    } catch (error) {
      setActionError(error.message || 'The requested access-control change could not be completed.');
    } finally {
      setWorking(false);
    }
  };

  const chartTotal = distribution.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm font-semibold text-slate-600" role="status"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> {t('usersLoading')}</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-slate-500">{t('usersSection')}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-slate-900">{t('adminUserDirectory')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{t('usersDescription')}</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button type="button" onClick={() => refreshUsers()} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-emerald-300 disabled:cursor-wait disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> {t('adminRefresh')}
          </button>
          <button type="button" onClick={() => { setActionError(''); setCreateOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-[#244b35] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#193b29]">
            <UserPlus className="h-4 w-4" /> {t('adminCreateUser')}
          </button>
        </div>
      </header>

      {loadError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{loadError}</div>}
      {actionError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{actionError}</div>}
      {notice && <div role="status" aria-live="polite" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{notice}</div>}

      <section className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]" aria-label={t('usersDistributionSecurity')}>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">{t('usersDistribution')}</p>
              <h2 className="mt-1 font-serif text-xl font-bold text-slate-900">{t('usersByRole')}</h2>
            </div>
            <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-600">{users.length} {t('usersCount')}</span>
          </div>
          {chartTotal > 0 ? (
            <div className="mt-2 grid items-center gap-3 sm:grid-cols-[1fr_1fr]">
              <div className="relative h-52 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution.filter(item => item.value > 0)} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={4} stroke="none">
                      {distribution.filter(item => item.value > 0).map(item => <Cell key={item.role} fill={item.color} />)}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} ${t('usersCount')}`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{chartTotal}</span>
                  <span className="text-[10px] font-medium text-slate-500">{t('usersAccountCount')}</span>
                </div>
              </div>
              <div className="space-y-3">
                {distribution.map(item => (
                  <div key={item.role} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-xs font-medium text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                    <span className="text-xs font-bold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-52 items-center justify-center text-center text-xs text-slate-500">{t('usersDistributionEmpty')}</div>
          )}
        </article>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className={`rounded-2xl border p-5 shadow-sm ${lockedUsers.length ? 'border-amber-200 bg-[#fffaf0]' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">{t('usersSecurityAlert')}</p>
                <h2 className="mt-1 font-serif text-lg font-bold text-slate-900">{t('usersLockedProfiles')}</h2>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${lockedUsers.length ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {lockedUsers.length ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
              </span>
            </div>
            <p className="mt-5 text-4xl font-bold tracking-tight text-slate-900">{lockedUsers.length}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{t('usersLockDescription')} <code className="rounded bg-white/70 px-1 py-0.5 text-[10px]">lock_time</code>.</p>
            {lockedUsers.length > 0 && <p className="mt-3 text-[11px] font-semibold text-amber-800">{t('usersReviewLocked')}</p>}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">{t('usersAccountStatus')}</p>
                <h2 className="mt-1 font-serif text-lg font-bold text-slate-900">{t('usersEnabledAccounts')}</h2>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><UsersRound className="h-5 w-5" /></span>
            </div>
            <p className="mt-5 text-4xl font-bold tracking-tight text-slate-900">{enabledCount}<span className="ml-1 text-base font-semibold text-slate-400">/ {users.length}</span></p>
            <p className="mt-1 text-xs text-slate-500">{t('usersEnabledDescription')}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#548866] transition-all" style={{ width: `${users.length ? enabledCount / users.length * 100 : 0}%` }} />
            </div>
          </article>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900">{t('usersMasterDirectory')}</h2>
            <p className="mt-1 text-xs text-slate-500">{filteredUsers.length} {t('paginationOf')} {users.length} {t('usersAccountsConfirmation')}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block sm:w-64">
              <span className="sr-only">{t('usersSearchLabel')}</span>
              <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('usersSearchPlaceholder')} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/15" />
            </label>
            <label className="relative block">
              <span className="sr-only">{t('usersFilterRole')}</span>
              <select value={roleFilter} onChange={event => setRoleFilter(event.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 sm:w-36">
                <option value="ALL">{t('usersAllRoles')}</option>
                {ROLE_OPTIONS.map(role => <option key={role} value={role}>{t(ROLE_META[role].labelKey)}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </label>
          </div>
        </div>

        {filteredUsers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">{t('usersId')}</th>
                  <th scope="col" className="px-3 py-3">{t('usersAvatar')}</th>
                  <th scope="col" className="px-3 py-3">{t('adminFullName')}</th>
                  <th scope="col" className="px-3 py-3">{t('adminAssignedRole')}</th>
                  <th scope="col" className="px-3 py-3">{t('usersStatus')}</th>
                  <th scope="col" className="px-5 py-3 text-right">{t('adminActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userPage.paginatedItems.map(user => {
                  const role = normalizeRole(user.role);
                  const meta = ROLE_META[role] || ROLE_META.BUYER;
                  const locked = isLocked(user);
                  const enabled = isEnabled(user);
                  const avatar = user.profilePictureUrl || user.profile_picture_url || user.avatarUrl;
                  return (
                    <tr key={userId(user)} className="transition-colors hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-slate-600">#{userId(user)}</td>
                      <td className="px-3 py-4">
                        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : getInitials(userName(user))}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <p className="text-xs font-bold text-slate-800">{userName(user)}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{userEmail(user) || t('usersEmailUnavailable')}</p>
                      </td>
                      <td className="px-3 py-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${meta.badge}`}>{t(meta.labelKey)}</span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${enabled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />{enabled ? t('usersEnabled') : t('usersDisabled')}
                          </span>
                          {locked && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700"><LockKeyhole className="h-3 w-3" /> {t('usersLoginLocked')}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <details className="relative inline-block text-left">
                          <summary aria-label={`${t('adminActions')}: ${userName(user)}`} className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 [&::-webkit-details-marker]:hidden">
                            <Ellipsis className="h-4 w-4" />
                          </summary>
                          <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                            <button type="button" onClick={() => beginRoleChange(user)} className={menuActionClass}><UserRound className="h-3.5 w-3.5" /> {t('usersChangeRole')}</button>
                            <button type="button" onClick={() => sendResetLink(user)} disabled={!userEmail(user)} className={`${menuActionClass} disabled:cursor-not-allowed disabled:opacity-50`}><Mail className="h-3.5 w-3.5" /> {t('usersSendResetLink')}</button>
                            <button type="button" onClick={() => beginUnlock(user)} disabled={!locked} className={`${menuActionClass} text-amber-800 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50`}><UnlockKeyhole className="h-3.5 w-3.5" /> {t('usersForceUnlock')}</button>
                            <button
                              type="button"
                              onClick={() => beginEnabledChange(user)}
                              disabled={String(userId(user)) === String(currentUser?.id) && isEnabled(user)}
                              className={`${menuActionClass} ${enabled ? 'text-rose-700 hover:bg-rose-50' : 'text-emerald-800 hover:bg-emerald-50'} disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {enabled ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                              {enabled ? t('adminDisableAccount') : t('adminEnableAccount')}
                            </button>
                            <button
                              type="button"
                              onClick={() => beginDelete(user)}
                              disabled={String(userId(user)) === String(currentUser?.id)}
                              className={`${menuActionClass} text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> {t('adminDeleteAccount')}
                            </button>
                          </div>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <UserRound className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">{t('usersNoMatches')}</p>
            <p className="mt-1 text-xs text-slate-500">{t('usersTryAnotherSearch')}</p>
          </div>
        )}
        {!loading && !loadError && <Pagination currentPage={userPage.currentPage} pageCount={userPage.pageCount} totalItems={userPage.totalItems} pageSize={userPage.pageSize} onPageChange={userPage.setCurrentPage} onPageSizeChange={userPage.setPageSize} t={t} />}
      </section>

      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={event => { if (event.target === event.currentTarget && !working) setPendingAction(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="access-confirm-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${pendingAction.type === 'role' ? 'bg-violet-50 text-violet-700' : pendingAction.type === 'unlock' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                  {pendingAction.type === 'role' ? <KeyRound className="h-5 w-5" /> : pendingAction.type === 'unlock' ? <UnlockKeyhole className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                </span>
                <div>
                  <h2 id="access-confirm-title" className="text-base font-bold text-slate-900">{pendingAction.type === 'role' ? t('usersConfirmRole') : pendingAction.type === 'unlock' ? t('usersConfirmUnlock') : pendingAction.type === 'delete' ? t('adminDeleteUserQuestion') : t('usersConfirmAccess')}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{userName(pendingAction.user)} · account #{userId(pendingAction.user)}</p>
                </div>
              </div>
              <button type="button" onClick={() => setPendingAction(null)} disabled={working} aria-label={t('adminCloseForm')} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><X className="h-4 w-4" /></button>
            </div>

            {pendingAction.type === 'role' ? (
              <label className="mt-5 block text-xs font-semibold text-slate-700">
                {t('usersNewRole')}
                <select value={selectedRole} onChange={event => setSelectedRole(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15">
                  {ROLE_OPTIONS.map(role => <option key={role} value={role}>{t(ROLE_META[role].labelKey)}</option>)}
                </select>
              </label>
            ) : pendingAction.type === 'unlock' ? (
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-900">
                {t('usersUnlockDescription')}
              </p>
            ) : pendingAction.type === 'delete' ? (
              <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-900">
                {t('adminDeleteUserWarning')}
              </p>
            ) : (
              <p className={`mt-5 rounded-xl border px-3.5 py-3 text-xs leading-5 ${pendingAction.enabled ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
                {pendingAction.enabled
                  ? t('adminAccountEnabledDescription')
                  : t('adminAccountDisabledDescription')}
              </p>
            )}

            {actionError && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{actionError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingAction(null)} disabled={working} className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{t('adminCancel')}</button>
              <button type="button" onClick={confirmAction} disabled={working || (pendingAction.type === 'role' && selectedRole === normalizeRole(pendingAction.user.role))} className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${pendingAction.type === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#244b35] hover:bg-[#193b29]'}`}>
                {working ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {working ? t('usersApplying') : pendingAction.type === 'delete' ? t('adminDeleteAccount') : t('adminConfirm')}
              </button>
            </div>
          </section>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="create-user-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between"><div><h2 id="create-user-title" className="text-base font-bold text-slate-900">{t('adminCreatePlatformUser')}</h2><p className="mt-1 text-xs text-slate-500">{t('adminCreateThroughAdminApi')}</p></div><button type="button" onClick={() => setCreateOpen(false)} aria-label={t('adminCloseForm')} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
            {actionError && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{actionError}</p>}
            <form onSubmit={createUser} className="mt-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">{t('adminFullName')}<input required minLength={2} maxLength={50} value={newUser.name} onChange={event => setNewUser(current => ({ ...current, name: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500" /></label>
              <label className="block text-xs font-semibold text-slate-700">{t('colEmail')}<input required type="email" value={newUser.email} onChange={event => setNewUser(current => ({ ...current, email: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500" /></label>
              <label className="block text-xs font-semibold text-slate-700">{t('adminTemporaryPassword')}<input required minLength={6} type="password" autoComplete="new-password" value={newUser.password} onChange={event => setNewUser(current => ({ ...current, password: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500" /></label>
              <label className="block text-xs font-semibold text-slate-700">{t('adminAssignedRole')}<select value={newUser.role} onChange={event => setNewUser(current => ({ ...current, role: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500">{ROLE_OPTIONS.map(role => <option key={role} value={role}>{t(ROLE_META[role].labelKey)}</option>)}</select></label>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700">{t('adminCancel')}</button><button type="submit" disabled={working} className="inline-flex items-center gap-2 rounded-lg bg-[#244b35] px-3.5 py-2 text-xs font-bold text-white disabled:opacity-60">{working ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}{t('adminCreateAccount')}</button></div>
            </form>
          </section>
        </div>
      )}

      <p className="flex items-start gap-2 px-1 text-[10px] leading-4 text-slate-500"><LockKeyhole className="mt-0.5 h-3 w-3 shrink-0" />{t('adminAccessAndResetNotice')}</p>
    </div>
  );
};
