import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Clock3,
  CreditCard,
  Download,
  FileDown,
  LoaderCircle,
  RefreshCw,
  Package,
  ShieldCheck,
  ShoppingBag,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { fetchOrderPaymentsAPI, markOrderPaidAPI } from '../../features/checkout/services/checkoutApi';
import { fetchOrdersAPI } from '../../features/orders/services/orderApi';
import { activateSupplierAPI, deactivateSupplierAPI, fetchAllStockMovementsAPI, fetchSuppliersAPI } from '../../features/inventory/services/inventoryApi';
import { fetchUsersAPI, setUserEnabledAPI } from '../../features/user-profile/services/profileApi';
import { fetchAllProductsAPI, fetchCategoriesAPI } from '../../features/products/services/productApi';
import { normalizeProduct } from '../../features/products/utils/normalizeProduct';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/common/TableFilters';

const getGreetingPeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
};

const PAYMENT_COLORS = {
  CARD: '#37795b',
  BANK_TRANSFER: '#d7a643',
  CASH_ON_DELIVERY: '#6d91ad',
  COD: '#6d91ad',
};

const PAYMENT_LABELS = {
  CARD: 'Card',
  BANK_TRANSFER: 'Bank transfer',
  CASH_ON_DELIVERY: 'Cash on delivery',
  COD: 'Cash on delivery',
};

const formatCurrency = amount => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(Number(amount) || 0);

const formatExactCurrency = amount => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
}).format(Number(amount) || 0);

const pick = (record, ...keys) => keys.map(key => record?.[key]).find(value => value !== undefined && value !== null && value !== '');
const orderId = order => pick(order, 'id', 'orderId', 'order_id');
const userId = user => pick(user, 'id', 'userId', 'user_id');
const roleName = user => String(pick(user, 'role', 'userRole', 'user_role') ?? 'BUYER').replace(/^ROLE_/, '').toUpperCase();
const enabled = user => user?.enabled ?? user?.isEnabled ?? user?.is_enabled ?? true;
const timestamp = record => pick(record, 'createdAt', 'created_at', 'createAt', 'updatedAt', 'updated_at');
const paymentMethod = payment => String(pick(payment, 'method', 'paymentMethod', 'payment_method') ?? '').toUpperCase();
const paymentStatus = payment => String(pick(payment, 'status', 'paymentStatus', 'payment_status') ?? '').toUpperCase();
const amountForOrder = order => Number(pick(order, 'totalAmount', 'total_amount') ?? 0);
const quantityForMovement = movement => Number(pick(movement, 'quantityChange', 'quantity_change') ?? 0);

const toDate = value => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const formatDateTime = value => {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date) : 'Date unavailable';
};

const Sparkline = ({ values, color }) => {
  const points = values.length > 1 ? values : [0, 0];
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const path = points.map((value, index) => {
    const x = (index / (points.length - 1)) * 100;
    const y = 30 - ((value - min) / range) * 26;
    return `${index ? 'L' : 'M'}${x},${y}`;
  }).join(' ');
  return <svg aria-hidden="true" viewBox="0 0 100 34" preserveAspectRatio="none" className="h-9 w-24 overflow-visible"><path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
};

const buildMonthlyRevenue = orders => {
  const year = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, index) => ({
    month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(year, index, 1)),
    thisYear: 0,
    lastYear: 0,
  }));
  orders.forEach(order => {
    const date = toDate(timestamp(order));
    if (!date || String(pick(order, 'status') ?? '').toUpperCase() === 'CANCELLED') return;
    const entry = months[date.getMonth()];
    const value = amountForOrder(order);
    if (date.getFullYear() === year) entry.thisYear += value;
    if (date.getFullYear() === year - 1) entry.lastYear += value;
  });
  return months.map(month => ({
    ...month,
    thisYear: Math.round(month.thisYear * 100) / 100,
    lastYear: Math.round(month.lastYear * 100) / 100,
  }));
};

const monthlyDelta = chart => {
  const now = new Date();
  const thisMonth = chart[now.getMonth()]?.thisYear || 0;
  const previousMonth = now.getMonth() ? chart[now.getMonth() - 1]?.thisYear || 0 : chart[11]?.lastYear || 0;
  return thisMonth - previousMonth;
};

