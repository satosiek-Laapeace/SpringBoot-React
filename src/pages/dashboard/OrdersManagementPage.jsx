import React from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const OrdersManagementPage = () => {
  const { orders, updateOrderStatus } = useStore();

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif">
          Order Fulfillment Management (`order_tbl` & `payment_tbl`)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage live buyer orders, update cold fleet dispatch status, and verify payment settlements.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Buyer Name</th>
                <th className="p-3">Delivery Slot</th>
                <th className="p-3">Items Count</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Order Status</th>
                <th className="p-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="p-3 font-bold font-mono text-emerald-600">#{o.id}</td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{o.buyer_name}</td>
                  <td className="p-3 text-slate-500">{o.delivery_slot}</td>
                  <td className="p-3 font-semibold">{o.items?.length || 0} items</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">${o.total_amount?.toFixed(2)}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                      {o.payment?.method} ({o.payment?.status})
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px]">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold"
                    >
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
