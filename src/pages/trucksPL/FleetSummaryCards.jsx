import React from 'react';
import { FiTruck, FiTrendingUp, FiTrendingDown, FiDollarSign, FiBarChart2, FiActivity } from 'react-icons/fi';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN');

// ── Fleet Health Widget ───────────────────────────────────────────────────────
function FleetHealthWidget({ data }) {
  const counts = data.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const items = [
    { status: 'Excellent',  dot: '🟢', num: 'text-emerald-700', bar: 'bg-emerald-400' },
    { status: 'Good',       dot: '🔵', num: 'text-blue-700',    bar: 'bg-blue-400'    },
    { status: 'Average',    dot: '🟠', num: 'text-orange-600',  bar: 'bg-orange-400'  },
    { status: 'Low Margin', dot: '🟡', num: 'text-yellow-600',  bar: 'bg-yellow-400'  },
    { status: 'Loss',       dot: '🔴', num: 'text-red-600',     bar: 'bg-red-400'     },
  ];

  const max = Math.max(...items.map(i => counts[i.status] || 0), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3.5 flex flex-col gap-3 border-t-[3px] border-t-slate-400">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fleet Health</p>
      <div className="space-y-2">
        {items.map(i => {
          const count = counts[i.status] || 0;
          if (!count) return null;
          return (
            <div key={i.status} className="flex items-center gap-2">
              <span className="text-[11px] w-3">{i.dot}</span>
              <span className="text-[11px] font-medium text-slate-500 w-20 truncate">{i.status}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${i.bar}`}
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
              <span className={`text-[11px] font-black w-4 text-right ${i.num}`}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, subLabel, value, icon: Icon, iconColor, iconBg, topBorder, valueColor, filterKey, onClick }) {
  return (
    <div
      onClick={() => filterKey && onClick && onClick(filterKey)}
      className={`
        bg-white rounded-xl border border-slate-200 shadow-sm
        border-t-[3px] ${topBorder}
        px-4 py-3.5 flex flex-col gap-2.5
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
        ${filterKey ? 'cursor-pointer hover:border-indigo-200' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 leading-snug">{label}</p>
          {subLabel && <p className="text-[9px] font-medium text-slate-400 mt-0.5">{subLabel}</p>}
        </div>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
      </div>
      <p className={`text-lg font-black leading-none tracking-tight ${valueColor || 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FleetSummaryCards({ data, onFilterChange }) {
  const total         = data.length;
  const profitable    = data.filter(r => r.profit >= 0).length;
  const lossMaking    = data.filter(r => r.profit < 0).length;
  const totalRevenue  = data.reduce((s, r) => s + r.revenue, 0);
  const totalExpenses = data.reduce((s, r) => s + r.expenses, 0);
  const totalProfit   = data.reduce((s, r) => s + r.profit, 0);

  const cards = [
    {
      label: 'Total Trucks',
      value: total,
      icon: FiTruck,
      iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600',
      topBorder: 'border-t-indigo-400',
      filterKey: null,
    },
    {
      label: 'Profitable Trucks',
      value: profitable,
      icon: FiTrendingUp,
      iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
      topBorder: 'border-t-emerald-400',
      filterKey: 'profitable',
    },
    {
      label: 'Loss Making Trucks',
      value: lossMaking,
      icon: FiTrendingDown,
      iconBg: 'bg-red-50', iconColor: 'text-red-500',
      topBorder: 'border-t-red-400',
      valueColor: lossMaking > 0 ? 'text-red-600' : 'text-slate-800',
      filterKey: 'loss',
    },
    {
      label: 'Fleet Revenue',
      subLabel: '(Current Period)',
      value: INR(totalRevenue),
      icon: FiDollarSign,
      iconBg: 'bg-green-50', iconColor: 'text-green-600',
      topBorder: 'border-t-green-400',
      filterKey: null,
    },
    {
      label: 'Fleet Expenses',
      subLabel: '(Current Period)',
      value: INR(totalExpenses),
      icon: FiActivity,
      iconBg: 'bg-orange-50', iconColor: 'text-orange-500',
      topBorder: 'border-t-orange-400',
      filterKey: null,
    },
    {
      label: 'Fleet Profit',
      subLabel: '(Current Period)',
      value: INR(totalProfit),
      icon: FiBarChart2,
      iconBg: totalProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      iconColor: totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500',
      topBorder: totalProfit >= 0 ? 'border-t-emerald-500' : 'border-t-red-500',
      valueColor: totalProfit >= 0 ? 'text-emerald-700' : 'text-red-600',
      filterKey: null,
    },
  ];

  const handleClick = (filterKey) => {
    if (!filterKey || !onFilterChange) return;
    if (filterKey === 'profitable') onFilterChange({ minProfit: '0' });
    if (filterKey === 'loss')       onFilterChange({ maxProfit: '-1' });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-5">
      {cards.map((c) => (
        <KpiCard key={c.label} {...c} onClick={handleClick} />
      ))}
      <FleetHealthWidget data={data} />
    </div>
  );
}
