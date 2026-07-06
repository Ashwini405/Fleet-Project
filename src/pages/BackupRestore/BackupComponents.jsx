import React from 'react';

// ─── Toggle ───────────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none ${
        checked ? 'bg-indigo-600' : 'bg-slate-200'
      }`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }) {
  const style = {
    Completed: 'bg-green-50 text-green-700 border-green-200',
    Failed:    'bg-red-50   text-red-700   border-red-200',
    Enabled:   'bg-green-50 text-green-700 border-green-200',
    Disabled:  'bg-slate-100 text-slate-500 border-slate-200',
  }[status] || 'bg-slate-100 text-slate-500 border-slate-200';
  const dot = {
    Completed:'bg-green-500', Failed:'bg-red-500', Enabled:'bg-green-500', Disabled:'bg-slate-400',
  }[status] || 'bg-slate-400';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

// ─── TypeBadge ────────────────────────────────────────────────────────────────

export function TypeBadge({ type }) {
  return type === 'Manual'
    ? <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-black text-purple-700 bg-purple-50 border border-purple-200 rounded uppercase tracking-wide">Manual</span>
    : <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded uppercase tracking-wide">Auto</span>;
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

export function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-sm font-black text-slate-800">{title}</p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
