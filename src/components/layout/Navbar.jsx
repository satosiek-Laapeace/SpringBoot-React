import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  ShoppingBag,
  Bell,
  Search,
  Menu,
  X,
  User,
  ShieldAlert,
  ChevronDown,
  Globe,
  LayoutDashboard,
  Store,
  Sparkles,
  Info,
  PhoneCall,
  Crown,
  Sprout
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import logoImg from '../../assets/images/craftfarm-logo.png';

export const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const {
    currentUser,
    activeRole,
    switchRole,
    getCartCount,
    setIsCartOpen,
    notifications,
    setIsNotificationsOpen,
    isNotificationsOpen
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-emerald-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Official CraftFarm Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={logoImg}
                alt="CraftFarm Logo"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40 dark:ring-emerald-400/60 shadow-md group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
            <div>
              <span className="text-2xl font-black font-serif tracking-tight bg-gradient-to-r from-emerald-800 via-emerald-600 to-green-600 dark:from-emerald-300 dark:via-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                CraftFarm
              </span>
              <span className="block text-[10px] uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 -mt-1">
                Smart Agri Platform
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search vegetables, fruits, seeds, irrigation tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-emerald-50/70 dark:bg-slate-800/90 text-sm text-slate-800 dark:text-slate-100 border border-emerald-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-extrabold uppercase tracking-wide">
            <Link
              to="/"
              className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                isActive('/') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={`flex items-center gap-1 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                isActive('/products') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-500" />
              Marketplace
            </Link>

            <Link
              to="/about"
              className={`flex items-center gap-1 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                isActive('/about') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-emerald-500" />
              About
            </Link>

            <Link
              to="/contact"
              className={`flex items-center gap-1 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                isActive('/contact') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
              Contact
            </Link>

            {/* Seller & Admin Separate Dashboard Links */}
            <Link
              to="/dashboard/seller"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all ${
                isActive('/dashboard/seller')
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-slate-700 hover:bg-emerald-100'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Seller</span>
            </Link>

            <Link
              to="/dashboard/admin"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all ${
                isActive('/dashboard/admin')
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-slate-700 hover:bg-amber-100'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 ml-4">
            
            {/* Language Switcher */}
            <button
              onClick={() => toggleLanguage()}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-extrabold"
              title="Toggle Language"
            >
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Dark / Light Theme Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
              aria-label="Toggle Theme"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative ring-1 ring-slate-200 dark:ring-slate-700"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 px-3.5 font-bold text-xs active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Basket</span>
              {getCartCount() > 0 && (
                <span className="bg-white text-emerald-700 text-xs font-black rounded-full w-4 h-4 flex items-center justify-center shadow">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl lg:hidden text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 font-bold text-sm">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            Home
          </Link>
          <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            Marketplace
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            About CraftFarm
          </Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            Contact Support
          </Link>
          <Link to="/dashboard/seller" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-emerald-600 font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800">
            👨‍🌾 Seller Dashboard
          </Link>
          <Link to="/dashboard/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-amber-600 font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800">
            👑 Admin Dashboard
          </Link>
        </div>
      )}
    </header>
  );
};
