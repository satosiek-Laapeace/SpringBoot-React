import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/common/TableFilters';

export const InventoryPage = () => {
  const { stockMovements, products, addStockMovement } = useStore();
  const { t } = useLanguage();
  const [movementSearch, setMovementSearch] = useState('');
  const [movementFilter, setMovementFilter] = useState('ALL');
  const filteredMovements = useMemo(() => {
    const query = movementSearch.trim().toLocaleLowerCase();
    return stockMovements.filter(movement => {
      const matchesType = movementFilter === 'ALL' || movement.type === movementFilter;
      const matchesSearch = !query || [movement.product_name, movement.type, movement.note, movement.id, movement.quantity_change]
        .some(value => String(value ?? '').toLocaleLowerCase().includes(query));
      return matchesType && matchesSearch;
    });
  }, [stockMovements, movementSearch, movementFilter]);
  const movementPage = usePagination(filteredMovements);
  const [selectedProductIdState, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState('RESTOCK');
  const [changeQty, setChangeQty] = useState('50');
  const [note, setNote] = useState('Farm harvest restock batch');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const selectedProductId = products.some(product => String(product.id) === selectedProductIdState)
    ? selectedProductIdState
    : String(products[0]?.id ?? '');
  const selectedProduct = products.find(product => String(product.id) === selectedProductId)
    || products[0];

  const handleStockAdjust = async (e) => {
    e.preventDefault();
    const prod = selectedProduct;
    if (!prod) return;

    const enteredQuantity = Number.parseInt(changeQty, 10);
    if (!Number.isInteger(enteredQuantity) || enteredQuantity === 0
        || (movementType !== 'ADJUSTMENT' && enteredQuantity < 0)) {
      setActionError('Enter a non-zero quantity. Use a positive amount for restocks and sales.');
      return;
    }

    const quantityChange = movementType === 'SALE'
      ? -Math.abs(enteredQuantity)
      : movementType === 'RESTOCK'
        ? Math.abs(enteredQuantity)
        : enteredQuantity;
    setSaving(true);
    setActionError('');
    try {
      await addStockMovement({
        product_id: prod.id,
        product_name: prod.name,
        type: movementType,
        quantity_change: quantityChange,
        note,
      });
      setNote('');
    } catch (error) {
      setActionError(error.message || 'Stock movement could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif">
          {t('inventoryTitle')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('inventoryDescription')}
        </p>
      </div>
      {actionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{actionError}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Stock Movement Log Table */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="text-base font-bold text-slate-900 dark:text-white">{t('inventoryRecentMovements')}</h3><p className="mt-1 text-xs text-slate-500">Showing {filteredMovements.length} of {stockMovements.length} movements</p></div>
            <TableFilters searchValue={movementSearch} onSearchChange={setMovementSearch} searchPlaceholder="Search stock movements..." searchLabel="Search stock movements" filters={[{ label: 'Filter by movement type', value: movementFilter, onChange: setMovementFilter, options: [{ value: 'ALL', label: 'All types' }, ...['RESTOCK', 'SALE', 'ADJUSTMENT', 'RETURN', 'DAMAGED'].map(type => ({ value: type, label: type }))] }]} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">{t('inventoryProduct')}</th>
                  <th className="p-3">{t('inventoryType')}</th>
                  <th className="p-3">{t('inventoryChange')}</th>
                  <th className="p-3">{t('inventoryAfterQuantity')}</th>
                  <th className="p-3">{t('inventoryNote')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {movementPage.paginatedItems.map(m => (
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
          {filteredMovements.length === 0 && <p className="py-10 text-center text-xs text-slate-500">No stock movements match these filters.</p>}
          <Pagination currentPage={movementPage.currentPage} pageCount={movementPage.pageCount} totalItems={movementPage.totalItems} pageSize={movementPage.pageSize} onPageChange={movementPage.setCurrentPage} onPageSizeChange={movementPage.setPageSize} t={t} />
        </div>

        {/* Adjust Stock Form */}
        <div className="lg:col-span-4">
          
          {/* Quick Stock Adjust Form */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('inventoryAdjustStock')}</h3>
            <form onSubmit={handleStockAdjust} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">{t('inventorySelectProduct')}</label>
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
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">{t('inventoryMovementType')}</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="RESTOCK">RESTOCK (+ Stock)</option>
                  <option value="SALE">SALE (- Stock)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (Audit)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">{t('cartQuantity')}</label>
                <input
                  type="number"
                  required
                  step="1"
                  value={changeQty}
                  onChange={(e) => setChangeQty(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">{t('inventoryNote')}</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('inventoryNotePlaceholder')}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={saving || products.length === 0}
                className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : t('inventoryPostMovement')}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
