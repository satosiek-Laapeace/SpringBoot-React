import React, { useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/common/TableFilters';

export const ProductManagementPage = () => {
  const { products, categories, addProduct, deleteProduct } = useStore();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return products.filter(product => {
      const matchesSearch = !query || [product.name, product.code, product.category_name, product.description, product.id]
        .some(value => String(value ?? '').toLocaleLowerCase().includes(query));
      const productCategoryId = String(product.category_id ?? product.categoryId ?? '');
      const matchesCategory = categoryFilter === 'ALL' || productCategoryId === categoryFilter;
      const stock = Number(product.stock_quantity ?? 0);
      const matchesStock = stockFilter === 'ALL' || (stockFilter === 'IN_STOCK' && stock > 0) || (stockFilter === 'LOW_STOCK' && stock > 0 && stock <= 15) || (stockFilter === 'OUT_OF_STOCK' && stock <= 0);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);
  const productPage = usePagination(filteredProducts);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Product Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('10.00');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [unit, setUnit] = useState('kg');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const selectedCategoryId = categories.some(category => String(category.id) === categoryId)
    ? categoryId
    : String(categories[0]?.id ?? '');

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedCategoryId) return;
    setSaving(true);
    setActionError('');
    try {
      await addProduct({
        name: name.trim(),
        categoryId: Number(selectedCategoryId),
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        unit,
        description,
        file: imageFile,
      });
      setIsAddModalOpen(false);
      setName('');
      setDescription('');
      setImageFile(null);
    } catch (error) {
      setActionError(error.message || 'Product could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    setActionError('');
    try {
      await deleteProduct(productId);
    } catch (error) {
      setActionError(error.message || 'Product could not be deleted.');
    }
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
        {actionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{actionError}</p>}

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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">Showing {filteredProducts.length} of {products.length} products</p>
          <TableFilters searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search products..." searchLabel="Search products" filters={[
            { label: 'Filter by category', value: categoryFilter, onChange: setCategoryFilter, options: [{ value: 'ALL', label: 'All categories' }, ...categories.map(c => ({ value: String(c.id), label: c.categories_name || c.name }))] },
            { label: 'Filter by stock', value: stockFilter, onChange: setStockFilter, options: [{ value: 'ALL', label: 'All stock' }, { value: 'IN_STOCK', label: 'In stock' }, { value: 'LOW_STOCK', label: 'Low stock' }, { value: 'OUT_OF_STOCK', label: 'Out of stock' }] },
          ]} />
        </div>
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
              {productPage.paginatedItems.map(p => (
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
                      onClick={() => handleDelete(p.id)}
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
        {filteredProducts.length === 0 && <p className="py-10 text-center text-xs text-slate-500">No products match these filters.</p>}
        <Pagination currentPage={productPage.currentPage} pageCount={productPage.pageCount} totalItems={productPage.totalItems} pageSize={productPage.pageSize} onPageChange={productPage.setCurrentPage} onPageSizeChange={productPage.setPageSize} t={t} />
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
                    value={selectedCategoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.categories_name}</option>
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

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Product image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
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
                disabled={saving || categories.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