const monthlyCounts = (records, getDate = timestamp) => {
  const year = new Date().getFullYear();
  const counts = Array(12).fill(0);
  records.forEach(record => {
    const date = toDate(getDate(record));
    if (date?.getFullYear() === year) counts[date.getMonth()] += 1;
  });
  return counts;
};

const buildActivityRows = ({ orders, stockMovements, suppliers, users, paymentsByOrder }) => {
  const usersById = new Map(users.map(user => [String(userId(user)), user]));
  const events = [];

  orders.forEach(order => {
    const payment = paymentsByOrder.get(String(orderId(order)))?.[0] || order.payment || {};
    const buyerId = pick(order, 'buyerId', 'buyer_id');
    const buyer = usersById.get(String(buyerId));
    const method = paymentMethod(payment);
    const status = paymentStatus(payment) || String(pick(order, 'status') ?? 'PENDING').toUpperCase();
    events.push({
      id: `order-${orderId(order)}`,
      ref: `ORD-${orderId(order)}`,
      actor: buyer?.fullName || buyer?.full_name || buyer?.name || buyer?.username || (buyerId ? `Buyer #${buyerId}` : 'Marketplace buyer'),
      action: `Order placed${method ? ` · ${PAYMENT_LABELS[method] || method.replaceAll('_', ' ')}` : ''}`,
      time: timestamp(order),
      amount: formatExactCurrency(amountForOrder(order)),
      status,
      type: 'order',
      orderId: orderId(order),
      isManualPayment: ['BANK_TRANSFER', 'CASH_ON_DELIVERY', 'COD'].includes(method) && status === 'PENDING',
    });
  });

  stockMovements.forEach(movement => {
    const quantity = quantityForMovement(movement);
    const supplierId = pick(movement, 'supplierId', 'supplier_id');
    const supplier = suppliers.find(item => String(pick(item, 'id', 'supplierId', 'supplier_id')) === String(supplierId));
    events.push({
      id: `stock-${pick(movement, 'id', 'movementId')}`,
      ref: `STK-${pick(movement, 'id', 'movementId')}`,
      actor: supplier?.name || (supplierId ? `Supplier #${supplierId}` : 'Inventory operations'),
      action: `${pick(movement, 'type', 'movementType') || 'Stock update'}${pick(movement, 'productName', 'product_name') ? ` · ${pick(movement, 'productName', 'product_name')}` : ''}`,
      time: timestamp(movement),
      amount: `${quantity > 0 ? '+' : ''}${quantity} units`,
      status: quantity < 0 ? 'SHIPPED' : 'ACTIVE',
      type: 'stock',
      supplierId,
    });
  });

  suppliers.forEach(supplier => {
    const id = pick(supplier, 'id', 'supplierId', 'supplier_id');
    const active = Boolean(pick(supplier, 'isActive', 'is_active', 'active'));
    events.push({
      id: `supplier-${id}`,
      ref: `SUP-${id}`,
      actor: pick(supplier, 'contactPerson', 'contact_person', 'name') || `Supplier #${id}`,
      action: `${active ? 'Supplier active' : 'Supplier awaiting approval'} · ${pick(supplier, 'name', 'supplierName', 'supplier_name') || 'Farm vendor'}`,
      time: timestamp(supplier),
      amount: '—',
      status: active ? 'ACTIVE' : 'PENDING',
      type: 'supplier',
      supplierId: id,
      active,
    });
  });

  users.forEach(user => {
    const id = userId(user);
    const lockTime = pick(user, 'lockTime', 'lock_time');
    events.push({
      id: `user-${id}`,
      ref: `USR-${id}`,
      actor: user.fullName || user.full_name || user.name || user.username || `User #${id}`,
      action: `${roleName(user)} account access`,
      time: timestamp(user),
      amount: '—',
      status: lockTime ? 'LOCKED' : enabled(user) ? 'ACTIVE' : 'DISABLED',
      type: 'user',
      userId: id,
      isEnabled: enabled(user),
      lockTime,
    });
  });

  return events.sort((a, b) => (toDate(b.time)?.getTime() || 0) - (toDate(a.time)?.getTime() || 0));
};

