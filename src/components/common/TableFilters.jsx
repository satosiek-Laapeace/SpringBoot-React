import React from 'react';
import { ListFilter, Search } from 'lucide-react';

export const TableFilters = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  searchLabel = 'Search records',
  filters = [],
}) => (
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
    <label className="relative block min-w-0 flex-1 sm:min-w-52">
      <span className="sr-only">{searchLabel}</span>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={searchValue}
        onChange={event => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
      />
    </label>
    {filters.map(filter => (
      <label key={filter.label} className="relative block min-w-36">
        <span className="sr-only">{filter.label}</span>
        <ListFilter aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <select
          value={filter.value}
          onChange={event => filter.onChange(event.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
        >
          {filter.options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
    ))}
  </div>
);
