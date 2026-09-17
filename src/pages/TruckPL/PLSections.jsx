import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiExternalLink, FiDatabase } from 'react-icons/fi';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN');

function formatReportDate(value) {
  if (!value) return '—';
  const text = String(value);
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00` : text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

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
export function PLTable({ cols, rows, amountKey = 'amount', onRowClick }) {
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
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              title={onRowClick ? 'View transaction in vendor ledger' : undefined}
              className={`hover:bg-slate-50/60 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {cols.map(c => (
                <td key={c.key} className={`px-4 py-3 ${c.right ? 'text-right font-bold text-slate-800' : 'text-slate-600 font-medium'} ${c.key === amountKey ? 'text-slate-800 font-black' : ''}`}>
                  {c.key === amountKey
                    ? INR(row[c.key])
                    : c.badge
                      ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.badge(row[c.key])}`}>{row[c.key]}</span>
                      : c.key === 'date'
                        ? formatReportDate(row[c.key])
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
export function RevenueSection({ data, totals, prevTotal, vehicleId }) {
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
      viewLabel="View Trips →" viewPath={`/trips?vehicle_id=${vehicleId}`}
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
              { key: 'category', label: 'Category'  },
              { key: 'description', label: 'Description' },
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
export function FuelSection({ data, total, prevTotal, vehicleId }) {
  const totalLitres = data.totalLitres || 0;
  return (
    <PLSection
      title="Fuel Expenses" subtitle={`${totalLitres.toLocaleString()} L total · ${data.fillups || 0} fill-ups`}
      total={total} totalLabel="Total Fuel Expense" accent="red" prevTotal={prevTotal}
      source="Fuel Management" records={`${data.fillups || 0} Fuel Entries`}
      viewLabel="View Fuel Entries →" viewPath={`/fuel?vehicle_id=${vehicleId}`}
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

// ── 3. Fastag Expenses ───────────────────────────────────────────────────────
export function FastagSection({ data, total, prevTotal, vehicleId }) {
  return (
    <PLSection
      title="Fastag Expenses"
      subtitle={`${data.count || 0} toll deductions · wallet fuel shown separately`}
      total={total}
      totalLabel="Total Fastag Expense"
      accent="purple"
      prevTotal={prevTotal}
      source="Fastag Management"
      records={`${data.count || 0} Fastag Entries`}
      viewLabel="View Fastag Entries →"
      viewPath={`/fastag?tab=Transactions&vehicle_id=${vehicleId}`}
    >
      <PLTable
        cols={[
          { key: 'date', label: 'Date' },
          { key: 'plaza', label: 'Toll Plaza' },
          { key: 'type', label: 'Type' },
          { key: 'reference', label: 'Reference' },
          { key: 'amount', label: 'Amount', right: true },
        ]}
        rows={data.entries || []}
      />
      <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Fuel via Fastag Wallet</p>
            <p className="text-[11px] text-cyan-700/70">Informational only · already included in Fuel Expenses</p>
          </div>
          <span className="text-sm font-black text-cyan-700">{INR(data.walletFuelTotal || 0)}</span>
        </div>
        {(data.walletFuelEntries || []).length > 0 ? (
          <PLTable
            cols={[
              { key: 'date', label: 'Date' },
              { key: 'litres', label: 'Litres' },
              { key: 'rate', label: '₹/L' },
              { key: 'amount', label: 'Already in Fuel', right: true },
            ]}
            rows={data.walletFuelEntries}
          />
        ) : (
          <p className="text-xs text-cyan-700/70">No fuel entries paid through Fastag Wallet.</p>
        )}
      </div>
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
export function TyreSection({ data, total, prevTotal, vehicleNumber }) {
  const navigate = useNavigate();
  const tyreVendors = [...new Map((data.records || [])
    .filter(record => record.vendorId || record.vendorName)
    .map(record => [
      record.vendorId || String(record.vendorName).trim().toLowerCase(),
      { id: record.vendorId, name: record.vendorName },
    ])).values()];
  const vendorParams = new URLSearchParams({ category: 'tyres' });
  if (tyreVendors.length === 1) {
    if (tyreVendors[0].id) vendorParams.set('vendor_id', String(tyreVendors[0].id));
    if (tyreVendors[0].name) vendorParams.set('vendor_name', tyreVendors[0].name);
  } else if (tyreVendors.length > 1) {
    vendorParams.set('vendor_ids', tyreVendors.filter(v => v.id).map(v => v.id).join(','));
    vendorParams.set('vendor_names', tyreVendors.filter(v => v.name).map(v => v.name).join('|'));
  }
  const vendorPath = `/vendors?${vendorParams.toString()}`;
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
      source="Tyre Vendor Ledger" records={`${data.transactions || 0} Transactions`}
      viewLabel="View Tyre Vendors →"
      viewPath={vendorPath}
    >
      <PLTable
        cols={[
          { key: 'date',   label: 'Date'        },
          { key: 'type',   label: 'Type', badge: typeBadge },
          { key: 'tyreNumber', label: 'Tyre Number' },
          { key: 'description', label: 'Description' },
          { key: 'vendorName', label: 'Vendor' },
          { key: 'amount', label: 'Amount', right: true },
        ]}
        rows={data.records || []}
        onRowClick={row => {
          const params = new URLSearchParams({
            category: 'tyres',
            tyre_number: row.tyreNumber || '',
            txn_type: row.type || '',
          });
          if (row.vendorId) params.set('vendor_id', String(row.vendorId));
          if (row.vendorName) params.set('vendor_name', row.vendorName);
          navigate(`/vendors?${params.toString()}`);
        }}
      />
      {(data.records || []).length === 0 && (
        <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          No tyre transactions are linked to this vehicle yet. Mount the tyre from Tyre Management to connect its vendor purchase and lifecycle costs to this P&L report.
        </div>
      )}
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
export function DriverSettlementSection({ data = {}, prevTotal, settlementRef, vehicleNo, vehicleId }) {
  const navigate = useNavigate();
  // Extract settlement data from the API response
  const s = data?.settlement || {};
  const settlementCount = data?.settlementCount || (s?.id ? 1 : 0);
  const driverInfo = data?.driverInfo || {};
  const pending = data?.pendingDetails || {};
  
  const Row = ({ label, value, bold, indent, color }) => (
    <div className={`flex justify-between items-center py-2 ${indent ? 'pl-4 border-l-2 border-slate-100' : ''} ${bold ? 'border-t border-slate-100 mt-1 pt-3' : ''}`}>
      <span className={`text-sm ${bold ? 'font-black text-slate-800' : 'font-medium text-slate-600'}`}>{label}</span>
      <span className={`text-sm font-black ${color || (bold ? 'text-slate-800' : 'text-slate-700')}`}>{INR(value)}</span>
    </div>
  );
  
  const countLabel = settlementCount === 1 ? '1 Approved Settlement' : `${settlementCount} Settlements`;
  const recordsText = settlementCount > 0
    ? `Settlement: ${settlementRef || s.settlement_no || 'Recorded'} · ${countLabel}`
    : '0 Settlements Recorded';

  const prepareParams = new URLSearchParams();
  prepareParams.set('tab', 'prepare');
  if (vehicleNo) prepareParams.set('truckNo', vehicleNo);
  if (driverInfo.id) prepareParams.set('driverId', String(driverInfo.id));
  if (driverInfo.name) prepareParams.set('driverName', driverInfo.name);
  if (driverInfo.plant) prepareParams.set('plant', driverInfo.plant);
  const preparePath = `/payments?${prepareParams.toString()}`;

  const historyParams = new URLSearchParams();
  historyParams.set('tab', 'history');
  if (vehicleNo) historyParams.set('vehicle', vehicleNo);
  if (s?.settlement_no) historyParams.set('settlementNo', s.settlement_no);
  if (s?.statement_month && !s.statement_month.includes('Months')) historyParams.set('month', s.statement_month);
  const historyPath = `/payments?${historyParams.toString()}`;

  const viewPath = settlementCount > 0 ? historyPath : preparePath;
  const viewLabel = settlementCount > 0 ? 'View Settlement →' : '+ Prepare Settlement →';

  return (
    <PLSection
      title="Driver Settlement" subtitle="Salary · Battha · Allowances · Deductions"
      total={data.netDriverCost || 0} totalLabel="Net Driver Cost" accent="teal" prevTotal={prevTotal}
      source="Operational Payments" records={recordsText}
      viewLabel={viewLabel} viewPath={viewPath}
    >
      {settlementCount === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-5 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <p className="text-xs font-bold text-slate-700">No monthly settlement generated yet for this vehicle</p>
            <p className="text-xs text-slate-500">
              {driverInfo.name 
                ? `Assigned Driver: ${driverInfo.name} ${pending.tripCount > 0 ? `• ${pending.tripCount} trips logged` : ''}`
                : 'Generate a monthly settlement in Operational Payments to calculate salary, battha, and advances.'}
            </p>
            <button
              onClick={() => navigate(preparePath)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              + Prepare Settlement for {vehicleNo || 'this Truck'}
            </button>
          </div>
        </div>
      ) : (
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
      )}
    </PLSection>
  );
}

// ── 7. RTA Section ────────────────────────────────────────────────────────────
export function RTASection({ data, total, prevTotal, vehicleNumber }) {
  const navigate = useNavigate();
  const rtaVendors = [...new Map((data.records || [])
    .filter(record => record.vendorId || record.vendorName)
    .map(record => [
      record.vendorId || String(record.vendorName).trim().toLowerCase(),
      { id: record.vendorId, name: record.vendorName },
    ])).values()];

  const vendorParams = new URLSearchParams({ category: 'rta' });
  if (vehicleNumber) vendorParams.set('vehicle_no', vehicleNumber);

  if (rtaVendors.length === 1) {
    if (rtaVendors[0].id) vendorParams.set('vendor_id', String(rtaVendors[0].id));
    if (rtaVendors[0].name) vendorParams.set('vendor_name', rtaVendors[0].name);
  } else if (rtaVendors.length > 1) {
    vendorParams.set('vendor_ids', rtaVendors.filter(v => v.id).map(v => v.id).join(','));
    vendorParams.set('vendor_names', rtaVendors.filter(v => v.name).map(v => v.name).join('|'));
  }
  const vendorPath = `/vendors?${vendorParams.toString()}`;

  return (
    <PLSection
      title="RTA Expenses" subtitle="Permit · Road Tax · Insurance · Fitness"
      total={total} totalLabel="Total RTA Cost" accent="slate" prevTotal={prevTotal}
      source="RTA Vendor Ledger" records={`${data.transactions || 0} Entries`}
      viewLabel="View RTA Records →" viewPath={vendorPath}
    >
      <PLTable
        cols={[
          { key: 'date',       label: 'Date'         },
          { key: 'type',       label: 'Expense Type' },
          { key: 'vendorName', label: 'Agent / Vendor' },
          { key: 'reference',  label: 'Reference' },
          { key: 'amount',     label: 'Amount', right: true },
        ]}
        rows={data.records || []}
        onRowClick={row => {
          const params = new URLSearchParams({
            category: 'rta',
            vehicle_no: vehicleNumber || '',
          });
          if (row.vendorId) params.set('vendor_id', String(row.vendorId));
          if (row.vendorName) params.set('vendor_name', row.vendorName);
          navigate(`/vendors?${params.toString()}`);
        }}
      />
    </PLSection>
  );
}

// ── EMI Section ────────────────────────────────────────────────────────────────
export function EmiSection({ data, total, prevTotal, vehicleId }) {
  const emiAmount = data?.emiAmount || 0;
  const paymentsCount = data?.paymentsCount || 0;
  const loanTenure = data?.loanTenure;

  return (
    <PLSection
      title="Vehicle EMI" subtitle="Loan Installments Paid"
      total={total} totalLabel="Total EMI Paid" accent="amber" prevTotal={prevTotal}
      source="Vehicle Master / EMI Tracker"
      records={`${paymentsCount} Payment${paymentsCount !== 1 ? 's' : ''}${loanTenure ? ` of ${loanTenure}` : ''}`}
      viewLabel="View Vehicle →" viewPath={`/vehicles/${vehicleId}`}
    >
      {emiAmount > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Financier</p>
            <p className="text-sm font-bold text-slate-800">{data?.financierName || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Installment</p>
            <p className="text-sm font-bold text-slate-800">{INR(emiAmount)}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Installments Paid</p>
            <p className="text-sm font-bold text-slate-800">{paymentsCount}{loanTenure ? ` / ${loanTenure}` : ''}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
            <p className="text-sm font-bold text-amber-700">{INR(total)}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 py-2">This vehicle has no financing/EMI on record.</p>
      )}
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