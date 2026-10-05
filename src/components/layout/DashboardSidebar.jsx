import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
  Sprout,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import logoImg from '../../assets/images/craftfarm-logo.png';

export const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, activeRole } = useStore();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between h-full min-h-[calc(100vh-5rem)] p-4 transition-colors duration-300">
      <div className="space-y-5">
        
        {/* Brand Logo Header (Matching AgriNest/CraftFarm screenshot style) */}
        <div className="px-3 py-2 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="CraftFarm Logo"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-sm"
            />
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 font-serif">CraftFarm</h3>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block -mt-0.5">
                {t('sellerStudio')}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Sprout className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('sellerWorkspace')}</span>
        </div>

        {/* Primary farm workflows */}
        <div className="space-y-4">
          <div>
            <div className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              {t('sellerMainMenu')}
            </div>
            <nav className="space-y-1">
              
              <Link
                to="/dashboard/seller"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/dashboard/admin') || isActive('/dashboard/seller') || isActive('/dashboard')
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t('sellerDashboard')}</span>
              </Link>

              <Link
                to="/dashboard/products"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/dashboard/products')
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>{t('sellerProducts')}</span>
              </Link>

              <Link
                to="/dashboard/inventory"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/dashboard/inventory')
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>{t('sellerInventory')}</span>
              </Link>

              <Link
                to="/dashboard/seller#analytics"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  location.hash === '#analytics'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>{t('sellerAnalytics')}</span>
              </Link>

            </nav>
          </div>

          {/* OTHER Section */}
          <div>
            <div className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              {t('sellerOther')}
            </div>
            <nav className="space-y-1">
              <Link to="/profile" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Settings className="w-4 h-4" />
                <span>{t('sellerSettings')}</span>
              </Link>

              <button onClick={async () => { await signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                <LogOut className="w-4 h-4" />
                <span>{t('sellerLogout')}</span>
              </button>

              <Link to="/contact" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                <HelpCircle className="w-4 h-4" />
                <span>{t('sellerHelp')}</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Active seller profile */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {currentUser?.avatar || currentUser?.full_name?.charAt(0) || currentUser?.username?.charAt(0) || 'F'}
            </div>
            <div className="truncate">
              <span className="font-extrabold block truncate">{currentUser?.full_name || currentUser?.username}</span>
              <span className="text-[10px] text-slate-400 font-normal block truncate">{activeRole}</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

      </div>
    </aside>
  );
};
