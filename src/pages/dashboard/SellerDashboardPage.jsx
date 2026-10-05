import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  ClipboardList,
  Package,
  PackageCheck,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchMyProductsAPI } from '../../features/products/services/productApi';
import { fetchMySellerOrdersAPI } from '../../features/orders/services/orderApi';
import { normalizeProduct } from '../../features/products/utils/normalizeProduct';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/common/TableFilters';

const getOrderStatus = (order) => String(order.status ?? 'PENDING').toUpperCase();

const getOrderBuyer = (order) =>
  order.buyerName ?? order.buyer_name ?? order.buyer?.displayName ?? order.buyer?.name ?? '—';

const getStatusLabel = (status, t) => ({
  PENDING: t('orderPending'),
  CONFIRMED: t('orderConfirmed'),
  PROCESSING: t('orderProcessing'),
  SHIPPED: t('orderShipped'),
  DELIVERED: t('orderDelivered'),
  CANCELLED: t('orderCancelled'),
}[status] ?? status);

const SELLER_STATUS_STYLES = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  PROCESSING: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
  SHIPPED: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300',
  DELIVERED: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300',
  CANCELLED: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const getStatusBadgeClass = (status) => SELLER_STATUS_STYLES[String(status ?? 'PENDING').toUpperCase()] ?? 'border-slate-200 bg-slate-100 text-slate-700';

const formatCurrency = (amount, language) => new Intl.NumberFormat(
  language === 'km' ? 'km-KH' : 'en-US',
  { style: 'currency', currency: 'USD', maximumFractionDigits: 2 },
).format(amount);

const getItemProductId = (item) => item.productId ?? item.product_id ?? item.product?.id;
const getItemTotal = (item) => Number(item.subTotal ?? item.subtotal ?? Number(item.priceAtPurchase ?? item.price_at_purchase ?? item.price ?? 0) * Number(item.quantity ?? 0));
const getOrderTotal = (order, productIds) => (Array.isArray(order.items) ? order.items : [])
  .filter((item) => productIds.has(String(getItemProductId(item))))
  .reduce((total, item) => total + getItemTotal(item), 0);

