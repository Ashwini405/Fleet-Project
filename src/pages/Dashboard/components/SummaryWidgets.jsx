import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Wrench, Eye, Zap, Droplet, Users, Receipt,
  AlertTriangle, Package, ShoppingCart, CheckCircle2,
  Navigation, PauseCircle, ClipboardCheck,
  TrendingUp, TrendingDown,
} from 'lucide-react';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN');

// ── Fleet Status ──────────────────────────────────────────────────────────────
export function FleetStatusWidget({ data }) {
  const navigate = useNavigate();
  const cards = [
    { label: 'Running',          value: data.running,          icon: Navigation,     bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', path: '/trips'      },
    { label: 'Idle',             value: data.idle,             icon: PauseCircle,    bg: 'bg-slate-50',  text: 'text-slate-500',  border: 'border-slate-200',  path: '/vehicles'   },
    { label: 'Under Service',    value: data.underService,     icon: Wrench,         bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100',  path: '/service'    },
    { label: 'Due for Inspection',value: data.dueForInspection,icon: ClipboardCheck, bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-100',    path: '/inspection' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Truck className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="font-black text-slate-800 text-sm">Fleet Status</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to navigate</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(c => (
          <button
            key={c.label}
            onClick={() => navigate(c.path)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border ${c.bg} ${c.border} hover:scale-[1.02] hover:shadow-md transition-all text-center group`}
          >
            <c.icon className={`w-5 h-5 ${c.text} mb-2 group-hover:scale-110 transition-transform`} />
            <span className={`text-3xl font-black ${c.text}`}>{c.value}</span>
            <span className={`text-[10px] font-bold ${c.text} uppercase tracking-wider mt-1 opacity-80`}>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Maintenance Summary ───────────────────────────────────────────────────────
export function MaintenanceWidget({ data }) {
  const navigate = useNavigate();
  const statusColor = { Completed: 'bg-green-100 text-green-700', 'In Progress': 'bg-yellow-100 text-yellow-700', Pending: 'bg-slate-100 text-slate-600' };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
          <Wrench className="w-4 h-4 text-amber-600" />
        </div>
        <h3 className="font-black text-slate-800 text-sm">Maintenance Summary</h3>
        <button onClick={() => navigate('/service')} className="ml-auto text-xs font-bold text-indigo-600 hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Services Due',       value: data.servicesDue,       color: 'text-red-600',    bg: 'bg-red-50 border-red-100'    },
          { label: 'In Workshop',        value: data.inWorkshop,        color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
          { label: 'Pending Repairs',    value: data.pendingRepairs,    color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100'},
          { label: 'Upcoming Periodic',  value: data.upcomingPeriodic,  color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100'},
        ].map(item => (
          <div key={item.label} className={`rounded-xl border p-3 flex flex-col items-center text-center ${item.bg}`}>
            <span className={`text-2xl font-black ${item.color}`}>{item.value}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {data.recentServices.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div>
              <p className="text-xs font-bold text-slate-800">{s.vehicle}</p>
              <p className="text-[11px] text-slate-500">{s.type} · {s.garage}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[s.status] || 'bg-slate-100 text-slate-500'}`}>
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Fuel Summary ──────────────────────────────────────────────────────────────
export function FuelWidget({ data }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
          <Droplet className="w-4 h-4 text-teal-600" />
        </div>
        <h3 className="font-black text-slate-800 text-sm">Fuel Summary</h3>
        <button onClick={() => navigate('/fuel')} className="ml-auto text-xs font-bold text-indigo-600 hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-teal-50 border border-teal-100 p-3 text-center">
          <p className="text-xl font-black text-teal-700">{INR(data.totalFuelCost)}</p>
          <p className="text-[10px] font-bold text-teal-500 uppercase tracking-wide mt-0.5">Total Fuel Cost</p>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-center">
          <p className="text-xl font-black text-blue-700">{data.fuelFilledToday} L</p>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mt-0.5">Filled Today</p>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-center">
          <p className="text-xl font-black text-green-700">{data.averageMileage} KMPL</p>
          <p className="text-[10px] font-bold text-green-500 uppercase tracking-wide mt-0.5">Avg Mileage</p>
        </div>
        <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 text-center">
          <p className="text-sm font-black text-orange-700 truncate">{data.topConsumer.vehicle}</p>
          <p className="text-[10px] font-bold text-orange-500 mt-0.5">{data.topConsumer.litres} L · Top Consumer</p>
        </div>
      </div>
      <div className="space-y-2">
        {data.recent.map((e, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
            <div>
              <p className="text-xs font-bold text-slate-800">{e.vehicle}</p>
              <p className="text-[11px] text-slate-400">{e.vendor} · {e.date}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-teal-700">{INR(e.cost)}</p>
              <p className="text-[10px] text-slate-400">{e.litres} L</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Driver Summary ────────────────────────────────────────────────────────────
export function DriverWidget({ data }) {
  const navigate = useNavigate();
  const statusColor = {
    'Pending Approval': 'bg-yellow-100 text-yellow-700',
    'Approved':         'bg-green-100 text-green-700',
    'Paid':             'bg-emerald-100 text-emerald-700',
    'Draft':            'bg-slate-100 text-slate-500',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="font-black text-slate-800 text-sm">Driver Summary</h3>
        <button onClick={() => navigate('/staff')} className="ml-auto text-xs font-bold text-indigo-600 hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Drivers',          value: data.total,              color: 'text-slate-800',   bg: 'bg-slate-50 border-slate-200'    },
          { label: 'On Trip',                value: data.onTrip,             color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-100'      },
          { label: 'Available',              value: data.available,          color: 'text-green-700',   bg: 'bg-green-50 border-green-100'    },
          { label: 'Pending Settlements',    value: data.pendingSettlements, color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-100'    },
        ].map(item => (
          <div key={item.label} className={`rounded-xl border p-3 flex flex-col items-center text-center ${item.bg}`}>
            <span className={`text-2xl font-black ${item.color}`}>{item.value}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {data.recentSettlements.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div>
              <p className="text-xs font-bold text-slate-800">{s.driver}</p>
              <p className="text-[11px] text-slate-400">{s.vehicle} · {s.month}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-xs font-black text-slate-700">{INR(s.amount)}</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusColor[s.status] || 'bg-slate-100 text-slate-500'}`}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Financial Summary ─────────────────────────────────────────────────────────
export function FinancialSummaryWidget({ data }) {
  const navigate = useNavigate();
  const total = data.breakdown.reduce((s, d) => s + d.amount, 0);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
          <Receipt className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="font-black text-slate-800 text-sm">Financial Summary</h3>
        <button onClick={() => navigate('/vendors')} className="ml-auto text-xs font-bold text-indigo-600 hover:underline">Vendors</button>
      </div>
      <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
        <div>
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Total Pending Payments</p>
          <p className="text-2xl font-black text-red-600 mt-0.5">{INR(total)}</p>
        </div>
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <div className="space-y-2.5">
        {data.breakdown.map((item, i) => {
          const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0;
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-xs font-bold text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800">{INR(item.amount)}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Inventory Summary ─────────────────────────────────────────────────────────
export function InventoryWidget({ data }) {
  const navigate = useNavigate();
  const statusStyle = { Low: 'bg-yellow-50 border-yellow-200 text-yellow-700', Out: 'bg-red-50 border-red-200 text-red-700' };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
          <Package className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="font-black text-slate-800 text-sm">Inventory Summary</h3>
        <button onClick={() => navigate('/parts')} className="ml-auto text-xs font-bold text-indigo-600 hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-yellow-50 border border-yellow-100 p-3 text-center">
          <p className="text-2xl font-black text-yellow-700">{data.lowStock}</p>
          <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wide mt-0.5">Low Stock</p>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center">
          <p className="text-2xl font-black text-red-700">{data.outOfStock}</p>
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mt-0.5">Out of Stock</p>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-center">
          <p className="text-2xl font-black text-blue-700">{data.pendingPOs}</p>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mt-0.5">Pending POs</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {data.items.map((item, i) => (
          <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${statusStyle[item.status]}`}>
            <p className="text-xs font-bold truncate pr-2">{item.name}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-bold">{item.stock}/{item.min}</span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${statusStyle[item.status]}`}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
