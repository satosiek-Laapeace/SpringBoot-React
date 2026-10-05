import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, LoaderCircle, Pencil, Plus, RefreshCw, Shapes, Trash2, X } from 'lucide-react';
import {
  createCategoryAPI,
  deleteCategoryAPI,
  fetchCategoriesAPI,
  updateCategoryAPI,
} from '../../features/products/services/productApi';
import { useLanguage } from '../../context/LanguageContext';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/common/TableFilters';

const emptyCategory = { name: '', description: '', icon: null };
const categoryId = category => category?.id ?? category?.categoryId;
const categoryName = category => category?.name ?? category?.categoryName ?? 'Unnamed category';
const isImageUrl = value => typeof value === 'string' && /^(https?:|\/|data:image\/)/i.test(value);

export const AdminCategoriesPage = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState('');
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return categories;
    return categories.filter(category => [categoryName(category), category.description, categoryId(category)]
      .some(value => String(value ?? '').toLocaleLowerCase().includes(query)));
  }, [categories, search]);
  const categoryPage = usePagination(filteredCategories);

  const refresh = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setError('');
    try {
      const result = await fetchCategoriesAPI();
      if (!Array.isArray(result)) throw new Error('The categories API returned an unsupported response.');
      setCategories(result);
    } catch (loadError) {
      setError(loadError.message || 'Categories could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openForm = category => {
    setEditing(category || null);
    setFormOpen(true);
    setError('');
    setForm(category ? {
      name: categoryName(category),
      description: category.description || '',
      icon: null,
    } : emptyCategory);
  };

  const save = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('description', form.description.trim());
      if (form.icon) payload.append('iconUrl', form.icon);
      if (editing) await updateCategoryAPI(categoryId(editing), payload);
      else await createCategoryAPI(payload);
      setFormOpen(false);
      setEditing(null);
      await refresh(true);
    } catch (saveError) {
      setError(saveError.message || 'The category could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!removing) return;
    setDeleting(true);
    setError('');
    try {
      await deleteCategoryAPI(categoryId(removing));
      setCategories(current => current.filter(item => String(categoryId(item)) !== String(categoryId(removing))));
      setRemoving(null);
    } catch (deleteError) {
      setError(deleteError.message || 'The category could not be removed. Products may still use it.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="space-y-5 pb-10">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-emerald-700">{t('adminMarketplaceManagement')}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('adminCategories')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('adminCategoryManagementDescription')}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => refresh(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-300 disabled:opacity-60"><RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />{t('adminRefresh')}</button>
          <button type="button" onClick={() => openForm(null)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"><Plus className="h-3.5 w-3.5" />{t('adminAddCategory')}</button>
        </div>
      </header>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">{error}</p>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-100 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-sm font-bold text-slate-900">{t('adminCategoryLibrary')}</h2>
              <p className="mt-1 text-xs text-slate-500">{filteredCategories.length} of {categories.length} {t('adminCategoriesFromApi')}</p></div>
            <TableFilters searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search categories..." searchLabel="Search categories" />
          </div>
        </header>
        {loading ? (
          <div role="status" className="flex min-h-48 items-center justify-center text-xs font-semibold text-slate-600"><LoaderCircle className="mr-2 h-4 w-4 animate-spin text-emerald-700" />{t('adminLoadingCategories')}</div>
        ) : filteredCategories.length ? (
          <div className="divide-y divide-slate-100">
            {categoryPage.paginatedItems.map(category => {
              const icon = category.iconUrl ?? category.icon_url;
              return (
                <article key={categoryId(category)} className="admin-category-row flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 sm:px-5">
                  {isImageUrl(icon) ? <img src={icon} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Shapes className="h-5 w-5" /></span>}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{categoryName(category)}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{category.description || t('adminNoDescription')}</p>
                    <p className="mt-1 font-mono text-[11px] text-slate-400">Category #{categoryId(category)}</p>
                  </div>
                  <button type="button" onClick={() => setViewing(category)} aria-label={`View details for ${categoryName(category)}`} title="View details" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-sky-50 hover:text-sky-800 dark:hover:bg-sky-950/60 dark:hover:text-sky-200"><Eye className="h-4 w-4" /></button>
                  <button type="button" onClick={() => openForm(category)} aria-label={`${t('adminEditCategory')} ${categoryName(category)}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => { setError(''); setRemoving(category); }} aria-label={`${t('adminDeleteCategory')} ${categoryName(category)}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/60 dark:hover:text-rose-200"><Trash2 className="h-4 w-4" /></button>
                </article>
              );
            })}
          </div>
        ) : <div className="px-5 py-14 text-center"><Shapes className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-700">{categories.length ? 'No categories match your search.' : t('adminNoCategories')}</p></div>}
        {!loading && <Pagination currentPage={categoryPage.currentPage} pageCount={categoryPage.pageCount} totalItems={categoryPage.totalItems} pageSize={categoryPage.pageSize} onPageChange={categoryPage.setCurrentPage} onPageSizeChange={categoryPage.setPageSize} t={t} />}
      </section>

      {viewing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setViewing(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="category-details-title" className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Marketplace category</p>
                <h2 id="category-details-title" className="mt-1 text-lg font-bold text-slate-900">Category details</h2>
              </div>
              <button type="button" onClick={() => setViewing(null)} aria-label="Close category details" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><X className="h-4 w-4" /></button>
            </header>
            <div className="p-5">
              <div className="mb-5 flex items-center gap-4">
                {isImageUrl(viewing.iconUrl ?? viewing.icon_url) ? (
                  <img src={viewing.iconUrl ?? viewing.icon_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Shapes className="h-7 w-7" /></span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{categoryName(viewing)}</h3>
                  <p className="mt-1 font-mono text-sm text-slate-500">Category #{categoryId(viewing)}</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</h4>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{viewing.description || t('adminNoDescription')}</p>
              </div>
            </div>
            <footer className="flex justify-end border-t border-slate-100 px-5 py-4">
              <button type="button" onClick={() => setViewing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Close details</button>
            </footer>
          </section>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="category-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <header className="flex items-center justify-between"><h2 id="category-title" className="text-sm font-bold text-slate-900">{editing ? t('adminEditCategory') : t('adminCreateCategory')}</h2><button type="button" onClick={() => setFormOpen(false)} aria-label={t('adminCloseForm')} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></header>
            {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>}
            <form onSubmit={save} className="mt-4 space-y-3">
              <label className="block text-sm font-semibold text-slate-700">{t('adminCategoryName')}<input required maxLength={100} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400" /></label>
              <label className="block text-sm font-semibold text-slate-700">{t('adminCategoryDescription')}<textarea maxLength={1000} rows={3} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" /></label>
              <label className="block text-sm font-semibold text-slate-700">{t('adminCategoryIcon')}<input type="file" accept="image/*" onChange={event => setForm(current => ({ ...current, icon: event.target.files?.[0] || null }))} className="mt-1 block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-800" /></label>
              <div className="flex justify-end gap-2 pt-1"><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">{t('adminCancel')}</button><button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60">{saving ? t('adminSaving') : t('adminSaveCategory')}</button></div>
            </form>
          </section>
        </div>
      )}
      {removing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="category-delete-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" /><div><h2 id="category-delete-title" className="text-sm font-bold text-slate-900">{t('adminDeleteCategoryQuestion')}</h2><p className="mt-2 text-xs leading-5 text-slate-600">{t('adminDeleteCategoryWarning')} <strong>{categoryName(removing)}</strong></p></div></div>
            {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>}
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setRemoving(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">{t('adminCancel')}</button><button type="button" onClick={remove} disabled={deleting} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">{deleting ? t('adminDeleting') : t('adminDelete')}</button></div>
          </section>
        </div>
      )}
    </main>
  );
};
