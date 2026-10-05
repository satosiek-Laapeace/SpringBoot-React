import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Command,
  ExternalLink,
  CreditCard,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  Bell,
  Package,
  Search,
  Shapes,
  ShieldCheck,
  ShoppingBag,
  Star,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { fetchNotificationsAPI } from '../../features/notifications/services/notificationApi';
import { fetchOrdersAPI } from '../../features/orders/services/orderApi';
import { fetchUsersAPI } from '../../features/user-profile/services/profileApi';
import { CraftFarmLogo } from '../common/CraftFarmLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { ThemeToggle } from '../common/ThemeToggle';

const ADMIN_NAVIGATION = [
  { labelKey: 'adminOverview', path: '/dashboard/admin', Icon: LayoutDashboard },
  { labelKey: 'adminProductCatalog', path: '/dashboard/admin/catalog', Icon: Package },
  { labelKey: 'adminCategories', path: '/dashboard/admin/categories', Icon: Shapes },
  { labelKey: 'adminReviews', path: '/dashboard/admin/reviews', Icon: Star },
  { labelKey: 'adminNotificationCenter', path: '/dashboard/admin/notifications', Icon: Bell },
  { labelKey: 'adminOrders', path: '/dashboard/admin/orders', Icon: ShoppingBag },
  { labelKey: 'adminFinancialDesk', path: '/dashboard/admin/finance', Icon: CreditCard },
  { labelKey: 'adminSettings', path: '/dashboard/admin/settings', Icon: Settings },
  { labelKey: 'adminSuppliers', path: '/dashboard/admin/suppliers', Icon: BriefcaseBusiness },
  { labelKey: 'adminStockMovements', path: '/dashboard/admin/stock-movements', Icon: Package },
  { labelKey: 'adminUserDirectory', path: '/dashboard/admin/users', Icon: UsersRound },
  { labelKey: 'adminSecurityAudit', path: '/dashboard/admin/security-log', Icon: ShieldCheck },
];

const notificationRead = item => Boolean(item?.isRead ?? item?.is_read ?? item?.read);
const notificationTitle = item => item?.title || item?.message || 'Platform notification';
const notificationDate = item => item?.createdAt || item?.created_at || '';
const initials = name => String(name || 'Admin')
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map(part => part[0]?.toUpperCase() || '')
  .join('');