export const SellerDashboardPage = () => {
  const { currentUser } = useStore();
  const { language, t } = useLanguage();
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const displayName = currentUser?.full_name || currentUser?.fullName || currentUser?.username || t('sellerNameFallback');

  const loadSellerData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setLoadError('');
    const [productsResult, ordersResult] = await Promise.allSettled([fetchMyProductsAPI(), fetchMySellerOrdersAPI()]);
    const errors = [];
    if (productsResult.status === 'fulfilled' && Array.isArray(productsResult.value)) {
      setSellerProducts(productsResult.value.map(normalizeProduct));
    } else {
      errors.push(productsResult.status === 'rejected' ? productsResult.reason?.message : 'Unexpected products response');
    }
    if (ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value)) {
      setSellerOrders(ordersResult.value);
    } else {
      errors.push(ordersResult.status === 'rejected' ? ordersResult.reason?.message : 'Unexpected orders response');
    }
    if (errors.length) setLoadError(errors.filter(Boolean).join(' '));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadSellerData(); }, [loadSellerData]);

  const sellerProductIds = useMemo(() => new Set(sellerProducts.map((product) => String(product.id))), [sellerProducts]);
  const visibleSellerOrders = useMemo(() => sellerOrders.filter((order) =>
    (Array.isArray(order.items) ? order.items : []).some((item) => sellerProductIds.has(String(getItemProductId(item))))
  ), [sellerOrders, sellerProductIds]);

  const lowStockProducts = useMemo(() => sellerProducts.filter((product) =>
    Number(product.stock_quantity ?? product.stockQuantity ?? 0) <= 15
  ), [sellerProducts]);
  const filteredSellerOrders = useMemo(() => {
    const query = orderSearch.trim().toLocaleLowerCase();
    return visibleSellerOrders.filter(order => {
      const status = getOrderStatus(order);
      const matchesStatus = orderStatusFilter === 'ALL' || status === orderStatusFilter;
      const matchesSearch = !query || [order.id, getOrderBuyer(order), status]
        .some(value => String(value ?? '').toLocaleLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [visibleSellerOrders, orderSearch, orderStatusFilter]);
  const sellerOrderPage = usePagination(filteredSellerOrders);
  const lowStockPage = usePagination(lowStockProducts);
  const pendingOrders = visibleSellerOrders.filter((order) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(getOrderStatus(order))
  );
  const revenue = visibleSellerOrders.reduce((total, order) => {
    if (getOrderStatus(order) === 'CANCELLED') return total;
    return total + getOrderTotal(order, sellerProductIds);
  }, 0);
  const metrics = [
    {
      label: t('sellerListings'),
      value: loading ? '—' : sellerProducts.length,
      icon: Package,
      iconClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    },
    {
      label: t('sellerLowStock'),
      value: loading ? '—' : lowStockProducts.length,
      icon: TriangleAlert,
      iconClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    },
    {
      label: t('sellerOpenOrders'),
      value: loading ? '—' : pendingOrders.length,
      icon: PackageCheck,
      iconClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    },
    {
      label: t('sellerRevenue'),
      value: loading ? '—' : formatCurrency(revenue, language),
      icon: CircleDollarSign,
      iconClass: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    },
  ];

  return (
    <main className="min-w-0 space-y-6 pb-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 dark:border-emerald-900/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            {t('sellerDashboard')}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {t('sellerWelcome')}, {displayName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {t('sellerDashboardDescription')}
          </p>
        </div>
        <Link
          to="/dashboard/products"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <Package className="h-4 w-4" />
          {t('sellerManageProducts')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {loadError ? (
          <p role="alert" className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{t('sellerDashboardLoadError')}: {loadError}</p>
        ) : <span />}
        <button type="button" onClick={() => loadSellerData(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-300 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />{t('sellerRefreshData')}
        </button>
      </div>

      <section aria-label={t('sellerBusinessSummary')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, iconClass }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-5 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          </article>
        ))}
      </section>

      <section id="analytics" className="grid scroll-mt-6 gap-5 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">{t('sellerRecentOrders')}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{filteredSellerOrders.length} of {visibleSellerOrders.length} orders</p>
            </div>
            <Link to="/dashboard/orders" aria-label={t('sellerViewOrders')} className="rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50">
              <ClipboardList className="h-5 w-5" />
            </Link>
          </div>
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800"><TableFilters searchValue={orderSearch} onSearchChange={setOrderSearch} searchPlaceholder="Search orders..." searchLabel="Search seller orders" filters={[{ label: 'Filter seller orders by status', value: orderStatusFilter, onChange: setOrderStatusFilter, options: [{ value: 'ALL', label: 'All statuses' }, ...['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => ({ value: status, label: getStatusLabel(status, t) }))] }]} /></div>
          {loading ? (
            <div role="status" className="px-5 py-10 text-center text-sm text-slate-500">{t('sellerLoadingData')}</div>
          ) : filteredSellerOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-5 py-3">{t('sellerOrder')}</th>
                    <th scope="col" className="px-5 py-3">{t('sellerBuyer')}</th>
                    <th scope="col" className="px-5 py-3">{t('sellerTotal')}</th>
                    <th scope="col" className="px-5 py-3">{t('sellerStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sellerOrderPage.paginatedItems.map((order) => {
                    const status = getOrderStatus(order);
                    return (
                      <tr key={order.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300">#{order.id}</td>
                        <td className="max-w-40 truncate px-5 py-3.5 font-medium text-slate-700 dark:text-slate-200">{getOrderBuyer(order)}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{formatCurrency(getOrderTotal(order, sellerProductIds), language)}</td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusBadgeClass(status)}`}>
                            {getStatusLabel(status, t)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination currentPage={sellerOrderPage.currentPage} pageCount={sellerOrderPage.pageCount} totalItems={sellerOrderPage.totalItems} pageSize={sellerOrderPage.pageSize} onPageChange={sellerOrderPage.setCurrentPage} onPageSizeChange={sellerOrderPage.setPageSize} t={t} />
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <BadgeCheck className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{visibleSellerOrders.length ? 'No orders match these filters.' : t('sellerNoOrders')}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('sellerNoOrdersDescription')}</p>
            </div>
          )}
          <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
            <Link to="/dashboard/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
              {t('sellerViewAllOrders')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">{t('sellerInventoryAttention')}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('sellerInventoryAttentionDescription')}</p>
            </div>
            <Link to="/dashboard/inventory" aria-label={t('sellerViewInventory')} className="rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50">
              <Package className="h-5 w-5" />
            </Link>
          </div>
          {loading ? (
            <div role="status" className="px-5 py-10 text-center text-sm text-slate-500">{t('sellerLoadingData')}</div>
          ) : lowStockProducts.length > 0 ? (
            <>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {lowStockPage.paginatedItems.map((product) => {
                const quantity = Number(product.stock_quantity ?? product.stockQuantity ?? 0);
                return (
                  <li key={product.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                        <TriangleAlert className="h-4 w-4" />
                      </span>
                      <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{product.name}</span>
                    </div>
                    <span className="whitespace-nowrap text-xs font-bold text-amber-700 dark:text-amber-300">
                      {quantity} {product.unit || t('sellerUnits')}
                    </span>
                  </li>
                );
              })}
            </ul>
            <Pagination currentPage={lowStockPage.currentPage} pageCount={lowStockPage.pageCount} totalItems={lowStockPage.totalItems} pageSize={lowStockPage.pageSize} onPageChange={lowStockPage.setCurrentPage} onPageSizeChange={lowStockPage.setPageSize} t={t} />
            </>
          ) : (
            <div className="px-5 py-10 text-center">
              <PackageCheck className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{t('sellerInventoryHealthy')}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('sellerInventoryHealthyDescription')}</p>
            </div>
          )}
          <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
            <Link to="/dashboard/inventory" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
              {t('sellerReviewInventory')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
};
