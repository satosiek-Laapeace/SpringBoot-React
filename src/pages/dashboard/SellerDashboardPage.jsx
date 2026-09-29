import React, { useState } from 'react';
import {
  Sprout,
  TrendingUp,
  Droplets,
  Plus,
  ShoppingBag,
  Boxes,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const SellerDashboardPage = () => {
  const { products, orders, stockMovements, addProduct } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter produce listed by seller (e.g. seller_id 1)
  const sellerProducts = products;
  const lowStockCount = sellerProducts.filter(p => p.stock_quantity < 100).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-green-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/40 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/30">
              👨‍🌾 Farmer / Seller Portal
            </span>
          </div>
          <h1 className="text-2xl font-black font-serif">Reach Farmer’s Harvest Dashboard</h1>
          <p className="text-xs text-emerald-100">
            Monitor crop growth cycles, manage listed farm produce, and fulfill direct market orders.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-white text-emerald-900 font-extrabold text-xs hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Add New Harvest Batch</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Harvest Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white">$4,850.00</span>
          <span className="text-[10px] text-emerald-600 font-bold block">↑ 14% this month</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Active Produce Items</span>
            <Sprout className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white">{sellerProducts.length} Items</span>
          <span className="text-[10px] text-slate-400 block">Organic Certified</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Pending Dispatch</span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white">{orders.length} Orders</span>
          <span className="text-[10px] text-emerald-600 font-bold block">Assigned to Cold Fleet</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-amber-500">{lowStockCount} Items</span>
          <span className="text-[10px] text-slate-400 block">Needs Restock Log</span>
        </div>

      </div>

      {/* Field IoT Sensor Widget & Crop List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Field IoT Sensors */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <span>Live Field Sensor Diagnostics</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Connected 🟢</span>
          </div>

          <div className="space-y-3">
            {[
              { field: 'Field A (Organic Potatoes)', status: 'Moisture Optimal (68%)', score: '92%', temp: '24°C' },
              { field: 'Field B (Roma Tomatoes)', status: 'Irrigation Active', score: '88%', temp: '26°C' },
              { field: 'Field C (Sweet Mango Orchard)', status: 'Soil Mineralized', score: '95%', temp: '27°C' }
            ].map((f, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{f.field}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{f.status} • Temp: {f.temp}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 text-sm block">{f.score}</span>
                  <span className="text-[9px] text-slate-400">Crop Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Listed Produce Quick View */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Listed Produce Catalog</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {sellerProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <img src={p.image_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{p.name}</span>
                    <span className="text-[10px] text-slate-400">${p.price.toFixed(2)} / {p.unit}</span>
                  </div>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.stock_quantity} {p.unit} left</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