export const AdminConsoleLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const searchRef = useRef(null);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('farmcraft_admin_sidebar_collapsed') === 'true');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState('unknown');
  const [checkingHealth, setCheckingHealth] = useState(false);

  const displayName = user?.full_name || user?.fullName || user?.name || user?.username || 'Administrator';
  const email = user?.email || 'Administrator account';
  const avatar = user?.profilePictureUrl || user?.profile_picture_url || '';
  const unreadCount = notifications.filter(item => !notificationRead(item)).length;

  const matches = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];
    return ADMIN_NAVIGATION.filter(item => t(item.labelKey).toLowerCase().includes(query)).slice(0, 4);
  }, [searchTerm, t]);

  useEffect(() => {
    let active = true;
    if (!user?.id) return undefined;
    fetchNotificationsAPI({ userId: user.id, page: 0, size: 10 })
      .then(result => {
        if (active) setNotifications(Array.isArray(result) ? result : []);
      })
      .catch(() => {
        if (active) setNotifications([]);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    const onKeyDown = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setSearchFocused(false);
        setNotificationsOpen(false);
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(value => {
      const next = !value;
      localStorage.setItem('farmcraft_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const checkSystemHealth = useCallback(async () => {
    setCheckingHealth(true);
    setSystemHealth('checking');
    try {
      await Promise.all([fetchOrdersAPI(), fetchUsersAPI()]);
      setSystemHealth('healthy');
    } catch {
      setSystemHealth('degraded');
    } finally {
      setCheckingHealth(false);
    }
  }, []);

  const goTo = path => {
    navigate(path);
    setSearchFocused(false);
    setSearchTerm('');
    setMobileNavOpen(false);
  };

  const doSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const renderNavigation = isMobile => ADMIN_NAVIGATION.map(({ labelKey, path, Icon }) => {
    const label = t(labelKey);
    const targetPath = path.split('#')[0];
    const isCurrent = location.pathname === targetPath &&
      (path.includes('#') ? location.hash === path.slice(path.indexOf('#')) : true);
    return (
      <Link
        key={label}
        to={path}
        onClick={() => isMobile && setMobileNavOpen(false)}
        title={collapsed && !isMobile ? label : undefined}
        aria-current={isCurrent ? 'page' : undefined}
        className={`group relative flex min-h-10 items-center gap-3 rounded-lg px-2.5 text-[12.5px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
          isCurrent
            ? 'bg-emerald-50 text-emerald-800 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)] dark:bg-emerald-950/50 dark:text-emerald-200'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
        }`}
      >
        {isCurrent && <span aria-hidden="true" className="absolute inset-y-1.5 left-0 w-0.75 rounded-full bg-emerald-600" />}
        <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${isCurrent ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
        {(!collapsed || isMobile) && <span className="truncate">{label}</span>}
      </Link>
    );
  });

  const sidebarWidth = collapsed ? 'lg:w-[76px]' : 'lg:w-[248px]';
  const contentOffset = collapsed ? 'lg:pl-[76px]' : 'lg:pl-[248px]';

  return (
    <div className="admin-console min-h-screen bg-[#f7f9f7] font-sans text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {mobileNavOpen && <button type="button" aria-label={t('adminCloseNavigation')} onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,280px)] flex-col border-r border-slate-200/80 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 ${sidebarWidth} ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`flex h-16 shrink-0 items-center border-b border-slate-100 dark:border-slate-800 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <Link to="/dashboard/admin" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            <CraftFarmLogo size={collapsed ? 'sm' : 'md'} showText={!collapsed} />
          </Link>
          {!collapsed && <button type="button" aria-label={t('adminCloseNavigation')} onClick={() => setMobileNavOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"><X className="h-4 w-4" /></button>}
        </div>

        <div className={`flex min-h-0 flex-1 flex-col ${collapsed ? 'px-2' : 'px-3'}`}>
          <div className="min-h-0 flex-1 overflow-y-auto py-4">
            {!collapsed && <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[.2em] text-slate-400">{t('adminWorkspaceLabel')}</p>}
            <nav aria-label="Admin workspace navigation" className="space-y-1">{renderNavigation(mobileNavOpen)}</nav>

            {!collapsed && (
              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-900/70 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-900 dark:text-emerald-200"><ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />{t('adminProtectedWorkspace')}</div>
                <p className="mt-1.5 text-[10px] leading-4 text-emerald-900/70 dark:text-emerald-200/70">{t('adminProtectedDescription')}</p>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-100 py-3 dark:border-slate-800">
            <div className={`flex items-center gap-3 rounded-lg px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initials(displayName)}
              </span>
              {!collapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">{displayName}</span>
                  <span className="mt-0.5 block truncate text-[9px] text-slate-500 dark:text-slate-400">{email}</span>
                </span>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              <Link to="/" title={collapsed ? t('adminClientStorefront') : undefined} className="flex min-h-8 min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 text-[10px] font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-200">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />{!collapsed && <span className="truncate">{t('adminClientStorefront')}</span>}
              </Link>
              <button type="button" onClick={doSignOut} title={collapsed ? t('adminSignOut') : undefined} className="flex min-h-8 min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 text-[10px] font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300">
                <LogOut className="h-3.5 w-3.5 shrink-0" />{!collapsed && <span className="truncate">{t('adminSignOut')}</span>}
              </button>
            </div>
          </div>
        </div>

        <button type="button" onClick={toggleCollapsed} aria-label={collapsed ? t('adminExpandSidebar') : t('adminCollapseSidebar')} className="absolute -right-3 top-20 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 lg:flex">
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>

      <div className={`min-h-screen transition-[padding] duration-300 ${contentOffset}`}>
        <header className="sticky top-0 z-30 flex h-19 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button type="button" aria-label={t('adminOpenNavigation')} onClick={() => setMobileNavOpen(true)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"><Menu className="h-4 w-4" /></button>
            <div className="relative w-full max-w-130">
              <label htmlFor="admin-global-search" className="sr-only">{t('adminSearchSections')}</label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                id="admin-global-search"
                type="search"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 140)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && matches[0]) goTo(matches[0].path);
                }}
                placeholder={t('adminSearchPlaceholder')}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-20 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
              />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[9px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-900 sm:flex"><Command className="h-2.5 w-2.5" />K</kbd>
              {searchFocused && searchTerm && (
                <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
                  {matches.length ? matches.map(({ labelKey, path, Icon }) => (
                    <button key={path} type="button" onMouseDown={() => goTo(path)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-200">
                      <Icon className="h-4 w-4 text-slate-400" />{t(labelKey)}<ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-300" />
                    </button>
                  )) : <p className="px-3 py-3 text-xs text-slate-500">{t('adminNoSearchMatches')}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <ThemeToggle compact />
            <div className="relative">
              <button type="button" onClick={() => setNotificationsOpen(value => !value)} aria-label={`${t('adminNotifications')}, ${unreadCount} ${t('adminUnread')}`} aria-expanded={notificationsOpen} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                <Bell className="h-4.25 w-4.25" />
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4.25 min-w-4.25 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[8px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {notificationsOpen && (
                <>
                  <button type="button" aria-label={t('adminCloseNavigation')} onClick={() => setNotificationsOpen(false)} className="fixed inset-0 z-30 cursor-default" />
                  <section aria-label={t('adminNotifications')} className="absolute right-0 top-12 z-40 w-[min(88vw,360px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
                    <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <div><p className="text-xs font-bold text-slate-900 dark:text-slate-100">{t('adminNotifications')}</p><p className="mt-0.5 text-[10px] text-slate-500">{unreadCount} {t('adminUnread')}</p></div>
                      <button type="button" aria-label={t('adminCloseNavigation')} onClick={() => setNotificationsOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-3.5 w-3.5" /></button>
                    </header>
                    <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                      {notifications.length ? notifications.slice(0, 8).map((item, index) => (
                        <div key={item.id ?? index} className={`px-4 py-3 ${notificationRead(item) ? '' : 'bg-emerald-50/40 dark:bg-emerald-950/30'}`}>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{notificationTitle(item)}</p>
                          {item?.message && item.message !== notificationTitle(item) && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400">{item.message}</p>}
                          {notificationDate(item) && <p className="mt-1.5 text-[9px] text-slate-400">{notificationDate(item)}</p>}
                        </div>
                      )) : <p className="px-4 py-8 text-center text-xs text-slate-500">{t('adminNoNotifications')}</p>}
                    </div>
                  </section>
                </>
              )}
            </div>

            <button type="button" onClick={checkSystemHealth} disabled={checkingHealth} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              <span className={`h-2 w-2 rounded-full ${systemHealth === 'healthy' ? 'bg-emerald-500' : systemHealth === 'degraded' ? 'bg-rose-500' : systemHealth === 'checking' ? 'animate-pulse bg-amber-500' : 'bg-slate-300'}`} />
              <span className="hidden sm:inline">{checkingHealth ? t('adminChecking') : systemHealth === 'healthy' ? t('adminHealthy') : systemHealth === 'degraded' ? t('adminSystemIssue') : t('adminSystemHealth')}</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
