import React, { useState, useEffect, useMemo } from 'react';
import {
  FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiCheckCircle,
  FiDroplet, FiDollarSign, FiActivity, FiTruck, FiPlus,
  FiSearch, FiChevronRight, FiFilter
} from 'react-icons/fi';
import AddFuelEntry from './AddFuelEntry';
import TripFuelOverview from './TripFuelOverview';

const INR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmt2 = (n) => +Number(n).toFixed(2);
const fmt1 = (n) => +Number(n).toFixed(1);

// ─── Status logic (based on mileage ratio + fuel overrun) ────────────────────
// critical : actualMileage < 75% of expected  OR  fuelVariance > 20% of expected
// warning  : actualMileage 75–90% of expected OR  fuelVariance 10–20% of expected
// no-fuel  : trip exists but zero fuel entries
// normal   : everything within range
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
  normal:   { label: 'Normal',   cls: 'bg-green-50 text-green-700 border-green-200',    dot: 'bg-green-500' },
  warning:  { label: 'Warning',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  critical: { label: 'Critical', cls: 'bg-red-50 text-red-700 border-red-200',          dot: 'bg-red-500' },
  'no-fuel':{ label: 'No Fuel',  cls: 'bg-slate-50 text-slate-500 border-slate-200',    dot: 'bg-slate-300' },
};

