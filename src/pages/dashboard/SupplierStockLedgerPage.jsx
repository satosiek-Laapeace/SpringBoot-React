import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  Filter,
  Leaf,
  MapPin,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  X,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  activateSupplierAPI,
  createStockMovementAPI,
  createSupplierAPI,
  deactivateSupplierAPI,
  fetchStockMovementsAPI,
  updateSupplierAPI,
} from '../../features/inventory/services/inventoryApi';

const PAGE_SIZE = 6;
const LEDGER_PAGE_SIZE = 6;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getDateKey = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

const getSupplierActive = (supplier) => Boolean(supplier.is_active ?? supplier.isActive ?? supplier.active);
const getSupplierLocation = (supplier) => supplier.location ?? supplier.region ?? supplier.address ?? 'Location not provided';
const getSupplierVerification = (supplier) =>
  supplier.verificationStatus ?? supplier.verification_status ?? supplier.verification ?? 'Not provided';
const getMovementType = (movement) => String(movement.type ?? '').toUpperCase();
const getMovementDate = (movement) => {
  const value = movement.createdAt ?? movement.created_at;
  return value ? new Date(value) : new Date(Number.NaN);
};
const getMovementProductId = (movement) => movement.productId ?? movement.product_id;
const getMovementSupplierId = (movement) => movement.supplierId ?? movement.supplier_id;
const getMovementChange = (movement) => Number(movement.quantityChange ?? movement.quantity_change ?? 0);
const getMovementAfter = (movement) => Number(movement.quantityAfter ?? movement.quantity_after ?? 0);
const getProductUnit = (product) => product?.unit ?? product?.stockUnit ?? 'units';

const formatTimestamp = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Timestamp unavailable';
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const formatQuantity = (value) => new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value);

const verificationStyle = (status) => {
  const normalized = String(status).toLowerCase();
  if (normalized.includes('verif') || normalized.includes('approved')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  if (normalized.includes('pending') || normalized.includes('review')) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }
  return 'border-slate-200 bg-slate-50 text-slate-600';
};

const isRestock = (type) => type.includes('RESTOCK') || type === 'IN';
const isDeduction = (type) => type.includes('SALE') || type.includes('DEDUCTION') || type === 'OUT';

const getMovementUnit = (movement, products) => {
  const product = products.find((item) => String(item.id) === String(getMovementProductId(movement)));
  return getProductUnit(product);
};

const buildMovementPage = (page, productById, supplierById) => {
  if (Array.isArray(page)) return page;
  if (!Array.isArray(page?.content)) return [];

  return page.content.map((movement) => {
    const productId = getMovementProductId(movement);
    const supplierId = getMovementSupplierId(movement);
    const product = productById.get(String(productId));
    const supplier = supplierById.get(String(supplierId));
    return {
      ...movement,
      productName: movement.productName ?? movement.product_name ?? product?.name ?? `Product #${productId ?? '—'}`,
      supplierName: movement.supplierName ?? movement.supplier_name ?? supplier?.name ?? '—',
    };
  });
};

const buildChartData = (movements) => {
  const latest = movements.reduce((latestDate, movement) => {
    const date = getMovementDate(movement);
    return !Number.isNaN(date.getTime()) && date > latestDate ? date : latestDate;
  }, new Date());
  const end = new Date(latest);
  end.setHours(0, 0, 0, 0);
  const start = new Date(end.getTime() - 6 * DAY_IN_MS);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start.getTime() + index * DAY_IN_MS);
    return {
      date,
      key: getDateKey(date),
      label: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date),
      incoming: 0,
      outgoing: 0,
    };
  });
  const dayByKey = new Map(days.map((day) => [day.key, day]));

  movements.forEach((movement) => {
    const date = getMovementDate(movement);
    if (Number.isNaN(date.getTime())) return;
    const day = dayByKey.get(getDateKey(date));
    const quantity = Math.abs(getMovementChange(movement));
    if (!day || !Number.isFinite(quantity)) return;
    const type = getMovementType(movement);
    if (isRestock(type)) day.incoming += quantity;
    if (isDeduction(type)) day.outgoing += quantity;
  });

  return days;
};

const getVerificationIcon = (status) => {
  const normalized = String(status).toLowerCase();
  return normalized.includes('verif') || normalized.includes('approved') ? BadgeCheck : CircleAlert;
};

