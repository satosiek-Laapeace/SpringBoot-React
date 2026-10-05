import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, RefreshCw, Sprout } from 'lucide-react';
import { AutoplayVideo } from '../components/common/AutoplayVideo';
import { CATEGORY_BANNER_MEDIA, getCategoryMedia } from '../config/categoryMedia';
import { fetchAllProductsAPI, fetchCategoriesAPI } from '../features/products/services/productApi';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useLanguage } from '../context/LanguageContext';

const getCategoryName = (category) => category.name ?? category.categoryName ?? category.categories_name ?? 'Farm goods';
const getCategoryId = (category) => category.id ?? category.categoryId;
const isImageUrl = (value) => typeof value === 'string' && /^(https?:|\/|data:image\/)/i.test(value);
const getProductImage = (product) => {
  const image = product.image_url ?? product.imageUrl ?? product.image;
  if (typeof image === 'string') return image;
  if (Array.isArray(product.images)) {
    const firstImage = product.images[0];
    return typeof firstImage === 'string' ? firstImage : firstImage?.url ?? firstImage?.imageUrl ?? null;
  }
  return image?.url ?? image?.imageUrl ?? null;
};

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const { t } = useLanguage();
  const categoryPage = usePagination(categories, 4);

  const loadCatalog = useCallback(async (showLoading = false) => {
    if (showLoading) setStatus('loading');
    try {
      const [categoryData, productData] = await Promise.all([fetchCategoriesAPI(), fetchAllProductsAPI()]);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setProducts(Array.isArray(productData) ? productData : []);
      setStatus('ready');
    } catch {
      setStatus((currentStatus) => currentStatus === 'ready' ? currentStatus : 'error');
    }
  }, []);

  useEffect(() => {
    loadCatalog(true);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') loadCatalog();
    };
    const intervalId = window.setInterval(refreshWhenVisible, 30_000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [loadCatalog]);

  return (
    <div className="min-h-full bg-white px-5 py-10 text-[#26352a] sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section aria-labelledby="categories-title" className="relative isolate mb-8 min-h-72 overflow-hidden rounded-3xl bg-[#173d29] shadow-xl sm:min-h-80">
          <div aria-hidden="true" className="absolute inset-0 z-0">
            <AutoplayVideo src={CATEGORY_BANNER_MEDIA.video} poster={CATEGORY_BANNER_MEDIA.poster} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-r from-[#0c2419]/90 via-[#173d29]/65 to-[#173d29]/10" />
            <div className="absolute inset-0 bg-linear-to-t from-[#0b2118]/35 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 flex min-h-72 flex-col items-start justify-center px-6 py-10 sm:min-h-80 sm:px-10 lg:px-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#e6f3c9] backdrop-blur-sm"><Leaf className="h-4 w-4" /> Fresh from nearby farms</span>
            <h1 id="categories-title" className="mt-5 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">Good food starts with good growing.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">Explore colorful harvests, garden fresh vegetables, and trusted farm essentials from local growers.</p>
            <Link to="/products" className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#e0eab7] px-5 py-3 text-sm font-bold text-[#183c28] shadow-lg transition hover:-translate-y-0.5 hover:bg-white">
              Shop the harvest <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="pointer-events-none absolute bottom-5 right-5 z-10 hidden rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-right text-white/90 backdrop-blur-md sm:block">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#d9e7bd]">Picked with care</p>
            <p className="mt-1 text-sm">From the field to your table</p>
          </div>
        </section>

        {status === 'loading' && (
          <div role="status" className="grid gap-4 pt-8 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-[1.45] animate-pulse rounded-xl bg-[#e7ede3] dark:bg-slate-800" />)}
          </div>
        )}

        {status === 'error' && (
          <div role="alert" className="mt-8 rounded-xl border border-rose-200 bg-white px-6 py-12 text-center dark:border-rose-900 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-[#26352a] dark:text-white">Categories could not be loaded</h2>
            <p className="mt-2 text-sm text-[#687269] dark:text-slate-400">Check your connection to the marketplace and try again.</p>
              <button type="button" onClick={() => loadCatalog(true)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#285331] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1c4228]">
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        )}

        {status === 'ready' && categories.length > 0 && (
          <div className={`grid gap-4 pt-8 sm:grid-cols-2 xl:grid-cols-4 ${categories.length === 1 ? 'mx-auto w-full max-w-2xl' : ''}`}>
            {categoryPage.paginatedItems.map((category) => {
              const id = getCategoryId(category);
              const name = getCategoryName(category);
              const matchingProducts = products.filter((product) => {
                const productCategoryId = product.categoryId ?? product.category_id ?? product.category?.id;
                const productCategoryName = product.categoryName ?? product.category_name ?? product.category?.name ?? product.category?.categoryName;
                return productCategoryId != null
                  ? String(productCategoryId) === String(id)
                  : String(productCategoryName || '').toLowerCase() === name.toLowerCase();
              });
              const categoryImage = category.iconUrl ?? category.icon_url;
              const imageUrl = isImageUrl(categoryImage)
                ? categoryImage
                : matchingProducts.map(getProductImage).find(isImageUrl) ?? categoryImage;
              const description = category.description || 'Browse products from this category.';
              const productCount = matchingProducts.length;
              const categoryMedia = getCategoryMedia(name);

              return (
                <article key={id ?? name} className="group overflow-hidden rounded-2xl border border-[#e1e8dd] bg-white shadow-sm shadow-[#183c28]/5 transition duration-200 hover:-translate-y-1 hover:border-[#bdcdb4] hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <Link to={`/products?categoryId=${encodeURIComponent(id)}`} aria-label={`Browse ${name}`} className="relative block aspect-[1.65] overflow-hidden bg-[#e9efe4] dark:bg-slate-800">
                    {categoryMedia ? (
                      <AutoplayVideo
                        src={categoryMedia.video}
                        poster={isImageUrl(imageUrl) ? imageUrl : categoryMedia.poster}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : isImageUrl(imageUrl) ? (
                      <img src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#547347] dark:text-emerald-300"><Sprout className="h-8 w-8" /></div>
                    )}
                    <span className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/35 to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#315a36] shadow-sm dark:bg-slate-950/90 dark:text-emerald-300">
                      {productCount} {productCount === 1 ? 'product' : 'products'}
                    </span>
                  </Link>
                  <div className="flex min-h-28 items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <h2 className="text-base font-bold tracking-tight text-[#2c3c30] dark:text-white">{name}</h2>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#69736a] dark:text-slate-400">{description}</p>
                    </div>
                    <Link to={`/products?categoryId=${encodeURIComponent(id)}`} aria-label={`Shop ${name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dfe7da] text-[#416441] transition group-hover:border-[#416441] group-hover:bg-[#edf3e9] dark:border-slate-700 dark:text-emerald-300 dark:group-hover:bg-slate-800">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {status === 'ready' && categories.length > 0 && <div className="mx-auto max-w-7xl"><Pagination currentPage={categoryPage.currentPage} pageCount={categoryPage.pageCount} totalItems={categoryPage.totalItems} pageSize={categoryPage.pageSize} onPageChange={categoryPage.setCurrentPage} onPageSizeChange={categoryPage.setPageSize} t={t} /></div>}

        {status === 'ready' && categories.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-[#cbd7c4] bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <Sprout className="mx-auto h-9 w-9 text-[#69834b]" />
            <h2 className="mt-4 text-lg font-bold text-[#2c3c30] dark:text-white">No categories yet</h2>
            <p className="mt-2 text-sm text-[#69736a] dark:text-slate-400">Please check back when the marketplace has new categories.</p>
          </div>
        )}
      </div>
    </div>
  );
};