function Card({ icon, label, value, sub, accent, valueClass = '' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-2xl font-black leading-tight ${valueClass || 'text-slate-800'}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function FuelDashboard() {
  const [entries, setEntries]       = useState([]);
  const [trips, setTrips]           = useState([]);
  const [isLoading, setLoading]     = useState(true);
  const [isAddOpen, setAddOpen]     = useState(false);
  const [selectedTrip, setSelected] = useState(null);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [vehicleFilter, setVehicle] = useState('all');
  const [dateFilter, setDate]       = useState('all');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:5001/api/fuel').then(r => r.json()),
      fetch('http://localhost:5001/api/trips').then(r => r.json()),
    ])
      .then(([fuelRes, tripRes]) => {
        if (fuelRes.success) setEntries(fuelRes.data);
        if (tripRes.success) setTrips(tripRes.data);
      })
      .catch(err => console.error('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // ─── Build one row per trip ───────────────────────────────────────────────
  const tripRows = useMemo(() => {
    const byTrip = {};
    entries.forEach(e => {
      const tid = e.trip_id || '__none__';
      if (!byTrip[tid]) byTrip[tid] = [];
      byTrip[tid].push(e);
    });

    return trips.map(t => {
      const distance        = Number(t.distance || t.est_distance || 0);
      const expectedMileage = Number(t.expected_mileage || 0);
      const tripEntries     = byTrip[t.trip_id] || [];

      // ── Fuel validation: skip entries with qty <= 0 ──
      const validEntries = tripEntries.filter(e => Number(e.quantity || 0) > 0);

      const actualFuel  = validEntries.reduce((s, e) => s + Number(e.quantity), 0);
      const totalCost   = validEntries.reduce((s, e) => s + Number(e.total_cost || 0), 0);

      // expectedFuel = distance / expectedMileage  (from trip plan)
      const expectedFuel  = distance > 0 && expectedMileage > 0 ? distance / expectedMileage : 0;

      // actualMileage = distance / actualFuel  (safe divide)
      const actualMileage = actualFuel > 0 && distance > 0 ? distance / actualFuel : 0;

      // overFuel = actualFuel - expectedFuel  (+ve = over-consumed)
      const overFuel = actualFuel > 0 && expectedFuel > 0 ? actualFuel - expectedFuel : null;

      // mileageVariance = actualMileage - expectedMileage
      const mileageVariance = actualMileage > 0 && expectedMileage > 0
        ? actualMileage - expectedMileage : null;

      // unique vendors — per entry, not per trip
      const vendors = [...new Set(validEntries.map(e => e.vendor).filter(Boolean))];

      // bill count — validate JSON parse
      const billCount = validEntries.reduce((s, e) => {
        try { return s + JSON.parse(e.receipt_files || '[]').length; } catch { return s; }
      }, 0);

      // ── Bill validation: flag entries missing bills ──
      const missingBills = validEntries.filter(e => {
        try { return JSON.parse(e.receipt_files || '[]').length === 0; } catch { return true; }
      }).length;

      const status = calcStatus(actualMileage, expectedMileage, actualFuel, expectedFuel);

      return {
        tripId:          t.trip_id,
        vehicle:         t.truck_no || t.vehicle_no || '',
        route:           `${t.source || '—'} → ${t.destination || '—'}`,
        source:          t.source || '',
        destination:     t.destination || '',
        driver:          t.driver_name || '—',
        distance,
        expectedMileage: fmt2(expectedMileage),
        expectedFuel:    fmt1(expectedFuel),
        actualFuel:      fmt1(actualFuel),
        totalCost,
        actualMileage:   fmt2(actualMileage),
        overFuel:        overFuel !== null ? fmt1(overFuel) : null,
        mileageVariance: mileageVariance !== null ? fmt2(mileageVariance) : null,
        vendors,
        billCount,
        missingBills,
        entryCount:      validEntries.length,
        status,
        tripStatus:      t.status || '',
        rawDate:         t.start_date || t.created_at || '',
      };
    });
  }, [entries, trips]);

  // ─── Fleet summary cards — only trips WITH fuel ───────────────────────────
  // avgMileage = totalDistanceOfFueledTrips / totalActualFuel  (correct formula)
  const fleet = useMemo(() => {
    const fueledTrips = tripRows.filter(t => t.actualFuel > 0);
    const totalFuel   = fueledTrips.reduce((s, t) => s + t.actualFuel, 0);
    const totalCost   = fueledTrips.reduce((s, t) => s + t.totalCost, 0);
    const totalDist   = fueledTrips.reduce((s, t) => s + t.distance, 0);
    // correct avg: total distance of fueled trips / total fuel (not sum of per-trip KMPLs)
    const avgMileage  = totalFuel > 0 ? totalDist / totalFuel : 0;
    const alertCount  = fueledTrips.filter(t => t.status !== 'normal').length;
    const noFuelCount = tripRows.filter(t => t.status === 'no-fuel').length;
    return { totalFuel: fmt1(totalFuel), totalCost, avgMileage: fmt2(avgMileage), activeTrips: fueledTrips.length, alertCount, noFuelCount };
  }, [tripRows]);

  // ─── Unique vehicles for filter dropdown ─────────────────────────────────
  const uniqueVehicles = useMemo(() =>
    ['all', ...new Set(tripRows.map(t => t.vehicle).filter(Boolean))],
    [tripRows]
  );

  // ─── Filtered rows ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const now = new Date();
    return tripRows.filter(t => {
      if (search && !(
        t.tripId.toLowerCase().includes(q) ||
        t.vehicle.toLowerCase().includes(q) ||
        t.driver.toLowerCase().includes(q) ||
        t.route.toLowerCase().includes(q)
      )) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (vehicleFilter !== 'all' && t.vehicle !== vehicleFilter) return false;
      if (dateFilter !== 'all' && t.rawDate) {
        const d = new Date(t.rawDate);
        if (dateFilter === 'today') {
          if (d.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === 'week') {
          const w = new Date(now); w.setDate(now.getDate() - 7);
          if (d < w) return false;
        } else if (dateFilter === 'month') {
          if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
        }
      }
      return true;
    });
  }, [tripRows, search, statusFilter, vehicleFilter, dateFilter]);

  // ─── Drill-down ───────────────────────────────────────────────────────────
  if (selectedTrip) {
    return (
      <TripFuelOverview
        tripId={selectedTrip}
        onBack={() => { setSelected(null); fetchData(); }}
      />
    );
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">Fuel Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Trip-wise fuel summary · click any row to drill down</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
        >
          <FiPlus className="w-4 h-4" /> New Fuel Entry
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          icon={<FiDroplet className="w-5 h-5 text-blue-600" />}
          label="Total Fuel Used" accent="bg-blue-50"
          value={`${fleet.totalFuel} L`}
          sub="Sum of valid entries only"
        />
        <Card
          icon={<FiDollarSign className="w-5 h-5 text-emerald-600" />}
          label="Total Fuel Cost" accent="bg-emerald-50"
          value={INR(fleet.totalCost)}
          sub="Sum of all amounts"
        />
        <Card
          icon={<FiActivity className="w-5 h-5 text-amber-600" />}
          label="Fleet Avg Mileage" accent="bg-amber-50"
          value={fleet.avgMileage > 0 ? `${fleet.avgMileage} KMPL` : '—'}
          sub="Total dist ÷ total fuel (fueled trips)"
        />
        <Card
          icon={<FiTruck className="w-5 h-5 text-indigo-600" />}
          label="Trips w/ Fuel" accent="bg-indigo-50"
          value={fleet.activeTrips}
          sub={`${fleet.alertCount} alert${fleet.alertCount !== 1 ? 's' : ''} · ${fleet.noFuelCount} no-fuel`}
        />
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text" placeholder="Trip, vehicle, driver, route…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none transition"
          />
        </div>

        {/* Vehicle filter */}
        <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
          <FiFilter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={vehicleFilter} onChange={e => setVehicle(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer"
          >
            {uniqueVehicles.map(v => <option key={v} value={v}>{v === 'all' ? 'All Vehicles' : v}</option>)}
          </select>
        </div>

        {/* Date filter */}
        <select
          value={dateFilter} onChange={e => setDate(e.target.value)}
          className="px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg bg-slate-50 outline-none cursor-pointer"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        {/* Status pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'normal', 'warning', 'critical', 'no-fuel'].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? 'All' : s === 'no-fuel' ? 'No Fuel' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 ml-auto">{filtered.length} trips</span>
      </div>

      {/* ── Trip-wise Table ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  'Vehicle', 'Trip ID', 'Route', 'Driver', 'Distance',
                  'Exp Fuel', 'Act Fuel', 'Over Fuel',
                  'Total Cost', 'Act KMPL', 'Exp KMPL', 'Variance',
                  'Vendors', 'Bills', 'Status', '',
                ].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="16" className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <FiDroplet className="w-10 h-10 opacity-30" />
                      <p className="text-sm font-medium">No trips match your filters</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(t => {
                const sc         = STATUS_CFG[t.status];
                const overFuelBad = t.overFuel !== null && t.overFuel > 0;
                const mileageLow  = t.mileageVariance !== null && t.mileageVariance < 0;
                const noFuel      = t.status === 'no-fuel';

                return (
                  <tr
                    key={t.tripId}
                    onClick={() => setSelected(t.tripId)}
                    className={`cursor-pointer transition-colors hover:bg-indigo-50/30 ${
                      t.status === 'critical' ? 'bg-red-50/20' :
                      t.status === 'warning'  ? 'bg-yellow-50/20' :
                      t.status === 'no-fuel'  ? 'bg-slate-50/60' : ''
                    }`}
                  >
                    {/* Vehicle */}
                    <td className="px-3 py-3.5 font-bold text-slate-800 whitespace-nowrap">{t.vehicle || '—'}</td>

                    {/* Trip ID */}
                    <td className="px-3 py-3.5 font-bold text-indigo-600 text-xs whitespace-nowrap">{t.tripId}</td>

                    {/* Route */}
                    <td className="px-3 py-3.5 text-slate-500 text-xs max-w-[150px]">
                      <span className="block truncate">{t.route}</span>
                    </td>

                    {/* Driver */}
                    <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap">{t.driver}</td>

                    {/* Distance */}
                    <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap">{t.distance > 0 ? `${t.distance} km` : '—'}</td>

                    {/* Expected Fuel = distance / expectedMileage */}
                    <td className="px-3 py-3.5 text-slate-500 whitespace-nowrap">
                      {t.expectedFuel > 0 ? `${t.expectedFuel} L` : '—'}
                    </td>

                    {/* Actual Fuel = SUM of valid entries */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {noFuel
                        ? <span className="text-slate-300 text-xs italic">No entries</span>
                        : <span className="font-bold text-slate-800">{t.actualFuel} L</span>
                      }
                    </td>

                    {/* Over Fuel = actualFuel - expectedFuel */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {t.overFuel !== null ? (
                        <span className={`font-bold text-xs ${overFuelBad ? 'text-red-600' : 'text-green-600'}`}>
                          {overFuelBad ? '+' : ''}{t.overFuel} L
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>

                    {/* Total Cost */}
                    <td className="px-3 py-3.5 font-bold text-emerald-700 whitespace-nowrap">
                      {t.totalCost > 0 ? INR(t.totalCost) : <span className="text-slate-300 font-normal text-xs">—</span>}
                    </td>

                    {/* Actual KMPL = distance / actualFuel */}
                    <td className="px-3 py-3.5 font-bold whitespace-nowrap">
                      {t.actualMileage > 0
                        ? <span className={mileageLow ? 'text-red-600' : 'text-slate-800'}>{t.actualMileage}</span>
                        : <span className="text-slate-300 font-normal text-xs">—</span>
                      }
                    </td>

                    {/* Expected KMPL — from trip plan */}
                    <td className="px-3 py-3.5 text-slate-500 whitespace-nowrap">
                      {t.expectedMileage > 0 ? t.expectedMileage : '—'}
                    </td>

                    {/* Mileage Variance = actual - expected */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {t.mileageVariance !== null ? (
                        <div className="flex items-center gap-1">
                          {mileageLow
                            ? <FiTrendingDown className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                            : <FiTrendingUp className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          }
                          <span className={`font-bold text-xs ${mileageLow ? 'text-red-600' : 'text-green-600'}`}>
                            {t.mileageVariance > 0 ? '+' : ''}{t.mileageVariance}
                          </span>
                        </div>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>

                    {/* Vendors — all unique vendors, comma separated */}
                    <td className="px-3 py-3.5 text-xs text-slate-500 max-w-[130px]">
                      {t.vendors.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {t.vendors.map(v => (
                            <span key={v} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium whitespace-nowrap">
                              {v}
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </td>

                    {/* Bills — count + missing bill warning */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {t.billCount > 0
                          ? <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{t.billCount}</span>
                          : <span className="text-slate-300 text-xs">—</span>
                        }
                        {t.missingBills > 0 && (
                          <span title={`${t.missingBills} entr${t.missingBills > 1 ? 'ies' : 'y'} missing bill`}>
                            <FiAlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </td>

                    {/* Chevron */}
                    <td className="px-3 py-3.5">
                      <FiChevronRight className="w-4 h-4 text-slate-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer totals */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <span className="font-bold text-slate-600 uppercase tracking-wide">Totals</span>
            <span>Trips: <strong className="text-slate-800">{filtered.length}</strong></span>
            <span>Fuel: <strong className="text-slate-800">{fmt1(filtered.reduce((s, t) => s + t.actualFuel, 0))} L</strong></span>
            <span>Cost: <strong className="text-emerald-700">{INR(filtered.reduce((s, t) => s + t.totalCost, 0))}</strong></span>
            <span>Over Fuel: <strong className="text-red-600">{fmt1(filtered.reduce((s, t) => s + (t.overFuel > 0 ? t.overFuel : 0), 0))} L</strong></span>
            <span>Alerts: <strong className="text-red-600">{filtered.filter(t => t.status === 'critical' || t.status === 'warning').length}</strong></span>
            <span>No Fuel: <strong className="text-slate-500">{filtered.filter(t => t.status === 'no-fuel').length}</strong></span>
          </div>
        )}
      </div>

      <AddFuelEntry
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        onSave={() => { setAddOpen(false); fetchData(); }}
      />
    </div>
  );
}
