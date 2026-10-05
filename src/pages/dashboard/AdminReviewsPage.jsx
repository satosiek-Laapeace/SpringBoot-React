import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, LoaderCircle, MessageSquareText, RefreshCw, Star, Trash2 } from 'lucide-react';
import { fetchAllProductsAPI } from '../../features/products/services/productApi';
import { deleteReviewAPI, fetchAllProductReviewsAPI } from '../../features/reviews/services/reviewApi';
import { useLanguage } from '../../context/LanguageContext';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/common/TableFilters';

const getId = item => item?.id ?? item?.reviewId ?? item?.review_id;
const productId = product => product?.id ?? product?.productId;
const productName = product => product?.name ?? product?.productName ?? `Product ${productId(product)}`;
const reviewerName = review => review?.userName ?? review?.user_name ?? review?.buyerName ?? review?.username ?? 'Marketplace user';
const reviewText = review => review?.comment ?? review?.content ?? review?.reviewText ?? review?.description ?? '';

export const AdminReviewsPage = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const filteredReviews = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return reviews.filter(review => {
      const rating = Number(review?.rating ?? review?.score ?? 0);
      const matchesRating = ratingFilter === 'ALL' || rating === Number(ratingFilter);
      const matchesSearch = !query || [reviewerName(review), reviewText(review), getId(review), rating]
        .some(value => String(value ?? '').toLocaleLowerCase().includes(query));
      return matchesRating && matchesSearch;
    });
  }, [reviews, search, ratingFilter]);
  const reviewPage = usePagination(filteredReviews);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setError('');
    try {
      const result = await fetchAllProductsAPI({ sort: 'id,desc' });
      if (!Array.isArray(result)) throw new Error('The products API returned an unsupported response.');
      setProducts(result);
      setSelectedProduct(current => current || (result[0] ? String(productId(result[0])) : ''));
    } catch (loadError) {
      setError(loadError.message || 'Products could not be loaded.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const loadReviews = useCallback(async (showRefresh = false) => {
    if (!selectedProduct) {
      setReviews([]);
      return;
    }
    setLoadingReviews(!showRefresh);
    setRefreshing(showRefresh);
    setError('');
    try {
      const result = await fetchAllProductReviewsAPI(selectedProduct);
      if (!Array.isArray(result)) throw new Error('The reviews API returned an unsupported response.');
      setReviews(result);
    } catch (loadError) {
      setError(loadError.message || 'Reviews could not be loaded.');
    } finally {
      setLoadingReviews(false);
      setRefreshing(false);
    }
  }, [selectedProduct]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const removeReview = async review => {
    setDeleting(true);
    setError('');
    try {
      await deleteReviewAPI(getId(review));
      setReviews(current => current.filter(item => String(getId(item)) !== String(getId(review))));
      setPendingDelete(null);
    } catch (deleteError) {
      setError(deleteError.message || 'The review could not be deleted.');
    } finally {
      setDeleting(false);
    }
  };

  const selected = products.find(product => String(productId(product)) === selectedProduct);

  return (
    <main className="space-y-5 pb-10">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-emerald-700">{t('adminMarketplaceTrust')}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('adminProductReviews')}</h1>
          <p className="mt-1 text-xs text-slate-500">{t('adminReviewScopeNotice')}</p>
        </div>
        <button type="button" onClick={() => loadReviews(true)} disabled={!selectedProduct || refreshing} className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-300 disabled:opacity-60 sm:self-auto"><RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />{t('adminRefreshReviews')}</button>
      </header>
      {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label className="block max-w-xl text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('adminSelectProduct')}
          <select value={selectedProduct} onChange={event => setSelectedProduct(event.target.value)} disabled={loadingProducts || !products.length} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-800 outline-none focus:border-emerald-500">
            {loadingProducts && <option value="">{t('adminLoadingProducts')}</option>}
            {!loadingProducts && !products.length && <option value="">{t('adminNoProducts')}</option>}
            {products.map(product => <option key={productId(product)} value={String(productId(product))}>{productName(product)}</option>)}
          </select>
        </label>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
          <div><h2 className="text-sm font-bold text-slate-900">{selected ? productName(selected) : t('adminReviews')}</h2><p className="mt-1 text-[10px] text-slate-500">{filteredReviews.length} of {reviews.length} {t('adminReviewsReturned')}</p></div>
          <TableFilters searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search reviews..." searchLabel="Search reviews" filters={[{ label: 'Filter by rating', value: ratingFilter, onChange: setRatingFilter, options: [{ value: 'ALL', label: 'All ratings' }, ...[5, 4, 3, 2, 1].map(rating => ({ value: String(rating), label: `${rating} stars` }))] }]} />
          <span className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-800"><Star className="mr-1 inline h-3.5 w-3.5 fill-current" />{t('adminModeration')}</span>
        </header>
        {loadingReviews ? <div role="status" className="flex min-h-40 items-center justify-center text-xs font-semibold text-slate-600"><LoaderCircle className="mr-2 h-4 w-4 animate-spin text-emerald-700" />{t('adminLoadingReviews')}</div>
          : filteredReviews.length ? <div className="divide-y divide-slate-100">{reviewPage.paginatedItems.map(review => {
            const id = getId(review);
            const rating = Number(review?.rating ?? review?.score ?? 0);
            return <article key={id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:px-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><MessageSquareText className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><p className="text-xs font-bold text-slate-900">{reviewerName(review)}</p><p className="font-mono text-[9px] text-slate-400">Review #{id}</p>{rating > 0 && <span className="text-[10px] font-bold text-amber-700"><Star className="mr-1 inline h-3 w-3 fill-current" />{rating}/5</span>}</div>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{reviewText(review) || t('adminNoWrittenComment')}</p>
              </div>
              {pendingDelete === id ? <div className="flex shrink-0 items-center gap-2"><span className="text-[10px] text-rose-700">{t('adminDeletePermanently')}</span><button type="button" onClick={() => removeReview(review)} disabled={deleting} className="rounded-lg bg-rose-600 px-2.5 py-2 text-[10px] font-bold text-white disabled:opacity-60">{deleting ? t('adminDeleting') : t('adminConfirm')}</button><button type="button" onClick={() => setPendingDelete(null)} className="rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] font-semibold text-slate-600">{t('adminCancel')}</button></div>
                : <button type="button" onClick={() => { setError(''); setPendingDelete(id); }} aria-label={`${t('adminDelete')} ${id}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>}
            </article>;
          })}</div> : <div className="px-5 py-14 text-center"><MessageSquareText className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-700">{reviews.length ? 'No reviews match these filters.' : t('adminNoProductReviews')}</p></div>}
        {!loadingReviews && <Pagination currentPage={reviewPage.currentPage} pageCount={reviewPage.pageCount} totalItems={reviewPage.totalItems} pageSize={reviewPage.pageSize} onPageChange={reviewPage.setCurrentPage} onPageSizeChange={reviewPage.setPageSize} t={t} />}
      </section>
    </main>
  );
};
