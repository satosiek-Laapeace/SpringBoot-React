import React, { useEffect } from 'react';
import { Bell, CheckCheck, Info, Tag, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';

export const NotificationDropdown = () => {
  const {
    notifications,
    isNotificationsOpen,
    setIsNotificationsOpen,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useStore();
  const { language, t } = useLanguage();
  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  useEffect(() => {
    if (!isNotificationsOpen) return undefined;
    const closeOnEscape = event => {
      if (event.key === 'Escape') setIsNotificationsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isNotificationsOpen, setIsNotificationsOpen]);

  if (!isNotificationsOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_STATUS':
      case 'ORDER_PLACED':
      case 'ORDER_CONFIRMED':
        return <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'PROMOTION':
        return <Tag className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <>
      <button type="button" aria-label={t('navCloseMenu')} className="fixed inset-0 z-40 cursor-default" onClick={() => setIsNotificationsOpen(false)} />
      <section role="dialog" aria-modal="true" aria-label={t('navNotifications')} className="fixed left-3 right-3 top-20 z-50 w-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 dark:border-slate-700 dark:bg-slate-900 sm:left-auto sm:right-6 sm:top-24 sm:w-96">
        
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('navNotifications')}</h3>
          </div>
          <button
            onClick={() => markAllNotificationsAsRead().catch(error => console.warn(`Could not mark notifications read: ${error.message}`))}
            disabled={unreadCount === 0}
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline disabled:cursor-default disabled:text-slate-400 disabled:no-underline dark:text-emerald-300 dark:disabled:text-slate-500"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {t('notificationMarkAllRead')}
          </button>
        </div>

        <div className="max-h-[min(60vh,24rem)] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              {t('notificationEmpty')}
            </div>
          ) : (
            notifications.map((n) => (
              <button
                type="button"
                key={n.id}
                onClick={() => markNotificationAsRead(n.id).catch(error => console.warn(`Could not mark notification read: ${error.message}`))}
                className={`flex w-full items-start gap-3 p-3.5 text-left transition-colors ${
                  !n.is_read
                    ? 'bg-emerald-50/40 dark:bg-slate-800/60'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'
                }`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {n.title}
                    </h4>
                    <span className="shrink-0 pl-2 text-[10px] text-slate-500 dark:text-slate-400">{n.created_at && !Number.isNaN(new Date(n.created_at).getTime()) ? new Date(n.created_at).toLocaleString(language === 'km' ? 'km-KH' : undefined) : ''}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-2.5 text-center dark:border-slate-700 dark:bg-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('notificationFooter')}
          </span>
        </div>
      </section>
    </>
  );
};
