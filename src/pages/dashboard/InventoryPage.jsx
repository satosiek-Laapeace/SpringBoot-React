import React, { useState } from 'react';
import { Boxes, Plus, TrendingUp, TrendingDown, RefreshCw, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const InventoryPage = () => {
  const { stockMovements, suppliers, products, addStockMovement } = useStore();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 101);
  const [movementType, setMovementType] = useState('RESTOCK_IN');
  const [changeQty, setChangeQty] = useState('50');
  const [note, setNote] = useState('Farm harvest restock batch');

  const handleStockAdjust = (e) => {
    e.preventDefault();
    const prod = products.find(p => p.id === Number(selectedProductId));
    if (!prod) return;

    const qtyVal = parseInt(changeQty, 10) * (movementType === 'SALE_OUT' ? -1 : 1);
    const newQtyAfter = Math.max(0, prod.stock_quantity + qtyVal);

    addStockMovement({
      product_id: prod.id,
      product_name: prod.name,
      type: movementType,
      quantity_change: qtyVal,
      quantity_after: newQtyAfter,
      supplier_name: suppliers[0]?.name || 'GreenAgro Supplies',
      note
    });

    setNote('');
  };

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif">
          Inventory Movements & Suppliers (`stock_movement_tbl`)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Traceable real-time stock logs (IN/OUT/ADJUSTMENT) and supplier distributor contacts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Stock Movement Log Table */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Stock Movement Logs</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Change</th>
                  <th className="p-3">After Qty</th>
                  <th className="p-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockMovements.map(m => (
                  <tr key={m.id}>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{m.product_name}</td>
                    <td className="p-3 font-semibold text-slate-500">{m.type}</td>
                    <td className={`p-3 font-extrabold ${m.quantity_change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                    </td>
                    <td className="p-3 font-bold">{m.quantity_after}</td>
                    <td className="p-3 text-slate-400">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Adjust Stock Form & Suppliers */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Stock Adjust Form */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Stock Adjustment</h3>
            <form onSubmit={handleStockAdjust} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} in stock)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Movement Type</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="RESTOCK_IN">RESTOCK_IN (+ Stock)</option>
                  <option value="SALE_OUT">SALE_OUT (- Stock)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (Audit)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  value={changeQty}
                  onChange={(e) => setChangeQty(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reason / Batch details"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Post Stock Movement
              </button>
            </form>
          </div>

          {/* Suppliers List (supplier_tbl) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Suppliers (`supplier_tbl`)</h3>
            <div className="space-y-2">
              {suppliers.map(s => (
                <div key={s.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">{s.name}</span>
                  <span className="text-slate-400 block text-[10px]">{s.contact_person} • {s.phone}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