export const SupplierStockLedgerPage = ({ view = 'suppliers' }) => {
  const { t } = useLanguage();
  const isStockView = view === 'stock';
  const { suppliers: storeSuppliers, stockMovements: storeMovements, products } = useStore();
  const hasApiSession = Boolean(localStorage.getItem('token'));
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierStatus, setSupplierStatus] = useState('all');
  const [supplierPage, setSupplierPage] = useState(1);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerType, setLedgerType] = useState('all');
  const [ledgerPage, setLedgerPage] = useState(1);
  const [supplierOverrides, setSupplierOverrides] = useState({});
  const [pendingSupplierIds, setPendingSupplierIds] = useState([]);
  const [actionError, setActionError] = useState('');
  const [demoModeNotice, setDemoModeNotice] = useState(false);
  const [liveMovements, setLiveMovements] = useState(null);
  const [ledgerLoadError, setLedgerLoadError] = useState('');
  const [supplierOverridesById, setSupplierOverridesById] = useState({});
  const [createdSuppliers, setCreatedSuppliers] = useState([]);
  const [supplierFormOpen, setSupplierFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '', description: '' });
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [movementFormOpen, setMovementFormOpen] = useState(false);
  const [movementForm, setMovementForm] = useState({ productId: '', type: 'RESTOCK', quantityChange: '', supplierId: '', note: '' });
  const [savingMovement, setSavingMovement] = useState(false);
  const [ledgerRevision, setLedgerRevision] = useState(0);

  useEffect(() => {
    if (!hasApiSession || !isStockView) return undefined;

    let isCurrent = true;
    const fetchAllMovementPages = async () => {
      const firstPage = await fetchStockMovementsAPI({ page: 0, size: 100 });
      if (Array.isArray(firstPage)) return firstPage;
      if (!Array.isArray(firstPage?.content)) {
        throw new Error('The stock movement API returned an unsupported response.');
      }
      const totalPages = Number(firstPage.totalPages ?? 1);
      if (!Number.isFinite(totalPages) || totalPages <= 1) return firstPage;
      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          fetchStockMovementsAPI({ page: index + 1, size: 100 })
        )
      );
      if (remainingPages.some((page) => !Array.isArray(page?.content))) {
        throw new Error('The stock movement API returned an incomplete page.');
      }
      return {
        ...firstPage,
        content: [
          ...firstPage.content,
          ...remainingPages.flatMap((page) => Array.isArray(page?.content) ? page.content : []),
        ],
      };
    };

    fetchAllMovementPages()
      .then((response) => {
        if (!Array.isArray(response) && !Array.isArray(response?.content)) {
          throw new Error('The stock movement API returned an unsupported response.');
        }
        if (isCurrent) setLiveMovements(response);
      })
      .catch((error) => {
        if (isCurrent) setLedgerLoadError(`Could not load the live stock ledger. Showing available local records instead. ${error.message}`);
      });

    return () => {
      isCurrent = false;
    };
  }, [hasApiSession, isStockView, ledgerRevision]);

  const suppliers = useMemo(
    () => [...createdSuppliers, ...storeSuppliers].map((original) => {
      const supplier = supplierOverridesById[original.id] ?? original;
      return ({
      ...supplier,
      is_active: supplierOverrides[supplier.id] ?? getSupplierActive(supplier),
      });
    }),
    [storeSuppliers, supplierOverrides, supplierOverridesById, createdSuppliers]
  );

  const productsById = useMemo(
    () => new Map(products.map((product) => [String(product.id), product])),
    [products]
  );

  const supplierById = useMemo(
    () => new Map(suppliers.map((supplier) => [String(supplier.id), supplier])),
    [suppliers]
  );

  const movements = useMemo(() => {
    const flattened = buildMovementPage(liveMovements ?? storeMovements, productsById, supplierById);
    return flattened
      .map((movement) => {
        const productId = getMovementProductId(movement);
        const supplierId = getMovementSupplierId(movement);
        const product = productsById.get(String(productId));
        const supplier = supplierById.get(String(supplierId));
        return {
          ...movement,
          productName: movement.productName ?? movement.product_name ?? product?.name ?? `Product #${productId ?? '—'}`,
          supplierName: movement.supplierName ?? movement.supplier_name ?? supplier?.name ?? '—',
        };
      })
      .sort((left, right) => getMovementDate(right) - getMovementDate(left));
  }, [liveMovements, storeMovements, productsById, supplierById]);

  const supplierProductCounts = useMemo(() => {
    const counts = new Map();
    products.forEach((product) => {
      const supplierId = product.supplierId ?? product.supplier_id;
      if (supplierId == null) return;
      const productIds = counts.get(String(supplierId)) ?? new Set();
      productIds.add(String(product.id));
      counts.set(String(supplierId), productIds);
    });
    movements.forEach((movement) => {
      const supplierId = getMovementSupplierId(movement);
      const productId = getMovementProductId(movement);
      if (supplierId == null || productId == null) return;
      const productIds = counts.get(String(supplierId)) ?? new Set();
      productIds.add(String(productId));
      counts.set(String(supplierId), productIds);
    });
    return counts;
  }, [movements, products]);

  const filteredSuppliers = useMemo(() => suppliers.filter((supplier) => {
    const search = supplierSearch.trim().toLowerCase();
    const matchesSearch = !search || [
      supplier.name,
      getSupplierLocation(supplier),
      supplier.contact_person,
      supplier.contactPerson,
      supplier.id,
    ].some((value) => String(value ?? '').toLowerCase().includes(search));
    const matchesStatus = supplierStatus === 'all'
      || (supplierStatus === 'active' ? supplier.is_active : !supplier.is_active);
    return matchesSearch && matchesStatus;
  }), [suppliers, supplierSearch, supplierStatus]);

  const filteredMovements = useMemo(() => movements.filter((movement) => {
    const search = ledgerSearch.trim().toLowerCase();
    const type = getMovementType(movement);
    const matchesSearch = !search || [
      movement.productName,
      movement.product_name,
      movement.supplierName,
      movement.supplier_name,
      getMovementSupplierId(movement),
      movement.id,
      movement.note,
    ].some((value) => String(value ?? '').toLowerCase().includes(search));
    const matchesType = ledgerType === 'all'
      || (ledgerType === 'restock' ? isRestock(type) : isDeduction(type));
    return matchesSearch && matchesType;
  }), [movements, ledgerSearch, ledgerType]);

  const supplierPageCount = Math.max(1, Math.ceil(filteredSuppliers.length / PAGE_SIZE));
  const ledgerPageCount = Math.max(1, Math.ceil(filteredMovements.length / LEDGER_PAGE_SIZE));
  const visibleSuppliers = filteredSuppliers.slice((supplierPage - 1) * PAGE_SIZE, supplierPage * PAGE_SIZE);
  const visibleMovements = filteredMovements.slice(
    (ledgerPage - 1) * LEDGER_PAGE_SIZE,
    ledgerPage * LEDGER_PAGE_SIZE
  );
  const activeSupplierCount = suppliers.filter((supplier) => supplier.is_active).length;
  const kilogramMovements = useMemo(
    () => movements.filter((movement) => getMovementUnit(movement, products).toLowerCase() === 'kg'),
    [movements, products]
  );
  const chartData = useMemo(() => buildChartData(kilogramMovements), [kilogramMovements]);
  const restockVolume = kilogramMovements.reduce((total, movement) =>
    total + (isRestock(getMovementType(movement)) ? Math.abs(getMovementChange(movement)) : 0), 0);
  const deductionVolume = kilogramMovements.reduce((total, movement) =>
    total + (isDeduction(getMovementType(movement)) ? Math.abs(getMovementChange(movement)) : 0), 0);
  const lastMovement = movements[0];

  const toggleSupplier = async (supplier) => {
    const supplierId = supplier.id;
    setActionError('');
    setPendingSupplierIds((current) => [...current, supplierId]);

    try {
      if (hasApiSession) {
        if (supplier.is_active) await deactivateSupplierAPI(supplierId);
        else await activateSupplierAPI(supplierId);
      } else {
        setDemoModeNotice(true);
      }
      setSupplierOverrides((current) => ({ ...current, [supplierId]: !supplier.is_active }));
      setSupplierPage(1);
    } catch (error) {
      setActionError(`Could not ${supplier.is_active ? 'deactivate' : 'activate'} ${supplier.name}: ${error.message}`);
    } finally {
      setPendingSupplierIds((current) => current.filter((id) => id !== supplierId));
    }
  };

  const openSupplierForm = (supplier = null) => {
    setActionError('');
    setEditingSupplier(supplier);
    setSupplierFormOpen(true);
    setSupplierForm(supplier ? {
      name: supplier.name ?? '',
      contactPerson: supplier.contactPerson ?? supplier.contact_person ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      address: supplier.address ?? supplier.location ?? '',
      description: supplier.description ?? '',
    } : { name: '', contactPerson: '', email: '', phone: '', address: '', description: '' });
  };

  const saveSupplier = async (event) => {
    event.preventDefault();
    if (!hasApiSession) {
      setActionError('Sign in as an administrator to create or update suppliers.');
      return;
    }
    setSavingSupplier(true);
    setActionError('');
    try {
      const payload = {
        ...supplierForm,
        name: supplierForm.name.trim(),
        email: supplierForm.email.trim(),
      };
      const saved = editingSupplier
        ? await updateSupplierAPI(editingSupplier.id, payload)
        : await createSupplierAPI(payload);
      const normalized = {
        ...saved,
        id: saved?.id ?? saved?.supplierId ?? editingSupplier?.id,
        name: saved?.name ?? payload.name,
        contactPerson: saved?.contactPerson ?? payload.contactPerson,
        email: saved?.email ?? payload.email,
        phone: saved?.phone ?? payload.phone,
        address: saved?.address ?? payload.address,
        is_active: saved?.active ?? saved?.is_active ?? editingSupplier?.is_active ?? true,
      };
      if (editingSupplier) {
        setSupplierOverridesById((current) => ({ ...current, [editingSupplier.id]: { ...editingSupplier, ...normalized } }));
      } else {
        setCreatedSuppliers((current) => [normalized, ...current]);
      }
      setSupplierFormOpen(false);
      setEditingSupplier(null);
    } catch (error) {
      setActionError(`Could not save supplier: ${error.message}`);
    } finally {
      setSavingSupplier(false);
    }
  };

  const saveStockMovement = async (event) => {
    event.preventDefault();
    const quantityChange = Number(movementForm.quantityChange);
    if (!Number.isInteger(quantityChange) || quantityChange === 0 ||
      (['RESTOCK', 'RETURN'].includes(movementForm.type) && quantityChange < 0) ||
      (movementForm.type === 'DAMAGED' && quantityChange > 0)) {
      setActionError('Enter a non-zero whole number. Restocks and returns must be positive, damaged stock must be negative, and adjustments may use either sign.');
      return;
    }
    setSavingMovement(true);
    setActionError('');
    try {
      await createStockMovementAPI({
        productId: Number(movementForm.productId),
        type: movementForm.type,
        quantityChange,
        supplierId: movementForm.supplierId ? Number(movementForm.supplierId) : null,
        note: movementForm.note.trim() || null,
      });
      setMovementFormOpen(false);
      setMovementForm({ productId: '', type: 'RESTOCK', quantityChange: '', supplierId: '', note: '' });
      setLedgerRevision((revision) => revision + 1);
    } catch (error) {
      setActionError(`Could not record stock movement: ${error.message}`);
    } finally {
      setSavingMovement(false);
    }
  };

  const exportLedger = () => {
    const columns = ['Timestamp', 'Product', 'Supplier ID', 'Type', 'Quantity Change', 'Quantity After'];
    const rows = filteredMovements.map((movement) => [
      formatTimestamp(movement.createdAt ?? movement.created_at),
      movement.productName,
      getMovementSupplierId(movement) ?? '',
      getMovementType(movement),
      getMovementChange(movement),
      getMovementAfter(movement),
    ]);
    const csv = [columns, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'farmcraft-stock-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-[linear-gradient(115deg,#f0f8f2_0%,#ffffff_72%)] p-5 sm:p-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
            {isStockView ? <Activity className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
            {isStockView ? t('inventoryControl') : t('supplierOperations')}
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {isStockView ? t('inventoryTitle') : t('supplierDirectory')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {isStockView
              ? t('inventoryDescription')
              : t('supplierDescription')}
          </p>
        </div>
        {isStockView && (
          <button
            type="button"
            onClick={exportLedger}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800 xl:self-auto"
          >
            <Download className="h-4 w-4" />
            {t('inventoryExportLedger')}
          </button>
        )}
      </header>

      {actionError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {actionError}
        </div>
      )}
      {(!hasApiSession || demoModeNotice) && (
        <div role="status" className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          {isStockView
            ? t('inventoryPreviewMode')
            : t('supplierPreviewMode')}
        </div>
      )}
      {isStockView && ledgerLoadError && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {ledgerLoadError}
        </div>
      )}

      {!isStockView && (
        <section aria-label={t('supplierSummary')} className="grid gap-3 sm:grid-cols-3">
          {[
            { label: t('supplierTotal'), value: suppliers.length, Icon: Truck, color: 'bg-emerald-50 text-emerald-700' },
            { label: t('statusActive'), value: activeSupplierCount, Icon: BadgeCheck, color: 'bg-teal-50 text-teal-700' },
            { label: t('statusInactive'), value: suppliers.length - activeSupplierCount, Icon: CircleAlert, color: 'bg-slate-100 text-slate-600' },
          ].map(({ label, value, Icon, color }) => (
            <article key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}><Icon className="h-4 w-4" /></span>
              <span><span className="block text-xs font-medium text-slate-500">{label}</span><span className="mt-0.5 block text-lg font-bold text-slate-900">{value}</span></span>
            </article>
          ))}
        </section>
      )}

      {isStockView && <section aria-label="Stock overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('inventoryRegisteredSuppliers'), value: suppliers.length, detail: `${activeSupplierCount} ${t('inventoryActiveVendors')}`, Icon: Truck, color: 'text-emerald-700 bg-emerald-50' },
          { label: t('inventoryIncomingStock'), value: `${formatQuantity(restockVolume)} kg`, detail: t('inventoryRestockKg'), Icon: ArrowDownRight, color: 'text-emerald-700 bg-emerald-50' },
          { label: t('inventoryOutgoingStock'), value: `${formatQuantity(deductionVolume)} kg`, detail: t('inventoryDeductionKg'), Icon: ArrowUpRight, color: 'text-orange-700 bg-orange-50' },
          { label: t('inventoryLatestMovement'), value: lastMovement ? formatTimestamp(getMovementDate(lastMovement)) : t('inventoryNoActivity'), detail: lastMovement?.productName ?? t('inventoryWaitingActivity'), Icon: Clock3, color: 'text-slate-700 bg-slate-100' },
        ].map(({ label, value, detail, Icon, color }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{detail}</p>
              </div>
              <span className={`rounded-xl p-2 ${color}`}><Icon className="h-4 w-4" /></span>
            </div>
          </article>
        ))}
      </section>}

      {isStockView && <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
              <Activity className="h-4 w-4" />
              {t('inventoryAnalytics')}
            </div>
            <h2 className="mt-1 font-serif text-xl font-bold text-slate-900">{t('inventoryDailyMovement')}</h2>
            <p className="mt-1 text-xs text-slate-500">{t('inventoryChartDescription')}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />{t('inventoryIncomingRestocks')}</span>
            <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-orange-500" />{t('inventoryOutgoingDeductions')}</span>
          </div>
        </div>
        <div className="h-64 w-full sm:h-72" role="img" aria-label="Bar chart of daily restocks and line chart of daily deductions">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="#edf1ed" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#7c887e', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#7c887e', fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: '#f5f8f5' }}
                contentStyle={{ border: '1px solid #e2e8e2', borderRadius: 12, fontSize: 12 }}
                formatter={(value, name) => [`${formatQuantity(value)} kg`, name === 'incoming' ? 'Restocks' : 'Deductions']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.date
                  ? formatTimestamp(payload[0].payload.date).split(',')[0]
                  : label}
              />
              <Bar dataKey="incoming" name="incoming" fill="#18845b" radius={[5, 5, 0, 0]} maxBarSize={28} />
              <Line dataKey="outgoing" name="outgoing" type="monotone" stroke="#f07a3d" strokeWidth={2.5} dot={{ r: 3, fill: '#f07a3d', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>}

      {!isStockView && <section id="suppliers" className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              {t('supplierDirectory')}
            </div>
            <h2 className="mt-1 font-serif text-xl font-bold text-slate-900">{t('supplierVendors')}</h2>
            <p className="mt-1 text-xs text-slate-500">{t('supplierDescription')}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => openSupplierForm()} disabled={!hasApiSession} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" />{t('addSupplier')}</button>
            <label className="relative">
              <span className="sr-only">{t('searchSuppliers')}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={supplierSearch}
                onChange={(event) => { setSupplierSearch(event.target.value); setSupplierPage(1); }}
                placeholder={t('supplierSearchPlaceholder')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white sm:w-64"
              />
            </label>
            <label className="relative">
              <span className="sr-only">{t('supplierFilterStatus')}</span>
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={supplierStatus}
                onChange={(event) => { setSupplierStatus(event.target.value); setSupplierPage(1); }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm outline-none transition focus:border-emerald-400 focus:bg-white sm:w-40"
              >
                <option value="all">{t('supplierAll')}</option>
                <option value="active">{t('statusActive')}</option>
                <option value="inactive">{t('statusInactive')}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3">{t('supplierName')}</th>
                <th className="px-4 py-3">{t('supplierLocation')}</th>
                <th className="px-4 py-3">{t('supplierVerification')}</th>
                <th className="px-4 py-3">{t('supplierProductsListed')}</th>
                <th className="px-4 py-3">{t('colStatusSupplier')}</th>
                <th className="px-5 py-3 text-right">{t('supplierAccess')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleSuppliers.map((supplier) => {
                const verification = getSupplierVerification(supplier);
                const verificationLabel = String(verification).trim().toUpperCase().replaceAll('_', ' ') === 'NOT PROVIDED'
                  ? t('supplierNotProvided')
                  : verification;
                const location = getSupplierLocation(supplier);
                const VerificationIcon = getVerificationIcon(verification);
                const pending = pendingSupplierIds.includes(supplier.id);
                const productCount = supplierProductCounts.get(String(supplier.id))?.size ?? 0;
                return (
                  <tr key={supplier.id} className="text-sm transition hover:bg-[#fbfdfb]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf5eb] text-emerald-800"><Leaf className="h-5 w-5" /></span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{supplier.name}</p>
                          <p className="text-xs text-slate-500">{t('supplierNumber').replace('{id}', supplier.id)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{location === 'Location not provided' ? t('supplierLocationMissing') : location}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${verificationStyle(verification)}`}>
                        <VerificationIcon className="h-3.5 w-3.5" />
                        {verificationLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700"><Package className="h-3.5 w-3.5 text-slate-400" />{t('supplierSkuCount').replace('{count}', productCount)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${supplier.is_active ? 'text-emerald-700' : 'text-slate-500'}`}>
                        <span className={`h-2 w-2 rounded-full ${supplier.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {supplier.is_active ? t('statusActive') : t('statusInactive')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                      <button type="button" onClick={() => openSupplierForm(supplier)} aria-label={`${t('btnEdit')} ${supplier.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:text-emerald-800"><Pencil className="h-4 w-4" /></button>
                      <button
                        type="button"
                        onClick={() => toggleSupplier(supplier)}
                        disabled={pending}
                        aria-label={`${supplier.is_active ? t('supplierDeactivate') : t('supplierActivate')} ${supplier.name}`}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                          supplier.is_active
                            ? 'border border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-emerald-700 text-white hover:bg-emerald-800'
                        }`}
                      >
                        {pending ? t('adminSaving') : supplier.is_active ? t('supplierDeactivate') : t('supplierActivate')}
                      </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visibleSuppliers.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">{t('supplierNoMatches')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={supplierPage}
          pageCount={supplierPageCount}
          itemCount={filteredSuppliers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setSupplierPage}
        />
      </section>}

      {isStockView && <section id="ledger" className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
              <Clock3 className="h-4 w-4" />
              {t('inventoryLiveAudit')}
            </div>
            <h2 className="mt-1 font-serif text-xl font-bold text-slate-900">{t('stockMovementLog')}</h2>
            <p className="mt-1 text-xs text-slate-500">{t('inventoryNewestFirst')} · stock_movement_tbl</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => { setActionError(''); setMovementForm(current => ({ ...current, productId: current.productId || String(products[0]?.id ?? '') })); setMovementFormOpen(true); }} disabled={!products.length || !hasApiSession} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" />{t('recordMovement')}</button>
            <label className="relative">
              <span className="sr-only">{t('inventorySearchLedger')}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={ledgerSearch}
                onChange={(event) => { setLedgerSearch(event.target.value); setLedgerPage(1); }}
                placeholder={t('inventorySearchPlaceholder')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white sm:w-64"
              />
            </label>
            <label className="relative">
              <span className="sr-only">{t('inventoryFilterType')}</span>
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={ledgerType}
                onChange={(event) => { setLedgerType(event.target.value); setLedgerPage(1); }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm outline-none transition focus:border-emerald-400 focus:bg-white sm:w-44"
              >
                <option value="all">{t('inventoryAllMovements')}</option>
                <option value="restock">{t('typeRestock')}</option>
                <option value="deduction">{t('inventoryDeductions')}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5 text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3">{t('colDate')}</th>
                <th className="px-4 py-3">{t('colProduct')}</th>
                <th className="px-4 py-3">{t('inventorySupplierId')}</th>
                <th className="px-4 py-3">{t('colType')}</th>
                <th className="px-4 py-3">{t('colChange')}</th>
                <th className="px-5 py-3 text-right">{t('colStockAfter')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleMovements.map((movement) => {
                const type = getMovementType(movement);
                const change = getMovementChange(movement);
                const unit = getMovementUnit(movement, products);
                const incoming = isRestock(type);
                const deduction = isDeduction(type);
                return (
                  <tr key={movement.id} className="text-sm transition hover:bg-[#fbfdfb]">
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="font-medium text-slate-800">{formatTimestamp(movement.createdAt ?? movement.created_at)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{movement.productName}</p>
                      <p className="text-xs text-slate-500">SKU {getMovementProductId(movement) ?? '—'}</p>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-600">{getMovementSupplierId(movement) ?? '—'}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${incoming ? 'bg-emerald-50 text-emerald-700' : deduction ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        {incoming ? 'RESTOCK' : deduction ? 'DEDUCTION' : type || 'ADJUSTMENT'}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap px-4 py-4 font-bold ${change >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {change > 0 ? '+' : ''}{formatQuantity(change)} {unit}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-800">
                      {formatQuantity(getMovementAfter(movement))} {unit}
                    </td>
                  </tr>
                );
              })}
              {visibleMovements.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">{t('inventoryNoMatches')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={ledgerPage}
          pageCount={ledgerPageCount}
          itemCount={filteredMovements.length}
          pageSize={LEDGER_PAGE_SIZE}
          onPageChange={setLedgerPage}
        />
      </section>}
      {!isStockView && supplierFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="supplier-form-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <header className="flex items-center justify-between"><div><h2 id="supplier-form-title" className="text-sm font-bold text-slate-900">{editingSupplier ? t('supplierUpdate') : t('supplierCreate')}</h2><p className="mt-1 text-[10px] text-slate-500">{t('supplierAdminOnly')}</p></div><button type="button" onClick={() => setSupplierFormOpen(false)} aria-label={t('adminCloseForm')} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></header>
            <form onSubmit={saveSupplier} className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-[11px] font-semibold text-slate-700">{t('supplierName')}<input required maxLength={255} value={supplierForm.name} onChange={event => setSupplierForm(current => ({ ...current, name: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500" /></label>
              <label className="text-[11px] font-semibold text-slate-700">{t('colContactPerson')}<input maxLength={255} value={supplierForm.contactPerson} onChange={event => setSupplierForm(current => ({ ...current, contactPerson: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500" /></label>
              <label className="text-[11px] font-semibold text-slate-700">{t('colEmail')}<input required type="email" maxLength={255} value={supplierForm.email} onChange={event => setSupplierForm(current => ({ ...current, email: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500" /></label>
              <label className="text-[11px] font-semibold text-slate-700">{t('colPhone')}<input type="tel" inputMode="numeric" autoComplete="tel" pattern="\+?[0-9]{7,15}" maxLength={16} value={supplierForm.phone} onChange={event => { const phone = event.target.value.replace(/[^0-9+]/g, '').replace(/(?!^)[+]/g, '').slice(0, 16); setSupplierForm(current => ({ ...current, phone })); }} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500" /></label>
              <label className="text-[11px] font-semibold text-slate-700 sm:col-span-2">{t('supplierAddress')}<input maxLength={255} value={supplierForm.address} onChange={event => setSupplierForm(current => ({ ...current, address: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500" /></label>
              <label className="text-[11px] font-semibold text-slate-700 sm:col-span-2">{t('adminCategoryDescription')}<textarea maxLength={1000} rows={3} value={supplierForm.description} onChange={event => setSupplierForm(current => ({ ...current, description: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500" /></label>
              <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setSupplierFormOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">{t('adminCancel')}</button><button type="submit" disabled={savingSupplier} className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{savingSupplier ? t('adminSaving') : t('supplierSave')}</button></div>
            </form>
          </section>
        </div>
      )}
      {isStockView && movementFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="movement-form-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <header className="flex items-center justify-between"><div><h2 id="movement-form-title" className="text-sm font-bold text-slate-900">{t('inventoryRecordMovement')}</h2><p className="mt-1 text-[10px] text-slate-500">{t('inventoryMovementPermissions')}</p></div><button type="button" onClick={() => setMovementFormOpen(false)} aria-label={t('adminCloseForm')} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></header>
            <form onSubmit={saveStockMovement} className="mt-4 space-y-3">
              <label className="block text-[11px] font-semibold text-slate-700">{t('inventoryProduct')}<select required value={movementForm.productId} onChange={event => setMovementForm(current => ({ ...current, productId: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500">{products.map(product => <option key={product.id} value={product.id}>{product.name} · #{product.id}</option>)}</select></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-[11px] font-semibold text-slate-700">{t('inventoryMovementType')}<select value={movementForm.type} onChange={event => setMovementForm(current => ({ ...current, type: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500"><option value="RESTOCK">{t('typeRestock')}</option><option value="ADJUSTMENT">{t('typeAdjustment')}</option><option value="RETURN">{t('inventoryReturn')}</option><option value="DAMAGED">{t('inventoryDamaged')}</option></select></label>
                <label className="block text-[11px] font-semibold text-slate-700">{t('inventoryQuantityChange')}<input required type="number" step="1" value={movementForm.quantityChange} onChange={event => setMovementForm(current => ({ ...current, quantityChange: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500" /><span className="mt-1 block text-[9px] font-normal text-slate-500">{t('inventoryNegativeQuantityHint')}</span></label>
              </div>
              <label className="block text-[11px] font-semibold text-slate-700">{t('inventorySupplierOptional')}<select value={movementForm.supplierId} onChange={event => setMovementForm(current => ({ ...current, supplierId: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500"><option value="">{t('inventoryNoSupplier')}</option>{suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name} · #{supplier.id}</option>)}</select></label>
              <label className="block text-[11px] font-semibold text-slate-700">{t('inventoryNote')}<input maxLength={500} value={movementForm.note} onChange={event => setMovementForm(current => ({ ...current, note: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-500" /></label>
              {actionError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{actionError}</p>}
              <div className="flex justify-end gap-2 pt-1"><button type="button" onClick={() => setMovementFormOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">{t('adminCancel')}</button><button type="submit" disabled={savingMovement} className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{savingMovement ? t('inventoryRecording') : t('recordMovement')}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

const Pagination = ({ currentPage, pageCount, itemCount, pageSize, onPageChange }) => {
  const { t } = useLanguage();
  const firstItem = itemCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, itemCount);
  const visiblePageCount = Math.min(pageCount, 5);
  const firstVisiblePage = Math.max(1, Math.min(currentPage - 2, pageCount - visiblePageCount + 1));
  const visiblePages = Array.from({ length: visiblePageCount }, (_, index) => firstVisiblePage + index);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>{t('paginationShowing')} <span className="font-semibold text-slate-700">{firstItem}–{lastItem}</span> {t('paginationOf')} <span className="font-semibold text-slate-700">{itemCount}</span></p>
      <nav aria-label={t('paginationLabel')} className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label={t('paginationPrevious')}
          className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {firstVisiblePage > 1 && <span className="px-1 text-slate-400">…</span>}
        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`h-8 min-w-8 rounded-lg px-2 font-semibold transition ${page === currentPage ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {page}
          </button>
        ))}
        {firstVisiblePage + visiblePageCount - 1 < pageCount && <span className="px-1 text-slate-400">…</span>}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
          disabled={currentPage >= pageCount}
          aria-label={t('paginationNext')}
          className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};
