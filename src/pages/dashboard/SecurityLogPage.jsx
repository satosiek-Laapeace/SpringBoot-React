import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Download,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchSecurityLogsPageAPI } from '../../features/auth/services/authApi';
import { useLanguage } from '../../context/LanguageContext';

const eventLabel = (eventType, t) => {
  const key = `securityEvent${String(eventType || 'UNKNOWN').split('_').map(part => part[0] + part.slice(1).toLowerCase()).join('')}`;
  const translated = t(key);
  return translated === key ? String(eventType || 'UNKNOWN').replaceAll('_', ' ') : translated;
};
const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
const eventColors = ['#047857', '#0284c7', '#d97706', '#e11d48', '#7c3aed', '#64748b'];
const outcomeColors = ['#059669', '#f59e0b', '#e11d48'];

const StatCard = ({ label, value, detail, icon: Icon, tone }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
      </div>
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
    </div>
  </article>
);

const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5 ${className}`}>
    <div className="mb-4">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
    {children}
  </section>
);

const ChartTooltip = ({ active, payload, label, t }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-slate-700">{label}</p>
      {payload.map(item => (
        <p key={item.dataKey} className="mt-1 text-xs text-slate-600">
          <span className="font-bold" style={{ color: item.color }}>{item.value}</span> {item.name || t('securityEvents')}
        </p>
      ))}
    </div>
  );
};

export const SecurityLogPage = () => {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async (isRefresh = false) => {
    setError('');
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await fetchSecurityLogsPageAPI({ page, size: 50, sort: 'createdAt,desc' });
      if (!Array.isArray(result?.content)) throw new Error(t('securityInvalidResponse'));
      setEntries(result.content);
      setTotalPages(Number(result.totalPages) || 0);
      setTotalElements(Number(result.totalElements) || 0);
    } catch (requestError) {
      setError(requestError.message || t('securityLoadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [language, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const analytics = useMemo(() => {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() - 23);
    const hourly = Array.from({ length: 24 }, (_, index) => {
      const time = new Date(start);
      time.setHours(start.getHours() + index);
      return { time, label: time.toLocaleTimeString([], { hour: 'numeric' }), events: 0 };
    });
    const eventCounts = new Map();
    const routeCounts = new Map();
    const actors = new Set();
    let actions = 0;
    let failed = 0;
    let successful = 0;

    entries.forEach(entry => {
      const type = eventLabel(entry.eventType, t);
      eventCounts.set(type, (eventCounts.get(type) || 0) + 1);
      if (String(entry.eventType).includes('ACTION')) actions += 1;
      if (Number(entry.responseStatus) >= 400) failed += 1;
      else successful += 1;
      const actor = entry.actorId ?? entry.actorUsername;
      if (actor !== null && actor !== undefined && actor !== '') actors.add(String(actor));
      const route = `${entry.httpMethod || '—'} ${entry.requestPath || t('securityUnknownRoute')}`;
      routeCounts.set(route, (routeCounts.get(route) || 0) + 1);

      const eventDate = entry.createdAt ? new Date(entry.createdAt) : null;
      if (eventDate && !Number.isNaN(eventDate.getTime())) {
        const bucket = Math.floor((eventDate.getTime() - start.getTime()) / 3_600_000);
        if (bucket >= 0 && bucket < hourly.length) hourly[bucket].events += 1;
      }
    });

    const eventTypes = [...eventCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    const outcomes = [
      { name: t('securitySuccessful'), value: successful },
      { name: t('securityClientErrors'), value: entries.filter(entry => Number(entry.responseStatus) >= 400 && Number(entry.responseStatus) < 500).length },
      { name: t('securityServerErrors'), value: entries.filter(entry => Number(entry.responseStatus) >= 500).length },
    ].filter(item => item.value > 0);
    const topRoutes = [...routeCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { hourly, eventTypes, outcomes, topRoutes, actors: actors.size, actions, failed };
  }, [entries, language]);

  const exportLogs = () => {
    const columns = ['timestamp', 'eventType', 'actorUsername', 'actorId', 'actorRole', 'httpMethod', 'requestPath', 'responseStatus', 'clientIp', 'authenticationType'];
    const content = [
      columns.join(','),
      ...entries.map(entry => columns.map(column => csvCell(column === 'timestamp' ? entry.createdAt : entry[column])).join(',')),
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `farmcraft-security-log-page-${page + 1}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{t('securitySection')}</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-slate-900">{t('securityOverview')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            {t('securityDescription')}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => loadLogs(true)} disabled={refreshing || loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />{t('securityRefresh')}
          </button>
          <button type="button" onClick={exportLogs} disabled={!entries.length} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-3.5 w-3.5" />{t('securityExportCsv')}
          </button>
        </div>
      </header>

      <section className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-950">
        <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{t('securityPrivacyNotice')}</p>
      </section>

      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><span>{error}</span><button type="button" onClick={() => loadLogs()} className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-rose-100">{t('securityRetry')}</button></div>}

      <section aria-label={t('securityActivitySummary')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('securityEventsLoaded')} value={loading ? '—' : entries.length} detail={t('securityLatestRecords')} icon={Activity} tone="bg-emerald-50 text-emerald-700" />
        <StatCard label={t('securityAdminActions')} value={loading ? '—' : analytics.actions} detail={t('securityWriteManagement')} icon={ShieldCheck} tone="bg-amber-50 text-amber-700" />
        <StatCard label={t('securityFailedRequests')} value={loading ? '—' : analytics.failed} detail={t('securityResponses400')} icon={AlertTriangle} tone="bg-rose-50 text-rose-700" />
        <StatCard label={t('securityUniqueActors')} value={loading ? '—' : analytics.actors} detail={t('securityDistinctUsers')} icon={Users} tone="bg-sky-50 text-sky-700" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div><h2 className="text-sm font-bold text-slate-900">{t('securityRecentEvents')}</h2><p className="mt-1 text-xs text-slate-500">{t('securityPageDescription')}</p></div>
          <span className="text-xs font-medium text-slate-500">{t('securityPage')} {totalPages ? page + 1 : 0} / {totalPages}</span>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">{t('securityLoading')}</div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">{error ? t('securityLoadError') : t('securityNoEventData')}</div>
          ) : (
            <div className="space-y-3">
              {entries.map(entry => {
                const status = Number(entry.responseStatus);
                return (
                  <article key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{eventLabel(entry.eventType, t)}</span>
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 font-mono text-[10px] text-slate-600">{entry.httpMethod || '—'}</span>
                          <span className="font-mono text-[10px] text-slate-500">{entry.createdAt ? new Date(entry.createdAt).toLocaleString(language === 'km' ? 'km-KH' : 'en-US') : '—'}</span>
                        </div>
                        <p className="mt-2 truncate font-mono text-xs text-slate-600" title={entry.requestPath || '—'}>{entry.requestPath || '—'}</p>
                      </div>

                      <div className="flex items-center gap-2 md:justify-end">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status >= 500 ? 'bg-rose-100 text-rose-700' : status >= 400 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {status || '—'}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">{entry.clientIp || '—'}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
                      <span>{entry.actorUsername || entry.actorId || '—'}{entry.actorRole ? <span className="ml-1 text-slate-400">({entry.actorRole})</span> : null}</span>
                      <span>{entry.responseStatus ? `${t('securityStatus')} ${entry.responseStatus}` : t('securityNoStatus')}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 sm:px-5">
          <span className="text-xs text-slate-500">{totalElements.toLocaleString()} {t('securityEvents')}</span>
          <div className="flex gap-2">
            <button type="button" aria-label={t('securityPrevious')} onClick={() => setPage(value => Math.max(0, value - 1))} disabled={page === 0 || loading} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <RefreshCw className="h-4 w-4 rotate-180" />
            </button>
            <button type="button" aria-label={t('securityNext')} onClick={() => setPage(value => Math.min(totalPages - 1, value + 1))} disabled={page >= totalPages - 1 || loading} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section aria-label={t('securityEventCharts')} className="grid gap-4 xl:grid-cols-3">
        <ChartCard title={t('securityActivityOverTime')} subtitle={t('securityHourlyEvents')} className="xl:col-span-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.hourly} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="securityActivityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.015} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 5" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 10 }} interval={3} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip content={<ChartTooltip t={t} />} labelFormatter={(_, payload) => payload?.[0]?.payload?.time?.toLocaleString(language === 'km' ? 'km-KH' : 'en-US', { month: 'short', day: 'numeric', hour: 'numeric' }) || ''} />
                <Area type="monotone" dataKey="events" name={t('securityEvents')} stroke="#047857" strokeWidth={2.5} fill="url(#securityActivityFill)" activeDot={{ r: 5, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title={t('securityRequestOutcomes')} subtitle={t('securityResponseStatus')}>
          {analytics.outcomes.length ? (
            <div className="grid h-64 grid-cols-[minmax(0,1fr)_112px] items-center gap-1">
              <div className="h-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.outcomes} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3} stroke="white" strokeWidth={3}>
                      {analytics.outcomes.map((item, index) => <Cell key={item.name} fill={outcomeColors[index]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip t={t} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {analytics.outcomes.map((item, index) => (
                  <div key={item.name}>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: outcomeColors[index] }} />{item.name}</div>
                    <p className="ml-3.5 mt-0.5 text-sm font-bold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="grid h-64 place-items-center text-xs text-slate-400">{t('securityNoResponseData')}</p>}
        </ChartCard>

        <ChartCard title={t('securityEventCategories')} subtitle={t('securityCommonEvents')} className="xl:col-span-2">
          {analytics.eventTypes.length ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.eventTypes} layout="vertical" margin={{ top: 2, right: 12, left: 12, bottom: 2 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 5" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={132} tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                  <Tooltip content={<ChartTooltip t={t} />} />
                  <Bar dataKey="value" name={t('securityEvents')} radius={[0, 6, 6, 0]} barSize={20}>
                    {analytics.eventTypes.map((item, index) => <Cell key={item.name} fill={eventColors[index % eventColors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="grid h-64 place-items-center text-xs text-slate-400">{t('securityNoEventData')}</p>}
        </ChartCard>

        <ChartCard title={t('securityTopRoutes')} subtitle={t('securityTopRoutesDescription')}>
          {analytics.topRoutes.length ? (
            <div className="space-y-4 py-1">
              {analytics.topRoutes.map((route, index) => {
                const percent = Math.max(8, Math.round((route.value / analytics.topRoutes[0].value) * 100));
                return (
                  <div key={route.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <p title={route.name} className="truncate font-mono text-[10px] text-slate-600">{route.name}</p>
                      <span className="shrink-0 text-xs font-bold text-slate-800">{route.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: eventColors[index] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="grid h-64 place-items-center text-xs text-slate-400">{t('securityNoRouteData')}</p>}
        </ChartCard>
      </section>

    </main>
  );
};
