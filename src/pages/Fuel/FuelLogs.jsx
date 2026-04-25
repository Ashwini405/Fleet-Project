import React, { useState, useMemo, useEffect } from 'react';
import {
  FiChevronDown, FiChevronUp, FiPlus, FiDownload,
  FiTruck, FiMapPin, FiAlertTriangle, FiCheckCircle,
  FiDroplet, FiSearch, FiFilter
} from 'react-icons/fi';
import AddFuelEntry from './AddFuelEntry';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const INR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const statusCfg = {
  Active: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
  Completed: { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
  Delayed: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
  Planned: { dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
};

function mileageAlert(actualMileage, expectedMileage) {
  if (actualMileage === 0) return null;
  if (actualMileage < expectedMileage * 0.75)
    return { label: 'Low Mileage', color: 'text-red-600 bg-red-50 border-red-200' };
  if (actualMileage < expectedMileage * 0.90)
    return { label: 'Below Expected', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
  return null;
}

// ─── FuelTable ────────────────────────────────────────────────────────────────
function FuelTable({ entries, onAddEntry, locked }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
        <FiDroplet className="w-8 h-8 opacity-30" />
        <p className="text-sm font-medium">No fuel entries yet</p>
        {!locked && (
          <button
            onClick={onAddEntry}
            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
          >
            <FiPlus className="w-3 h-3" /> Add First Entry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {['Date', 'Liters (L)', 'Rate (₹/L)', 'Total Amount', 'Vendor', 'Added By'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {entries.map(e => (
            <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-3 text-slate-600 font-medium text-xs">{e.date}</td>
              <td className="px-4 py-3 font-bold text-slate-800">{Number(e.liters).toFixed(2)} L</td>
              <td className="px-4 py-3 text-slate-600">₹{Number(e.rate).toFixed(2)}</td>
              <td className="px-4 py-3 font-bold text-emerald-700">{INR(Number(e.amount))}</td>
              <td className="px-4 py-3 text-slate-600">{e.vendor}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">{e.addedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── TripCard ─────────────────────────────────────────────────────────────────
function TripCard({ trip, onAddEntry }) {
  const [open, setOpen] = useState(true);
  const locked = trip.status === 'Closed' || trip.status === 'Completed';

  const totalFuel = trip.entries.reduce(
    (s, e) => s + Number(e.liters || 0),
    0
  );
  const totalCost = trip.entries.reduce(
    (s, e) => s + Number(e.amount || 0),
    0
  );
  const avgMileage =
    totalFuel > 0
      ? (Number(trip.distance) / Number(totalFuel)).toFixed(2)
      : 0;
  const alert = mileageAlert(+avgMileage, trip.expectedMileage);
  const cfg = statusCfg[trip.status] || statusCfg.Planned;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ── Card Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <FiTruck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm font-bold text-slate-900">{trip.tripId}</span>
              <span className="text-xs font-semibold text-slate-500">{trip.vehicle}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {trip.status}
              </span>
              {alert && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${alert.color}`}>
                  <FiAlertTriangle className="w-2.5 h-2.5" />
                  {alert.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
              <FiMapPin className="w-3 h-3 flex-shrink-0" />
              <span>{trip.source}</span>
              <span className="text-slate-300">→</span>
              <span>{trip.destination}</span>
              <span className="text-slate-300 mx-1">·</span>
              <span>{trip.driver}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          {trip.entries.length > 0 ? (
            <>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Fuel</span>
                <span className="text-sm font-bold text-slate-800">{totalFuel.toFixed(2)} L</span>
              </div>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Cost</span>
                <span className="text-sm font-bold text-emerald-700">{INR(totalCost.toFixed(0))}</span>
              </div>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Mileage</span>
                <span className={`text-sm font-bold ${alert ? 'text-red-600' : 'text-slate-800'}`}>
                  {avgMileage} km/L
                </span>
              </div>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic hidden sm:block">No entries</span>
          )}
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center ml-1">
            {open ? <FiChevronUp className="w-4 h-4 text-slate-500" /> : <FiChevronDown className="w-4 h-4 text-slate-500" />}
          </div>
        </div>
      </div>

      {open && (
        <>
          <div className="border-t border-slate-100">
            <FuelTable entries={trip.entries} onAddEntry={() => onAddEntry(trip)} locked={locked} />
          </div>
          {trip.entries.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50/60 border-t border-slate-100">
              <div className="flex items-center gap-5 text-xs">
                <span className="text-slate-500">
                  Total Fuel: <strong className="text-slate-800">{totalFuel.toFixed(2)} L</strong>
                </span>
                <span className="text-slate-500">
                  Total Cost: <strong className="text-emerald-700">{INR(totalCost.toFixed(0))}</strong>
                </span>
                <span className="text-slate-500">
                  Avg Mileage:{' '}
                  <strong className={alert ? 'text-red-600' : 'text-slate-800'}>
                    {avgMileage} km/L
                  </strong>
                  {!alert && avgMileage > 0 && <FiCheckCircle className="inline w-3 h-3 text-green-500 ml-1" />}
                </span>
              </div>
              {locked ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed">
                  🔒 Locked
                </span>
              ) : (
                <button
                  onClick={() => onAddEntry(trip)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
                >
                  <FiPlus className="w-3 h-3" /> Add Fuel Entry
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main FuelLogs (fully dynamic, with all fixes) ───────────────────────────
export default function FuelLogs() {
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicle] = useState('all');
  const [statusFilter, setStatus] = useState('all');
  const [isAddModalOpen, setAddModal] = useState(false);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);   // 🔥 ADD THIS

  const refreshData = async () => {
    try {
      const tripsRes = await fetch('http://localhost:5001/api/trips');
      const tripsData = await tripsRes.json();
      if (tripsData.success) {
        const tripsWithFuel = await Promise.all(
          tripsData.data.map(async (trip) => {
            const fuelRes = await fetch(`http://localhost:5001/api/fuel/trip/${trip.id}`);
            const fuelData = await fuelRes.json();
            return {
              id: trip.id,                    // 🔥 ADD THIS (MOST IMPORTANT)
              tripId: trip.trip_id,           // display
              vehicle: trip.truck_no,
              vehicle_id: trip.vehicle_id,    // 🔥 ADD THIS
              driver: trip.driver_name,
              status: trip.trip_status,
              source: trip.source,
              destination: trip.destination,
              distance: Number(trip.est_distance || 0),             // ✅ FIX
              expectedMileage: Number(trip.expected_mileage || 0),  // ✅ FIX

              entries: fuelData.success
                ? fuelData.data.map(f => ({
                  id: f.id,
                  date: new Date(f.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }),
                  liters: Number(f.quantity || 0),        // ✅ FIX
                  rate: Number(f.rate || 0),
                  amount: Number(f.total_cost || 0),      // ✅ FIX
                  vendor: f.vendor,
                  addedBy: f.supervisor_name || '—'       // ✅ works after backend fix
                }))
                : []
            };
          })
        );
        setTrips(tripsWithFuel);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const vehicles = useMemo(() => ['all', ...new Set(trips.map(t => t.vehicle))], [trips]);
  const statuses = ['all', 'Active', 'Completed', 'Delayed', 'Planned'];

  const filtered = useMemo(() => {
    return trips.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        t.tripId.toLowerCase().includes(q) ||
        t.vehicle.toLowerCase().includes(q) ||
        t.driver.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q);
      const matchVehicle = vehicleFilter === 'all' || t.vehicle === vehicleFilter;
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchVehicle && matchStatus;
    });
  }, [search, vehicleFilter, statusFilter, trips]);

  const handleAddEntry = () => setAddModal(true);

  const handleExport = () => {
    const rows = [['Trip ID', 'Vehicle', 'Driver', 'Date', 'Liters', 'Rate', 'Amount', 'Vendor', 'Added By']];
    trips.forEach(t =>
      t.entries.forEach(e =>
        rows.push([t.tripId, t.vehicle, t.driver, e.date, e.liters, e.rate, e.amount, e.vendor, e.addedBy])
      )
    );
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fuel-by-trip.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Top Bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search trip, vehicle, driver…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 outline-none w-56 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <FiFilter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={vehicleFilter}
              onChange={e => setVehicle(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            >
              {vehicles.map(v => <option key={v} value={v}>{v === 'all' ? 'All Vehicles' : v}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <select
              value={statusFilter}
              onChange={e => setStatus(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <FiDownload className="w-4 h-4" /> Export CSV


          </button>
        </div>
      </div>

      {/* ── Trip Cards ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 text-slate-400 gap-3">
          <FiDroplet className="w-10 h-10 opacity-30" />
          <p className="text-sm font-medium">No trips match your filters</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(trip => (
            <TripCard
              key={trip.tripId}
              trip={trip}
              onAddEntry={(trip) => {
                setSelectedTrip(trip);   // 🔥 SET SELECTED TRIP
                setAddModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* ── AddFuelEntry Modal (refreshes after save) ── */}
      <AddFuelEntry
        isOpen={isAddModalOpen}
        onClose={() => setAddModal(false)}
        onSave={() => {
          setAddModal(false);
          refreshData();
        }}
        trip={selectedTrip}
      />

      {/* ── Footer summary ── */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex flex-wrap items-center gap-6 text-xs text-slate-500">
          <span className="font-bold text-slate-700 uppercase tracking-wide">Fleet Summary</span>
          <span>
            Trips: <strong className="text-slate-800">{filtered.length}</strong>
          </span>
          <span>
            Total Fuel:{' '}
            <strong className="text-slate-800">
              {filtered
                .reduce(
                  (s, t) => s + t.entries.reduce((a, e) => a + Number(e.liters || 0), 0),
                  0
                )
                .toFixed(2)} L
            </strong>
          </span>
          <span>
            Total Cost:{' '}
            <strong className="text-emerald-700">
              {INR(
                filtered
                  .reduce(
                    (s, t) => s + t.entries.reduce((a, e) => a + Number(e.amount || 0), 0),
                    0
                  )
                  .toFixed(0)
              )}
            </strong>
          </span>
          <span>
            Entries:{' '}
            <strong className="text-slate-800">
              {filtered.reduce((s, t) => s + t.entries.length, 0)}
            </strong>
          </span>
        </div>
      )}

    </div>
  );
}