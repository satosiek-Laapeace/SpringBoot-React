import React, { useState } from 'react';
import { User, MapPin, ShoppingBag, Clock, CheckCircle2, ChevronRight, Shield } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ProfilePage = () => {
  const { currentUser, addresses, orders } = useStore();
  const [activeTab, setActiveTab] = useState('ORDERS'); // ORDERS | ADDRESSES | PROFILE

  const userOrders = orders.filter(o => o.buyer_id === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* User Banner Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl">
        <div className="w-20 h-20 rounded-full bg-emerald-500 text-white font-bold text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
          {currentUser.avatar}
        </div>

        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold font-serif">{currentUser.full_name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white uppercase">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-slate-300">@{currentUser.username} • {currentUser.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'ORDERS'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Order History ({userOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('ADDRESSES')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'ADDRESSES'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Saved Delivery Addresses (`address_tbl`)
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <p className="text-xs text-slate-400">No past orders found.</p>
          ) : (
            userOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">Order #{order.id}</span>
                    <span className="text-slate-400 block">{new Date(order.created_at).toLocaleString()}</span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs w-fit">
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300">{item.quantity}x {item.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">${item.sub_total?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                  <span className="text-slate-500">Slot: {order.delivery_slot}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">
                    Total: ${order.total_amount?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Addresses */}
      {activeTab === 'ADDRESSES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{addr.city}, {addr.state}</span>
                {addr.is_default && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Default</span>}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{addr.street}</p>
              <p className="text-[10px] text-slate-400">Instructions: {addr.delivery_instructions}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
