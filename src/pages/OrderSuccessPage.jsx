import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Truck, Calendar, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const { orders } = useStore();

  const order = orders.find(o => o.id === Number(id)) || orders[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 text-center">
      
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <CheckCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          ORDER CONFIRMED
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
          Thank you! Order #{order?.id} is Dispatched
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Your produce has been assigned to our temperature-controlled smart van. A confirmation receipt has been sent to your profile.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
          <span className="text-slate-400 font-semibold">Payment Status:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
            {order?.payment?.status || 'PAID'} ({order?.payment?.method})
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
          <span className="text-slate-400 font-semibold">Delivery Slot:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{order?.delivery_slot}</span>
        </div>

        <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 dark:text-white">
          <span>Total Paid Amount:</span>
          <span className="text-emerald-600 dark:text-emerald-400">${order?.total_amount?.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Link
          to="/profile"
          className="px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors"
        >
          View Order Tracking
        </Link>

        <Link
          to="/products"
          className="px-6 py-3 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow"
        >
          Continue Shopping
        </Link>
      </div>

    </div>
  );
};
