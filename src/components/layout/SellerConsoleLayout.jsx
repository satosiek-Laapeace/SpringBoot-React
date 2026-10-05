import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Sprout,
  X,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { CraftFarmLogo } from '../common/CraftFarmLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { ThemeToggle } from '../common/ThemeToggle';

const SELLER_NAVIGATION = [
  { labelKey: 'sellerDashboard', path: '/dashboard/seller', Icon: LayoutDashboard },
  { labelKey: 'sellerProducts', path: '/dashboard/products', Icon: Package },
  { labelKey: 'sellerInventory', path: '/dashboard/inventory', Icon: Boxes },
  { labelKey: 'sellerOrders', path: '/dashboard/orders', Icon: ClipboardList },
];

const getInitials = name => String(name || 'Seller')
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map(part => part[0]?.toUpperCase() || '')
  .join('');

export const SellerConsoleLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('farmcraft_seller_sidebar_collapsed') === 'true');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const displayName = user?.full_name || user?.fullName || user?.name || user?.username || 'Seller';
  const email = user?.email || '';
  const avatar = user?.profilePictureUrl || user?.profile_picture_url || '';
  const compactSidebar = collapsed && !mobileNavOpen;
  const activeNavigation = SELLER_NAVIGATION.find(item => item.path === location.pathname);

  const toggleCollapsed = () => {
    setCollapsed(current => {
      const next = !current;
      localStorage.setItem('farmcraft_seller_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const navigationLinks = isMobile => SELLER_NAVIGATION.map(({ labelKey, path, Icon }) => {
    const active = location.pathname === path;
    const label = t(labelKey);
    return (
      <Link
        key={path}
        to={path}
        onClick={() => isMobile && setMobileNavOpen(false)}
        title={collapsed && !isMobile ? label : undefined}
        aria-current={active ? 'page' : undefined}
        className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${active
          ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
        }`}
      >
        {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-full bg-emerald-600" />}
        <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
        {(!collapsed || isMobile) && <span className="truncate">{label}</span>}
      </Link>
    );
  });

  const sidebarWidth = collapsed ? 'lg:w-[76px]' : 'lg:w-[256px]';
  const contentOffset = collapsed ? 'lg:pl-[76px]' : 'lg:pl-[256px]';

  return (
    <div className="seller-console min-h-screen bg-[#f7f9f7] text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label={t('adminCloseNavigation')}
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,288px)] flex-col border-r border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/95 ${sidebarWidth} ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`flex h-16 shrink-0 items-center border-b border-slate-100 dark:border-slate-800 ${compactSidebar ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <Link to="/dashboard/seller" onClick={() => setMobileNavOpen(false)} aria-label="CraftFarm seller dashboard" className="min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            <CraftFarmLogo size={compactSidebar ? 'sm' : 'md'} showText={!compactSidebar} />
          </Link>
          {!compactSidebar && <button type="button" onClick={() => setMobileNavOpen(false)} aria-label={t('adminCloseNavigation')} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"><X className="h-4 w-4" /></button>}
        </div>

        <div className={`min-h-0 flex-1 overflow-y-auto py-5 ${compactSidebar ? 'px-2' : 'px-3'}`}>
          {!compactSidebar && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 text-xs font-bold text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
              <Sprout className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
              <span>{t('sellerWorkspace')}</span>
            </div>
          )}
          <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400 ${compactSidebar ? 'sr-only' : ''}`}>{t('sellerMainMenu')}</p>
          <nav aria-label={t('sellerMainMenu')} className="space-y-1">{navigationLinks(mobileNavOpen)}</nav>
        </div>

        <div className={`shrink-0 border-t border-slate-100 py-3 dark:border-slate-800 ${compactSidebar ? 'px-2' : 'px-3'}`}>
          <div className={`flex min-w-0 items-center gap-2.5 rounded-xl px-2 py-2 ${compactSidebar ? 'justify-center' : ''}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900">
              {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : getInitials(displayName)}
            </span>
            {!compactSidebar && <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{displayName}</span>{email && <span className="mt-0.5 block truncate text-[10px] text-slate-500 dark:text-slate-400">{email}</span>}</span>}
          </div>
          <div className={`mt-2 grid gap-1 ${compactSidebar ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Link to="/" title={compactSidebar ? t('adminClientStorefront') : undefined} className="flex min-h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-[10px] font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-200">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />{!compactSidebar && <span className="truncate">{t('adminClientStorefront')}</span>}
            </Link>
            <button type="button" onClick={handleSignOut} title={compactSidebar ? t('sellerLogout') : undefined} className="flex min-h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-[10px] font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300">
              <LogOut className="h-3.5 w-3.5 shrink-0" />{!compactSidebar && <span className="truncate">{t('sellerLogout')}</span>}
            </button>
          </div>
        </div>

        <button type="button" onClick={toggleCollapsed} aria-label={collapsed ? t('adminExpandSidebar') : t('adminCollapseSidebar')} className="absolute -right-3 top-20 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 lg:flex">
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>

      <div className={`min-h-screen transition-[padding] duration-300 ${contentOffset}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label={t('adminOpenNavigation')} onClick={() => setMobileNavOpen(true)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"><Menu className="h-4 w-4" /></button>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-400">{t('sellerWorkspace')}</p>
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{t(activeNavigation?.labelKey || 'sellerDashboard')}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <ThemeToggle compact />
            <Link to="/" aria-label={t('adminClientStorefront')} title={t('adminClientStorefront')} className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex">
              <ExternalLink className="h-4 w-4" /><span>{t('adminClientStorefront')}</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
