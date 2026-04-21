import React, { useState, useEffect, useMemo } from 'react';
import {
  FiArrowLeft, FiAlertTriangle, FiCheckCircle,
  FiDroplet, FiFileText, FiPlus, FiTrendingUp, FiTrendingDown
} from 'react-icons/fi';
import AddFuelEntry from './AddFuelEntry';

const INR  = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmt2 = (n) => +Number(n).toFixed(2);
const fmt1 = (n) => +Number(n).toFixed(1);

// ─── Status logic (mirrors dashboard) ────────────────────────────────────────
function calcStatus(actualMileage, expectedMileage, actualFuel, expectedFuel) {
  if (actualFuel === 0) return 'no-fuel';
  if (expectedMileage <= 0) return 'normal';
  const mRatio = actualMileage / expectedMileage;
  const fRatio = expectedFuel > 0 ? (actualFuel - expectedFuel) / expectedFuel : 0;
  if (mRatio < 0.75 || fRatio > 0.20) return 'critical';
  if (mRatio < 0.90 || fRatio > 0.10) return 'warning';
  return 'normal';
}

const STATUS_CFG = {
  normal:   { label: 'Normal',   cls: 'bg-green-50 text-green-700 border-green-200' },
  warning:  { label: 'Warning',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  critical: { label: 'Critical', cls: 'bg-red-50 text-red-700 border-red-200' },
  'no-fuel':{ label: 'No Fuel',  cls: 'bg-slate-50 text-slate-500 border-slate-200' },
};

// ─── Alert message builder ────────────────────────────────────────────────────
function buildAlertMessages(status, actualMileage, expectedMileage, overFuel, expectedFuel) {
  const msgs = [];
  if (status === 'no-fuel') return msgs;

  const mRatio = expectedMileage > 0 ? actualMileage / expectedMileage : 1;
  const fRatio = expectedFuel > 0 && overFuel !== null ? overFuel / expectedFuel : 0;

  if (mRatio < 0.75) {
    msgs.push({
      severity: 'critical',
      text: `Mileage critically low: ${actualMileage} KMPL vs expected ${expectedMileage} KMPL (${((1 - mRatio) * 100).toFixed(0)}% below). Possible fuel theft or engine issue.`,
    });
  } else if (mRatio < 0.90) {
    msgs.push({
      severity: 'warning',
      text: `Mileage below expected: ${actualMileage} KMPL vs ${expectedMileage} KMPL (${((1 - mRatio) * 100).toFixed(0)}% below). Check vehicle condition.`,
    });
  }

  if (overFuel !== null && fRatio > 0.20) {
    msgs.push({
      severity: 'critical',
      text: `Fuel over-consumed by ${overFuel > 0 ? '+' : ''}${overFuel} L (${(fRatio * 100).toFixed(0)}% above expected ${expectedFuel} L). Investigate immediately.`,
    });
  } else if (overFuel !== null && fRatio > 0.10) {
    msgs.push({
      severity: 'warning',
      text: `Fuel usage slightly high: ${overFuel > 0 ? '+' : ''}${overFuel} L over expected ${expectedFuel} L.`,
    });
  }

  return msgs;
}

export default function TripFuelOverview({ tripId, onBack }) {
  const [trip, setTrip]         = useState(null);
  const [entries, setEntries]   = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isAddOpen, setAddOpen] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:5001/api/trips/${tripId}`).then(r => r.json()),
      fetch(`http://localhost:5001/api/fuel?trip_id=${tripId}`).then(r => r.json()),
    ])
      .then(([tripRes, fuelRes]) => {
        if (tripRes.success) setTrip(tripRes.data);
        if (fuelRes.success) setEntries(fuelRes.data);
      })
      .catch(err => console.error('TripFuelOverview fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [tripId]);

  // ─── Metrics ──────────────────────────────────────────────────────────────
  const m = useMemo(() => {
    if (!trip) return null;
    const distance        = Number(trip.distance || trip.est_distance || 0);
    const expectedMileage = Number(trip.expected_mileage || 0);

    // ── Fuel validation: only count entries with qty > 0 ──
    const validEntries = entries.filter(e => Number(e.quantity || 0) > 0);

    const actualFuel  = validEntries.reduce((s, e) => s + Number(e.quantity), 0);
    const totalCost   = validEntries.reduce((s, e) => s + Number(e.total_cost || 0), 0);
    const expectedFuel = distance > 0 && expectedMileage > 0 ? distance / expectedMileage : 0;
    const actualMileage = actualFuel > 0 && distance > 0 ? distance / actualFuel : 0;
    const overFuel      = actualFuel > 0 && expectedFuel > 0 ? actualFuel - expectedFuel : null;
    const mileageVariance = actualMileage > 0 && expectedMileage > 0 ? actualMileage - expectedMileage : null;

    const vendors   = [...new Set(validEntries.map(e => e.vendor).filter(Boolean))];
    const billCount = validEntries.reduce((s, e) => {
      try { return s + JSON.parse(e.receipt_files || '[]').length; } catch { return s; }
    }, 0);
    // ── Bill validation ──
    const missingBills = validEntries.filter(e => {
      try { return JSON.parse(e.receipt_files || '[]').length === 0; } catch { return true; }
    });

    const status = calcStatus(actualMileage, expectedMileage, actualFuel, expectedFuel);
    const alerts = buildAlertMessages(status, fmt2(actualMileage), expectedMileage, overFuel !== null ? fmt1(overFuel) : null, fmt1(expectedFuel));

    // ── Per-entry KMPL: distance covered between consecutive entries ──
    // We use each entry's own distance field (odometer delta stored at entry time)
    const entriesWithKmpl = validEntries.map(e => {
      const entryDist = Number(e.distance || 0);
      const entryQty  = Number(e.quantity || 0);
      const kmpl      = entryDist > 0 && entryQty > 0 ? fmt2(entryDist / entryQty) : null;
      return { ...e, entryKmpl: kmpl, entryDist };
    });

    return {
      distance, expectedMileage,
      actualFuel:      fmt1(actualFuel),
      totalCost,
      expectedFuel:    fmt1(expectedFuel),
      actualMileage:   fmt2(actualMileage),
      overFuel:        overFuel !== null ? fmt1(overFuel) : null,
      mileageVariance: mileageVariance !== null ? fmt2(mileageVariance) : null,
      vendors, billCount, missingBills,
      status, alerts,
      entriesWithKmpl,
      avgRate: validEntries.length > 0
        ? fmt2(validEntries.reduce((s, e) => s + Number(e.rate || 0), 0) / validEntries.length)
        : 0,
    };
  }, [trip, entries]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!trip || !m) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
      <FiDroplet className="w-10 h-10 opacity-30" />
      <p className="text-sm">Trip not found</p>
      <button onClick={onBack} className="text-indigo-600 text-sm font-bold hover:underline">← Back</button>
    </div>
  );

  const sc          = STATUS_CFG[m.status];
  const overFuelBad = m.overFuel !== null && m.overFuel > 0;
  const mileageLow  = m.mileageVariance !== null && m.mileageVariance < 0;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-black text-slate-800">{trip.trip_id}</h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${sc.cls}`}>
              {m.status === 'normal' ? <FiCheckCircle className="w-3 h-3" /> : <FiAlertTriangle className="w-3 h-3" />}
              {sc.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5 truncate">
            {trip.truck_no || trip.vehicle_no} · {trip.driver_name} · {trip.source || '—'} → {trip.destination || '—'}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
        >
          <FiPlus className="w-4 h-4" /> Add Fuel Entry
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Actual vs Expected Fuel */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fuel Used</p>
          <p className="text-xl font-black text-slate-800">{m.actualFuel > 0 ? `${m.actualFuel} L` : '—'}</p>
          <p className="text-xs text-slate-500 mt-0.5">Expected: <strong>{m.expectedFuel > 0 ? `${m.expectedFuel} L` : '—'}</strong></p>
        </div>

        {/* Over Fuel */}
        <div className={`rounded-xl border p-4 ${overFuelBad ? 'border-red-200 bg-red-50/50' : m.overFuel !== null ? 'border-green-200 bg-green-50/50' : 'border-slate-200 bg-slate-50/50'}`}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Over Fuel</p>
          <p className={`text-xl font-black ${overFuelBad ? 'text-red-600' : m.overFuel !== null ? 'text-green-600' : 'text-slate-400'}`}>
            {m.overFuel !== null ? `${overFuelBad ? '+' : ''}${m.overFuel} L` : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{overFuelBad ? 'Over-consumed' : m.overFuel !== null ? 'Under expected' : 'No fuel data'}</p>
        </div>

        {/* Actual vs Expected Mileage */}
        <div className={`rounded-xl border p-4 ${mileageLow ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mileage</p>
          <p className={`text-xl font-black ${mileageLow ? 'text-red-600' : 'text-slate-800'}`}>
            {m.actualMileage > 0 ? `${m.actualMileage} KMPL` : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Expected: <strong>{m.expectedMileage > 0 ? `${m.expectedMileage} KMPL` : '—'}</strong>
            {m.mileageVariance !== null && (
              <span className={`ml-1 font-bold ${mileageLow ? 'text-red-600' : 'text-green-600'}`}>
                ({m.mileageVariance > 0 ? '+' : ''}{m.mileageVariance})
              </span>
            )}
          </p>
        </div>

        {/* Total Cost */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Cost</p>
          <p className="text-xl font-black text-emerald-700">{m.totalCost > 0 ? INR(m.totalCost) : '—'}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {m.entriesWithKmpl.length} entr{m.entriesWithKmpl.length !== 1 ? 'ies' : 'y'} · avg ₹{m.avgRate}/L
          </p>
        </div>
      </div>

      {/* ── Alert Messages ── */}
      {m.alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {m.alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                a.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <FiAlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
              <p className={`text-sm font-medium ${a.severity === 'critical' ? 'text-red-700' : 'text-yellow-700'}`}>
                {a.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Bill Validation Warning ── */}
      {m.missingBills.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border bg-amber-50 border-amber-200">
          <FiAlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-amber-700">
            {m.missingBills.length} fuel entr{m.missingBills.length > 1 ? 'ies are' : 'y is'} missing uploaded bills.
            Entries on: {m.missingBills.map(e => e.date ? new Date(e.date).toLocaleDateString('en-IN') : '—').join(', ')}
          </p>
        </div>
      )}

      {/* ── Fuel Entries Table (with per-entry KMPL) ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fuel Entries</p>
          <span className="text-xs text-slate-400">{m.entriesWithKmpl.length} entries</span>
        </div>

        {m.entriesWithKmpl.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <FiDroplet className="w-8 h-8 opacity-30" />
            <p className="text-sm">No fuel entries for this trip</p>
            <button
              onClick={() => setAddOpen(true)}
              className="mt-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
            >
              <FiPlus className="w-3 h-3" /> Add First Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Date', 'Qty (L)', 'Rate (₹/L)', 'Total Cost', 'Distance', 'KMPL', 'Vendor', 'Location', 'Bills'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {m.entriesWithKmpl.map(e => {
                  let files = [];
                  try { files = JSON.parse(e.receipt_files || '[]'); } catch {}
                  const kmplLow = e.entryKmpl !== null && m.expectedMileage > 0 && e.entryKmpl < m.expectedMileage * 0.9;

                  return (
                    <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {e.date ? new Date(e.date).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-700 whitespace-nowrap">{Number(e.quantity)} L</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">₹{Number(e.rate || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700 whitespace-nowrap">{INR(e.total_cost || 0)}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {e.entryDist > 0 ? `${e.entryDist} km` : '—'}
                      </td>
                      {/* Per-entry KMPL = entry distance / entry qty */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {e.entryKmpl !== null ? (
                          <div className="flex items-center gap-1">
                            {kmplLow
                              ? <FiTrendingDown className="w-3 h-3 text-red-400" />
                              : <FiTrendingUp className="w-3 h-3 text-green-400" />
                            }
                            <span className={`font-bold text-xs ${kmplLow ? 'text-red-600' : 'text-slate-700'}`}>
                              {e.entryKmpl}
                            </span>
                          </div>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{e.vendor || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{e.location || '—'}</td>
                      {/* Bills per entry */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {files.length > 0 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">{files.length}</span>
                        ) : (
                          <span title="No bill uploaded">
                            <FiAlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals footer */}
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Total</td>
                  <td className="px-4 py-3 font-black text-blue-700">{m.actualFuel} L</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">avg ₹{m.avgRate}</td>
                  <td className="px-4 py-3 font-black text-emerald-700">{INR(m.totalCost)}</td>
                  <td className="px-4 py-3 text-slate-600">{m.distance > 0 ? `${m.distance} km` : '—'}</td>
                  <td className="px-4 py-3 font-black text-slate-700">
                    {m.actualMileage > 0 ? (
                      <div className="flex items-center gap-1">
                        {mileageLow ? <FiTrendingDown className="w-3 h-3 text-red-400" /> : <FiTrendingUp className="w-3 h-3 text-green-400" />}
                        <span className={mileageLow ? 'text-red-600' : 'text-slate-700'}>{m.actualMileage} KMPL</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td colSpan="3" className="px-4 py-3 text-xs text-slate-400">{m.vendors.join(', ') || '—'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Vendors + Bills ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* All vendors */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Vendors Used</p>
          {m.vendors.length === 0 ? (
            <p className="text-sm text-slate-400">No vendors recorded</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {m.vendors.map(v => (
                <span key={v} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold">
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bills */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Uploaded Bills
              <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">{m.billCount}</span>
            </p>
            {m.missingBills.length > 0 && (
              <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                <FiAlertTriangle className="w-3 h-3" /> {m.missingBills.length} missing
              </span>
            )}
          </div>
          {m.billCount === 0 ? (
            <p className="text-sm text-slate-400">No bills uploaded</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {m.entriesWithKmpl.map(e => {
                let files = [];
                try { files = JSON.parse(e.receipt_files || '[]'); } catch {}
                return files.map((f, i) => (
                  <div key={`${e.id}-${i}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                    <FiFileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{f}</span>
                  </div>
                ));
              })}
            </div>
          )}
        </div>
      </div>

      <AddFuelEntry
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        onSave={() => { setAddOpen(false); fetchData(); }}
      />
    </div>
  );
}
