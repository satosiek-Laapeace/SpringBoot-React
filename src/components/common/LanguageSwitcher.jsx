import React, { useState } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FlagEN, FlagKM } from './FlagIcons';

const LANGUAGES = [
  { code: 'en', label: 'English', Flag: FlagEN },
  { code: 'km', label: 'ខ្មែរ', Flag: FlagKM },
];

export const LanguageSwitcher = ({ compact = false }) => {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const activeLanguage = LANGUAGES.find(item => item.code === language) || LANGUAGES[0];
  const ActiveFlag = activeLanguage.Flag;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label={t('languageSelect')}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(value => !value)}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 ${compact ? 'w-10 px-0' : ''}`}
      >
        {compact && <Languages className="h-4 w-4" />}
        <ActiveFlag className="h-3.5 w-5 rounded-sm ring-1 ring-black/10" />
        {!compact && <><span>{activeLanguage.label}</span><ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} /></>}
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-30 cursor-default" aria-label={t('languageSelect')} onClick={() => setOpen(false)} />
          <div role="listbox" aria-label={t('languageSelect')} className="absolute right-0 top-12 z-40 min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
            {LANGUAGES.map(({ code, label, Flag }) => (
              <button key={code} type="button" role="option" aria-selected={language === code} onClick={() => { setLanguage(code); setOpen(false); }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-emerald-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Flag className="h-3.5 w-5 rounded-sm ring-1 ring-black/10" />
                <span>{label}</span>
                {language === code && <Check className="ml-auto h-3.5 w-3.5 text-emerald-700" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
