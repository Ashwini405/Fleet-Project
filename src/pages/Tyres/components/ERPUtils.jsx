import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

// ── Shimmer skeleton ──────────────────────────────────────────────────────────
export function Shimmer({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] rounded ${className}`}
      style={{ animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%' }} />
  );
}

export function TableSkeleton({ rows = 6, cols = 7 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'}`}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="py-3.5 px-5">
              <Shimmer className={`h-3 rounded-full ${j === 0 ? 'w-24' : j === cols - 1 ? 'w-16' : 'w-20'}`} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
          <Shimmer className="h-7 w-12 rounded-lg" />
          <Shimmer className="h-2.5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon = Info, title, subtitle, action, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 gap-3 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && onAction && (
        <button onClick={onAction}
          className="mt-1 px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all hover:shadow-md">
          {action}
        </button>
      )}
    </motion.div>
  );
}

// ── Toast system ──────────────────────────────────────────────────────────────
const TOAST_STYLES = {
  success: { bg: 'bg-emerald-600', icon: CheckCircle },
  warning: { bg: 'bg-amber-500',   icon: AlertTriangle },
  error:   { bg: 'bg-red-600',     icon: XCircle },
  info:    { bg: 'bg-blue-600',    icon: Info },
};

export function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {Array.isArray(toasts) && toasts.map(t => {
          const cfg = TOAST_STYLES[t.type] || TOAST_STYLES.success;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0,  scale: 1    }}
              exit={{    opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-bold text-white min-w-[260px] max-w-xs ${cfg.bg}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-[13px]">{t.msg}</span>
              <button onClick={() => onDismiss(t.id)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ── useToast hook ─────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = React.useState([]);

  const push = React.useCallback((msg, type = 'success', duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { id, msg, type }]);
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = React.useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return { toasts, push, dismiss };
}

// ── Tread bar ─────────────────────────────────────────────────────────────────
export function TreadBar({ pct }) {
  const safePct = Number(pct || 0);
  const color = safePct <= 20
    ? 'bg-red-500'
    : safePct <= 50
      ? 'bg-amber-500'
      : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(safePct, 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className={`text-[10px] font-bold tabular-nums ${safePct <= 20 ? 'text-red-600' : safePct <= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
        {safePct}%
      </span>
    </div>
  );
}

// ── Health badge ──────────────────────────────────────────────────────────────
const HEALTH_STYLE = {
  Good:     { pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  Medium:   { pill: 'bg-amber-50   text-amber-700   ring-1 ring-amber-200',   dot: 'bg-amber-400'   },
  Critical: { pill: 'bg-red-50     text-red-700     ring-1 ring-red-200',     dot: 'bg-red-500 animate-pulse' },
  Poor:     { pill: 'bg-red-50     text-red-700     ring-1 ring-red-200',     dot: 'bg-red-500 animate-pulse' },
};

export function HealthBadge({ health }) {
  const normalizedHealth = String(health || 'Good').trim().toLowerCase();
  const healthKey =
    normalizedHealth === 'good' ? 'Good'
    : normalizedHealth === 'medium' ? 'Medium'
    : normalizedHealth === 'poor' ? 'Poor'
    : normalizedHealth === 'critical' ? 'Critical'
    : 'Good';
  const h = HEALTH_STYLE[healthKey] || HEALTH_STYLE.Good;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${h.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${h.dot}`} />{healthKey}
    </span>
  );
}

// ── Sticky table header wrapper ───────────────────────────────────────────────
export function StickyTable({ children, minWidth = '900px' }) {
  return (
    <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full text-left border-collapse" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function StickyThead({ children }) {
  return (
    <thead className="sticky top-0 z-10">
      {children}
    </thead>
  );
}

// ── Default export for convenience ────────────────────────────────────────────
export default {
  Shimmer,
  TableSkeleton,
  CardSkeleton,
  EmptyState,
  Toast,
  useToast,
  TreadBar,
  HealthBadge,
  StickyTable,
  StickyThead,
};