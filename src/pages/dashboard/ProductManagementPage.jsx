import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, Package, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ProductManagementPage = () => {
  const { products, categories, addProduct, deleteProduct } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Product Form State
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('Fresh Vegetables');
  const [price, setPrice] = useState('10.00');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [unit, setUnit] = useState('kg');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addProduct({
      name,
      category_name: categoryName,
      price: parseFloat(price) || 10.0,
      stock_quantity: parseInt(stockQuantity, 10) || 100,
      unit,
      description,
      image_url: imageUrl,
      is_organic: true,
      discount: 'No Discount'
    });
    setIsAddModalOpen(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif">
            Product Catalog Management (`products_tbl`)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add, update, or remove produce items, unit pricing, and active status.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Item Code</th>
                <th className="p-3">Category</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Stock Qty</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map(p => (
                <tr key={p.id}>
                  <td className="p-3 font-bold flex items-center gap-3">
                    <img src={p.image_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <span className="block text-slate-800 dark:text-slate-100 font-bold">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{p.discount}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-500 font-bold">{p.code}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{p.category_name}</td>
                  <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400">${p.price.toFixed(2)} / {p.unit}</td>
                  <td className="p-3 font-bold">{p.stock_quantity} {p.unit}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Product to Marketplace</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Organic Dragonfruit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.categories_name}>{c.categories_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="piece">piece</option>
                    <option value="set">set</option>
                    <option value="bag">bag</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
              >
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
