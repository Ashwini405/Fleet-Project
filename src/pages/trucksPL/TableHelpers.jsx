import React from 'react';

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  Excellent:   { dot: '🟢', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Good:        { dot: '🔵', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  Average:     { dot: '🟠', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200'  },
  'Low Margin':{ dot: '🟡', bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200'  },
  Loss:        { dot: '🔴', bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200'     },
};

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP['Average'];
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black
        border ${s.bg} ${s.text} ${s.border} whitespace-nowrap
      `}
    >
      <span>{s.dot}</span>
      <span>{status}</span>
    </span>
  );
}

// ── Sort Icon ─────────────────────────────────────────────────────────────────
export function SortIcon({ column, sortKey, sortDir }) {
  if (sortKey !== column) {
    return <span className="ml-1 text-slate-300 text-[10px]">↕</span>;
  }
  return (
    <span className="ml-1 text-indigo-500 text-[10px]">
      {sortDir === 'asc' ? '↑' : '↓'}
    </span>
  );
}

// ── Sort Handler ──────────────────────────────────────────────────────────────
export function nextSort(currentKey, currentDir, newKey) {
  if (currentKey !== newKey) return { sortKey: newKey, sortDir: 'desc' };
  if (currentDir === 'desc')  return { sortKey: newKey, sortDir: 'asc'  };
  return { sortKey: null, sortDir: null };
}

export function applySorting(data, sortKey, sortDir) {
  if (!sortKey) return data;
  return [...data].sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });
}

// ── Format Helpers ────────────────────────────────────────────────────────────
export const INR = (n) => '₹' + Number(n).toLocaleString('en-IN');

export function formatDate(date) {
  const d    = new Date(date);
  const day  = String(d.getDate()).padStart(2, '0');
  const mon  = d.toLocaleString('en-IN', { month: 'short' });
  const yr   = d.getFullYear();
  const hr12 = d.getHours() % 12 || 12;
  const mn   = String(d.getMinutes()).padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
  return { date: `${day} ${mon} ${yr}`, time: `${String(hr12).padStart(2,'0')}:${mn} ${ampm}` };
}
