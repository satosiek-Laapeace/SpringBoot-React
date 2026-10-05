import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';

export const PasswordField = ({
  id,
  label,
  name = 'password',
  value,
  onChange,
  autoComplete,
  minLength,
  required = true,
  inputClassName = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const labelText = label || 'Password';

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">{labelText}</label>
      <div className="relative">
        <LockKeyhole aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          name={name}
          type={isVisible ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          value={value}
          onChange={onChange}
          {...props}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-11 text-[15px] text-slate-900 outline-none transition hover:border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10 ${inputClassName}`.trim()}
        />
        <button
          type="button"
          onClick={() => setIsVisible(visible => !visible)}
          aria-label={`${isVisible ? 'Hide' : 'Show'} ${labelText.toLowerCase()}`}
          aria-pressed={isVisible}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
        >
          {isVisible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
