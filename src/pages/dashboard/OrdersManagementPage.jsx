import React, { useMemo, useState } from 'react';
import { BadgeCheck, ClipboardList, Clock3, PackageCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/common/TableFilters';

const ORDER_STATUS_SEQUENCE = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const ORDER_STATUSES = ORDER_STATUS_SEQUENCE;

const STATUS_STYLES = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  DELIVERED: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300',
  CANCELLED: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
  PROCESSING: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
  SHIPPED: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
};

const statusPriority = status => {
  const index = ORDER_STATUS_SEQUENCE.indexOf(String(status || 'PENDING').toUpperCase());
  return index === -1 ? ORDER_STATUS_SEQUENCE.length : index;
};

const orderStatus = order => order.status || 'PENDING';
const displayStatus = (status, t) => ({
  PENDING: t('orderPending'),
  CONFIRMED: t('orderConfirmed'),
  PROCESSING: t('orderProcessing'),
  SHIPPED: t('orderShipped'),
  DELIVERED: t('orderDelivered'),
  CANCELLED: t('orderCancelled'),
}[status] || status.replaceAll('_', ' '));

const orderBuyer = (order, t) => order.buyerName || order.buyer_name ||
  (order.buyerId || order.buyer_id ? `${t('ordersBuyer')} #${order.buyerId || order.buyer_id}` : t('ordersBuyer'));

const orderDelivery = (order, t) => {
  const slot = order.deliverySlot || order.delivery_slot;
  if (slot) return slot;
  const deliveryTime = order.deliveryTime || order.delivery_time;
  if (!deliveryTime) return t('ordersNotScheduled');
  const date = new Date(deliveryTime);
  return Number.isNaN(date.getTime()) ? t('ordersNotScheduled') : date.toLocaleString();
};

const orderItemCount = order => (order.items || []).length;

