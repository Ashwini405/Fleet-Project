import React from 'react';
import { FiZap, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiInfo } from 'react-icons/fi';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN');

// ── Helpers ───────────────────────────────────────────────────────────────────
function pct(part, total) {
  return total > 0 ? +((part / total) * 100).toFixed(1) : 0;
}
function varPct(curr, prev) {
  return prev > 0 ? +((( curr - prev) / prev) * 100).toFixed(1) : 0;
}

// ── Rule engine ───────────────────────────────────────────────────────────────
function generateInsights(totals, prev) {
  const insights = [];

  const fuelPct     = pct(totals.totalFuel,    totals.totalExpenses);
  const tyrePct     = pct(totals.totalTyres,   totals.totalExpenses);
  const maintPct    = pct(totals.totalMaint,   totals.totalExpenses);
  const driverPct   = pct(totals.netDriverCost,totals.totalExpenses);

  const fuelVar     = varPct(totals.totalFuel,    prev.totalFuel);
  const tyreVar     = varPct(totals.totalTyres,   prev.totalTyres);
  const maintVar    = varPct(totals.totalMaint,   prev.totalMaint);
  const revenueVar  = varPct(totals.totalRevenue, prev.totalRevenue);

  // Fuel insight
  if (fuelPct > 40) {
    insights.push({
      type: 'warning',
      icon: FiAlertTriangle,
      title: `Fuel cost is ${fuelPct}% of total expenses`,
      detail: 'Suggestion: Inspect mileage records and optimize route planning to reduce fuel consumption.',
      color: 'border-orange-200 bg-orange-50',
      iconColor: 'text-orange-500',
    });
  } else {
    insights.push({
      type: 'good',
      icon: FiCheckCircle,
      title: `Fuel cost is under control at ${fuelPct}% of expenses`,
      detail: 'Fuel efficiency is within acceptable range for this vehicle class.',
      color: 'border-green-200 bg-green-50',
      iconColor: 'text-green-500',
    });
  }

  // Tyre variance
  if (tyreVar > 15) {
    insights.push({
      type: 'warning',
      icon: FiAlertTriangle,
      title: `Tyre cost increased by ${tyreVar}% vs previous period`,
      detail: 'Possible reasons: Tyre replacement, retreading, or wheel alignment issues. Schedule a tyre health check.',
      color: 'border-yellow-200 bg-yellow-50',
      iconColor: 'text-yellow-600',
    });
  } else if (tyreVar < -10) {
    insights.push({
      type: 'good',
      icon: FiCheckCircle,
      title: `Tyre cost reduced by ${Math.abs(tyreVar)}% vs previous period`,
      detail: 'Tyre expenses are lower this period. Good maintenance practices are showing results.',
      color: 'border-green-200 bg-green-50',
      iconColor: 'text-green-500',
    });
  }

  // Maintenance
  if (maintVar > 20) {
    insights.push({
      type: 'warning',
      icon: FiAlertTriangle,
      title: `Maintenance cost increased by ${maintVar}%`,
      detail: 'Review recent repair orders. Repeated breakdowns may indicate deeper mechanical issues.',
      color: 'border-red-200 bg-red-50',
      iconColor: 'text-red-500',
    });
  } else {
    insights.push({
      type: 'good',
      icon: FiCheckCircle,
      title: 'Maintenance cost is within normal range',
      detail: 'Vehicle maintenance is under control. Continue the current service schedule.',
      color: 'border-green-200 bg-green-50',
      iconColor: 'text-green-500',
    });
  }

  // Revenue trend
  if (revenueVar > 10) {
    insights.push({
      type: 'good',
      icon: FiTrendingUp,
      title: `Revenue grew ${revenueVar}% vs previous period`,
      detail: 'Strong revenue performance. Ensure continued trip allocation and timely invoicing.',
      color: 'border-indigo-200 bg-indigo-50',
      iconColor: 'text-indigo-500',
    });
  } else if (revenueVar < -5) {
    insights.push({
      type: 'warning',
      icon: FiAlertTriangle,
      title: `Revenue declined by ${Math.abs(revenueVar)}% vs previous period`,
      detail: 'Review trip frequency and client billing. Consider increasing trip allocation for this truck.',
      color: 'border-orange-200 bg-orange-50',
      iconColor: 'text-orange-500',
    });
  }

  // Profit margin rating
  if (totals.profitMargin > 20) {
    insights.push({
      type: 'good',
      icon: FiCheckCircle,
      title: `Profit margin is excellent at ${totals.profitMargin}%`,
      detail: 'This truck is among the top performers. Continue current operating strategy.',
      color: 'border-emerald-200 bg-emerald-50',
      iconColor: 'text-emerald-500',
    });
  } else if (totals.profitMargin < 0) {
    insights.push({
      type: 'critical',
      icon: FiAlertTriangle,
      title: `This truck is operating at a loss (${totals.profitMargin}%)`,
      detail: 'Immediate review required. Evaluate expense categories and consider route reassignment.',
      color: 'border-red-300 bg-red-50',
      iconColor: 'text-red-600',
    });
  }

  // Driver cost
  if (driverPct > 25) {
    insights.push({
      type: 'info',
      icon: FiInfo,
      title: `Driver settlement is ${driverPct}% of total expenses`,
      detail: 'Review allowance structure and advance amounts. Ensure advance recoveries are on track.',
      color: 'border-blue-200 bg-blue-50',
      iconColor: 'text-blue-500',
    });
  }

  return insights.slice(0, 6);
}

