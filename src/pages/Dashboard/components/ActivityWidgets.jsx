import React, { useState } from 'react';
import {
  Bell, ShieldAlert, FileText, Wrench, ClipboardCheck, Battery,
  CreditCard, AlertTriangle, ChevronRight,
  Navigation, Droplet, Users, ShoppingCart, CheckCircle2, Truck,
} from 'lucide-react';

// ── Notifications Panel ───────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  critical: { dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700 border-red-200',    label: 'Critical' },
  high:     { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200', label: 'High'  },
  medium:   { dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Medium'},
  low:      { dot: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-700 border-blue-200',  label: 'Low'  },
};

const TYPE_ICON = {
  'Insurance Expiry':               ShieldAlert,
  'Permit Expiry':                  FileText,
  'Fitness Due':                    ClipboardCheck,
  'Service Due':                    Wrench,
  'Inspection Due':                 ClipboardCheck,
  'Battery Warranty Expiry':        Battery,
  'Driver Settlement Approval':     CreditCard,
};

export function NotificationsPanel({ data }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? data : data.filter(n => n.severity === filter);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
          <Bell className="w-4 h-4 text-red-500" />
        </div>
        <h3 className="font-black text-slate-800 text-sm">Alerts & Notifications</h3>
        <span className="ml-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
          {data.filter(n => n.severity === 'critical' || n.severity === 'high').length}
        </span>
        <div className="ml-auto flex gap-1">
          {['all', 'critical', 'high', 'medium', 'low'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-colors capitalize ${filter === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-50 overflow-auto max-h-80">
        {filtered.map(n => {
          const cfg  = SEVERITY_CONFIG[n.severity];
          const Icon = TYPE_ICON[n.type] || AlertTriangle;
          return (
            <div key={n.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{n.type}</p>
                <p className="text-[11px] text-slate-500 truncate">{n.vehicle}{n.daysLeft !== null ? ` · ${n.daysLeft} days left` : ''}</p>
              </div>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.badge}`}>{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Recent Activities ─────────────────────────────────────────────────────────
const ACTIVITY_ICONS = {
  trip:       Navigation,
  service:    Wrench,
  fuel:       Droplet,
  settlement: Users,
  po:         ShoppingCart,
  inspection: ClipboardCheck,
  payment:    CreditCard,
  tyre:       Truck,
  driver:     Users,
};

export function RecentActivitiesWidget({ data }) {
  const [show, setShow] = useState(6);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="font-black text-slate-800 text-sm">Recent Activities</h3>
        <span className="ml-auto text-[11px] text-slate-400 font-medium">All modules</span>
      </div>
      <div className="divide-y divide-slate-50">
        {data.slice(0, show).map(a => {
          const Icon = ACTIVITY_ICONS[a.icon] || CheckCircle2;
          return (
            <div key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${a.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">{a.action}</p>
                <p className="text-[11px] text-slate-500 truncate">{a.detail}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium flex-shrink-0 pt-0.5">{a.time}</span>
            </div>
          );
        })}
      </div>
      {show < data.length && (
        <button
          onClick={() => setShow(data.length)}
          className="w-full py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1 border-t border-slate-100"
        >
          Show all {data.length} activities <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
