import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../features/products/components/ProductCard';
import { fetchAllProductsByCategoryAPI } from '../features/products/services/productApi';
import { normalizeProduct } from '../features/products/utils/normalizeProduct';

export const ProductsPage = () => {
  const { products, categories, users } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('categoryId');
  const selectedCategoryName = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryProducts, setCategoryProducts] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minimumPrice, setMinimumPrice] = useState(0);
  const [maximumPrice, setMaximumPrice] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const itemsPerPage = 6;

  useEffect(() => {
    if (!selectedCategoryId) {
      setCategoryProducts(null);
      setCategoryLoading(false);
      return undefined;
    }

    let isCurrent = true;
    setCategoryLoading(true);
    fetchAllProductsByCategoryAPI(selectedCategoryId)
      .then((result) => {
        if (isCurrent) setCategoryProducts(Array.isArray(result) ? result.map(normalizeProduct) : null);
      })
      .catch(() => {
        if (isCurrent) setCategoryProducts(null);
      })
      .finally(() => {
        if (isCurrent) setCategoryLoading(false);
      });

    return () => { isCurrent = false; };
  }, [selectedCategoryId]);

  const selectCategory = (category) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category');
    if (category) nextParams.set('categoryId', category.id);
    else nextParams.delete('categoryId');
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  const updateSearch = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set('search', value);
    else nextParams.delete('search');
    setSearchParams(nextParams, { replace: true });
    setCurrentPage(1);
  };

  const categorySource = categoryProducts ?? products;
  const maxCatalogPrice = Math.max(1, ...products.map((product) => Number(product.price) || 0));
  const priceCeiling = maximumPrice ?? maxCatalogPrice;

  const sellerNameFor = (product) => {
    const seller = product.seller || users.find((user) => String(user.id) === String(product.seller_id));
    return product.seller_name || product.sellerName || seller?.displayName || seller?.full_name || seller?.username || 'Local grower';
  };

  const sellerOptions = useMemo(() => [...new Set(products.map((product) => sellerNameFor(product)))].sort(), [products, users]);

  const filteredProducts = useMemo(() => categorySource.filter(product => {
    const categoryName = String(product.category_name || product.categoryName || product.category?.name || product.category || '');
    const categoryId = product.category_id ?? product.categoryId ?? product.category?.id;
    const productName = String(product.name || '');
    const description = String(product.description || '');
    const code = String(product.code || '');
    const matchesCategory =
      (!selectedCategoryId && !selectedCategoryName) ||
      (selectedCategoryId && String(categoryId) === selectedCategoryId) ||
      (selectedCategoryName && categoryName.toLowerCase().includes(selectedCategoryName.toLowerCase()));
    const matchesSearch =
      productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeller = selectedSellers.length === 0 || selectedSellers.includes(sellerNameFor(product));
    const price = Number(product.price) || 0;
    const matchesPrice = price >= minimumPrice && price <= priceCeiling;
    const matchesStock = !inStockOnly || Number(product.stock_quantity ?? product.stockQuantity ?? 0) > 0;
    return matchesCategory && matchesSearch && matchesSeller && matchesPrice && matchesStock;
  }).sort((first, second) => {
    if (sortBy === 'price-low') return Number(first.price) - Number(second.price);
    if (sortBy === 'price-high') return Number(second.price) - Number(first.price);
    if (sortBy === 'rating') return Number(second.rating || 0) - Number(first.rating || 0);
    return 0;
  }), [categorySource, selectedCategoryId, selectedCategoryName, searchQuery, selectedSellers, minimumPrice, priceCeiling, inStockOnly, sortBy, users]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  useEffect(() => setCurrentPage((page) => Math.min(page, totalPages)), [totalPages]);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSeller = (seller) => {
    setSelectedSellers((current) => current.includes(seller)
      ? current.filter((name) => name !== seller)
      : [...current, seller]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    selectCategory(null);
    setSelectedSellers([]);
    setInStockOnly(false);
    setMinimumPrice(0);
    setMaximumPrice(null);
    updateSearch('');
  };

  return (
    <div className="min-h-full bg-[#fbfcf8] px-4 py-8 text-[#26352a] sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-7 flex flex-col gap-5 border-b border-[#e4e8df] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7134]">THE FARMCRAFT MARKET</p>
            <h1 className="mt-2 text-3xl font-bold text-[#233a2a] sm:text-4xl">Good food, grown close.</h1>
            <p className="mt-2 text-sm text-[#687269]">Shop this week’s harvest from independent local growers.</p>
          </div>
          <Link to="/categories" className="hidden items-center gap-2 text-sm font-semibold text-[#315a36] hover:text-[#9a7134] sm:inline-flex">
            Browse all categories <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829080]" />
            <input
              type="search"
              placeholder="Search produce and pantry goods"
              value={searchQuery}
              onChange={(event) => updateSearch(event.target.value)}
              className="h-11 w-full border border-[#dfe5db] bg-white pl-10 pr-4 text-sm outline-none placeholder:text-[#929c90] focus:border-[#557b52] focus:ring-2 focus:ring-[#557b52]/15"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
              className="inline-flex h-10 items-center gap-2 border border-[#dfe5db] bg-white px-3 text-sm font-semibold text-[#405342] md:hidden"
            >
              <Filter className="h-4 w-4" /> Filters {filtersOpen ? <X className="h-4 w-4" /> : null}
            </button>
            <p className="text-sm text-[#687269]"><strong className="text-[#24392b]">{filteredProducts.length}</strong> products</p>
            <label className="flex items-center gap-2 text-sm text-[#687269]">
              <span className="hidden sm:inline">Sort</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-10 border border-[#dfe5db] bg-white px-3 text-sm font-semibold text-[#2d4331] outline-none focus:border-[#557b52]">
                <option value="featured">Featured</option>
                <option value="rating">Top rated</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[230px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} h-fit border border-[#e2e7de] bg-white p-4 md:block`} aria-label="Product filters">
            <div className="mb-3 flex items-center justify-between border-b border-[#edf0ea] pb-3">
              <h2 className="text-sm font-bold text-[#253b2c]">Refine your market</h2>
              <button type="button" onClick={clearFilters} className="text-xs font-semibold text-[#73806f] underline underline-offset-2 hover:text-[#315a36]">Clear</button>
            </div>

            <details open className="border-b border-[#edf0ea] py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[#344635]">Farm categories <ChevronDown className="h-4 w-4" /></summary>
              <div className="mt-3 space-y-2.5">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#5d6b5e]">
                  <input type="radio" name="category" checked={!selectedCategoryId && !selectedCategoryName} onChange={() => selectCategory(null)} className="accent-[#315a36]" />
                  All categories
                </label>
                {categories.map((category) => {
                  const categoryId = category.id ?? category.categoryId;
                  const label = category.categories_name || category.name || category.categoryName;
                  return (
                    <label key={categoryId} className="flex cursor-pointer items-center gap-2.5 text-sm text-[#5d6b5e]">
                      <input type="radio" name="category" checked={selectedCategoryId === String(categoryId)} onChange={() => selectCategory({ id: categoryId })} className="accent-[#315a36]" />
                      <span className="flex-1">{label}</span>
                    </label>
                  );
                })}
              </div>
            </details>

            <details open className="border-b border-[#edf0ea] py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[#344635]">Seller <ChevronDown className="h-4 w-4" /></summary>
              <div className="mt-3 max-h-40 space-y-2.5 overflow-y-auto">
                {sellerOptions.map((seller) => (
                  <label key={seller} className="flex cursor-pointer items-center gap-2.5 text-sm text-[#5d6b5e]">
                    <input type="checkbox" checked={selectedSellers.includes(seller)} onChange={() => toggleSeller(seller)} className="h-4 w-4 accent-[#315a36]" />
                    <span className="truncate">{seller}</span>
                  </label>
                ))}
              </div>
            </details>

            <details open className="border-b border-[#edf0ea] py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[#344635]">Price per unit <ChevronDown className="h-4 w-4" /></summary>
              <div className="mt-3 space-y-3">
                <label className="block text-xs text-[#6f7a6e]">From ${minimumPrice.toFixed(2)}
                  <input type="range" min="0" max={maxCatalogPrice} step="0.25" value={minimumPrice} onChange={(event) => setMinimumPrice(Math.min(Number(event.target.value), priceCeiling))} className="mt-2 block w-full accent-[#315a36]" />
                </label>
                <label className="block text-xs text-[#6f7a6e]">Up to ${priceCeiling.toFixed(2)}
                  <input type="range" min="0" max={maxCatalogPrice} step="0.25" value={priceCeiling} onChange={(event) => setMaximumPrice(Math.max(Number(event.target.value), minimumPrice))} className="mt-2 block w-full accent-[#315a36]" />
                </label>
              </div>
            </details>

            <label className="flex cursor-pointer items-center gap-2.5 py-4 text-sm font-semibold text-[#344635]">
              <input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} className="h-4 w-4 accent-[#315a36]" />
              In stock only
            </label>
          </aside>

          <section aria-label="Marketplace products" className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#899286]">Showing</span>
              {selectedCategoryName && <span className="bg-[#e9efe4] px-2.5 py-1 text-xs font-semibold text-[#315a36]">{selectedCategoryName}</span>}
              {selectedSellers.map((seller) => <span key={seller} className="inline-flex items-center gap-1 bg-[#e9efe4] px-2.5 py-1 text-xs font-semibold text-[#315a36]">{seller}<button type="button" onClick={() => toggleSeller(seller)} aria-label={`Remove ${seller} filter`}><X className="h-3 w-3" /></button></span>)}
              {inStockOnly && <span className="inline-flex items-center gap-1 bg-[#e9efe4] px-2.5 py-1 text-xs font-semibold text-[#315a36]"><Check className="h-3 w-3" /> In stock</span>}
            </div>

            {categoryLoading ? (
              <div className="grid min-h-80 place-items-center border border-dashed border-[#d7dfd2] text-sm text-[#6f7a6e]">Loading this harvest…</div>
            ) : currentProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {currentProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="border border-dashed border-[#cbd7c4] bg-white px-6 py-16 text-center">
                <p className="font-semibold text-[#2c3c30]">No products match these filters.</p>
                <p className="mt-1 text-sm text-[#69736a]">Try a wider price range or clear your filters.</p>
                <button type="button" onClick={clearFilters} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#315a36]">Clear filters <X className="h-4 w-4" /></button>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-[#e4e8df] pt-4 text-sm text-[#687269]">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} aria-label="Previous page" className="grid h-9 w-9 place-items-center border border-[#dfe5db] bg-white disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} aria-label="Next page" className="grid h-9 w-9 place-items-center border border-[#dfe5db] bg-white disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
              <span className="hidden sm:inline">{currentProducts.length} of {filteredProducts.length} products</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
