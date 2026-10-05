import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ShoppingCart, User, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { CraftFarmLogo } from '../common/CraftFarmLogo';
import { FlagEN, FlagKM } from '../common/FlagIcons';
import { ThemeToggle } from '../common/ThemeToggle';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, notifications, currentUser, activeRole, isNotificationsOpen, setIsCartOpen, setIsNotificationsOpen } = useStore();
  const { isAuthenticated, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const cartCount = cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const unreadNotifications = notifications?.filter(n => !n.is_read)?.length || 0;
  const profileImageUrl = currentUser?.profilePictureUrl || currentUser?.profile_picture_url || currentUser?.picture || currentUser?.imageUrl;
  const userRoles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  const isAdmin = [activeRole, currentUser?.role, ...userRoles].some(
    (role) => String(role || '').replace(/^ROLE_/, '').toUpperCase() === 'ADMIN'
  );
  const isSeller = [activeRole, currentUser?.role, ...userRoles].some(
    (role) => String(role || '').replace(/^ROLE_/, '').toUpperCase() === 'SELLER'
  );


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };


  const navLinks = [
    { label: t('navShop'), path: '/products' },
    { label: t('navCategories'), path: '/categories' },
    { label: t('navAbout'), path: '/about' },
    ...(activeRole === 'SELLER' ? [] : [{
      label: activeRole === 'ADMIN' ? t('adminOverview') : t('navMyOrders'),
      path: activeRole === 'ADMIN' ? '/dashboard/admin' : '/profile',
    }]),
  ];


  const handleSignOut = async () => {
    await signOut();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#081912]/90 backdrop-blur-md border-b border-gray-100/60 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:h-20 sm:gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <CraftFarmLogo size="sm" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 lg:flex lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3 py-2 rounded-full text-xs lg:px-4 lg:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1b4332] dark:bg-[#d4a373] text-white dark:text-[#1b4332] shadow-sm font-bold'
                      : 'text-[#1a202c] dark:text-gray-200 hover:bg-[#1b4332]/10 hover:text-[#1b4332] dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <form onSubmit={handleSearch} className="relative hidden max-w-md flex-1 lg:block">
            <div className="relative">
              <input
                type="text"
                placeholder={t('navSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#0e261b] text-[#1a202c] dark:text-white placeholder-gray-400 dark:placeholder-gray-400 pl-11 pr-4 py-2.5 rounded-full text-sm border border-transparent focus:border-[#1b4332] dark:focus:border-[#40916c] focus:bg-white dark:focus:bg-[#133525] focus:outline-none focus:ring-2 focus:ring-[#1b4332]/20 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 w-4 h-4" />
            </div>
          </form>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Language Switcher with Flags */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[#1b4332]/20 dark:border-white/20 hover:border-[#1b4332] bg-white dark:bg-[#0e261b] text-[#1a202c] dark:text-white text-xs font-bold transition-all"
                title={t('languageSelect')}
              >
                {language === 'km' ? <FlagKM className="w-5 h-3.5" /> : <FlagEN className="w-5 h-3.5" />}
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#0e261b] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-1.5 z-50 animate-fadeIn">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors ${
                      language === 'en' ? 'text-[#1b4332] dark:text-[#d4a373]' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <FlagEN className="w-5 h-3.5" />
                    <span>English (EN)</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('km');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors ${
                      language === 'km' ? 'text-[#1b4332] dark:text-[#d4a373]' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <FlagKM className="w-5 h-3.5" />
                    <span className="font-khmer">ខ្មែរ (KM)</span>
                  </button>
                </div>
              )}
            </div>
            <div className="hidden md:block"><ThemeToggle compact /></div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationsOpen(open => !open)}
              className="relative hidden cursor-pointer rounded-full p-2.5 text-[#1a202c] transition-colors hover:bg-[#1b4332]/10 hover:text-[#1b4332] dark:text-gray-200 dark:hover:bg-white/10 md:inline-flex"
              title={t('navNotifications')}
              aria-label={t('navNotifications')}
              aria-expanded={isNotificationsOpen}
            >
              <Bell className="w-5 h-5 stroke-[1.75]" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#d4a373] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-[#081912]">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Shopping Cart Counter */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate('/cart');
              }}
              className="relative p-2.5 text-[#1a202c] dark:text-gray-200 hover:text-[#1b4332] hover:bg-[#1b4332]/10 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title={t('navCart')}
              aria-label={cartCount > 0 ? t('navCartCount').replace('{count}', String(cartCount)) : t('navCart')}
            >
              <ShoppingCart className="w-5 h-5 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#1b4332] dark:bg-[#d4a373] text-white dark:text-[#1b4332] text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-[#081912]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Role Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-full border border-gray-200 dark:border-white/20 hover:border-[#1b4332] bg-white dark:bg-[#0e261b] text-[#1a202c] dark:text-white transition-all cursor-pointer"
              >
                <div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#1b4332] text-xs font-bold text-white">
                  {currentUser?.full_name ? currentUser.full_name.charAt(0) : currentUser?.username?.charAt(0) || <User className="w-4 h-4" />}
                  {profileImageUrl && <img src={profileImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(event) => event.currentTarget.remove()} />}
                </div>
                <span className="text-xs font-semibold hidden lg:inline-block max-w-[100px] truncate">
                  {currentUser?.full_name || currentUser?.username || t('navMyAccount')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0e261b] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{currentUser?.full_name || currentUser?.username || t('navGuest')}</p>
                    {currentUser?.email && <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>}
                    <div className="mt-1.5 inline-block px-2 py-0.5 bg-[#d4a373]/20 text-[#1b4332] dark:text-[#d4a373] text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {t('navRole')}: {activeRole}
                    </div>
                  </div>

                  <div className="py-1">
                    {isAuthenticated ? (
                      <>
                        {isAdmin && (
                          <Link
                            to="/dashboard/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="mx-2 mb-1 flex items-center rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
                          >
                            {t('adminOverview')}
                          </Link>
                        )}
                        {isSeller && (
                          <Link
                            to="/dashboard/seller"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="mx-2 mb-1 flex items-center rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
                          >
                            {t('sellerDashboard')}
                          </Link>
                        )}
                        <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1b4332] dark:text-gray-200 dark:hover:bg-white/10">{t('navAccountSettings')}</Link>
                        <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"><LogOut className="h-3.5 w-3.5" /> {t('sellerLogout')}</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10">{t('cartSignIn')}</Link>
                        <Link to="/register" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10">{t('navCreateAccount')}</Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? t('navCloseMenu') : t('navOpenMenu')}
              aria-expanded={mobileMenuOpen}
              className="rounded-lg p-2 text-[#1a202c] hover:bg-gray-100 dark:text-white dark:hover:bg-white/10 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav aria-label={t('navMobileNavigation')} className="border-t border-gray-100 pb-4 pt-3 dark:border-white/10 lg:hidden">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('navSearchPlaceholder')}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  location.pathname === link.path
                    ? 'bg-[#1b4332]/10 text-[#1b4332] dark:bg-white/10 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-white/10">
              <ThemeToggle compact />
              <button type="button" onClick={() => { setIsNotificationsOpen(open => !open); setMobileMenuOpen(false); }} aria-label={t('navNotifications')} aria-expanded={isNotificationsOpen} className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#d4a373] px-1 text-[9px] font-bold text-white">{unreadNotifications}</span>}
              </button>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10" aria-label={t('navCart')}>
                <ShoppingCart className="h-5 w-5" />
              </Link>
              {isAuthenticated ? (
                <>
                  {isSeller && <Link to="/dashboard/seller" onClick={() => setMobileMenuOpen(false)} className="ml-auto rounded-lg px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40">{t('sellerDashboard')}</Link>}
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10">{t('navAccountSettings')}</Link>
                  <button type="button" onClick={handleSignOut} className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40">{t('sellerLogout')}</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="ml-auto rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10">{t('cartSignIn')}</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40">{t('navCreateAccount')}</Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
