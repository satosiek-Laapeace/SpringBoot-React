import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Heart, ShieldCheck, Truck, RefreshCw, Sprout } from 'lucide-react';
import logoImg from '../../assets/images/craftfarm-logo.png';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';

export const Footer = () => {
  const { t } = useLanguage();
  const { activeRole } = useStore();
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 transition-colors duration-300">
      
      {/* Value Proposition Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-3xl bg-slate-800/90 border border-slate-700/60 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('footerOrganic')}</h4>
              <p className="text-xs text-slate-400">{t('footerOrganicDescription')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('footerColdFleet')}</h4>
              <p className="text-xs text-slate-400">{t('footerColdFleetDescription')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('footerQuality')}</h4>
              <p className="text-xs text-slate-400">{t('footerQualityDescription')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('footerTraceableSupply')}</h4>
              <p className="text-xs text-slate-400">{t('footerTraceableDescription')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
        
        {/* Brand Info with Official Logo */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="CraftFarm Logo"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-lg"
            />
            <span className="text-2xl font-black font-serif text-white tracking-tight">CraftFarm</span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            {t('footerDescription')}
          </p>
          <div className="space-y-2 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{t('footerLocation')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>+855 23 888 999</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>support@craftfarm.com</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{t('footerMarketplace')}</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">{t('footerFreshVegetables')}</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">{t('footerOrganicFruits')}</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">{t('footerSeedsGrains')}</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">{t('footerFertilizers')}</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">{t('footerMachinery')}</Link></li>
          </ul>
        </div>

        {/* Platform Solutions */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{t('footerSolutions')}</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">{t('sellerDashboard')}</Link></li>
            <li><Link to="/dashboard/inventory" className="hover:text-emerald-400 transition-colors">{t('inventoryTitle')}</Link></li>
            <li><Link to="/dashboard/products" className="hover:text-emerald-400 transition-colors">{t('adminProductCatalog')}</Link></li>
            {activeRole !== 'SELLER' && (
              <li>
                <Link
                  to={activeRole === 'ADMIN' ? '/dashboard/admin/orders' : '/dashboard/orders'}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t('sellerOrders')}
                </Link>
              </li>
            )}
            <li><Link to="/profile" className="hover:text-emerald-400 transition-colors">{t('addressBook')}</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{t('footerInsights')}</h4>
          <p className="text-xs text-slate-400 mb-3">
            {t('footerInsightsDescription')}
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
            <input
              type="email"
              placeholder={t('footerEmailPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-emerald-600/20"
            >
              {t('footerJoinNewsletter')}
            </button>
          </form>
        </div>

      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          © {new Date().getFullYear()} {t('footerCopyright')}
        </div>
        <div className="flex items-center gap-1">
          <span>{t('footerCraftedWith')}</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>{t('footerSustainable')}</span>
        </div>
      </div>
    </footer>
  );
};
