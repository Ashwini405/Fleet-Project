import React, { useMemo, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';

function fmt(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const CONDITION_BADGE = {
  Good: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Average: 'bg-amber-50 text-amber-700 border border-amber-200',
  Damaged: 'bg-red-50 text-red-700 border border-red-200',
};

export default function ReturnsHistory({ returns, loading }) {
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [partFilter, setPartFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const vehicles = useMemo(() => Array.from(new Set(returns.map((r) => r.vehicle_number).filter(Boolean))), [returns]);
  const parts = useMemo(() => Array.from(new Set(returns.map((r) => r.part_name).filter(Boolean))), [returns]);

  const filtered = useMemo(() => {
    return returns.filter((r) => {
      if (vehicleFilter !== 'All' && r.vehicle_number !== vehicleFilter) return false;
      if (partFilter !== 'All' && r.part_name !== partFilter) return false;
      if (fromDate && r.return_date < fromDate) return false;
      if (toDate && r.return_date > toDate) return false;
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return [r.part_name, r.vehicle_number, r.condition_on_return]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [returns, vehicleFilter, partFilter, fromDate, toDate, searchTerm]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
        <RotateCcw className="h-4 w-4 text-violet-600" />
        <div>
          <h2 className="text-sm font-bold text-slate-800">Parts Restocked to Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Old/removed parts returned from vehicles back into stock.</p>
        </div>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} records</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 px-5 pt-4 pb-3">
        <label className="block text-xs font-semibold text-slate-500">
          Vehicle
          <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
            <option value="All">All vehicles</option>
            {vehicles.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-500">
          Part
          <select value={partFilter} onChange={(e) => setPartFilter(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
            <option value="All">All parts</option>
            {parts.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-500">
          From date
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>
        <label className="block text-xs font-semibold text-slate-500">
          To date
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>
        <label className="block text-xs font-semibold text-slate-500">
          Search
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Part, vehicle, condition"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
        </label>
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full text-sm min-w-120">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Date</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Part</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Vehicle</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Qty</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Condition</th>
              <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Restocked</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-14 text-center text-xs text-slate-400">Loading returns...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center">
                <RotateCcw className="h-9 w-9 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">No parts returned yet</p>
                <p className="text-xs text-slate-400 mt-1">Use the Return button on Issued Parts History rows to log one.</p>
              </td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{fmt(r.return_date)}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{r.part_name || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{r.vehicle_number || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                      {r.quantity_returned}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${CONDITION_BADGE[r.condition_on_return] || CONDITION_BADGE.Good}`}>
                      {r.condition_on_return}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {r.restocked ? (
                      <span className="text-emerald-600 font-semibold text-xs">Yes</span>
                    ) : (
                      <span className="text-slate-400 text-xs">No</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