export function OperationalInsights({ totals, prev }) {
  const insights = generateInsights(totals, prev);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
          <FiZap className="w-4 h-4 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800">Operational Insights</h3>
          <p className="text-[11px] text-slate-400 font-medium">Rule-based recommendations from this period's data</p>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins, i) => (
          <div key={i} className={`rounded-xl border p-4 flex gap-3 ${ins.color}`}>
            <ins.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${ins.iconColor}`} />
            <div>
              <p className="text-xs font-black text-slate-800 leading-snug">{ins.title}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{ins.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Audit Trail: How Profit is Calculated ─────────────────────────────────────
export function AuditTrail({ totals }) {
  const isProfit = totals.netProfit >= 0;

  const steps = [
    { label: 'Trip Revenue',      value: totals.totalTripRevenue,   sign: '+', color: 'text-green-700',  dot: 'bg-green-500'   },
    { label: 'Rental Income',     value: totals.totalRentalRevenue, sign: '+', color: 'text-green-700',  dot: 'bg-green-400'   },
    { label: 'Other Income',      value: totals.totalOtherRevenue,  sign: '+', color: 'text-green-600',  dot: 'bg-green-300'   },
    { label: 'Fuel Expenses',     value: totals.totalFuel,          sign: '−', color: 'text-red-600',    dot: 'bg-red-500'     },
    { label: 'Maintenance',       value: totals.totalMaint,         sign: '−', color: 'text-red-600',    dot: 'bg-amber-500'   },
    { label: 'Tyres',             value: totals.totalTyres,         sign: '−', color: 'text-red-600',    dot: 'bg-purple-500'  },
    { label: 'Battery',           value: totals.totalBattery,       sign: '−', color: 'text-red-600',    dot: 'bg-blue-500'    },
    { label: 'Driver Settlement', value: totals.netDriverCost,      sign: '−', color: 'text-red-600',    dot: 'bg-teal-500'    },
    { label: 'RTA Expenses',      value: totals.totalRTA,           sign: '−', color: 'text-red-600',    dot: 'bg-slate-500'   },
    { label: 'Miscellaneous',     value: totals.totalMisc,          sign: '−', color: 'text-red-600',    dot: 'bg-orange-500'  },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 px-6 py-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit & Transparency</p>
        <p className="text-white font-black text-base mt-0.5">How Profit is Calculated</p>
      </div>

      <div className="p-6">
        {/* Formula display */}
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Formula</p>
          <p className="text-sm font-black text-slate-800">
            Net Profit = Total Revenue − Total Expenses
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            = {INR(totals.totalRevenue)} − {INR(totals.totalExpenses)} ={' '}
            <span className={isProfit ? 'text-emerald-700 font-black' : 'text-red-600 font-black'}>
              {INR(totals.netProfit)}
            </span>
          </p>
        </div>

        {/* Step-by-step waterfall */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-200" />

          <div className="space-y-1">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 relative">
                <span className={`w-5 h-5 rounded-full flex-shrink-0 z-10 ${step.dot} border-2 border-white shadow-sm`} />
                <div className="flex-1 flex justify-between items-center py-2 border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black w-4 ${step.sign === '+' ? 'text-green-600' : 'text-red-500'}`}>
                      {step.sign}
                    </span>
                    <span className="text-xs font-medium text-slate-600">{step.label}</span>
                  </div>
                  <span className={`text-xs font-black ${step.color}`}>{INR(step.value)}</span>
                </div>
              </div>
            ))}

            {/* Result */}
            <div className="flex items-center gap-4 pt-2">
              <span className={`w-6 h-6 rounded-full flex-shrink-0 z-10 border-2 border-white shadow-md ${isProfit ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className={`flex-1 flex justify-between items-center py-3 px-4 rounded-xl ${isProfit ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                <span className={`text-sm font-black uppercase tracking-wider ${isProfit ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isProfit ? 'Net Profit' : 'Net Loss'}
                </span>
                <span className={`text-lg font-black ${isProfit ? 'text-emerald-700' : 'text-red-700'}`}>
                  {INR(Math.abs(totals.netProfit))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Report Footer ─────────────────────────────────────────────────────────────
export function ReportFooter({ info, period }) {
  const now    = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const fields = [
    { label: 'Generated On',    value: dateStr                  },
    { label: 'Print Timestamp', value: timeStr                  },
    { label: 'Generated By',    value: 'Fleet Manager'          },
    { label: 'Report Period',   value: period                   },
    { label: 'Truck Number',    value: info.truckNo             },
    { label: 'Running Plant',   value: info.plant               },
    { label: 'Vehicle Model',   value: info.model               },
    { label: 'Export Version',  value: 'Version 1.0'            },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden">
      <div className="px-6 py-3 border-b border-slate-700 flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Information</p>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          Auto-generated · Fleet ERP
        </span>
      </div>
      <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4">
        {fields.map(f => (
          <div key={f.label}>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{f.label}</p>
            <p className="text-xs font-bold text-slate-300">{f.value}</p>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-600 font-medium">
          This report is system-generated by Fleet ERP. All figures are based on recorded transactions for the selected period.
        </p>
      </div>
    </div>
  );
}