const STATUS_STYLE = {
  PAID: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  DELIVERED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  PENDING_VERIFICATION: 'border-amber-200 bg-amber-50 text-amber-800',
  SHIPPED: 'border-blue-200 bg-blue-50 text-blue-700',
  PROCESSING: 'border-blue-200 bg-blue-50 text-blue-700',
  CONFIRMED: 'border-blue-200 bg-blue-50 text-blue-700',
  LOCKED: 'border-rose-200 bg-rose-50 text-rose-700',
  DISABLED: 'border-slate-200 bg-slate-100 text-slate-600',
  FAILED: 'border-rose-200 bg-rose-50 text-rose-700',
  CANCELLED: 'border-slate-200 bg-slate-100 text-slate-600',
};

const normalizeStatus = status => status === 'PENDING' ? 'PENDING VERIFICATION' : status.replaceAll('_', ' ');

const exportCsv = rows => {
  const columns = ['ID Reference', 'Actor', 'Activity Action', 'Timestamp', 'Amount / Quantity', 'Status'];
  const csvValue = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const content = [columns, ...rows.map(row => [
    row.ref,
    row.actor,
    row.action,
    row.time || '',
    row.amount,
    normalizeStatus(row.status),
  ])].map(row => row.map(csvValue).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `farmcraft-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

const TooltipCard = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-lg">
      <p className="text-[10px] font-semibold text-slate-500">{label}</p>
      {payload.map(item => <p key={item.dataKey} className="mt-1 text-xs font-bold" style={{ color: item.color }}>{item.name}: {formatExactCurrency(item.value)}</p>)}
    </div>
  );
};

export const AdminDashboardPage = () => {
  const { t } = useLanguage();
  const [greetingPeriod, setGreetingPeriod] = useState(getGreetingPeriod);

  useEffect(() => {
    const timer = window.setInterval(() => setGreetingPeriod(getGreetingPeriod()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const { user: currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [paymentsByOrder, setPaymentsByOrder] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiConnection, setApiConnection] = useState('connecting');
  const [errors, setErrors] = useState([]);
  const [actionError, setActionError] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [pendingAccessChange, setPendingAccessChange] = useState(null);
  const [pendingSupplierChange, setPendingSupplierChange] = useState(null);

  const refreshDashboard = useCallback(async (showRefresh = true) => {
    if (showRefresh) setRefreshing(true);
    setErrors([]);
    const load = async (label, request) => {
      try {
        const data = await request();
        if (!Array.isArray(data)) throw new Error('Unexpected API response');
        return { data, error: null };
      } catch (error) {
        return { data: [], error: `${label}: ${error.message}` };
      }
    };

    const results = await Promise.all([
      load('Orders', fetchOrdersAPI),
      load('Farm vendors', fetchSuppliersAPI),
      load('Users', fetchUsersAPI),
      load('Stock activity', fetchAllStockMovementsAPI),
      load('Products', fetchAllProductsAPI),
      load('Categories', fetchCategoriesAPI),
    ]);
    const [orderResult, supplierResult, userResult, movementResult, productResult, categoryResult] = results;
    const apiErrors = results.map(result => result.error).filter(Boolean);
    const successfulSources = results.filter(result => !result.error).length;
    setApiConnection(successfulSources === 0 ? 'unavailable' : apiErrors.length ? 'partial' : 'connected');

    const latestOrders = [...orderResult.data]
      .sort((a, b) => (toDate(timestamp(b))?.getTime() || 0) - (toDate(timestamp(a))?.getTime() || 0));
    const latestForPayment = latestOrders.slice(0, 30);
    const paymentResults = await Promise.all(latestForPayment.map(async order => {
      try {
        const result = await fetchOrderPaymentsAPI(orderId(order));
        return [String(orderId(order)), Array.isArray(result) ? result : []];
      } catch (error) {
        apiErrors.push(`Payments for order #${orderId(order)}: ${error.message}`);
        return [String(orderId(order)), []];
      }
    }));

    setOrders(orderResult.data);
    setSuppliers(supplierResult.data);
    setUsers(userResult.data);
    setStockMovements(movementResult.data);
    setProducts(productResult.data.map(normalizeProduct));
    setCategories(categoryResult.data);
    setPaymentsByOrder(new Map(paymentResults));
    setErrors([...new Set(apiErrors)]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refreshDashboard(false);
  }, [refreshDashboard]);

  const monthlyRevenue = useMemo(() => buildMonthlyRevenue(orders), [orders]);
  const paymentMix = useMemo(() => {
    const counts = new Map();
    paymentsByOrder.forEach((payments, id) => {
      const order = orders.find(item => String(orderId(item)) === id);
      const payment = payments[0] || order?.payment;
      const method = paymentMethod(payment);
      if (method) {
        const canonical = method === 'COD' ? 'CASH_ON_DELIVERY' : method;
        counts.set(canonical, (counts.get(canonical) || 0) + 1);
      }
    });
    return [
      { name: t('overviewCard'), key: 'CARD', value: counts.get('CARD') || 0, color: PAYMENT_COLORS.CARD },
      { name: t('overviewBankTransfer'), key: 'BANK_TRANSFER', value: counts.get('BANK_TRANSFER') || 0, color: PAYMENT_COLORS.BANK_TRANSFER },
      { name: t('overviewCashDelivery'), key: 'CASH_ON_DELIVERY', value: counts.get('CASH_ON_DELIVERY') || 0, color: PAYMENT_COLORS.CASH_ON_DELIVERY },
    ];
  }, [orders, paymentsByOrder, t]);
  const paymentTotal = paymentMix.reduce((sum, item) => sum + item.value, 0);
  const gmv = orders.reduce((total, order) => total + (String(pick(order, 'status') ?? '').toUpperCase() === 'CANCELLED' ? 0 : amountForOrder(order)), 0);
  const inProgressOrders = orders.filter(order => ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(String(pick(order, 'status') ?? '').toUpperCase())).length;
  const activeVendors = suppliers.filter(supplier => Boolean(pick(supplier, 'isActive', 'is_active', 'active'))).length;
  const inStockProducts = products.filter(product => product.stock_quantity > 0).length;
  const lockedUsers = users.filter(user => Boolean(pick(user, 'lockTime', 'lock_time'))).length;
  const monthlyChange = monthlyDelta(monthlyRevenue);

  const toggleUserAccess = async (id, nextEnabled) => {
    setActionError('');
    try {
      const updated = await setUserEnabledAPI(id, nextEnabled);
      setUsers(current => current.map(user => String(userId(user)) === String(id) ? { ...user, ...updated } : user));
      setPendingAccessChange(null);
    } catch (error) {
      setActionError(error.message || 'Account access could not be updated.');
    }
  };

  const toggleSupplierAccess = async (id, nextActive) => {
    setActionError('');
    try {
      const updated = nextActive ? await activateSupplierAPI(id) : await deactivateSupplierAPI(id);
      setSuppliers(current => current.map(supplier =>
        String(pick(supplier, 'id', 'supplierId', 'supplier_id')) === String(id)
          ? { ...supplier, ...updated, isActive: nextActive, is_active: nextActive }
          : supplier
      ));
      setPendingSupplierChange(null);
    } catch (error) {
      setActionError(error.message || 'Vendor access could not be updated.');
    }
  };

  const confirmPayment = async id => {
    setConfirmingId(id);
    setActionError('');
    try {
      const paid = await markOrderPaidAPI(id);
      setPaymentsByOrder(current => {
        const next = new Map(current);
        next.set(String(id), [paid, ...(next.get(String(id)) || []).slice(1)]);
        return next;
      });
      setPendingPayment(null);
    } catch (error) {
      setActionError(error.message || `Payment for order #${id} could not be confirmed.`);
    } finally {
      setConfirmingId(null);
    }
  };

  const rows = useMemo(() => buildActivityRows({
    orders,
    stockMovements,
    suppliers,
    users,
    paymentsByOrder,
  }), [orders, stockMovements, suppliers, users, paymentsByOrder]);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityType, setActivityType] = useState('ALL');
  const filteredRows = useMemo(() => {
    const query = activitySearch.trim().toLocaleLowerCase();
    return rows.filter(row => {
      const matchesType = activityType === 'ALL' || row.type === activityType;
      const matchesSearch = !query || [row.ref, row.actor, row.action, row.status, row.amount, row.type]
        .some(value => String(value ?? '').toLocaleLowerCase().includes(query));
      return matchesType && matchesSearch;
    });
  }, [rows, activitySearch, activityType]);
  const activityPage = usePagination(filteredRows);

  const summary = [
    {
      label: t('overviewGmv'),
      value: formatCurrency(gmv),
      change: monthlyChange,
      note: t('overviewExcludingCanceled'),
      Icon: WalletCards,
      accent: '#20875a',
      spark: monthlyRevenue.map(item => item.thisYear),
    },
    {
      label: t('overviewActiveVendors'),
      value: activeVendors.toLocaleString('en-US'),
      change: null,
      note: `${t('overviewOf')} ${suppliers.length} ${t('overviewVendorAccounts')}`,
      Icon: BriefcaseBusiness,
      accent: '#438b6a',
      spark: monthlyCounts(suppliers.filter(item => Boolean(pick(item, 'isActive', 'is_active', 'active')))),
    },
    {
      label: t('overviewCatalogProducts'),
      value: products.length.toLocaleString('en-US'),
      change: null,
      note: `${categories.length.toLocaleString('en-US')} ${t('overviewProductCategories')}`,
      Icon: Package,
      accent: '#a87728',
      spark: monthlyCounts(products),
    },
    {
      label: t('overviewOrdersInProgress'),
      value: inProgressOrders.toLocaleString('en-US'),
      change: null,
      note: `${orders.length.toLocaleString('en-US')} ${t('overviewTotalOrderRecords')}`,
      Icon: ShoppingBag,
      accent: '#4f82b2',
      spark: monthlyCounts(orders),
    },
    {
      label: t('overviewSecurityWarnings'),
      value: lockedUsers.toLocaleString('en-US'),
      change: null,
      note: lockedUsers ? t('overviewLockedProfilesReview') : t('overviewNoLockedProfiles'),
      Icon: lockedUsers ? AlertTriangle : ShieldCheck,
      accent: lockedUsers ? '#d49a32' : '#58856b',
      spark: monthlyCounts(users.filter(user => pick(user, 'lockTime', 'lock_time')), user => pick(user, 'lockTime', 'lock_time')),
    },
  ];

  if (loading) {
    return <div className="flex min-h-[55vh] items-center justify-center text-sm font-semibold text-slate-600" role="status"><LoaderCircle className="mr-2 h-5 w-5 animate-spin text-emerald-700" />{t('overviewLoading')}</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500"><span>{t('overviewExecutive')}</span><span className="text-slate-300">/</span><span className="text-emerald-700">{t('overviewMarketplaceOperations')}</span></div>
          <h1 className="mt-2 text-[26px] font-bold tracking-[-.035em] text-slate-900 sm:text-3xl">{t(`overviewWelcome${greetingPeriod[0].toUpperCase()}${greetingPeriod.slice(1)}`)}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('overviewDescription')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span role="status" className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[10px] font-semibold ${apiConnection === 'connected' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : apiConnection === 'partial' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${apiConnection === 'connected' ? 'bg-emerald-500' : apiConnection === 'partial' ? 'bg-amber-500' : 'bg-rose-500'}`} />
            {apiConnection === 'connected' ? t('overviewApiConnected') : apiConnection === 'partial' ? t('overviewApiPartial') : apiConnection === 'connecting' ? t('overviewApiConnecting') : t('overviewApiUnavailable')}
          </span>
          <button type="button" onClick={() => refreshDashboard()} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />{t('adminRefresh')}
          </button>
          <button type="button" onClick={() => exportCsv(rows)} disabled={!rows.length} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-3.5 w-3.5" />{t('overviewExportActivity')}
          </button>
        </div>
      </header>

      {errors.length > 0 && (
        <section role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-bold text-amber-900"><AlertTriangle className="h-4 w-4" />{t('overviewDataSourcesError')}</p>
          <ul className="mt-1.5 space-y-1 pl-6 text-[10px] text-amber-800">{errors.slice(0, 4).map(error => <li key={error} className="list-disc">{error}</li>)}</ul>
        </section>
      )}
      {actionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">{actionError}</p>}

      <section aria-label="Executive platform metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summary.map(({ label, value, change, note, Icon, accent, spark }) => (
          <article key={label} className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,.025)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,.07)] sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-500">{label}</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition group-hover:bg-emerald-50"><Icon className="h-4 w-4" style={{ color: accent }} /></span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-2">
              <p className="text-[27px] font-bold leading-none tracking-[-.04em] text-slate-900">{value}</p>
              <Sparkline values={spark} color={accent} />
            </div>
            <div className="mt-3 flex min-h-4 items-center gap-1.5">
              {change !== null ? (
                <>
                  {change >= 0 ? <ArrowUpRight className="h-3 w-3 text-emerald-600" /> : <ArrowDownRight className="h-3 w-3 text-rose-600" />}
                  <span className={`text-[10px] font-bold ${change >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{change >= 0 ? '+' : '−'}{formatCurrency(Math.abs(change))}</span>
                  <span className="text-[10px] text-slate-400">{t('overviewVsPreviousMonth')}</span>
                </>
              ) : <span className="text-[10px] text-slate-500">{note}</span>}
            </div>
          </article>
        ))}
      </section>

      <section aria-label="Marketplace management shortcuts" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: t('overviewManageCatalog'), description: `${products.length} ${t('overviewListings')} · ${inStockProducts} ${t('overviewInStock')}`, href: '/dashboard/admin/catalog', Icon: Package },
          { title: t('overviewManageOrders'), description: `${orders.length} ${t('adminOrders')} ${t('overviewAcrossMarketplace')}`, href: '/dashboard/admin/orders', Icon: ShoppingBag },
          { title: t('overviewManageUsers'), description: `${users.length} ${t('overviewUserProfiles')} · ${lockedUsers} ${t('usersLockedProfiles')}`, href: '/dashboard/admin/users', Icon: UsersRound },
          { title: t('overviewManageSuppliers'), description: `${suppliers.length} ${t('overviewSupplierAccounts')}`, href: '/dashboard/admin/suppliers', Icon: BriefcaseBusiness },
        ].map(({ title, description, href, Icon }) => (
          <Link key={href} to={href} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Icon className="h-4 w-4" /></span>
            <span className="min-w-0"><span className="block text-xs font-bold text-slate-800 group-hover:text-emerald-800">{title}</span><span className="mt-1 block truncate text-[10px] text-slate-500">{description}</span></span>
            <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-emerald-700" />
          </Link>
        ))}
      </section>

      <section aria-label="Marketplace analytics" className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.85fr)]">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,.025)] sm:p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{t('overviewRevenueAnalytics')}</p>
              <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900">{t('overviewMonthlyRevenue')}</h2>
              <p className="mt-1 text-[10px] text-slate-500">{t('overviewOrderValueByDate')} · {new Date().getFullYear()} / {new Date().getFullYear() - 1}</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-600">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600" />{t('overviewThisYear')}</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />{t('overviewLastYear')}</span>
            </div>
          </div>
          <div className="mt-4 h-62.5 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3f8a61" stopOpacity={0.2} /><stop offset="95%" stopColor="#3f8a61" stopOpacity={0.015} /></linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eef1ee" strokeDasharray="3 4" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#89958d', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#89958d', fontSize: 10 }} tickFormatter={value => value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${value}`} />
                <Tooltip content={<TooltipCard />} />
                <Area type="monotone" dataKey="thisYear" name="This year" stroke="#38845a" strokeWidth={2.5} fill="url(#adminRevenueFill)" activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="lastYear" name="Last year" stroke="#c4cbd0" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,.025)] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{t('adminFinancialDesk')}</p>
              <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900">{t('overviewPaymentBreakdown')}</h2>
              <p className="mt-1 text-[10px] text-slate-500">{t('overviewLatest')} {Math.min(30, orders.length)} {t('overviewOrdersWithPayments')}</p>
            </div>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </div>
          {paymentTotal ? (
            <>
              <div className="relative mt-1 h-47.5">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMix.filter(item => item.value > 0)} dataKey="value" nameKey="name" innerRadius={57} outerRadius={82} paddingAngle={4} stroke="none">
                      {paymentMix.filter(item => item.value > 0).map(item => <Cell key={item.key} fill={item.color} />)}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} orders`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">{paymentTotal}</span>
                  <span className="text-[9px] font-medium text-slate-500">{t('adminFinancialDesk')}</span>
                </div>
              </div>
              <div className="space-y-2.5 border-t border-slate-100 pt-3">
                {paymentMix.map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[11px] font-medium text-slate-600"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                    <span className="text-[11px] font-bold text-slate-800">{item.value}<span className="ml-1 font-medium text-slate-400">{paymentTotal ? `${Math.round(item.value / paymentTotal * 100)}%` : ''}</span></span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-62.5 flex-col items-center justify-center text-center">
              <CreditCard className="h-7 w-7 text-slate-300" />
              <p className="mt-2 text-xs font-semibold text-slate-600">{t('overviewNoPaymentRecords')}</p>
              <p className="mt-1 max-w-48 text-[10px] leading-4 text-slate-400">{t('overviewPaymentChartEmpty')}</p>
            </div>
          )}
        </article>
      </section>

      <section aria-label="Live operations ledger" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,.025)]">
        <header className="flex flex-col justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <div>
          <div className="flex items-center gap-2"><h2 className="text-base font-bold tracking-tight text-slate-900">{t('overviewLiveLedger')}</h2><span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />{t('overviewLive')}</span></div>
            <p className="mt-1 text-[10px] text-slate-500">{t('overviewLedgerDescription')}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><TableFilters searchValue={activitySearch} onSearchChange={setActivitySearch} searchPlaceholder="Search activity..." searchLabel="Search activity" filters={[{ label: 'Filter activity type', value: activityType, onChange: setActivityType, options: [{ value: 'ALL', label: 'All activity' }, ...['order', 'stock', 'supplier', 'user'].map(type => ({ value: type, label: type[0].toUpperCase() + type.slice(1) }))] }]} /><Link to="/dashboard/admin/finance" className="inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-2 text-[10px] font-bold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">{t('overviewOpenFinancialDesk')}<ArrowRight className="h-3 w-3" /></Link></div>
        </header>
        {filteredRows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5 text-left">
              <thead className="bg-slate-50/80 text-[9px] font-bold uppercase tracking-[.13em] text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">{t('overviewIdReference')}</th>
                  <th scope="col" className="px-3 py-3">{t('overviewActor')}</th>
                  <th scope="col" className="px-3 py-3">{t('overviewActivityAction')}</th>
                  <th scope="col" className="px-3 py-3">{t('colDate')}</th>
                  <th scope="col" className="px-3 py-3">{t('overviewAmountQuantity')}</th>
                  <th scope="col" className="px-3 py-3">{t('sellerStatus')}</th>
                  <th scope="col" className="px-5 py-3 text-right">{t('adminActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityPage.paginatedItems.map(row => {
                  const style = STATUS_STYLE[row.status] || STATUS_STYLE.PENDING;
                  const lockedAction = row.type === 'user' && String(row.userId) === String(currentUser?.id);
                  return (
                    <tr key={row.id} className="transition-colors hover:bg-slate-50/65">
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[10px] font-bold text-slate-600">{row.ref}</td>
                      <td className="max-w-40 truncate px-3 py-3.5 text-[11px] font-semibold text-slate-800" title={row.actor}>{row.actor}</td>
                      <td className="max-w-56 px-3 py-3.5 text-[10px] text-slate-600"><span className="line-clamp-2">{row.action}</span></td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-[10px] text-slate-500">{formatDateTime(row.time)}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-[10px] font-semibold text-slate-700">{row.amount}</td>
                      <td className="px-3 py-3.5"><span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[9px] font-bold ${style}`}>{normalizeStatus(row.status)}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {row.isManualPayment && <button type="button" disabled={Boolean(confirmingId)} onClick={() => setPendingPayment({ id: row.orderId, ref: row.ref, amount: row.amount })} className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2 py-1.5 text-[9px] font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60"><Check className="h-3 w-3" />{t('overviewVerifyPayment')}</button>}
                          {row.type === 'user' && <button type="button" disabled={lockedAction} onClick={() => setPendingAccessChange({ id: row.userId, name: row.actor, enabled: row.isEnabled })} className="whitespace-nowrap rounded-md border border-slate-200 px-2 py-1.5 text-[9px] font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40">{lockedAction ? t('overviewCurrentAccount') : t('overviewToggleAccess')}</button>}
                          {row.type === 'supplier' && <button type="button" onClick={() => setPendingSupplierChange({ id: row.supplierId, name: row.actor, active: row.active })} className="whitespace-nowrap rounded-md border border-slate-200 px-2 py-1.5 text-[9px] font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800">{t('overviewToggleAccess')}</button>}
                          {row.type === 'order' && !row.isManualPayment && <Link to="/dashboard/admin/finance" className="whitespace-nowrap rounded-md border border-slate-200 px-2 py-1.5 text-[9px] font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800">{t('overviewViewPayment')}</Link>}
                          <button type="button" aria-label={`Export activity record for ${row.ref}`} onClick={() => exportCsv([row])} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"><FileDown className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center"><Clock3 className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-700">{t('overviewNoActivity')}</p><p className="mt-1 text-[10px] text-slate-500">{t('overviewActivityEmptyHint')}</p></div>
        )}
        <Pagination currentPage={activityPage.currentPage} pageCount={activityPage.pageCount} totalItems={activityPage.totalItems} pageSize={activityPage.pageSize} onPageChange={activityPage.setCurrentPage} onPageSizeChange={activityPage.setPageSize} t={t} />
        <footer className="flex flex-col justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 sm:flex-row sm:items-center">
          <p className="text-[9px] text-slate-500">{t('overviewShowingRecent')} {rows.length} {t('overviewActivityEvents')} · {t('overviewAmountsUsd')}</p>
          <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-500"><BadgeCheck className="h-3 w-3 text-emerald-600" />{t('overviewConnectedCore')}</div>
        </footer>
      </section>

      <section id="security" className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,.025)] sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${lockedUsers ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}><ShieldCheck className="h-4 w-4" /></span>
            <div><h2 className="text-sm font-bold text-slate-900">{t('overviewSecurityLog')}</h2><p className="mt-1 text-[10px] text-slate-500">{lockedUsers ? `${lockedUsers} ${t('overviewAccountsLoginLocked')}` : t('overviewSecurityLogDescription')}</p></div>
          </div>
          <Link to="/dashboard/admin/security-log" className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">{t('overviewOpenSecurityLog')}<ShieldCheck className="h-3.5 w-3.5" /></Link>
        </div>
      </section>

      {pendingAccessChange && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="toggle-access-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h2 id="toggle-access-title" className="text-sm font-bold text-slate-900">{pendingAccessChange.enabled ? 'Disable account access?' : 'Enable account access?'}</h2>
            <p className="mt-2 text-xs leading-5 text-slate-600">This changes access for <strong>{pendingAccessChange.name}</strong>. Administrators cannot disable their own account.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingAccessChange(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => toggleUserAccess(pendingAccessChange.id, !pendingAccessChange.enabled)} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">Confirm change</button>
            </div>
          </section>
        </div>
      )}

      {pendingSupplierChange && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="toggle-vendor-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h2 id="toggle-vendor-title" className="text-sm font-bold text-slate-900">{pendingSupplierChange.active ? 'Deactivate this vendor?' : 'Activate this vendor?'}</h2>
            <p className="mt-2 text-xs leading-5 text-slate-600">Change marketplace access for <strong>{pendingSupplierChange.name}</strong>.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingSupplierChange(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => toggleSupplierAccess(pendingSupplierChange.id, !pendingSupplierChange.active)} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">Confirm change</button>
            </div>
          </section>
        </div>
      )}

      {pendingPayment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="verify-payment-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h2 id="verify-payment-title" className="text-sm font-bold text-slate-900">Verify manual payment</h2>
            <p className="mt-2 text-xs leading-5 text-slate-600">Confirm that funds have been received for <strong>{pendingPayment.ref}</strong> ({pendingPayment.amount}). This will mark the payment as paid.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingPayment(null)} disabled={Boolean(confirmingId)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
              <button type="button" onClick={() => confirmPayment(pendingPayment.id)} disabled={Boolean(confirmingId)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
                {confirmingId ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {confirmingId ? 'Recording…' : 'Confirm funds received'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
