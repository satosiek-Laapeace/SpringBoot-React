import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Users,
  Target,
  Award,
  Globe,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Heart,
  Droplets,
  BarChart3
} from 'lucide-react';
import logoImg from '../assets/images/craftfarm-logo.png';

export const AboutPage = () => {
  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-b from-emerald-50/80 to-transparent dark:from-emerald-950/30 dark:to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <img
            src={logoImg}
            alt="CraftFarm"
            className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-emerald-500/40 shadow-2xl animate-bounce-slow"
          />
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300 dark:border-emerald-800">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Our Mission & Vision</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-serif tracking-tight max-w-3xl mx-auto">
            Reinventing Smart Agriculture & Direct Farm Logistics
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CraftFarm connects sustainable smallholder farmers directly with fresh food buyers, markets, and suppliers using real-time IoT sensors and traceable cold-chain delivery.
          </p>
        </div>
      </section>

      {/* Core Values / 3 Columns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Fair Farmer Income</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              By removing expensive middlemen, CraftFarm empowers local growers to earn 30% to 40% higher profits per harvest batch.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Eco & Water Conscious</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Our IoT soil moisture sensors reduce groundwater consumption by 40% while preserving rich topsoil nutrients.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">100% Traceable Organic</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every package features a QR code linking directly to the farm origin, harvest timestamp, and soil health score.
            </p>
          </div>

        </div>
      </section>

      {/* Leadership & Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-slate-900 text-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-slate-800 shadow-2xl">
          
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              OUR JOURNEY
            </span>
            <h2 className="text-3xl font-black font-serif">
              Built by Agronomists and Software Engineers
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Started in 2024, CraftFarm began as a small research trial in Battambang to help vegetable growers monitor soil moisture during dry seasons. Today, CraftFarm supports over 25,000 farmers and processes daily fresh harvests delivered straight to consumers and restaurants.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link
                to="/contact"
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-2"
              >
                <span>Get in Touch with Our Team</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <h4 className="text-3xl font-extrabold text-emerald-400">25,000+</h4>
              <p className="text-[11px] text-slate-400 mt-1">Growers Onboarded</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <h4 className="text-3xl font-extrabold text-emerald-400">100%</h4>
              <p className="text-[11px] text-slate-400 mt-1">Farm Direct Produce</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <h4 className="text-3xl font-extrabold text-emerald-400">3 Hours</h4>
              <p className="text-[11px] text-slate-400 mt-1">Average Delivery Time</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <h4 className="text-3xl font-extrabold text-emerald-400">4.9 / 5</h4>
              <p className="text-[11px] text-slate-400 mt-1">Customer Satisfaction</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
