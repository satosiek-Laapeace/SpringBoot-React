import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Heart, ShieldCheck, Truck, RefreshCw, Sprout } from 'lucide-react';
import logoImg from '../../assets/images/craftfarm-logo.png';

export const Footer = () => {
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
              <h4 className="text-sm font-bold text-white">100% Farm Organic</h4>
              <p className="text-xs text-slate-400">Direct from local growers</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Smart Cold Fleet</h4>
              <p className="text-xs text-slate-400">Fresh temperature delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Guaranteed Quality</h4>
              <p className="text-xs text-slate-400">Inspected stock & grading</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Traceable Supply</h4>
              <p className="text-xs text-slate-400">Live movement history</p>
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
            Empowering modern farmers and connecting fresh harvest directly with consumers, stores, and suppliers through smart IoT technology and real-time inventory logistics.
          </p>
          <div className="space-y-2 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Phnom Penh & Battambang Smart Agri Parks, Cambodia</span>
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
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Marketplace</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Fresh Vegetables</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Organic Fruits</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Seeds & Grains</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Bio Fertilizers</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Farm Machinery</Link></li>
          </ul>
        </div>

        {/* Platform Solutions */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform Solutions</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Farmer Dashboard</Link></li>
            <li><Link to="/dashboard/inventory" className="hover:text-emerald-400 transition-colors">Stock Movements Log</Link></li>
            <li><Link to="/dashboard/products" className="hover:text-emerald-400 transition-colors">Product Catalog Manager</Link></li>
            <li><Link to="/dashboard/orders" className="hover:text-emerald-400 transition-colors">Order Dispatch System</Link></li>
            <li><Link to="/profile" className="hover:text-emerald-400 transition-colors">Delivery Address Book</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Farm Insights</h4>
          <p className="text-xs text-slate-400 mb-3">
            Subscribe for weekly crop market reports and price trends.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-emerald-600/20"
            >
              Join Newsletter
            </button>
          </form>
        </div>

      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          © {new Date().getFullYear()} CraftFarm Platform. All rights reserved.
        </div>
        <div className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>for Sustainable Tomorrow</span>
        </div>
      </div>
    </footer>
  );
};
