import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Bell, Check, CheckCheck, LoaderCircle, Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  createNotificationAPI,
  deleteNotificationAPI,
  fetchAllNotificationsAPI,
  markAllNotificationsReadAPI,
  markNotificationReadAPI,
} from '../../features/notifications/services/notificationApi';
import { fetchUsersAPI } from '../../features/user-profile/services/profileApi';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/common/TableFilters';

const NOTIFICATION_TYPES = [
  'SYSTEM',
  'PROMOTION',
  'ORDER_PLACED',
  'ORDER_SHIPPED',
  'ORDER_DELIVERED',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'STOCK_LOW',
];

const userId = user => user?.id ?? user?.userId ?? user?.user_id;
const userName = user => user?.fullName ?? user?.full_name ?? user?.name ?? user?.username ?? user?.email ?? `User #${userId(user)}`;
const notificationRead = notification => Boolean(notification?.read ?? notification?.isRead ?? notification?.is_read);

export const AdminNotificationsPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading: authLoading, role } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoadedFor, setNotificationsLoadedFor] = useState('');
  const [notificationsLoadFailed, setNotificationsLoadFailed] = useState(false);
  const notificationLoadSequence = useRef(0);
  const [form, setForm] = useState({ type: 'SYSTEM', title: '', message: '' });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [readFilter, setReadFilter] = useState('ALL');
  const filteredNotifications = useMemo(() => {
    const query = historySearch.trim().toLocaleLowerCase();
    return notifications.filter(notification => {
      const isRead = notificationRead(notification);
      const matchesRead = readFilter === 'ALL' || (readFilter === 'READ' && isRead) || (readFilter === 'UNREAD' && !isRead);
      const matchesSearch = !query || [notification.title, notification.message, notification.type, notification.id]
        .some(value => String(value ?? '').toLocaleLowerCase().includes(query));
      return matchesRead && matchesSearch;
    });
  }, [notifications, historySearch, readFilter]);
  const notificationPage = usePagination(filteredNotifications);
  const canManageNotifications = isAuthenticated && role === 'ADMIN';

  const loadNotifications = useCallback(async (recipientId = selectedUserId) => {
    const requestSequence = ++notificationLoadSequence.current;
    if (!canManageNotifications || !recipientId) return false;
    try {
      const result = await fetchAllNotificationsAPI({ userId: recipientId, sort: 'createdAt,desc' });
      if (requestSequence !== notificationLoadSequence.current) return false;
      if (!Array.isArray(result)) throw new Error('The notification service returned an unsupported response.');
      setNotifications(result);
      setNotificationsLoadedFor(recipientId);
      setNotificationsLoadFailed(false);
      setError('');
      return true;
    } catch (loadError) {
      if (requestSequence !== notificationLoadSequence.current) return false;
      setError(loadError.message || 'Notifications could not be loaded.');
      setNotificationsLoadFailed(true);
      return false;
    }
  }, [canManageNotifications, selectedUserId]);

  const loadUsers = useCallback(async () => {
    if (authLoading || !canManageNotifications) return [];
    try {
      const result = await fetchUsersAPI();
      if (!Array.isArray(result)) throw new Error('The user service returned an unsupported response.');
      if (result.some(user => userId(user) == null)) {
        throw new Error('The user service returned a user without an ID.');
      }
      const recipientId = result.some(user => String(userId(user)) === selectedUserId)
        ? selectedUserId
        : (result[0] ? String(userId(result[0])) : '');
      setUsers(result);
      setSelectedUserId(recipientId);
      setError('');
      if (recipientId) {
        await loadNotifications(recipientId);
      } else {
        setNotifications([]);
        setNotificationsLoadedFor('');
        setNotificationsLoadFailed(false);
      }
      return result;
    } catch (loadError) {
      setError(loadError.message || 'Users could not be loaded.');
      return null;
    } finally {
      setLoadingUsers(false);
    }
  }, [authLoading, canManageNotifications, loadNotifications, selectedUserId]);

  useEffect(() => {
    if (!authLoading && canManageNotifications) loadUsers();
  }, [authLoading, canManageNotifications, loadUsers]);

  const refreshData = async () => {
    setLoadingUsers(true);
    setError('');
    setNotice('');
    setNotificationsLoadedFor('');
    setNotificationsLoadFailed(false);
    const refreshedUsers = await loadUsers();
    if (!refreshedUsers) return;
    const recipientId = refreshedUsers.some(user => String(userId(user)) === selectedUserId)
      ? selectedUserId
      : (refreshedUsers[0] ? String(userId(refreshedUsers[0])) : '');
    if (recipientId !== selectedUserId) {
      setSelectedUserId(recipientId);
    } else if (!recipientId) {
      setNotifications([]);
      setNotificationsLoadedFor('');
    }
  };

  const sendNotification = async event => {
    event.preventDefault();
    if (!canManageNotifications || !selectedUserId) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await createNotificationAPI({
        buyerId: Number(selectedUserId),
        type: form.type,
        title: form.title.trim(),
        message: form.message.trim(),
      });
      setForm(current => ({ ...current, title: '', message: '' }));
      setNotice('Notification sent.');
      await loadNotifications(selectedUserId);
    } catch (sendError) {
      setError(sendError.message || 'The notification could not be sent.');
    } finally {
      setSaving(false);
    }
  };

  const markRead = async notification => {
    setWorkingId(notification.id);
    setError('');
    try {
      await markNotificationReadAPI(notification.id, selectedUserId);
      setNotifications(current => current.map(item =>
        String(item.id) === String(notification.id) ? { ...item, read: true, isRead: true, is_read: true } : item
      ));
    } catch (actionError) {
      setError(actionError.message || 'The notification could not be marked as read.');
    } finally {
      setWorkingId(null);
    }
  };

  const deleteNotification = async notification => {
    setWorkingId(notification.id);
    setError('');
    try {
      await deleteNotificationAPI(notification.id, selectedUserId);
      setNotifications(current => current.filter(item => String(item.id) !== String(notification.id)));
      setNotice('Notification deleted.');
    } catch (actionError) {
      setError(actionError.message || 'The notification could not be deleted.');
    } finally {
      setWorkingId(null);
    }
  };

  const markAllRead = async () => {
    if (!selectedUserId) return;
    setWorkingId('all');
    setError('');
    try {
      await markAllNotificationsReadAPI(selectedUserId);
      setNotifications(current => current.map(item => ({ ...item, read: true, isRead: true, is_read: true })));
      setNotice('All notifications marked as read.');
    } catch (actionError) {
      setError(actionError.message || 'Notifications could not be marked as read.');
    } finally {
      setWorkingId(null);
    }
  };

  const unreadCount = notifications.filter(item => !notificationRead(item)).length;
  const loadingNotifications = Boolean(selectedUserId)
    && notificationsLoadedFor !== selectedUserId
    && !notificationsLoadFailed;

  return (
    <main className="space-y-5 pb-10">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-emerald-700">{t('adminCommunications')}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('adminNotifications')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('adminNotificationsDescription')}</p>
        </div>
        <button type="button" onClick={refreshData} disabled={loadingUsers || loadingNotifications || authLoading || !canManageNotifications} className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-300 disabled:opacity-60 sm:self-auto">
          <RefreshCw className={`h-3.5 w-3.5 ${loadingUsers || loadingNotifications ? 'animate-spin' : ''}`} />{t('adminRefresh')}
        </button>
      </header>

      {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">{notice}</p>}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form onSubmit={sendNotification} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t('adminSendNotification')}</h2>
            <p className="mt-1 text-xs text-slate-500">{t('adminSendNotificationDescription')}</p>
          </div>
          <label className="block text-xs font-semibold text-slate-700">
            {t('adminRecipient')}
            <select value={selectedUserId} onChange={event => { const recipientId = event.target.value; setNotificationsLoadedFor(''); setNotificationsLoadFailed(false); setSelectedUserId(recipientId); if (recipientId) loadNotifications(recipientId); }} disabled={loadingUsers || !users.length || !canManageNotifications} required className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500">
              {loadingUsers && <option value="">Loading users…</option>}
              {!loadingUsers && !users.length && <option value="">No users found</option>}
              {users.map(user => <option key={userId(user)} value={String(userId(user))}>{userName(user)}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            {t('adminType')}
            <select value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500">
              {NOTIFICATION_TYPES.map(type => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            {t('adminTitleLabel')}
            <input value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} required maxLength={255} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            {t('adminMessage')}
            <textarea value={form.message} onChange={event => setForm(current => ({ ...current, message: event.target.value }))} maxLength={1000} rows={4} className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </label>
          <button type="submit" disabled={saving || !selectedUserId} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{t('adminSendNotification')}
          </button>
        </form>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('adminNotificationHistory')}</h2>
              <p className="mt-1 text-xs text-slate-500">{filteredNotifications.length} of {notifications.length} {t('adminNotificationsCount')} · {unreadCount} {t('adminUnread')}</p>
            </div>
            <button type="button" onClick={markAllRead} disabled={!unreadCount || Boolean(workingId)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">
              <CheckCheck className="h-3.5 w-3.5" />{t('adminMarkAllRead')}
            </button>
          </header>
          <div className="border-b border-slate-100 px-4 py-3 sm:px-5"><TableFilters searchValue={historySearch} onSearchChange={setHistorySearch} searchPlaceholder="Search notifications..." searchLabel="Search notifications" filters={[{ label: 'Filter by read status', value: readFilter, onChange: setReadFilter, options: [{ value: 'ALL', label: 'All notifications' }, { value: 'UNREAD', label: 'Unread' }, { value: 'READ', label: 'Read' }] }]} /></div>
          {selectedUserId && (loadingNotifications || notificationsLoadedFor !== selectedUserId) ? (
            <div role="status" className="flex min-h-48 items-center justify-center text-xs font-semibold text-slate-600"><LoaderCircle className="mr-2 h-4 w-4 animate-spin text-emerald-700" />Loading notifications…</div>
          ) : selectedUserId && notificationsLoadFailed ? (
            <div role="alert" className="flex min-h-48 items-center justify-center px-6 text-center text-xs text-rose-700">Notifications could not be loaded. Use Refresh to try again.</div>
          ) : filteredNotifications.length ? (
            <div className="max-h-[38rem] divide-y divide-slate-100 overflow-y-auto">
              {notificationPage.paginatedItems.map(notification => {
                const isRead = notificationRead(notification);
                return (
                  <article key={notification.id} className={`flex gap-3 px-4 py-4 ${isRead ? '' : 'bg-emerald-50/40'}`}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm"><Bell className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{notification.title || t('adminNotificationSingular')}</h3>
                        {!isRead && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">{t('adminUnreadLabel')}</span>}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">{notification.message || t('adminNoMessage')}</p>
                      <p className="mt-1.5 text-[10px] text-slate-400">{notification.type?.replaceAll('_', ' ')} · {notification.createdAt || notification.created_at || 'Date unavailable'}</p>
                    </div>
                    <div className="flex shrink-0 items-start gap-1">
                      {!isRead && <button type="button" onClick={() => markRead(notification)} disabled={Boolean(workingId)} aria-label="Mark notification as read" title="Mark as read" className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"><Check className="h-4 w-4" /></button>}
                      <button type="button" onClick={() => deleteNotification(notification)} disabled={Boolean(workingId)} aria-label="Delete notification" title="Delete notification" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <Bell className="h-6 w-6 text-slate-300" />
              <p className="mt-2 text-xs font-semibold text-slate-700">{notifications.length ? 'No notifications match these filters.' : t('adminNoUserNotifications')}</p>
            </div>
          )}
          {!loadingNotifications && notificationsLoadedFor === selectedUserId && <Pagination currentPage={notificationPage.currentPage} pageCount={notificationPage.pageCount} totalItems={notificationPage.totalItems} pageSize={notificationPage.pageSize} onPageChange={notificationPage.setCurrentPage} onPageSizeChange={notificationPage.setPageSize} t={t} />}
        </section>
      </section>
    </main>
  );
};
