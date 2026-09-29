import React from 'react';
import { Bell, CheckCheck, Info, Tag, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const NotificationDropdown = () => {
  const {
    notifications,
    isNotificationsOpen,
    setIsNotificationsOpen,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useStore();

  if (!isNotificationsOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_STATUS':
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
      <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)} />
      <div className="absolute right-4 top-16 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
          </div>
          <button
            onClick={markAllNotificationsAsRead}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-3.5 flex gap-3 items-start cursor-pointer transition-colors ${
                  !n.is_read
                    ? 'bg-emerald-50/40 dark:bg-slate-800/60'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'
                }`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex-shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">{n.created_at}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-2.5 text-center bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Smart Alerts synchronized with CraftFarm Engine
          </span>
        </div>
      </div>
    </>
  );
};
