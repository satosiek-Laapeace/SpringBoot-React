import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileImage,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { fetchOrderPaymentsAPI, markOrderPaidAPI } from '../../features/checkout/services/checkoutApi';
import { fetchOrdersAPI } from '../../features/orders/services/orderApi';
import { fetchUserAPI } from '../../features/user-profile/services/profileApi';
import { useLanguage } from '../../context/LanguageContext';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/common/TableFilters';

const METHOD_META = {
  CARD: { labelKey: 'financeCard', color: '#578b6c', Icon: CreditCard },
  BANK_TRANSFER: { labelKey: 'financeBankTransfer', color: '#d4a24c', Icon: ArrowDownLeft },
  CASH_ON_DELIVERY: { labelKey: 'financeCashOnDelivery', color: '#7895ae', Icon: Banknote },
};

const currency = value => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
}).format(Number(value) || 0);

const asArray = value => Array.isArray(value) ? value : [];
const read = (value, ...keys) => keys.map(key => value?.[key]).find(item => item !== undefined && item !== null && item !== '');
const orderKey = order => String(read(order, 'id', 'orderId', 'order_id') ?? '');
const buyerKey = order => read(order, 'buyerId', 'buyer_id');
const paymentMethod = payment => String(read(payment, 'method', 'paymentMethod', 'payment_method') ?? '').toUpperCase();
const paymentStatus = payment => String(read(payment, 'status', 'paymentStatus', 'payment_status') ?? '').toUpperCase();

const dateKey = date => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
};

const getInitials = value => String(value || 'Buyer')
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map(part => part[0]?.toUpperCase() || '')
  .join('');

const loadFinancialRecords = async () => {
  const orders = asArray(await fetchOrdersAPI());
  const paymentsByOrder = await Promise.all(orders.map(async order => {
    const payments = asArray(await fetchOrderPaymentsAPI(orderKey(order)));
    return [orderKey(order), payments];
  }));
  const buyerIds = [...new Set(orders.map(buyerKey).filter(id => id !== undefined && id !== null))];
  const buyers = await Promise.all(buyerIds.map(async id => {
    try {
      return [String(id), await fetchUserAPI(id)];
    } catch {
      return [String(id), null];
    }
  }));

  const paymentsMap = new Map(paymentsByOrder);
  const buyersMap = new Map(buyers);
  return orders.flatMap(order => {
    const id = orderKey(order);
    const latestPayment = asArray(paymentsMap.get(id))[0];
    if (!latestPayment) return [];
    const buyerId = buyerKey(order);
    const buyer = buyerId == null ? null : buyersMap.get(String(buyerId));
    return [{
      order,
      payment: latestPayment,
      buyer,
      id,
      method: paymentMethod(latestPayment),
      status: paymentStatus(latestPayment),
    }];
  });
};

const formatDay = (date, language) => new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', { weekday: 'short' }).format(date);

const buildPayoutTimeline = (records, language) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return { key: dateKey(date), day: formatDay(date, language), amount: 0 };
  });
  const daysByKey = new Map(days.map(day => [day.key, day]));

  records.forEach(({ order, payment, status }) => {
    if (status !== 'PAID') return;
    const key = dateKey(read(payment, 'paidAt', 'paid_at') || read(order, 'createdAt', 'created_at'));
    const day = daysByKey.get(key);
    if (day) day.amount += Number(read(payment, 'amount') ?? read(order, 'totalAmount', 'total_amount') ?? 0);
  });

  return days.map(day => ({ ...day, amount: Math.round(day.amount * 100) / 100 }));
};

const chartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#e4e9e1] bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-[#738174]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#244333]">{currency(payload[0].value)}</p>
    </div>
  );
};

