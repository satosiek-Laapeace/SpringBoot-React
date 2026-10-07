import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardList,
  Package,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  TriangleAlert,
  WalletCards,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchMyProductsAPI } from '../../features/products/services/productApi';
import { fetchMySellerOrdersAPI } from '../../features/orders/services/orderApi';
import { fetchSellerDashboardOverviewAPI } from '../../features/dashboard/services/dashboardApi';
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
const MONTH_LABELS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  km: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'],
};
const buildPlatformMonthlyRevenue = (overview, language) => {
  const revenueByMonth = new Map((overview?.monthlyRevenue ?? []).map((entry) => [entry.month, entry]));
  return Array.from({ length: 12 }, (_, index) => {
    const entry = revenueByMonth.get(index + 1);
    return {
      month: MONTH_LABELS[language === 'km' ? 'km' : 'en'][index],
      thisYear: Number(entry?.thisYear ?? 0),
      lastYear: Number(entry?.lastYear ?? 0),
    };
  });
};

const SellerRevenueTooltip = ({ active, payload, label, language, t }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-lg">
      <p className="text-[10px] font-semibold text-slate-500">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 text-xs font-bold" style={{ color: item.color }}>
          {item.dataKey === 'thisYear' ? t('overviewThisYear') : t('overviewLastYear')}:{' '}
          {formatCurrency(item.value, language)}
        </p>
      ))}
    </div>
  );
};

