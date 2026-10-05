import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Eye, FileImage, LoaderCircle, Package, Pencil, Plus, RefreshCw, Star, Trash2, Upload, X } from 'lucide-react';
import {
  addProductImageAPI,
  createProductAPI,
  deleteProductImageAPI,
  deleteProductAPI,
  fetchCategoriesAPI,
  fetchProductImagesAPI,
  fetchAllProductsAPI,
  setPrimaryProductImageAPI,
  updateProductAPI,
} from '../../features/products/services/productApi';
import { normalizeProduct } from '../../features/products/utils/normalizeProduct';
import { useLanguage } from '../../context/LanguageContext';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/common/TableFilters';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  unit: 'kg',
  categoryId: '',
  file: null,
};
const recordId = record => record?.id ?? record?.productId ?? record?.categoryId;

const normalizeCategory = category => ({
  ...category,
  id: recordId(category),
  name: category?.name ?? category?.categoryName ?? category?.categories_name ?? 'Unnamed category',
});

export const AdminCatalogPage = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [workingWithImages, setWorkingWithImages] = useState(false);
  const [imageError, setImageError] = useState('');
  const [pendingImageDelete, setPendingImageDelete] = useState(null);

  const loadCatalog = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setError('');
    try {
      const [productResult, categoryResult] = await Promise.all([
        fetchAllProductsAPI({ sort: 'id,desc' }),
        fetchCategoriesAPI(),
      ]);
      if (!Array.isArray(productResult) || !Array.isArray(categoryResult)) {
        throw new Error('The catalog API returned an unsupported response.');
      }
      setProducts(productResult.map(normalizeProduct));
      setCategories(categoryResult.map(normalizeCategory));
    } catch (loadError) {
      setError(loadError.message || 'The product catalog could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const loadProductImages = useCallback(async productId => {
    setLoadingImages(true);
    setImageError('');
    try {
      const result = await fetchProductImagesAPI(productId);
      if (!Array.isArray(result)) throw new Error('The product image service returned an unsupported response.');
      setProductImages(result);
    } catch (loadError) {
      setImageError(loadError.message || 'Product images could not be loaded.');
      setProductImages([]);
    } finally {
      setLoadingImages(false);
    }
  }, []);

  const uploadProductImages = async event => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length || !viewingProduct) return;
    const payload = new FormData();
    files.forEach(file => payload.append('files', file));
    setWorkingWithImages(true);
    setImageError('');
    try {
      await addProductImageAPI(recordId(viewingProduct), payload);
      await loadProductImages(recordId(viewingProduct));
    } catch (uploadError) {
      setImageError(uploadError.message || 'Product images could not be uploaded.');
    } finally {
      setWorkingWithImages(false);
    }
  };

  const setPrimaryImage = async image => {
    setWorkingWithImages(true);
    setImageError('');
    try {
      await setPrimaryProductImageAPI(recordId(viewingProduct), image.id);
      await loadProductImages(recordId(viewingProduct));
      await loadCatalog(true);
    } catch (updateError) {
      setImageError(updateError.message || 'The primary image could not be updated.');
    } finally {
      setWorkingWithImages(false);
    }
  };

  const deleteProductImage = async image => {
    setWorkingWithImages(true);
    setImageError('');
    try {
      await deleteProductImageAPI(recordId(viewingProduct), image.id);
      setPendingImageDelete(null);
      await loadProductImages(recordId(viewingProduct));
      await loadCatalog(true);
    } catch (deleteError) {
      setImageError(deleteError.message || 'The product image could not be deleted.');
    } finally {
      setWorkingWithImages(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter(product => {
      const matchesSearch = !query || [product.name, product.category_name, product.seller_name, product.code, product.id]
        .some(value => String(value || '').toLowerCase().includes(query));
      const matchesCategory = categoryFilter === 'ALL' || String(product.category_id ?? '') === categoryFilter;
      const stock = Number(product.stock_quantity ?? 0);
      const matchesStock = stockFilter === 'ALL' || (stockFilter === 'IN_STOCK' && stock > 0) || (stockFilter === 'LOW_STOCK' && stock > 0 && stock <= 15) || (stockFilter === 'OUT_OF_STOCK' && stock <= 0);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);
  const productPage = usePagination(filteredProducts);

  const openForm = product => {
    setError('');
    setFormOpen(true);
    setEditingProduct(product || null);
    setForm(product ? {
      ...emptyForm,
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      stockQuantity: String(product.stock_quantity ?? 0),
      unit: product.unit || 'kg',
      categoryId: String(product.category_id ?? ''),
    } : {
      ...emptyForm,
      categoryId: categories[0] ? String(categories[0].id) : '',
    });
  };

  const saveProduct = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('description', form.description.trim());
      payload.append('price', form.price);
      payload.append('stockQuantity', form.stockQuantity);
      payload.append('unit', form.unit.trim());
      payload.append('categoryId', form.categoryId);
      if (form.file) payload.append('file', form.file);

      if (editingProduct) {
        await updateProductAPI(recordId(editingProduct), payload);
      } else {
        await createProductAPI(payload);
      }
      setFormOpen(false);
      setEditingProduct(null);
      await loadCatalog(true);
    } catch (saveError) {
      setError(saveError.message || 'The product could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    setError('');
    try {
      await deleteProductAPI(recordId(deletingProduct));
      setProducts(current => current.filter(product => String(recordId(product)) !== String(recordId(deletingProduct))));
      setDeletingProduct(null);
    } catch (deleteError) {
      setError(deleteError.message || 'The product could not be removed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="space-y-5 pb-10">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-emerald-700">{t('adminMarketplaceManagement')}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('adminProductCatalog')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('adminCatalogDescription')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => loadCatalog(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-300 disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />{t('adminRefresh')}
          </button>
          <button type="button" onClick={() => openForm(null)} disabled={!categories.length} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
            <Plus className="h-3.5 w-3.5" />{t('adminAddProduct')}
          </button>
        </div>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">{error}</p>}
      {!categories.length && !loading && !error && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">{t('adminAddCategoryBeforeProduct')}</p>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t('adminMarketplaceListings')}</h2>
            <p className="mt-1 text-xs text-slate-500">{products.length} {t('adminProducts')} · {categories.length} {t('adminCategories').toLowerCase()}</p>
          </div>
          <TableFilters searchValue={search} onSearchChange={setSearch} searchPlaceholder={t('adminSearchProducts')} searchLabel={t('adminSearchProducts')} filters={[
            { label: 'Filter by category', value: categoryFilter, onChange: setCategoryFilter, options: [{ value: 'ALL', label: 'All categories' }, ...categories.map(category => ({ value: String(category.id), label: category.name }))] },
            { label: 'Filter by stock', value: stockFilter, onChange: setStockFilter, options: [{ value: 'ALL', label: 'All stock' }, { value: 'IN_STOCK', label: 'In stock' }, { value: 'LOW_STOCK', label: 'Low stock' }, { value: 'OUT_OF_STOCK', label: 'Out of stock' }] },
          ]} />
        </div>
        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-xs font-semibold text-slate-600" role="status"><LoaderCircle className="mr-2 h-4 w-4 animate-spin text-emerald-700" />{t('adminLoadingCatalog')}</div>
        ) : filteredProducts.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[.1em] text-slate-500">
                <tr><th className="px-4 py-3">{t('adminProduct')}</th><th className="px-3 py-3">{t('adminSeller')}</th><th className="px-3 py-3">{t('adminCategory')}</th><th className="px-3 py-3">{t('adminPrice')}</th><th className="px-3 py-3">{t('adminStock')}</th><th className="px-4 py-3 text-right">{t('adminActions')}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productPage.paginatedItems.map(product => (
                  <tr key={recordId(product)} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image_url ? <img src={product.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Package className="h-4 w-4" /></span>}
                        <span><span className="block max-w-52 truncate text-sm font-bold text-slate-800">{product.name}</span><span className="mt-0.5 block text-xs text-slate-400">#{recordId(product)}</span></span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">{product.seller_name || '—'}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{product.category_name}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-800">${Number(product.price || 0).toFixed(2)} / {product.unit}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">{Number(product.stock_quantity || 0)} {product.unit}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => { setViewingProduct(product); setProductImages([]); setPendingImageDelete(null); loadProductImages(recordId(product)); }} aria-label={`View details for ${product.name}`} title="View details" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-800"><Eye className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => openForm(product)} aria-label={`Edit ${product.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"><Pencil className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => setDeletingProduct(product)} aria-label={`Remove ${product.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center"><Package className="h-6 w-6 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-700">{search ? t('adminNoMatchingProducts') : t('adminNoProductsInCatalog')}</p></div>
        )}
        {!loading && <Pagination currentPage={productPage.currentPage} pageCount={productPage.pageCount} totalItems={productPage.totalItems} pageSize={productPage.pageSize} onPageChange={productPage.setCurrentPage} onPageSizeChange={productPage.setPageSize} t={t} />}
      </section>

      {viewingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setViewingProduct(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="product-details-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Marketplace listing</p>
                <h2 id="product-details-title" className="mt-1 text-lg font-bold text-slate-900">Product details</h2>
              </div>
              <button type="button" onClick={() => setViewingProduct(null)} aria-label="Close product details" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><X className="h-4 w-4" /></button>
            </header>
            <div className="grid gap-5 p-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-6">
              <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                {viewingProduct.image_url ? (
                  <img src={viewingProduct.image_url} alt={viewingProduct.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-emerald-700"><Package className="h-10 w-10" /></div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900">{viewingProduct.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">Listing #{recordId(viewingProduct)}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{viewingProduct.category_name || 'Uncategorized'}</span>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{viewingProduct.description || 'No product description provided.'}</p>
                <dl className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Price</dt><dd className="mt-1 text-sm font-bold text-slate-900">${Number(viewingProduct.price || 0).toFixed(2)} / {viewingProduct.unit || 'unit'}</dd></div>
                  <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Available stock</dt><dd className="mt-1 text-sm font-bold text-slate-900">{Number(viewingProduct.stock_quantity || 0)} {viewingProduct.unit || 'unit'}</dd></div>
                  <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Seller</dt><dd className="mt-1 truncate text-sm font-semibold text-slate-900">{viewingProduct.seller_name || 'Not assigned'}</dd></div>
                  <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Product code</dt><dd className="mt-1 truncate text-sm font-semibold text-slate-900">{viewingProduct.code || `#${recordId(viewingProduct)}`}</dd></div>
                </dl>
              </div>
            </div>
            <section className="border-t border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Product images</h3>
                  <p className="mt-1 text-xs text-slate-500">Upload, choose the primary image, or remove images from this listing.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                  {workingWithImages ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Upload images
                  <input type="file" accept="image/*" multiple disabled={workingWithImages} onChange={uploadProductImages} className="sr-only" />
                </label>
              </div>
              {imageError && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{imageError}</p>}
              {loadingImages ? (
                <div role="status" className="flex min-h-24 items-center justify-center text-xs text-slate-500"><LoaderCircle className="mr-2 h-4 w-4 animate-spin text-emerald-700" />Loading product images…</div>
              ) : productImages.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {productImages.map(image => {
                    const primary = Boolean(image.isPrimary ?? image.is_primary);
                    return (
                      <article key={image.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="relative aspect-square bg-slate-100">
                          <img src={image.imageUrl || image.image_url} alt="" className="h-full w-full object-cover" />
                          {primary && <span className="absolute left-2 top-2 rounded-full bg-emerald-700 px-2 py-1 text-[9px] font-bold text-white">Primary</span>}
                        </div>
                        <div className="flex min-h-10 items-center justify-between gap-2 p-2">
                          {pendingImageDelete === image.id ? (
                            <>
                              <span className="text-[10px] font-semibold text-rose-700">Remove?</span>
                              <div className="flex gap-1">
                                <button type="button" onClick={() => deleteProductImage(image)} disabled={workingWithImages} className="rounded-md bg-rose-600 px-2 py-1 text-[9px] font-bold text-white disabled:opacity-50">Confirm</button>
                                <button type="button" onClick={() => setPendingImageDelete(null)} className="rounded-md border border-slate-200 px-2 py-1 text-[9px] font-semibold text-slate-600">Cancel</button>
                              </div>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => setPrimaryImage(image)} disabled={primary || workingWithImages} className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-default disabled:opacity-50">
                                {primary ? <Check className="h-3 w-3" /> : <Star className="h-3 w-3" />}{primary ? 'Selected' : 'Set primary'}
                              </button>
                              <button type="button" onClick={() => setPendingImageDelete(image.id)} disabled={workingWithImages} aria-label="Delete product image" title="Delete image" className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /></button>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 flex min-h-24 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
                  <FileImage className="h-5 w-5 text-slate-300" />
                  <p className="mt-1 text-xs font-semibold text-slate-600">No additional product images.</p>
                </div>
              )}
            </section>
            <footer className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6">
              <button type="button" onClick={() => setViewingProduct(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Close details</button>
            </footer>
          </section>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="catalog-form-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <header className="flex items-center justify-between">
              <h2 id="catalog-form-title" className="text-sm font-bold text-slate-900">{editingProduct ? t('adminEditProductListing') : t('adminAddProductListing')}</h2>
              <button type="button" onClick={() => setFormOpen(false)} aria-label={t('adminCloseProductForm')} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </header>
            {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>}
            <form onSubmit={saveProduct} className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">{t('adminProductName')}<input required maxLength={50} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400" /></label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">{t('adminProductDescription')}<textarea maxLength={1000} rows={3} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" /></label>
              <label className="text-sm font-semibold text-slate-700">{t('adminCategory')}<select required value={form.categoryId} onChange={event => setForm(current => ({ ...current, categoryId: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="" disabled>{t('adminSelectCategory')}</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label className="text-sm font-semibold text-slate-700">{t('adminUnit')}<input required value={form.unit} onChange={event => setForm(current => ({ ...current, unit: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" /></label>
              <label className="text-sm font-semibold text-slate-700">{t('adminPrice')}<input required type="number" min="0.01" step="0.01" value={form.price} onChange={event => setForm(current => ({ ...current, price: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" /></label>
              <label className="text-sm font-semibold text-slate-700">{t('adminStockQuantity')}<input required type="number" min="0" step="1" value={form.stockQuantity} onChange={event => setForm(current => ({ ...current, stockQuantity: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" /></label>
              <label className="text-[11px] font-semibold text-slate-700 sm:col-span-2">{t('adminProductImage')}<input type="file" accept="image/*" onChange={event => setForm(current => ({ ...current, file: event.target.files?.[0] || null }))} className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-800" /></label>
              <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
                <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">{t('adminCancel')}</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60">{saving ? t('adminSaving') : t('adminSaveProduct')}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deletingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="delete-product-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" /><div><h2 id="delete-product-title" className="text-sm font-bold text-slate-900">{t('adminRemoveProductQuestion')}</h2><p className="mt-2 text-xs leading-5 text-slate-600">{t('adminRemoveProductDescription')} <strong>{deletingProduct.name}</strong></p></div></div>
            {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingProduct(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">{t('adminCancel')}</button>
              <button type="button" onClick={deleteProduct} disabled={deleting} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">{deleting ? t('adminRemoving') : t('adminRemoveProduct')}</button>
            </div>
          </section>
        </div>
      )}

    </main>
  );
};