export const FinancialOperationsPage = () => {
  const { language, t } = useLanguage();
  const message = (key, values = {}) => Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, value), t(key),
  );
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const [queueSearch, setQueueSearch] = useState('');
  const [queueMethod, setQueueMethod] = useState('ALL');

  const refresh = useCallback(async (showLoader = true) => {
    if (showLoader) setRefreshing(true);
    setLoadError('');
    try {
      setRecords(await loadFinancialRecords());
    } catch (error) {
      setLoadError(error.message || t('financeLoadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [language]);

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  const paymentMix = useMemo(() => Object.entries(METHOD_META).map(([method, meta]) => ({
    method,
    name: t(meta.labelKey),
    value: records.filter(record => record.method === method).length,
    color: meta.color,
  })), [records, language]);

  const pendingQueue = useMemo(() => records
    .filter(record => record.status === 'PENDING' && ['BANK_TRANSFER', 'CASH_ON_DELIVERY'].includes(record.method))
    .sort((left, right) => new Date(read(right.order, 'createdAt', 'created_at') || 0) - new Date(read(left.order, 'createdAt', 'created_at') || 0)),
  [records]);
  const filteredPendingQueue = useMemo(() => {
    const query = queueSearch.trim().toLocaleLowerCase();
    return pendingQueue.filter(record => {
      const matchesMethod = queueMethod === 'ALL' || record.method === queueMethod;
      const buyer = read(record.buyer, 'fullName', 'full_name', 'name') || read(record.order, 'buyerName', 'buyer_name') || '';
      const reference = read(record.payment, 'transactionId', 'transaction_id') || '';
      const matchesSearch = !query || [record.id, buyer, read(record.buyer, 'email'), reference, record.method]
        .some(value => String(value ?? '').toLocaleLowerCase().includes(query));
      return matchesMethod && matchesSearch;
    });
  }, [pendingQueue, queueSearch, queueMethod]);
  const pendingPage = usePagination(filteredPendingQueue);

  const payoutTimeline = useMemo(() => buildPayoutTimeline(records, language), [records, language]);
  const paymentTotal = paymentMix.reduce((sum, item) => sum + item.value, 0);
  const pendingAmount = pendingQueue.reduce((sum, record) =>
    sum + Number(read(record.order, 'totalAmount', 'total_amount') ?? read(record.payment, 'amount') ?? 0), 0);
  const paidPayoutValue = payoutTimeline.reduce((sum, day) => sum + day.amount, 0);
  const bankTransferCount = paymentMix.find(item => item.method === 'BANK_TRANSFER')?.value || 0;
  const codCount = paymentMix.find(item => item.method === 'CASH_ON_DELIVERY')?.value || 0;

  const confirmPayment = async record => {
    setConfirmingOrderId(record.id);
    setActionError('');
    setSuccessMessage('');
    try {
      await markOrderPaidAPI(record.id);
      setRecords(current => current.map(item => item.id === record.id
        ? { ...item, status: 'PAID', payment: { ...item.payment, status: 'PAID', paidAt: new Date().toISOString() } }
        : item));
      setSuccessMessage(message('financePaymentConfirmed', { id: record.id }));
    } catch (error) {
      setActionError(error.message || message('financePaymentFailed', { id: record.id }));
    } finally {
      setConfirmingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm font-semibold text-[#526b58]" role="status">
        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> {t('financeLoading')}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 text-[#26372c]">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#6e816f]">{t('financeEyebrow')}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#1d392a]">{t('financeTitle')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#718075]">{t('financeDescription')}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfe8df] bg-white px-3 py-2 text-[11px] font-semibold text-[#536a58]">
            <LockKeyhole className="h-3.5 w-3.5" /> {t('financeAdminSession')}
          </span>
          <button type="button" onClick={() => refresh()} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg bg-[#244b35] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#193b29] disabled:cursor-wait disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> {t('financeRefresh')}
          </button>
        </div>
      </header>

      {loadError && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{loadError}</span>
        </div>
      )}
      {actionError && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{actionError}</span>
        </div>
      )}
      {successMessage && (
        <div role="status" aria-live="polite" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> <span>{successMessage}</span>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={t('financeOverview')}>
        {[
          { label: t('financeAwaiting'), value: pendingQueue.length, detail: t('financeManualActions'), Icon: Clock3, tone: 'text-[#98702f]', iconBg: 'bg-[#f7f0df]' },
          { label: t('financeUnderReview'), value: currency(pendingAmount), detail: t('financeBankAndCash'), Icon: WalletCards, tone: 'text-[#244b35]', iconBg: 'bg-[#e9f1e9]' },
          { label: t('financeBankTransfers'), value: bankTransferCount, detail: t('financeRecordedOrders'), Icon: ArrowDownLeft, tone: 'text-[#9a712e]', iconBg: 'bg-[#f8f1e2]' },
          { label: t('financeCashDelivery'), value: codCount, detail: t('financeRecordedOrders'), Icon: Banknote, tone: 'text-[#557890]', iconBg: 'bg-[#eaf1f5]' },
        ].map(({ label, value, detail, Icon, tone, iconBg }) => (
          <article key={label} className="rounded-2xl border border-[#e5eae2] bg-white p-4 shadow-[0_3px_12px_rgba(28,50,33,.035)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#798579]">{label}</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-[#24382a]">{value}</p>
                <p className="mt-1 text-[11px] text-[#8a948b]">{detail}</p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${tone}`}><Icon className="h-5 w-5" /></span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]" aria-label={t('financeMix')}>
        <article className="rounded-2xl border border-[#e5eae2] bg-white p-5 shadow-[0_3px_12px_rgba(28,50,33,.035)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#829083]">{t('financeMix')}</p>
              <h2 className="mt-1 font-serif text-xl font-bold text-[#263a2d]">{t('financeMethodsUsed')}</h2>
            </div>
            <span className="rounded-lg bg-[#f3f6f1] px-2.5 py-1.5 text-[10px] font-bold text-[#647563]">{paymentTotal} {t('financeOrders')}</span>
          </div>
          {paymentTotal ? (
            <div className="mt-2 grid items-center gap-4 sm:grid-cols-[1fr_1fr]">
              <div className="relative h-52 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMix.filter(item => item.value > 0)} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={4} stroke="none">
                      {paymentMix.filter(item => item.value > 0).map(item => <Cell key={item.method} fill={item.color} />)}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} ${t('financeOrders')}`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#263a2d]">{paymentTotal}</span>
                  <span className="text-[10px] font-medium text-[#8a968b]">{t('financePayments')}</span>
                </div>
              </div>
              <div className="space-y-3">
                {paymentMix.map(item => (
                  <div key={item.method} className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-[#617064]">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="text-xs font-bold text-[#334638]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-52 items-center justify-center text-center text-xs text-[#879287]">{t('financeNoPaymentMethods')}</div>
          )}
        </article>

        <article className="rounded-2xl border border-[#e5eae2] bg-white p-5 shadow-[0_3px_12px_rgba(28,50,33,.035)]">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#829083]">{t('financeSettlementVisibility')}</p>
              <h2 className="mt-1 font-serif text-xl font-bold text-[#263a2d]">{t('financePaidOrderTotals')}</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 self-start rounded-lg bg-[#edf3ea] px-2.5 py-1.5 text-[10px] font-bold text-[#4d7451]">
              <ArrowUpRight className="h-3.5 w-3.5" /> {currency(paidPayoutValue)} {t('financePaidOrders')}
            </span>
          </div>
          <div className="mt-5 h-48 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payoutTimeline} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="payoutFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5c8b68" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#5c8b68" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#edf0eb" strokeDasharray="3 4" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#929c92', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#929c92', fontSize: 10 }} tickFormatter={value => `$${value}`} />
                <Tooltip content={chartTooltip} />
                <Area type="monotone" dataKey="amount" name={t('financePaidOrders')} stroke="#4d7b58" strokeWidth={2.5} fill="url(#payoutFill)" activeDot={{ r: 4, fill: '#4d7b58', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-4 text-[#879287]">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            {t('financePayoutNote')}
          </p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e5eae2] bg-white shadow-[0_3px_12px_rgba(28,50,33,.035)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[#edf0eb] px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-[#263a2d]">{t('financeReviewQueue')}</h2>
              <span className="rounded-full bg-[#f8f1e2] px-2 py-0.5 text-[10px] font-bold text-[#97702f]">{filteredPendingQueue.length} / {pendingQueue.length} {t('financePending')}</span>
            </div>
            <p className="mt-1 text-xs text-[#7f8a7f]">{t('financeReviewHint')}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[#dfe8df] bg-[#f8faf7] px-2.5 py-1.5 text-[10px] font-semibold text-[#5e7461]">
            <ShieldCheck className="h-3.5 w-3.5" /> {t('financeAdminAuthorized')}
          </div>
        </div>

        <div className="border-b border-[#edf0eb] px-5 py-3"><TableFilters searchValue={queueSearch} onSearchChange={setQueueSearch} searchPlaceholder="Search pending payments..." searchLabel="Search pending payments" filters={[{ label: 'Filter by payment method', value: queueMethod, onChange: setQueueMethod, options: [{ value: 'ALL', label: 'All methods' }, ...['BANK_TRANSFER', 'CASH_ON_DELIVERY'].map(method => ({ value: method, label: t(METHOD_META[method].labelKey) }))] }]} /></div>
        {filteredPendingQueue.length ? (
          <div className="divide-y divide-[#edf0eb]">
            {pendingPage.paginatedItems.map(record => {
              const buyerName = read(record.buyer, 'fullName', 'full_name', 'name') ||
                read(record.order, 'buyerName', 'buyer_name') ||
                (buyerKey(record.order) != null ? `${t('financeBuyer')} #${buyerKey(record.order)}` : t('financeUnknownBuyer'));
              const buyerEmail = read(record.buyer, 'email') || '';
              const avatar = read(record.buyer, 'profilePictureUrl', 'profile_picture_url');
              const method = METHOD_META[record.method];
              const MethodIcon = method?.Icon || WalletCards;
              const amount = read(record.order, 'totalAmount', 'total_amount') ?? read(record.payment, 'amount');
              const reference = read(record.payment, 'transactionId', 'transaction_id');
              const isConfirming = confirmingOrderId === record.id;

              return (
                <article key={record.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_.9fr_1fr_auto] lg:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eaf1e9] text-xs font-bold text-[#496a4e]">
                      {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : getInitials(buyerName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-bold text-[#376044]">{t('financeOrder')} #{record.id}</p>
                      <p className="mt-1 truncate text-sm font-semibold text-[#304235]">{buyerName}</p>
                      {buyerEmail && <p className="truncate text-[11px] text-[#849084]">{buyerEmail}</p>}
                    </div>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8eadf] bg-[#fafaf6] px-2.5 py-1.5 text-[11px] font-semibold text-[#6c684f]">
                      <MethodIcon className="h-3.5 w-3.5" /> {method ? t(method.labelKey) : record.method.replaceAll('_', ' ')}
                    </span>
                    <p className="mt-2 text-[10px] text-[#8a948b]">
                      <Clock3 className="mr-1 inline h-3 w-3" />
                      {read(record.order, 'createdAt', 'created_at') ? new Date(read(record.order, 'createdAt', 'created_at')).toLocaleString(language === 'km' ? 'km-KH' : 'en-US') : t('financeDateUnavailable')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-start">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a948b]">{t('financeOrderTotal')}</p>
                      <p className="mt-1 text-lg font-bold tracking-tight text-[#263a2d]">{currency(amount)}</p>
                    </div>
                    <div className="flex min-w-36 items-center gap-2 rounded-xl border border-dashed border-[#dbe3d8] bg-[#f8faf7] px-3 py-2">
                      <FileImage className="h-4 w-4 shrink-0 text-[#91a091]" />
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-semibold text-[#647464]">{reference ? `${t('financeReference')}: ${reference}` : t('financeReceiptMissing')}</p>
                        <p className="text-[9px] text-[#929b92]">{t('financeReceiptPreviewUnavailable')}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => confirmPayment(record)}
                    disabled={Boolean(confirmingOrderId)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2e754b] px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#2e754b]/15 transition hover:bg-[#245f3c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2e754b] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isConfirming ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {isConfirming ? t('financeRecording') : t('financeConfirmReceipt')}
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4ed] text-[#54815a]"><CheckCircle2 className="h-6 w-6" /></span>
            <h3 className="mt-3 text-sm font-bold text-[#34483a]">{t('financeQueueClear')}</h3>
            <p className="mt-1 text-xs text-[#849084]">{t('financeNoPending')}</p>
          </div>
        )}
        <Pagination currentPage={pendingPage.currentPage} pageCount={pendingPage.pageCount} totalItems={pendingPage.totalItems} pageSize={pendingPage.pageSize} onPageChange={pendingPage.setCurrentPage} onPageSizeChange={pendingPage.setPageSize} t={t} />
      </section>

      <p className="flex items-start gap-2 px-1 text-[10px] leading-4 text-[#879287]">
        <LockKeyhole className="mt-0.5 h-3 w-3 shrink-0" />
        {t('financeSecurityNote')}
      </p>
    </div>
  );
};
