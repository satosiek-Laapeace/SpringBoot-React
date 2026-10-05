import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, pageCount, totalItems, pageSize, onPageChange, onPageSizeChange, t }) => {
  if (totalItems <= 0) return null;
  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);
  const visiblePageCount = Math.min(5, pageCount);
  const firstVisiblePage = Math.max(1, Math.min(currentPage - 2, pageCount - visiblePageCount + 1));
  const visiblePages = Array.from({ length: visiblePageCount }, (_, index) => firstVisiblePage + index);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400">
        <p>{t('paginationShowing')} <span className="font-semibold text-slate-700 dark:text-slate-200">{firstItem}–{lastItem}</span> {t('paginationOf')} <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span></p>
        {onPageSizeChange && <label className="flex items-center gap-1.5">{t('paginationRowsPerPage')}<select aria-label={t('paginationRowsPerPage')} value={pageSize} onChange={event => onPageSizeChange(Number(event.target.value))} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{[6, 12, 24].map(size => <option key={size} value={size}>{size}</option>)}</select></label>}
      </div>
      <nav aria-label={t('paginationLabel')} className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} aria-label={t('paginationPrevious')} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button>
        {visiblePages.map(page => <button key={page} type="button" onClick={() => onPageChange(page)} aria-current={page === currentPage ? 'page' : undefined} className={`h-8 min-w-8 rounded-lg px-2 font-semibold ${page === currentPage ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{page}</button>)}
        <button type="button" onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))} disabled={currentPage >= pageCount} aria-label={t('paginationNext')} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></button>
      </nav>
    </div>
  );
};