export const SellerDashboardPage = () => {
  const { currentUser } = useStore();
  const { language, t } = useLanguage();
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerProductsLoaded, setSellerProductsLoaded] = useState(false);
  const [sellerOrdersLoaded, setSellerOrdersLoaded] = useState(false);
  const [platformOverview, setPlatformOverview] = useState(null);
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
    const [productsResult, ordersResult, overviewResult] = await Promise.allSettled([
      fetchMyProductsAPI(),
      fetchMySellerOrdersAPI(),
      fetchSellerDashboardOverviewAPI(),
    ]);
    const errors = [];
    if (productsResult.status === 'fulfilled' && Array.isArray(productsResult.value)) {
      setSellerProducts(productsResult.value.map(normalizeProduct));
      setSellerProductsLoaded(true);
    } else {
      errors.push(productsResult.status === 'rejected' ? productsResult.reason?.message : 'Unexpected products response');
    }
    if (ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value)) {
      setSellerOrders(ordersResult.value);
      setSellerOrdersLoaded(true);
    } else {
      errors.push(ordersResult.status === 'rejected' ? ordersResult.reason?.message : 'Unexpected orders response');
    }
    if (overviewResult.status === 'fulfilled'
      && overviewResult.value
      && typeof overviewResult.value === 'object'
      && !Array.isArray(overviewResult.value)) {
      setPlatformOverview(overviewResult.value);
    } else {
      errors.push(overviewResult.status === 'rejected'
        ? overviewResult.reason?.message
        : 'Unexpected platform overview response');
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
  const monthlyRevenue = useMemo(
    () => buildPlatformMonthlyRevenue(platformOverview, language),
    [platformOverview, language],
  );
  const sellerPerformance = useMemo(() => {
    let revenue = 0;
    let itemsSold = 0;
    let revenueOrderCount = 0;
    let openOrders = 0;

    visibleSellerOrders.forEach((order) => {
      const status = getOrderStatus(order);
      if (['PENDING', 'CONFIRMED', 'PROCESSING'].includes(status)) openOrders += 1;
      if (status === 'CANCELLED') return;

      revenue += getOrderTotal(order, sellerProductIds);
      revenueOrderCount += 1;
      (Array.isArray(order.items) ? order.items : [])
        .filter((item) => sellerProductIds.has(String(getItemProductId(item))))
        .forEach((item) => {
          const quantity = Number(item.quantity ?? 0);
          if (Number.isFinite(quantity) && quantity > 0) itemsSold += quantity;
        });
    });

    return {
      revenue,
      orderCount: visibleSellerOrders.length,
      itemsSold,
      openOrders,
      averageOrderValue: revenueOrderCount ? revenue / revenueOrderCount : 0,
    };
  }, [visibleSellerOrders, sellerProductIds]);
  const currentYearRevenue = Number(platformOverview?.currentYearRevenue ?? 0);
  const previousYearRevenue = Number(platformOverview?.previousYearRevenue ?? 0);
  const revenueChange = currentYearRevenue - previousYearRevenue;

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
  const sellerMetrics = [
    {
      label: t('sellerOwnRevenue'),
      value: formatCurrency(sellerPerformance.revenue, language),
      note: t('sellerRevenueExcludesCancelled'),
      icon: WalletCards,
      iconClass: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      label: t('sellerOwnOrders'),
      value: sellerPerformance.orderCount.toLocaleString(language === 'km' ? 'km-KH' : 'en-US'),
      note: t('sellerOrdersForYourProducts'),
      icon: ShoppingBag,
      iconClass: 'text-sky-700 dark:text-sky-300',
    },
    {
      label: t('sellerItemsSold'),
      value: sellerPerformance.itemsSold.toLocaleString(language === 'km' ? 'km-KH' : 'en-US'),
      note: t('sellerItemsSoldDescription'),
      icon: PackageCheck,
      iconClass: 'text-amber-700 dark:text-amber-300',
    },
    {
      label: t('sellerOpenOrders'),
      value: sellerPerformance.openOrders.toLocaleString(language === 'km' ? 'km-KH' : 'en-US'),
      note: t('sellerOpenOrdersDescription'),
      icon: ClipboardList,
      iconClass: 'text-indigo-700 dark:text-indigo-300',
    },
    {
      label: t('sellerAverageOrderValue'),
      value: formatCurrency(sellerPerformance.averageOrderValue, language),
      note: t('sellerAverageOrderValueDescription'),
      icon: WalletCards,
      iconClass: 'text-emerald-700 dark:text-emerald-300',
    },
  ];
  const metrics = [
    {
      label: t('overviewGmv'),
      value: platformOverview ? formatCurrency(platformOverview.marketplaceGmv, language) : '—',
      note: t('overviewExcludingCanceled'),
      icon: WalletCards,
      iconClass: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      label: t('overviewActiveVendors'),
      value: platformOverview ? Number(platformOverview.activeVendors).toLocaleString(language === 'km' ? 'km-KH' : 'en-US') : '—',
      note: `${t('overviewOf')} ${Number(platformOverview?.vendorAccounts ?? 0).toLocaleString(language === 'km' ? 'km-KH' : 'en-US')} ${t('overviewVendorAccounts')}`,
      icon: BriefcaseBusiness,
      iconClass: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      label: t('overviewCatalogProducts'),
      value: platformOverview ? Number(platformOverview.catalogProducts).toLocaleString(language === 'km' ? 'km-KH' : 'en-US') : '—',
      note: `${Number(platformOverview?.productCategories ?? 0).toLocaleString(language === 'km' ? 'km-KH' : 'en-US')} ${t('overviewProductCategories')}`,
      icon: Package,
      iconClass: 'text-amber-700 dark:text-amber-300',
    },
    {
      label: t('overviewOrdersInProgress'),
      value: platformOverview ? Number(platformOverview.ordersInProgress).toLocaleString(language === 'km' ? 'km-KH' : 'en-US') : '—',
      note: `${Number(platformOverview?.totalOrders ?? 0).toLocaleString(language === 'km' ? 'km-KH' : 'en-US')} ${t('overviewTotalOrderRecords')}`,
      icon: ShoppingBag,
      iconClass: 'text-sky-700 dark:text-sky-300',
    },
    {
      label: t('sellerLowStock'),
      value: loading || !sellerProductsLoaded ? '—' : lowStockProducts.length,
      note: t('sellerInventoryAttentionDescription'),
      icon: TriangleAlert,
      iconClass: 'text-amber-700 dark:text-amber-300',
    },
  ];

  return (
    <div className="min-w-0 space-y-6 pb-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
            <span>{t('sellerStudio')}</span><span className="text-slate-300">/</span>
            <span className="text-emerald-700">{t('sellerDashboard')}</span>
          </div>
          <h1 className="mt-2 text-[26px] font-bold tracking-[-.035em] text-slate-900 dark:text-white sm:text-3xl">
            {t('sellerWelcome')}, {displayName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('sellerPlatformDashboardDescription')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => loadSellerData(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />{t('sellerRefreshData')}
          </button>
          <Link to="/dashboard/products" className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
            <Package className="h-3.5 w-3.5" />{t('sellerManageProducts')}<ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {loadError && (
        <section role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200"><AlertCircle className="h-4 w-4" />{t('sellerDashboardLoadError')}</p>
          <p className="mt-1.5 pl-6 text-[10px] text-amber-800 dark:text-amber-300">{loadError}</p>
        </section>
      )}

      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('sellerBusinessSummary')}</h2>
      <section aria-label={t('sellerBusinessSummary')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {sellerMetrics.map(({ label, value, note, icon: Icon, iconClass }) => (
          <article key={label} className="group rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,.025)] transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_12px_28px_rgba(15,23,42,.07)] dark:border-emerald-900/50 dark:bg-slate-900 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-500">{label}</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition group-hover:bg-emerald-50 dark:bg-slate-800 dark:group-hover:bg-emerald-950/50">
                <Icon className={`h-4 w-4 ${iconClass}`} />
              </span>
            </div>
            <p className="mt-3 truncate text-[27px] font-bold leading-none tracking-[-.04em] text-slate-900 dark:text-white">
              {loading || !sellerProductsLoaded || !sellerOrdersLoaded ? '—' : value}
            </p>
            <div className="mt-3 min-h-4 text-[10px] text-slate-500 dark:text-slate-400">{note}</div>
          </article>
        ))}
      </section>

      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('sellerMarketplaceOverview')}</h2>
      <section aria-label={t('sellerMarketplaceOverview')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(({ label, value, note, icon: Icon, iconClass }) => (
          <article key={label} className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,.025)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,.07)] dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-500">{label}</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition group-hover:bg-emerald-50 dark:bg-slate-800 dark:group-hover:bg-emerald-950/50">
                <Icon className={`h-4 w-4 ${iconClass}`} />
              </span>
            </div>
            <p className="mt-3 truncate text-[27px] font-bold leading-none tracking-[-.04em] text-slate-900 dark:text-white">{value}</p>
            <div className="mt-3 min-h-4 text-[10px] text-slate-500 dark:text-slate-400">{note}</div>
          </article>
        ))}
      </section>

      <section aria-label={t('sellerQuickActions')} className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: t('sellerManageProducts'),
            description: `${sellerProductsLoaded ? sellerProducts.length : '—'} ${t('sellerListings').toLowerCase()}`,
            href: '/dashboard/products',
            Icon: Package,
          },
          {
            title: t('sellerReviewInventory'),
            description: `${sellerProductsLoaded ? lowStockProducts.length : '—'} ${t('sellerLowStock').toLowerCase()}`,
            href: '/dashboard/inventory',
            Icon: TriangleAlert,
          },
          {
            title: t('sellerViewAllOrders'),
            description: `${sellerOrdersLoaded ? sellerPerformance.openOrders : '—'} ${t('sellerOpenOrders').toLowerCase()}`,
            href: '/dashboard/orders',
            Icon: ClipboardList,
          },
        ].map(({ title, description, href, Icon }) => (
          <Link
            key={href}
            to={href}
            className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-slate-800 group-hover:text-emerald-800 dark:text-slate-100 dark:group-hover:text-emerald-300">{title}</span>
              <span className="mt-1 block truncate text-[10px] text-slate-500 dark:text-slate-400">{description}</span>
            </span>
            <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
          </Link>
        ))}
      </section>

      <section aria-label={t('sellerRevenueAnalytics')} className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(260px,.85fr)]">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,.025)] dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{t('sellerRevenueAnalytics')}</p>
              <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900 dark:text-white">{t('sellerMonthlySales')}</h2>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{t('sellerPlatformRevenueChartDescription')}</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600" />{t('overviewThisYear')}</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />{t('overviewLastYear')}</span>
            </div>
          </div>
          <div className="mt-4 h-60 min-w-0">
            {loading ? (
              <div role="status" className="flex h-full items-center justify-center text-sm text-slate-500">{t('sellerLoadingData')}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sellerRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3f8a61" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3f8a61" stopOpacity={0.015} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#eef1ee" strokeDasharray="3 4" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#89958d', fontSize: 10 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#89958d', fontSize: 10 }}
                    tickFormatter={(value) => value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${value}`}
                  />
                  <Tooltip content={<SellerRevenueTooltip language={language} t={t} />} />
                  <Area type="monotone" dataKey="thisYear" name={t('overviewThisYear')} stroke="#38845a" strokeWidth={2.5} fill="url(#sellerRevenueFill)" activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="lastYear" name={t('overviewLastYear')} stroke="#c4cbd0" strokeWidth={2} strokeDasharray="5 5" fill="transparent" activeDot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,.025)] dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{t('sellerRevenueAnalytics')}</p>
          <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900 dark:text-white">{t('sellerYearToDate')}</h2>
          <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{platformOverview?.currentYear ?? '—'}</p>
          <p className="mt-7 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{loading || !platformOverview ? '—' : formatCurrency(currentYearRevenue, language)}</p>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">{t('sellerComparedWithLastYear')}</span>
            <span className={`font-bold ${revenueChange >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
              {loading || !platformOverview ? '—' : `${revenueChange >= 0 ? '+' : '−'}${formatCurrency(Math.abs(revenueChange), language)}`}
            </span>
          </div>
          <p className="mt-2 text-[10px] leading-5 text-slate-500 dark:text-slate-400">
            {t('overviewLastYear')}: {loading || !platformOverview ? '—' : formatCurrency(previousYearRevenue, language)}
          </p>
        </article>
      </section>

      <section id="analytics" className="grid scroll-mt-6 gap-5 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">{t('sellerRecentOrders')}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {filteredSellerOrders.length} {t('sellerOf')} {visibleSellerOrders.length} {t('sellerOrders').toLowerCase()}
              </p>
            </div>
            <Link to="/dashboard/orders" aria-label={t('sellerViewOrders')} className="rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50">
              <ClipboardList className="h-5 w-5" />
            </Link>
          </div>
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800"><TableFilters searchValue={orderSearch} onSearchChange={setOrderSearch} searchPlaceholder={t('sellerSearchOrders')} searchLabel={t('sellerSearchOrders')} filters={[{ label: t('sellerFilterOrderStatus'), value: orderStatusFilter, onChange: setOrderStatusFilter, options: [{ value: 'ALL', label: t('sellerAllStatuses') }, ...['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => ({ value: status, label: getStatusLabel(status, t) }))] }]} /></div>
          {loading ? (
            <div role="status" className="px-5 py-10 text-center text-sm text-slate-500">{t('sellerLoadingData')}</div>
          ) : !sellerOrdersLoaded || !sellerProductsLoaded ? (
            <div role="status" className="px-5 py-10 text-center text-sm text-slate-500">{t('sellerDashboardSectionUnavailable')}</div>
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
              <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{visibleSellerOrders.length ? t('sellerNoOrdersMatchFilter') : t('sellerNoOrders')}</p>
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
          ) : !sellerProductsLoaded ? (
            <div role="status" className="px-5 py-10 text-center text-sm text-slate-500">{t('sellerDashboardSectionUnavailable')}</div>
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
    </div>
  );
};
