import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { fetchOrderPaymentsAPI } from '../features/checkout/services/checkoutApi';
import { fetchOrderAPI } from '../features/orders/services/orderApi';

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { orders } = useStore();
  const [order, setOrder] = useState(location.state?.order || orders.find((item) => String(item.id) === String(id)) || null);
  const [payment, setPayment] = useState(location.state?.payment || null);

  useEffect(() => {
    if (location.state?.order) return;
    let isCurrent = true;
    Promise.allSettled([fetchOrderAPI(id), fetchOrderPaymentsAPI(id)]).then(([orderResult, paymentResult]) => {
      if (!isCurrent) return;
      if (orderResult.status === 'fulfilled') setOrder(orderResult.value);
      if (paymentResult.status === 'fulfilled') {
        const records = Array.isArray(paymentResult.value) ? paymentResult.value : [];
        setPayment(records[0] || null);
      }
    });
    return () => { isCurrent = false; };
  }, [id, location.state?.order]);

  const totalAmount = Number(order?.totalAmount ?? order?.total_amount ?? 0);
  const deliverySlot = order?.deliverySlot ?? order?.delivery_slot;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 text-center">
      
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <CheckCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          ORDER RECEIVED
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
          Thank you! Order #{order?.id || id} is in good hands.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Your grower has received your order. We’ll keep you updated as it’s prepared for delivery.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
          <span className="text-slate-400 font-semibold">Payment Status:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
            {payment?.status || order?.payment?.status || 'PENDING'}{(payment?.method || order?.payment?.method) ? ` (${payment?.method || order?.payment?.method})` : ''}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
          <span className="text-slate-400 font-semibold">Delivery Slot:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{deliverySlot || 'To be confirmed'}</span>
        </div>

        <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 dark:text-white">
          <span>Order Total:</span>
          <span className="text-emerald-600 dark:text-emerald-400">${totalAmount.toFixed(2)}</span>
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
