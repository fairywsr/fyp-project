import React, { useId } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  required = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-200 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-400 ml-1 font-bold">*</span>}
          </span>
        </label>
      )}
      <input
        id={inputId}
        required={required}
        className={`w-full bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all duration-150 disabled:opacity-50 disabled:bg-slate-950 disabled:cursor-not-allowed shadow-inner shadow-black/20 ${
          error ? 'border-rose-500/80 bg-rose-950/10 focus:border-rose-500 focus:ring-rose-500/25' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-300 flex items-center gap-1 font-medium mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-xs text-slate-400 mt-0.5">{helperText}</span>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  options = [],
  className = '',
  id,
  children,
  required = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-200 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-400 ml-1 font-bold">*</span>}
          </span>
        </label>
      )}
      <div className="relative w-full">
        <select
          id={inputId}
          required={required}
          className={`w-full appearance-none bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-lg pl-3.5 pr-10 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all duration-150 cursor-pointer shadow-inner shadow-black/20 ${
            error ? 'border-rose-500/80 bg-rose-950/10 focus:border-rose-500 focus:ring-rose-500/25' : ''
          } ${className}`}
          {...props}
        >
          {children ||
            options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 py-1">
                {opt.label}
              </option>
            ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && (
        <span className="text-xs text-rose-300 flex items-center gap-1 font-medium mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          {error}
        </span>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  rows = 4,
  className = '',
  id,
  required = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-200 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-400 ml-1 font-bold">*</span>}
          </span>
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        className={`w-full bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all duration-150 resize-y shadow-inner shadow-black/20 leading-relaxed ${
          error ? 'border-rose-500/80 bg-rose-950/10 focus:border-rose-500 focus:ring-rose-500/25' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-300 flex items-center gap-1 font-medium mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          {error}
        </span>
      )}
    </div>
  );
}