const formatAmount = (amount, language) => amount == null || !Number.isFinite(Number(amount))
  ? '—'
  : new Intl.NumberFormat(language === 'km' ? 'km-KH' : 'en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

export const OrdersManagementPage = () => {
  const { orders, updateOrderStatus, activeRole } = useStore();
  const { language, t } = useLanguage();
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const pendingCount = orders.filter(order => orderStatus(order) === 'PENDING').length;
  const confirmedCount = orders.filter(order => ['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(orderStatus(order))).length;
  const deliveredCount = orders.filter(order => orderStatus(order) === 'DELIVERED').length;
  const editableStatuses = activeRole === 'ADMIN'
    ? ORDER_STATUSES
    : ORDER_STATUSES.filter(status => status !== 'CANCELLED');
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...orders]
      .filter(order => {
        const status = orderStatus(order);
        const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
        const matchesSearch = !query || [order.id, orderBuyer(order, t), orderDelivery(order, t), order.payment?.method, order.paymentMethod, status]
          .some(value => String(value ?? '').toLocaleLowerCase().includes(query));
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => statusPriority(orderStatus(b)) - statusPriority(orderStatus(a)) || Number(b.id ?? 0) - Number(a.id ?? 0));
  }, [orders, search, statusFilter, t]);
  const orderPage = usePagination(filteredOrders);

  const handleStatusChange = async (orderId, status) => {
    setSavingOrderId(orderId);
    setStatusError('');
    const updated = await updateOrderStatus(orderId, status);
    if (!updated) setStatusError(t('ordersStatusUpdateError'));
    setSavingOrderId(null);
  };

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">{t('ordersSection')}</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-slate-900 dark:text-white">{t('sellerOrders')}</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            {t('ordersDescription')}
          </p>
        </div>
      </header>

      <section aria-label={t('ordersSummary')} className="grid gap-3 sm:grid-cols-3">
        {[
          { label: t('ordersTotal'), count: orders.length, Icon: ClipboardList, tone: 'text-slate-700 dark:text-slate-200', iconTone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
          { label: t('orderPending'), count: pendingCount, Icon: Clock3, tone: 'text-amber-700 dark:text-amber-300', iconTone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
          { label: t('ordersInFulfillment'), count: confirmedCount, Icon: PackageCheck, tone: 'text-emerald-700 dark:text-emerald-300', iconTone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
          { label: t('orderDelivered'), count: deliveredCount, Icon: BadgeCheck, tone: 'text-teal-700 dark:text-teal-300', iconTone: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300' },
        ].map(({ label, count, Icon, tone, iconTone }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconTone}`}><Icon className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
              <p className={`mt-0.5 text-xl font-bold ${tone}`}>{count}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('ordersActivity')}</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('ordersRecords').replace('{count}', String(filteredOrders.length))}</p>
          </div>
          <div className="flex items-center gap-3"><TableFilters searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search orders..." searchLabel="Search orders" filters={[{ label: 'Filter orders by status', value: statusFilter, onChange: setStatusFilter, options: [{ value: 'ALL', label: 'All statuses' }, ...ORDER_STATUSES.map(status => ({ value: status, label: displayStatus(status, t) }))] }]} /><BadgeCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" /></div>
        </div>

        {statusError && <p role="alert" className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{statusError}</p>}

        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-3">{t('sellerOrder')}</th>
                  <th scope="col" className="px-5 py-3">{t('sellerBuyer')}</th>
                  <th scope="col" className="px-5 py-3">{t('ordersDelivery')}</th>
                  <th scope="col" className="px-5 py-3">{t('ordersItems')}</th>
                  <th scope="col" className="px-5 py-3">{t('sellerTotal')}</th>
                  <th scope="col" className="px-5 py-3">{t('ordersPayment')}</th>
                  <th scope="col" className="px-5 py-3">{t('sellerStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orderPage.paginatedItems.map(order => {
                  const status = orderStatus(order);
                  const payment = order.payment?.method || order.paymentMethod || t('ordersNotRecorded');
                  const paymentStatus = order.payment?.status || order.paymentStatus;
                  const isSaving = savingOrderId === order.id;
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">#{order.id}</td>
                      <td className="max-w-44 px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{orderBuyer(order, t)}</td>
                      <td className="max-w-48 px-5 py-4 text-xs leading-5 text-slate-500 dark:text-slate-400">{orderDelivery(order, t)}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">{t('ordersItemCount').replace('{count}', String(orderItemCount(order)))}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900 dark:text-white">{formatAmount(order.totalAmount ?? order.total_amount, language)}</td>
                      <td className="px-5 py-4">
                        <span className="block text-xs font-medium text-slate-700 dark:text-slate-200">{payment}</span>
                        <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">{paymentStatus || t('ordersStatusUnavailable')}</span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-md border px-2 py-1 text-[10px] font-bold ${STATUS_STYLES[status] || STATUS_STYLES.PENDING}`}>
                            {displayStatus(status, t)}
                          </span>
                          <select
                            aria-label={`${t('ordersUpdateStatus')} ${order.id}`}
                            value={status}
                            disabled={isSaving}
                            onChange={event => handleStatusChange(order.id, event.target.value)}
                            className="max-w-32 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {!editableStatuses.includes(status) && <option value={status} disabled>{displayStatus(status, t)}</option>}
                            {editableStatuses.map(option => <option key={option} value={option}>{displayStatus(option, t)}</option>)}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{orders.length ? 'No orders match these filters.' : t('ordersEmptyTitle')}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{orders.length ? 'Try changing your search or status.' : t('ordersEmptyDescription')}</p>
          </div>
        )}
        <Pagination currentPage={orderPage.currentPage} pageCount={orderPage.pageCount} totalItems={orderPage.totalItems} pageSize={orderPage.pageSize} onPageChange={orderPage.setCurrentPage} onPageSizeChange={orderPage.setPageSize} t={t} />
      </section>

    </div>
  );
};
