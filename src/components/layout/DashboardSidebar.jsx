import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  Truck,
  Car,
  Share2,
  Settings,
  HelpCircle,
  Plus,
  ChevronDown,
  Sparkles,
  Sprout,
  Crown
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import logoImg from '../../assets/images/craftfarm-logo.png';

export const DashboardSidebar = () => {
  const location = useLocation();
  const { currentUser, activeRole, switchRole } = useStore();

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
                {activeRole} Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Role Toggle Pill */}
        <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex text-xs font-bold">
          <button
            onClick={() => switchRole('SELLER')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeRole === 'SELLER'
                ? 'bg-emerald-500 text-white shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Farmer</span>
          </button>

          <button
            onClick={() => switchRole('ADMIN')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeRole === 'ADMIN'
                ? 'bg-emerald-500 text-white shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* MAIN MENU Section (Exact items from media_1790674953093.png) */}
        <div className="space-y-4">
          <div>
            <div className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              MAIN MENU
            </div>
            <nav className="space-y-1">
              
              <Link
                to="/dashboard/admin"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/dashboard/admin') || isActive('/dashboard')
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/dashboard/seller"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/dashboard/seller')
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Overview</span>
              </Link>

              <Link
                to="/dashboard/orders"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/dashboard/orders')
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders</span>
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
                <span>Products</span>
              </Link>

              <Link
                to="/dashboard/inventory"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive('/dashboard/inventory')
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Farmers</span>
              </Link>

              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <CreditCard className="w-4 h-4" />
                <span>Payments</span>
              </div>

              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <Truck className="w-4 h-4" />
                <span>Delivery</span>
              </div>

              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <Car className="w-4 h-4" />
                <span>Vehicles</span>
              </div>

              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <Share2 className="w-4 h-4" />
                <span>Social content</span>
              </div>

            </nav>
          </div>

          {/* OTHER Section */}
          <div>
            <div className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              OTHER
            </div>
            <nav className="space-y-1">
              <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>

              <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Setup Store Widget & User Profile (Exact layout from media_1790674953093.png) */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        
        {/* SETUP STORE Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 dark:text-slate-200">
            <span>SETUP STORE</span>
            <span className="text-emerald-600 dark:text-emerald-400">6 / 7</span>
          </div>
          
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
          </div>

          <button className="w-full py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm">
            Setup
          </button>
        </div>

        {/* Active User Footer Card */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
              {currentUser.avatar}
            </div>
            <div className="truncate">
              <span className="font-extrabold block truncate">{currentUser.full_name}</span>
              <span className="text-[10px] text-slate-400 font-normal block truncate">Admin</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </div>

      </div>
    </aside>
  );
};
