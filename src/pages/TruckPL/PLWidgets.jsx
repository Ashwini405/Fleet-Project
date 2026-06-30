import React from 'react';
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiPercent,
  FiTruck, FiMap, FiDroplet, FiBarChart2,
} from 'react-icons/fi';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN');
const INRs = (n) => n >= 1000000 ? `₹${(n/1000000).toFixed(1)}M` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, trend, trendLabel, icon: Icon,
  iconBg, iconColor, valueColor,
  accent,           // left-border color class e.g. 'border-green-400'
  highlight = false // makes Net Profit card slightly larger
}) {
  const trendUp   = trend > 0;
  const trendZero = trend === 0 || trend === undefined;

  return (
    <div
      className={`
        group relative bg-white rounded-2xl border border-slate-200 shadow-sm
        border-l-4 ${accent}
        p-6 flex flex-col gap-4
        transition-all duration-200 ease-out
        hover:-translate-y-1 hover:shadow-lg hover:border-l-4
        ${highlight ? 'ring-2 ring-emerald-200 ring-offset-1' : ''}
      `}
    >
      {/* Icon + label row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500 leading-snug">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      {/* Value */}
      <p className={`text-[2rem] font-black leading-none tracking-tight ${valueColor} ${highlight ? 'text-[2.25rem]' : ''}`}>
        {value}
      </p>

      {/* Trend / sub-label */}
      {!trendZero ? (
        <div className={`flex items-center gap-1 text-[11px] font-semibold ${
          trendUp ? 'text-emerald-600' : 'text-red-500'
        }`}>
          <span>{trendUp ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% {trendLabel || 'vs Last Period'}</span>
        </div>
      ) : trendLabel ? (
        <p className="text-[11px] font-medium text-slate-400">{trendLabel}</p>
      ) : null}
    </div>
  );
}

export function TruckKpiCards({ kpis }) {
  const isProfit = kpis.netProfit >= 0;

  return (
    <div className="space-y-4">

      {/* ── Row 1: Financial KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Total Revenue"
          value={INR(kpis.totalRevenue)}
          trend={12}
          icon={FiTrendingUp}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          valueColor="text-green-700"
          accent="border-green-400"
        />
        <KpiCard
          label="Total Expenses"
          value={INR(kpis.totalExpenses)}
          trend={-5}
          icon={FiTrendingDown}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          valueColor="text-red-600"
          accent="border-red-400"
        />
        <KpiCard
          label="Net Profit"
          value={INR(Math.abs(kpis.netProfit))}
          trend={isProfit ? 8 : -8}
          icon={FiDollarSign}
          iconBg={isProfit ? 'bg-emerald-100' : 'bg-rose-100'}
          iconColor={isProfit ? 'text-emerald-600' : 'text-rose-600'}
          valueColor={isProfit ? 'text-emerald-700' : 'text-rose-600'}
          accent={isProfit ? 'border-emerald-400' : 'border-rose-400'}
          highlight={isProfit}
        />
        <KpiCard
          label="Profit Margin"
          value={`${kpis.profitMargin}%`}
          trend={kpis.profitMargin >= 0 ? 3 : -3}
          icon={FiPercent}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          valueColor={kpis.profitMargin >= 0 ? 'text-blue-700' : 'text-red-600'}
          accent="border-blue-400"
        />
      </div>

      {/* ── Row 2: Operational KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Completed Trips"
          value={kpis.totalTrips}
          trendLabel="This statement period"
          icon={FiTruck}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          valueColor="text-purple-700"
          accent="border-purple-400"
        />
        <KpiCard
          label="Distance Travelled"
          value={`${kpis.totalDistance.toLocaleString()} km`}
          trendLabel="Total km covered"
          icon={FiMap}
          iconBg="bg-cyan-100"
          iconColor="text-cyan-600"
          valueColor="text-cyan-700"
          accent="border-cyan-400"
        />
        <KpiCard
          label="Fuel Cost per km"
          value={`₹ ${kpis.fuelPerKm}`}
          trendLabel="Cost per kilometre"
          icon={FiDroplet}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          valueColor="text-orange-700"
          accent="border-orange-400"
        />
        <KpiCard
          label="Revenue per km"
          value={`₹ ${kpis.revenuePerKm}`}
          trendLabel="Earnings per kilometre"
          icon={FiBarChart2}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          valueColor="text-indigo-700"
          accent="border-indigo-400"
        />
      </div>

    </div>
  );
}

// ── Expense Summary Card (enhanced with % column) ────────────────────────────
export function ExpenseSummary({ totals }) {
  const items = [
    { label: 'Fuel',          value: totals.totalFuel,       color: '#ef4444', bar: 'bg-red-500'    },
    { label: 'Maintenance',   value: totals.totalMaint,      color: '#f59e0b', bar: 'bg-amber-500'  },
    { label: 'Tyres',         value: totals.totalTyres,      color: '#8b5cf6', bar: 'bg-purple-500' },
    { label: 'Battery',       value: totals.totalBattery,    color: '#3b82f6', bar: 'bg-blue-500'   },
    { label: 'Driver',        value: totals.netDriverCost,   color: '#0d9488', bar: 'bg-teal-500'   },
    { label: 'RTA',           value: totals.totalRTA,        color: '#64748b', bar: 'bg-slate-500'  },
    { label: 'Miscellaneous', value: totals.totalMisc,       color: '#f97316', bar: 'bg-orange-500' },
  ];
  const total = totals.totalExpenses;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-sm font-black text-slate-800 mb-1">Expense Summary</h3>
      <p className="text-[11px] text-slate-400 font-medium mb-5">Breakdown of all operating costs</p>
      <div className="space-y-3">
        {items.map((item) => {
          const pct = total > 0 ? +((item.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs font-bold text-slate-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-800">{INR(item.value)}</span>
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[36px] text-center"
                    style={{ background: item.color + '20', color: item.color }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.bar} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 pt-4 border-t border-slate-200 flex justify-between items-center">
        <span className="text-sm font-black text-slate-700 uppercase tracking-wide">Total Expenses</span>
        <span className="text-xl font-black text-red-600">{INR(total)}</span>
      </div>
    </div>
  );
}

// ── Performance Rating ────────────────────────────────────────────────────────
function PerformanceRating({ margin }) {
  let stars, label, color;
  if      (margin > 20)  { stars = 5; label = 'Excellent'; color = 'text-emerald-600'; }
  else if (margin > 15)  { stars = 4; label = 'Good';      color = 'text-green-600';   }
  else if (margin > 10)  { stars = 3; label = 'Average';   color = 'text-yellow-600';  }
  else if (margin >= 0)  { stars = 2; label = 'Poor';      color = 'text-orange-600';  }
  else                   { stars = 1; label = 'Loss';      color = 'text-red-600';     }
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[11px] font-black uppercase tracking-widest ${color}`}>
        {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
      </span>
      <span className={`text-xs font-black ${color}`}>{label}</span>
    </div>
  );
}

// ── Full Accounting P&L Card ──────────────────────────────────────────────────
export function ProfitCalculationCard({ totals }) {
  const isProfit = totals.netProfit >= 0;

  const revenueLines = [
    { label: 'Trip Revenue',   value: totals.totalTripRevenue   },
    { label: 'Rental Income',  value: totals.totalRentalRevenue },
    { label: 'Other Income',   value: totals.totalOtherRevenue  },
  ];
  const expenseLines = [
    { label: 'Fuel',             value: totals.totalFuel      },
    { label: 'Maintenance',      value: totals.totalMaint     },
    { label: 'Tyres',            value: totals.totalTyres     },
    { label: 'Battery',          value: totals.totalBattery   },
    { label: 'Driver Settlement',value: totals.netDriverCost  },
    { label: 'RTA Expenses',     value: totals.totalRTA       },
    { label: 'Miscellaneous',    value: totals.totalMisc      },
  ];

  const StatLine = ({ label, value, muted }) => (
    <div className={`flex justify-between items-center py-1.5 ${muted ? 'opacity-70' : ''}`}>
      <span className="text-xs font-medium text-slate-500 pl-3">{label}</span>
      <span className="text-xs font-bold text-slate-700">{INR(value)}</span>
    </div>
  );

  const TotalLine = ({ label, value, color }) => (
    <div className={`flex justify-between items-center py-2.5 border-t border-slate-200 mt-1`}>
      <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-black ${color}`}>{INR(value)}</span>
    </div>
  );

  return (
    <div className={`rounded-2xl border-2 shadow-md overflow-hidden ${isProfit ? 'border-emerald-300' : 'border-red-300'}`}>
      {/* Dark header */}
      <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Profit & Loss Statement</p>
          <p className="text-white font-black text-base mt-0.5">Complete Accounting Statement</p>
        </div>
        <PerformanceRating margin={totals.profitMargin} />
      </div>

      <div className="bg-white px-6 py-5 space-y-4">

        {/* Revenue block */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Revenue
          </p>
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            {revenueLines.map(l => <StatLine key={l.label} label={l.label} value={l.value} />)}
            <TotalLine label="Total Revenue" value={totals.totalRevenue} color="text-green-700" />
          </div>
        </div>

        {/* Expenses block */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Expenses
          </p>
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            {expenseLines.map(l => <StatLine key={l.label} label={l.label} value={l.value} />)}
            <TotalLine label="Total Expenses" value={totals.totalExpenses} color="text-red-600" />
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net = Revenue − Expenses</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Net result */}
        <div className={`flex justify-between items-center py-5 px-5 rounded-2xl ${
          isProfit ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${
              isProfit ? 'text-emerald-600' : 'text-red-600'
            }`}>{isProfit ? '✦ NET PROFIT' : '✦ NET LOSS'}</p>
            <p className={`text-[11px] font-medium mt-1 ${
              isProfit ? 'text-emerald-500' : 'text-red-500'
            }`}>Margin: {totals.profitMargin}%</p>
            <div className="mt-1.5">
              <PerformanceRating margin={totals.profitMargin} />
            </div>
          </div>
          <span className={`text-4xl font-black tracking-tight ${
            isProfit ? 'text-emerald-700' : 'text-red-700'
          }`}>
            {!isProfit && '− '}{INR(Math.abs(totals.netProfit))}
          </span>
        </div>
      </div>
    </div>
  );
}


