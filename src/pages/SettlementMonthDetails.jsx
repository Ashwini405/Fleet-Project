import React, { useEffect, useState } from 'react';
import { FiTruck, FiDroplet, FiChevronDown, FiChevronUp, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

// Trips of the truck for the whole statement month + its fuel and mileage,
// shown while preparing / approving a driver salary sheet.
const INR = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => {
  const [y, m, day] = String(d || '').split('-');
  return y && m && day ? `${day}-${m}` : '—';
};
const monthLabel = (m) => {
  const [y, mo] = String(m || '').split('-').map(Number);
  return y && mo ? new Date(y, mo - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : m;
};
const STATUS = {
  Closed: 'bg-slate-100 text-slate-600', Completed: 'bg-green-50 text-green-700',
  Started: 'bg-blue-50 text-blue-700', 'In Transit': 'bg-blue-50 text-blue-700',
  Planned: 'bg-amber-50 text-amber-700', Cancelled: 'bg-red-50 text-red-600',
};

function Chip({ label, value, tone = 'text-slate-800' }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
      <p className={`text-sm font-black ${tone}`}>{value}</p>
    </div>
  );
}

export default function SettlementMonthDetails({ vehicleNo, driverId, month, compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTrips, setShowTrips] = useState(!compact);
  const [showFuel, setShowFuel] = useState(false);

  useEffect(() => {
    if (!vehicleNo || !month) { setData(null); return; }
    let cancelled = false;
    setLoading(true); setError('');
    const qs = new URLSearchParams({ vehicle_no: vehicleNo, month, ...(driverId ? { driver_id: driverId } : {}) });
    fetch(`http://localhost:5001/api/driver-settlements/month-details?${qs}`)
      .then(r => r.json())
      .then(d => { if (cancelled) return; if (d.success) setData(d.data); else setError(d.message || 'Could not load month details'); })
      .catch(() => !cancelled && setError('Could not load month details'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [vehicleNo, driverId, month]);

  if (!vehicleNo || !month) return null;
  if (loading && !data) return <div className="bg-white rounded-xl border border-slate-200 p-5 text-sm text-slate-400">Loading trips and fuel for {monthLabel(month)}…</div>;
  if (error) return <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-sm text-red-600">{error}</div>;
  if (!data) return null;

  const s = data.summary;
  const mileageLow = s.expected_mileage > 0 && s.avg_mileage > 0 && s.avg_mileage < s.expected_mileage;
  const cardCls = compact ? 'rounded-xl border border-slate-200 overflow-hidden' : 'bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden';

  return (
    <div className="space-y-4">
      {/* ── Trips of the month ── */}
      <div className={cardCls}>
        {!compact && <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />}
        <button type="button" onClick={() => setShowTrips(v => !v)}
          className="w-full px-4 sm:px-5 pt-4 pb-3 flex items-center gap-2 text-left">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0"><FiTruck className="w-4 h-4 text-violet-500" /></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-slate-800">Trips in {monthLabel(month)}</h2>
            <p className="text-[11px] text-slate-400 truncate">{vehicleNo} · all trips of the truck, plus the driver's trips on other trucks</p>
          </div>
          {showTrips ? <FiChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <FiChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
        </button>
        <div className="px-4 sm:px-5 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Chip label="Trips on truck" value={s.truck_trips} />
          <Chip label="Counted for battha" value={s.counted_trips} tone="text-indigo-700" />
          <Chip label="By other driver" value={s.other_driver_trips} tone={s.other_driver_trips ? 'text-amber-600' : 'text-slate-800'} />
          <Chip label="Planned KM" value={`${s.planned_km.toLocaleString('en-IN')} km`} />
        </div>
        {showTrips && (
          <div className="border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50">
                  {['Date', 'Trip', 'Route', 'Driver', 'Status', 'KM', 'Driver Adv.', 'Battha'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.trips.map(t => (
                  <tr key={t.id} className={t.counted ? '' : 'bg-slate-50/60'}>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{fmtDate(t.trip_date)}</td>
                    <td className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap">
                      {t.trip_id}
                      {!t.on_this_truck && <span className="ml-1 text-[10px] font-semibold text-slate-400">({t.truck_no})</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-600 min-w-[140px]">{t.source || '—'} → {t.destination || '—'}</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{t.driver_name || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${STATUS[t.trip_status] || 'bg-slate-100 text-slate-600'}`}>{t.trip_status}</span></td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{t.est_distance ? t.est_distance.toLocaleString('en-IN') : '—'}</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{t.driver_advance ? INR(t.driver_advance) : '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {t.counted
                        ? <span className="inline-flex items-center gap-1 font-bold text-indigo-700"><FiCheckCircle className="w-3 h-3" /> Counted</span>
                        : <span className="text-[11px] font-semibold text-slate-400">{t.trip_status === 'Cancelled' ? 'Cancelled' : 'Other driver'}</span>}
                    </td>
                  </tr>
                ))}
                {data.trips.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">No trips for this truck or driver in {monthLabel(month)}.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Fuel & mileage of the month ── */}
      <div className={cardCls}>
        {!compact && <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />}
        <div className="px-4 sm:px-5 pt-4 pb-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0"><FiDroplet className="w-4 h-4 text-cyan-600" /></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-slate-800">Fuel &amp; Mileage — {monthLabel(month)}</h2>
            <p className="text-[11px] text-slate-400 truncate">All fuel filled in {vehicleNo} this month</p>
          </div>
        </div>
        <div className="px-4 sm:px-5 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Chip label="Fuel filled" value={`${s.fuel_litres.toLocaleString('en-IN')} L`} />
          <Chip label="Fuel cost" value={INR(s.fuel_cost)} tone="text-emerald-700" />
          <Chip label="KM run" value={s.km_run ? `${s.km_run.toLocaleString('en-IN')} km` : '—'} />
          <Chip label="Mileage" value={s.avg_mileage ? `${s.avg_mileage} km/L` : '—'} tone={mileageLow ? 'text-red-600' : 'text-slate-800'} />
        </div>
        <div className="px-4 sm:px-5 pb-4 space-y-2 text-xs">
          {s.km_run > 0 && (
            <p className="text-slate-500">Odometer {s.odo_start.toLocaleString('en-IN')} → {s.odo_end.toLocaleString('en-IN')} km · {s.fills} fill{s.fills === 1 ? '' : 's'}
              {s.adblue_litres > 0 && <> · AdBlue {s.adblue_litres} L (not counted in mileage)</>}
            </p>
          )}
          {s.expected_mileage > 0 && s.avg_mileage > 0 && (
            mileageLow ? (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                <FiAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Mileage <strong>{s.avg_mileage} km/L</strong> is below expected <strong>{s.expected_mileage} km/L</strong>.
                  For {s.km_run.toLocaleString('en-IN')} km the truck should have used {s.expected_litres} L —
                  <strong> {s.excess_litres} L extra (≈ {INR(s.excess_value)})</strong>.
                  {!compact && ' If it should be recovered, add it under Other Deductions (fuel shortage).'}
                </span>
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-green-700 font-semibold"><FiCheckCircle className="w-3.5 h-3.5" /> Mileage is at or above expected ({s.expected_mileage} km/L)</p>
            )
          )}
          {s.expected_mileage === 0 && s.avg_mileage > 0 && (
            <p className="text-slate-400">No expected mileage is set for this truck in Vehicle Master, so it can't be compared.</p>
          )}
          {s.fills === 0 && <p className="text-slate-400">No fuel entries for this truck in {monthLabel(month)}.</p>}
        </div>
        {s.fills > 0 && (
          <>
            <button type="button" onClick={() => setShowFuel(v => !v)}
              className="w-full px-4 sm:px-5 py-2 border-t border-slate-100 text-xs font-bold text-indigo-600 hover:bg-slate-50 flex items-center justify-center gap-1">
              {showFuel ? <>Hide fuel entries <FiChevronUp className="w-3.5 h-3.5" /></> : <>Show {s.fills} fuel entr{s.fills === 1 ? 'y' : 'ies'} <FiChevronDown className="w-3.5 h-3.5" /></>}
            </button>
            {showFuel && (
              <div className="border-t border-slate-100 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      {['Date', 'Trip', 'Fuel', 'Litres', 'Rate', 'Amount', 'Odometer', 'KM', 'Mileage', 'Paid By'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.fuel.map(f => (
                      <tr key={f.id}>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{fmtDate(f.date)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{f.trip_code || <span className="text-slate-400">No trip</span>}</td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{f.fuel_type || '—'}</td>
                        <td className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap">{f.quantity} L</td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">₹{f.rate}</td>
                        <td className="px-3 py-2 font-bold text-emerald-700 whitespace-nowrap">{INR(f.total_cost)}</td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{f.current_odo ? Number(f.current_odo).toLocaleString('en-IN') : '—'}</td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{f.distance || '—'}</td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{f.mileage ? `${f.mileage} km/L` : '—'}</td>
                        <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{f.payment_method || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
