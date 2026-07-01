import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiExternalLink, FiDatabase } from 'react-icons/fi';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN');

// ── Variance pill ─────────────────────────────────────────────────────────────
function VariancePill({ current, previous }) {
  if (!previous || previous === 0) return null;
  const diff    = current - previous;
  const pct     = +((diff / previous) * 100).toFixed(1);
  const isUp    = diff > 0;
  const neutral = diff === 0;
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold ${
      neutral  ? 'bg-slate-50 border-slate-200 text-slate-500' :
      isUp     ? 'bg-orange-50 border-orange-200 text-orange-700' :
                 'bg-green-50 border-green-200 text-green-700'
    }`}>
      <div className="flex flex-col items-center min-w-[72px]">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Current</span>
        <span className="font-black text-slate-800">{INR(current)}</span>
      </div>
      <div className="w-px h-8 bg-slate-200" />
      <div className="flex flex-col items-center min-w-[72px]">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Previous</span>
        <span className="font-medium text-slate-500">{INR(previous)}</span>
      </div>
      <div className="w-px h-8 bg-slate-200" />
      <div className="flex flex-col items-center min-w-[72px]">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Difference</span>
        <span className={neutral ? 'text-slate-500' : isUp ? 'text-orange-700' : 'text-green-700'}>
          {isUp ? '+' : ''}{INR(diff)}
        </span>
        <span className={`text-[10px] font-black ${neutral ? 'text-slate-400' : isUp ? 'text-orange-600' : 'text-green-600'}`}>
          {isUp ? '▲' : diff < 0 ? '▼' : '—'} {Math.abs(pct)}%
        </span>
      </div>
    </div>
  );
}

// ── Source metadata bar ───────────────────────────────────────────────────────
function SourceBar({ source, records, viewLabel, viewPath }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 rounded-b-none">
      <div className="flex items-center gap-2 text-[11px] text-slate-400">
        <FiDatabase className="w-3 h-3 flex-shrink-0" />
        <span className="font-bold text-slate-500">Source:</span>
        <span className="font-medium">{source}</span>
        <span className="text-slate-300">·</span>
        <span className="font-medium">{records}</span>
      </div>
      <button
        onClick={() => navigate(viewPath)}
        className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
      >
        {viewLabel} <FiExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Shared expandable section wrapper ─────────────────────────────────────────
export function PLSection({
  title, subtitle, total, totalLabel = 'Subtotal',
  accent = 'indigo', defaultOpen = true,
  source, records, viewLabel, viewPath,
  prevTotal, children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const colors = {
    indigo: { header: 'bg-indigo-50 border-indigo-200', title: 'text-indigo-800', badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
    green:  { header: 'bg-green-50 border-green-200',   title: 'text-green-800',  badge: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
    red:    { header: 'bg-red-50 border-red-200',       title: 'text-red-800',    badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500'    },
    amber:  { header: 'bg-amber-50 border-amber-200',   title: 'text-amber-800',  badge: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500'  },
    blue:   { header: 'bg-blue-50 border-blue-200',     title: 'text-blue-800',   badge: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
    purple: { header: 'bg-purple-50 border-purple-200', title: 'text-purple-800', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    teal:   { header: 'bg-teal-50 border-teal-200',     title: 'text-teal-800',   badge: 'bg-teal-100 text-teal-700',     dot: 'bg-teal-500'   },
    slate:  { header: 'bg-slate-50 border-slate-200',   title: 'text-slate-800',  badge: 'bg-slate-100 text-slate-700',   dot: 'bg-slate-500'  },
  };
  const c = colors[accent] || colors.indigo;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Clickable header */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-6 py-4 border-b ${c.header} transition-colors hover:brightness-95`}
      >
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
          <div className="text-left">
            <p className={`text-sm font-black ${c.title}`}>{title}</p>
            {subtitle && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-black px-3 py-1 rounded-full ${c.badge}`}>{INR(total)}</span>
          {open ? <FiChevronUp className="w-4 h-4 text-slate-400" /> : <FiChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <>
          {/* Variance strip */}
          {prevTotal !== undefined && (
            <div className="px-6 pt-4 pb-0">
              <VariancePill current={total} previous={prevTotal} />
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">
            {children}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{totalLabel}</span>
              <span className="text-base font-black text-slate-800">{INR(total)}</span>
            </div>
          </div>

          {/* Source bar */}
          {source && (
            <SourceBar
              source={source}
              records={records}
              viewLabel={viewLabel}
              viewPath={viewPath}
            />
          )}
        </>
      )}
    </div>
  );
}

// ── Shared table ──────────────────────────────────────────────────────────────
export function PLTable({ cols, rows, amountKey = 'amount' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50">
            {cols.map(c => (
              <th key={c.key} className={`px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${c.right ? 'text-right' : 'text-left'}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/60 transition-colors">
              {cols.map(c => (
                <td key={c.key} className={`px-4 py-3 ${c.right ? 'text-right font-bold text-slate-800' : 'text-slate-600 font-medium'} ${c.key === amountKey ? 'text-slate-800 font-black' : ''}`}>
                  {c.key === amountKey
                    ? INR(row[c.key])
                    : c.badge
                      ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.badge(row[c.key])}`}>{row[c.key]}</span>
                      : row[c.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 1. Revenue Section ────────────────────────────────────────────────────────
export function RevenueSection({ data, totals, prevTotal }) {
  const typeBadge = (t) => {
    if (t === 'Freight')     return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (t === 'Return Load') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };
  const totalRecords = data.trips.length + data.rental.length + data.other.length;
  return (
    <PLSection
      title="Revenue" subtitle="Trip Income · Rental · Other"
      total={totals.totalRevenue} totalLabel="Total Revenue" accent="green"
      defaultOpen={true} prevTotal={prevTotal}
      source="Trip Master" records={`${totalRecords} Records (${data.trips.length} Trips)`}
      viewLabel="View Trips →" viewPath="/trips"
    >
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Trip Revenue</p>
          <PLTable
            cols={[
              { key: 'date',   label: 'Date'  },
              { key: 'route',  label: 'Route' },
              { key: 'type',   label: 'Type', badge: typeBadge },
              { key: 'amount', label: 'Amount', right: true },
            ]}
            rows={data.trips}
          />
          <div className="flex justify-between mt-2 px-1">
            <span className="text-xs text-slate-400 font-medium">Trip Revenue Subtotal</span>
            <span className="text-xs font-black text-green-700">{INR(data.totals.totalTripRevenue)}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rental Income</p>
          <PLTable
            cols={[
              { key: 'date',   label: 'Date'   },
              { key: 'client', label: 'Client' },
              { key: 'days',   label: 'Days'   },
              { key: 'amount', label: 'Amount', right: true },
            ]}
            rows={data.rental}
          />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Other Income</p>
          <PLTable
            cols={[
              { key: 'date',   label: 'Date'        },
              { key: 'desc',   label: 'Description' },
              { key: 'amount', label: 'Amount', right: true },
            ]}
            rows={data.other}
          />
        </div>
      </div>
    </PLSection>
  );
}

// ── 2. Fuel Section ───────────────────────────────────────────────────────────
export function FuelSection({ data, total, prevTotal }) {
  const totalLitres = data.totalLitres || 0;
  return (
    <PLSection
      title="Fuel Expenses" subtitle={`${totalLitres.toLocaleString()} L total · ${data.fillups || 0} fill-ups`}
      total={total} totalLabel="Total Fuel Expense" accent="red" prevTotal={prevTotal}
      source="Fuel Management" records={`${data.fillups || 0} Fuel Entries`}
      viewLabel="View Fuel Entries →" viewPath="/fuel"
    >
      <PLTable
        cols={[
          { key: 'date',    label: 'Date'         },
          { key: 'station', label: 'Fuel Station' },
          { key: 'litres',  label: 'Litres'       },
          { key: 'rate',    label: '₹/L'          },
          { key: 'amount',  label: 'Amount', right: true },
        ]}
        rows={data.entries || []}
      />
    </PLSection>
  );
}

// ── 3. Maintenance Section ────────────────────────────────────────────────────
export function MaintenanceSection({ data, total, prevTotal }) {
  return (
    <PLSection
      title="Maintenance Expenses" subtitle="Service · Repairs · Periodic"
      total={total} totalLabel="Total Maintenance Cost" accent="amber" prevTotal={prevTotal}
      source="Service & Maintenance Module" records={`${data.services || 0} Service Records`}
      viewLabel="View Service History →" viewPath="/service"
    >
      <PLTable
        cols={[
          { key: 'date',   label: 'Date'         },
          { key: 'type',   label: 'Service Type' },
          { key: 'garage', label: 'Garage'       },
          { key: 'amount', label: 'Amount', right: true },
        ]}
        rows={data.records || []}
      />
    </PLSection>
  );
}

// ── 4. Tyre Section ───────────────────────────────────────────────────────────
export function TyreSection({ data, total, prevTotal }) {
  const typeBadge = (t) => {
    if (t === 'Purchase')    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (t === 'Retreading')  return 'bg-blue-50 text-blue-700 border-blue-200';
    if (t === 'Puncture')    return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };
  return (
    <PLSection
      title="Tyre Expenses" subtitle="Purchase · Retreading · Puncture · Replacement"
      total={total} totalLabel="Total Tyre Cost" accent="purple" prevTotal={prevTotal}
      source="Tyre Management" records={`${data.transactions || 0} Transactions`}
      viewLabel="View Tyre Transactions →" viewPath="/tyres"
    >
      <PLTable
        cols={[
          { key: 'date',   label: 'Date'        },
          { key: 'type',   label: 'Type', badge: typeBadge },
          { key: 'description', label: 'Description' },
          { key: 'amount', label: 'Amount', right: true },
        ]}
        rows={data.records || []}
      />
    </PLSection>
  );
}

// ── 5. Battery Section ────────────────────────────────────────────────────────
export function BatterySection({ data, total, prevTotal }) {
  return (
    <PLSection
      title="Battery Expenses" subtitle="Purchase · Replacement · Repair"
      total={total} totalLabel="Total Battery Cost" accent="blue" prevTotal={prevTotal}
      source="Battery Management" records={`${data.transactions || 0} Transactions`}
      viewLabel="View Battery History →" viewPath="/vehicles"
    >
      <PLTable
        cols={[
          { key: 'date',   label: 'Date'        },
          { key: 'type',   label: 'Type'        },
          { key: 'description', label: 'Description' },
          { key: 'amount', label: 'Amount', right: true },
        ]}
        rows={data.records || []}
      />
    </PLSection>
  );
}

// ── 6. Driver Settlement Section ──────────────────────────────────────────────
export function DriverSettlementSection({ data, prevTotal, settlementRef }) {
  // Extract settlement data from the API response
  const s = data.settlement || {};
  
  const Row = ({ label, value, bold, indent, color }) => (
    <div className={`flex justify-between items-center py-2 ${indent ? 'pl-4 border-l-2 border-slate-100' : ''} ${bold ? 'border-t border-slate-100 mt-1 pt-3' : ''}`}>
      <span className={`text-sm ${bold ? 'font-black text-slate-800' : 'font-medium text-slate-600'}`}>{label}</span>
      <span className={`text-sm font-black ${color || (bold ? 'text-slate-800' : 'text-slate-700')}`}>{INR(value)}</span>
    </div>
  );
  
  return (
    <PLSection
      title="Driver Settlement" subtitle="Salary · Battha · Allowances · Deductions"
      total={data.netDriverCost} totalLabel="Net Driver Cost" accent="teal" prevTotal={prevTotal}
      source="Operational Payments" records={`Settlement: ${settlementRef || "-"} · 1 Approved Settlement`}
      viewLabel="View Settlement →" viewPath="/payments"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Earnings</p>
          <Row label="Fixed Salary"       value={Number(s.fixed_salary || 0)} indent />
          <Row label="Battha"             value={Number(s.total_battha || 0)} indent />
          <Row label="Loading Charges"    value={Number(s.loading_charges || 0)} indent />
          <Row label="Unloading Charges"  value={Number(s.unloading_charges || 0)} indent />
          <Row label="Bonus"              value={Number(s.bonus || 0)} indent />
          <Row label="Other Allowances"   value={Number(s.other_allowances || 0)} indent />
          <Row label="Gross Earnings"     value={data.grossEarnings || 0} bold color="text-green-700" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Deductions</p>
          <Row label="Driver Advance"    value={Number(s.driver_advance || 0)} indent />
          <Row label="Penalty"           value={Number(s.penalty || 0)} indent />
          <Row label="Other Deductions"  value={Number(s.other_deductions || 0)} indent />
          <Row label="Total Deductions"  value={data.totalDeductions || 0} bold color="text-red-600" />
          <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-200">
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Net Driver Cost</p>
            <p className="text-2xl font-black text-teal-800">{INR(data.netDriverCost || 0)}</p>
            <p className="text-[11px] text-teal-600 mt-0.5">Gross Earnings − Total Deductions</p>
          </div>
        </div>
      </div>
    </PLSection>
  );
}

// ── 7. RTA Section ────────────────────────────────────────────────────────────
export function RTASection({ data, total, prevTotal }) {
  return (
    <PLSection
      title="RTA Expenses" subtitle="Permit · Road Tax · Insurance · Fitness"
      total={total} totalLabel="Total RTA Cost" accent="slate" prevTotal={prevTotal}
      source="Vehicle Master / RTA" records={`${data.transactions || 0} Entries`}
      viewLabel="View RTA Records →" viewPath="/vehicles"
    >
      <PLTable
        cols={[
          { key: 'date',   label: 'Date'         },
          { key: 'type',   label: 'Expense Type' },
          { key: 'amount', label: 'Amount', right: true },
        ]}
        rows={data.records || []}
      />
    </PLSection>
  );
}

// ── 8. Miscellaneous Section ──────────────────────────────────────────────────
export function MiscExpenseSection({ data, total, prevTotal }) {
  return (
    <PLSection
      title="Miscellaneous Expenses" subtitle="Toll · Parking · Cleaning · Other"
      total={total} totalLabel="Total Misc Cost" accent="slate" prevTotal={prevTotal}
      source="Income & Expense" records={`${data.transactions || 0} Entries`}
      viewLabel="View Expense Entries →" viewPath="/finance"
    >
      <PLTable
        cols={[
          { key: 'date',   label: 'Date'        },
          { key: 'type',   label: 'Type'        },
          { key: 'description', label: 'Description' },
          { key: 'amount', label: 'Amount', right: true },
        ]}
        rows={data.records || []}
      />
    </PLSection>
  );
}