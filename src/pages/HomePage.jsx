import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ArrowRight,
  TrendingUp,
  Droplets,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Smartphone,
  Sparkles,
  Users,
  Award,
  Globe2,
  Star
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../features/products/components/ProductCard';

export const HomePage = () => {
  const { products } = useStore();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION (Matching media_1790671821385.png) */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        
        {/* Background Decorative Blur Orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-400/15 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide">
                <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Smart Farming for a Sustainable Future</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white font-serif leading-[1.15] tracking-tight">
                Empowering Farmers.{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-300 bg-clip-text text-transparent">
                  Growing Tomorrow.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                CraftFarm brings IoT sensor technology, real-time yield analytics, and fresh marketplace logistics to help you increase crop yield, reduce fertilizer costs, and build a profitable agricultural ecosystem.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/products"
                  className="px-7 py-3.5 rounded-full bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-700/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/dashboard"
                  className="px-7 py-3.5 rounded-full bg-white dark:bg-slate-800 border-2 border-emerald-600/30 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold text-sm hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Launch Dashboard</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified Organic Growers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Real-Time Inventory Log</span>
                </div>
              </div>

            </div>

            {/* Right Hero Image Card (With Live Sensors Overlay Widget) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 group">
                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80"
                  alt="Smart Farm Farmer with Tablet"
                  className="w-full h-[440px] object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Floating Metric Widget (Matching media_1790671821385.png) */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/50 dark:border-slate-700 shadow-xl flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Soil Health</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Good & Mineralized</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Moisture Level</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Optimal (65%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Circular Score Badge */}
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-lg">
                    <span className="text-xl font-extrabold leading-none">78%</span>
                    <span className="text-[9px] font-semibold opacity-90">Crop Score</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATS COUNTER BAR (Matching media_1790671821385.png green bar) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-emerald-900 dark:bg-slate-900 text-white p-8 sm:p-10 shadow-2xl border border-emerald-800 dark:border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-800/80 dark:divide-slate-800">
            
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-800/60 mx-auto flex items-center justify-center text-emerald-300 mb-2">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">25K+</h3>
              <p className="text-xs text-emerald-200 dark:text-slate-400 font-medium">Happy Registered Farmers</p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="w-10 h-10 rounded-full bg-emerald-800/60 mx-auto flex items-center justify-center text-emerald-300 mb-2">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">1.2M+</h3>
              <p className="text-xs text-emerald-200 dark:text-slate-400 font-medium">Acres Monitored Live</p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="w-10 h-10 rounded-full bg-emerald-800/60 mx-auto flex items-center justify-center text-emerald-300 mb-2">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">30%</h3>
              <p className="text-xs text-emerald-200 dark:text-slate-400 font-medium">Average Yield Increase</p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="w-10 h-10 rounded-full bg-emerald-800/60 mx-auto flex items-center justify-center text-emerald-300 mb-2">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">40%</h3>
              <p className="text-xs text-emerald-200 dark:text-slate-400 font-medium">Water Saved via IoT</p>
            </div>

          </div>
        </div>
      </section>

      {/* SMART SOLUTIONS GRID (Matching media_1790671821385.png 4 solution cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            WHAT WE OFFER
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif">
            Smart Solutions for Modern Farming
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Everything you need to manage your farm efficiently, track inventory movements, and sell directly to market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Crop Management */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Sprout className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Crop Management</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Plan, monitor, and manage your crop growth cycles with precision sensors and real-time field data.
            </p>
          </div>

          {/* Card 2: Irrigation Control */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Droplets className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Irrigation Control</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated smart drip irrigation scheduling to conserve groundwater and optimize root hydration.
            </p>
          </div>

          {/* Card 3: Fertilizer & Soil Care */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fertilizer & Soil Care</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Understand NPK soil composition better and apply targeted organic nutrients at the ideal time.
            </p>
          </div>

          {/* Card 4: Market Insights */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Market Insights</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Get real-time crop market prices, demand forecasts, and connect directly with bulk wholesale buyers.
            </p>
          </div>

        </div>

      </section>

      {/* FEATURED MARKETPLACE PRODUCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              FRESH HARVEST
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
              Featured Farm Produce & Tools
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All Marketplace Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* TECHNOLOGY & MOBILE APP SHOWCASE (Matching media_1790671821385.png bottom) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              SMART. SIMPLE. POWERFUL.
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif">
              Technology that grows with you
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              CraftFarm is your digital farming partner. Access real-time field data, expert recommendations, and inventory management tools — all in one seamless web & mobile app.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Real-time field monitoring & weather sync</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>AI-powered crop health & pest diagnostics</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Easy to use on mobile & web browser</span>
              </li>
            </ul>

            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/products"
                className="px-6 py-3 rounded-full bg-emerald-700 dark:bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-md shadow-emerald-700/20"
              >
                Learn More →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 p-4">
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80"
                alt="App Dashboard Preview"
                className="rounded-xl object-cover"
              />
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-between text-xs font-bold">
                <span>Field Sensor Sync Active</span>
                <span className="text-emerald-600 dark:text-emerald-400">Connected 🟢</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
