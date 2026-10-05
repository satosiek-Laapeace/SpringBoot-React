import React from 'react';
import {
  TrendingUp,
  Users,
  RotateCcw,
  DollarSign,
  Calendar,
  Download,
  Truck,
  Search,
  MoreVertical,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';

export const DashboardPage = () => {
  const { products, vehicles } = useStore();
  const { t } = useLanguage();
  const productPage = usePagination(products);

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar (Matching media_1790671841547.png) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif">
            Sales overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time farm revenue, customer segments, fleet sensors, and stock catalog.
          </p>
        </div>

        {/* Date Filter & Export CSV Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>15 Mar, 2026 - 21 Mar 2026</span>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Top Metric Cards (Matching media_1790671841547.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Total Sales</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">2,421</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-0.5">
              ↑ 4.9%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">vs last period</span>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">New Customers</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">110</span>
            <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 text-[11px] font-bold flex items-center gap-0.5">
              ↑ 4.9%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">vs last period</span>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Return Orders</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">124</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-0.5">
              ↑ 4.9%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">vs last period</span>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Total Revenue</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$9,31.42</span>
            <span className="text-[11px] text-slate-400 font-semibold">vs 0 last period</span>
          </div>
          <span className="text-[10px] text-slate-400 block">vs last period</span>
        </div>

      </div>

      {/* Analytics & Fleet Section Grid (Matching media_1790671841547.png middle row) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Analytics Chart Box (Left 8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue analytics</h3>
            <button className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              This Week ∨
            </button>
          </div>

          {/* Styled Bar Chart Mockup */}
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

        {/* Vehicles & Fleet Live Tracking Box (Right 4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Vehicles</h3>
            <span className="text-slate-400 text-xs cursor-pointer">↗</span>
          </div>

          {/* Fleet Status Donut Arc Widget */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-8 border-emerald-500 border-t-slate-200 flex items-center justify-center font-extrabold text-sm text-slate-900 dark:text-white">
                65.2%
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-semibold">Fleets Maintenance</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">In-Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-slate-600 dark:text-slate-300">Maintenance</span>
              </div>
            </div>
          </div>

          {/* Fleet Sub metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Total Vehicles</span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">91</span>
              <span className="text-[10px] text-emerald-600 font-bold block">↑ 4.9%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Under maintenance</span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">19</span>
              <span className="text-[10px] text-emerald-600 font-bold block">↑ 6.7%</span>
            </div>
          </div>

          {/* Live Tracking List */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live Tracking</span>
            {vehicles.map(v => (
              <div key={v.id} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{v.name}</span>
                    <span className="text-[10px] text-slate-400 block">{v.location}</span>
                  </div>
                </div>
                <span className="font-bold text-amber-500 text-xs">{v.range}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Product & Inventory Data Table (Matching media_1790671841547.png bottom table) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Table Controls Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search product code, name..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">
              Setup
            </button>
            <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
              Import
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3">Items Code</th>
                <th className="p-3">Products Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Price</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stock Qty</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
              {productPage.paginatedItems.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-slate-500 font-bold">{p.code}</td>
                  <td className="p-3 font-bold flex items-center gap-2">
                    <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <span>{p.name}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      Published
                    </span>
                  </td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">${p.price.toFixed(2)}</td>
                  <td className="p-3 text-slate-500">{p.category_name}</td>
                  <td className="p-3 font-bold">{p.stock_quantity} {p.unit}</td>
                  <td className="p-3 text-right">
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={productPage.currentPage} pageCount={productPage.pageCount} totalItems={productPage.totalItems} pageSize={productPage.pageSize} onPageChange={productPage.setCurrentPage} onPageSizeChange={productPage.setPageSize} t={t} />

      </div>

    </div>
  );
};
