import React, { useState, useRef, useEffect } from 'react';
import {
  Eye, Key, Lock, Unlock, Mail, Trash2,
  MoreVertical, LogIn, CheckCircle2, XCircle, Shield,
  Users,
} from 'lucide-react';

// ─── Section Label ────────────────────────────────────────────────────────────

export function SectionLabel({ title, sub }) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h2>
      {sub && <p className="text-[11px] text-slate-300 font-medium mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }) {
  const cfg = {
    Active:   { cls: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500'  },
    Disabled: { cls: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-500'    },
    Locked:   { cls: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500'  },
  }[status] ?? { cls: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

export function RoleBadge({ role }) {
  const colors = {
    'Administrator':          'bg-purple-50 text-purple-700 border-purple-200',
    'Finance Manager':        'bg-blue-50 text-blue-700 border-blue-200',
    'Operations Manager':     'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Maintenance Supervisor': 'bg-amber-50 text-amber-700 border-amber-200',
    'HR Manager':             'bg-pink-50 text-pink-700 border-pink-200',
    'Viewer':                 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${colors[role] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {role}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

export function KpiCard({ label, value, icon: Icon, iconBg, valueColor = 'text-slate-800', sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 leading-tight">{label}</p>
        <p className={`text-2xl font-black leading-tight ${valueColor}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Action Menu ──────────────────────────────────────────────────────────────

export function ActionMenu({ user, onView, onToggleStatus, onDelete, onResetPwd }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const actions = [
    { icon: Eye,   label: 'View Details',       onClick: () => { onView();       setOpen(false); } },
    { icon: Key,   label: 'Reset Password',      onClick: () => { onResetPwd();  setOpen(false); } },
    user.status === 'Active'
      ? { icon: Lock,   label: 'Disable Login',  onClick: () => { onToggleStatus('Disabled'); setOpen(false); } }
      : { icon: Unlock, label: 'Enable Login',   onClick: () => { onToggleStatus('Active');   setOpen(false); } },
    { icon: Mail,  label: 'Send Welcome Email',  onClick: () => setOpen(false) },
    { icon: Trash2,label: 'Delete User',         onClick: () => { onDelete(); setOpen(false); }, danger: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1 overflow-hidden">
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition-colors text-left ${
                a.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <a.icon className="w-3.5 h-3.5 shrink-0" />
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}