import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Calendar,
  Download,
  Search,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminDashboardPage = () => {
  const { products, vehicles } = useStore();
  const [activeFilterTab, setActiveFilterTab] = useState('REVENUE'); // REVENUE | ORDER | AVERAGE | VALUE

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar (Matching media_1790674953093.png) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif tracking-tight">
            Business Data
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time farm revenue, customer growth segments, category analytics, and produce sales.
          </p>
        </div>

        {/* Date Selector & Export CSV */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>15 Mar, 2026 - 21 Mar 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards (Exact specs from media_1790674953093.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Daily sales */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Daily sales</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">$19,909</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
              ↑ 4.9%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">vs 0 last period</span>
        </div>

        {/* Card 2: Monthly growth */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Monthly growth</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">110</span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 text-[11px] font-bold">
              ↑ 4.9%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">vs 0 last period</span>
        </div>

        {/* Card 3: Farmer performance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Farmer performance</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">29%</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
              ↑ 4.9%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">vs 0 last period</span>
        </div>

        {/* Card 4: Expense vs profit */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Expense vs profit</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">$109.00</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
              ↑ 4.9%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">vs 0 last period</span>
        </div>

      </div>

      {/* Filter Tabs Bar (Matching media_1790674953093.png sub-bar) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'REVENUE', label: 'Revenue Trend' },
            { id: 'ORDER', label: 'Order Trend' },
            { id: 'AVERAGE', label: 'Average Order' },
            { id: 'VALUE', label: 'Value Trend' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilterTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilterTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
          <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Analytics & Customer Segments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Analytics Bar Chart (Left 8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue analytics</h3>
            <button className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
              <span>This Week</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-dashed border-slate-200 dark:border-slate-800">
            {[
              { month: 'Jan', val: 12000, active: false },
              { month: 'Feb', val: 15000, active: false },
              { month: 'Mar', val: 28000, active: true, amount: '$22,430' },
              { month: 'Apr', val: 14000, active: false },
              { month: 'May', val: 16000, active: false },
              { month: 'Jun', val: 18000, active: false },
              { month: 'Jul', val: 15000, active: false },
              { month: 'Aug', val: 14000, active: false },
              { month: 'Sep', val: 19000, active: false },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                {bar.active && (
                  <div className="absolute -top-9 px-2.5 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] shadow-lg animate-bounce">
                    {bar.amount}
                  </div>
                )}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden h-40 flex items-end">
                  <div
                    style={{ height: `${(bar.val / 30000) * 100}%` }}
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      bar.active
                        ? 'bg-emerald-500 shadow-md shadow-emerald-500/40'
                        : 'bg-emerald-200 dark:bg-emerald-950/80 group-hover:bg-emerald-400'
                    }`}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-400">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments Donut Gauge (Right 4 Cols - Matching media_1790674953093.png) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Customer segments</h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-32 h-32 rounded-full border-[12px] border-emerald-500 border-t-slate-200 flex items-center justify-center shadow-inner">
              <div className="text-center">
                <span className="text-sm font-extrabold text-emerald-600 block">+5.8%</span>
                <span className="text-[9px] text-slate-400 block font-bold">vs last week</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-700 dark:text-slate-200">Premium</span>
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100">
                $9,450 <span className="text-slate-400 font-normal text-[10px] ml-1">32%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                <span className="font-bold text-slate-700 dark:text-slate-200">Regular</span>
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100">
                $8,320 <span className="text-slate-400 font-normal text-[10px] ml-1">46%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="font-bold text-slate-700 dark:text-slate-200">New</span>
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100">
                $3,380 <span className="text-slate-400 font-normal text-[10px] ml-1">20%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Row: Top Produce Progress Breakdown & Categories Analysis Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Produce Harvests (Left 6 Cols - Matching media_1790674953093.png) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Dishes & Produce</h3>
            <span className="text-xs font-bold text-slate-400">This Week ∨</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Potato', amount: 'USD 690,163', percent: '98%', color: 'bg-emerald-500' },
              { name: 'Tomato', amount: 'USD 120,163', percent: '70%', color: 'bg-emerald-400' },
              { name: 'Carrot', amount: 'USD 1000,163', percent: '60%', color: 'bg-emerald-400' },
              { name: 'Cabbage', amount: 'USD 280,163', percent: '80%', color: 'bg-emerald-500' },
              { name: 'Spinach', amount: 'USD 300,163', percent: '65%', color: 'bg-emerald-400' }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                  <span className="text-slate-400 text-[11px] font-mono">{item.amount} • {item.percent}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: item.percent }} className={`h-full ${item.color} rounded-full transition-all duration-500`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Analysis Line Chart (Right 6 Cols - Matching media_1790674953093.png) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Categories Analysis</h3>
            <span className="text-xs font-bold text-slate-400">Today ∨</span>
          </div>

          <div className="relative h-52 flex items-end justify-between pt-8 px-2 border-b border-dashed border-slate-200 dark:border-slate-800">
            {/* Tooltip Highlight */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-slate-900 text-white text-[11px] font-extrabold shadow-lg z-10">
              <span>📍 Tomato: $15,290</span>
            </div>

            {/* Simulated Trend Line Curve Points */}
            {[
              { label: '23%', val: 23 },
              { label: '25%', val: 25 },
              { label: '30%', val: 30 },
              { label: '29%', val: 29 },
              { label: '33%', val: 33 },
              { label: '28%', val: 28 },
              { label: '25%', val: 25 }
            ].map((pt, i) => (
              <div key={i} className="flex flex-col items-center gap-1 group">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{pt.label}</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950 group-hover:scale-125 transition-transform" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
