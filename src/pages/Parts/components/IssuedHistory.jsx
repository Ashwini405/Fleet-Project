import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Truck, CalendarDays } from 'lucide-react';

export default function IssuedHistory({ history }) {
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [partFilter, setPartFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const vehicles = useMemo(() => Array.from(new Set(history.map((item) => item.vehicleNumber).filter(Boolean))), [history]);
  const parts = useMemo(() => Array.from(new Set(history.map((item) => item.partName).filter(Boolean))), [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((record) => {
      if (vehicleFilter !== 'All' && record.vehicleNumber !== vehicleFilter) return false;
      if (partFilter !== 'All' && record.partName !== partFilter) return false;
      if (fromDate && record.date < fromDate) return false;
      if (toDate && record.date > toDate) return false;
      const search = searchTerm.trim().toLowerCase();
      if (!search) return true;
      return [record.partName, record.vehicleNumber, record.serviceType, record.vendor]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search));
    });
  }, [history, vehicleFilter, partFilter, fromDate, toDate, searchTerm]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <History className="h-5 w-5 text-slate-600" /> Issued Parts History
          </h2>
          <p className="mt-1 text-sm text-slate-500">Track service part consumption, vehicle usage and issue cost.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">{filteredHistory.length} records</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-5">
        <label className="block text-sm font-semibold text-slate-500">
          Vehicle
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="All">All vehicles</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle} value={vehicle}>{vehicle}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-500">
          Part
          <select
            value={partFilter}
            onChange={(e) => setPartFilter(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="All">All parts</option>
            {parts.map((part) => (
              <option key={part} value={part}>{part}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-500">
          Search
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search part, vehicle or vendor"
              className="w-full rounded-3xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mb-5">
        <label className="block text-sm font-semibold text-slate-500">
          From date
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-500">
          To date
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-[0.22em]">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3">Service type</th>
              <th className="px-4 py-3 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <AnimatePresence>
              {filteredHistory.map((record, index) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm text-slate-600">{record.date}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">{record.partName}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{record.vehicleNumber}</td>
                  <td className="px-4 py-4 text-center text-sm font-bold text-slate-900">{record.qty}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{record.serviceType}</td>
                  <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">₹{record.cost.toFixed(2)}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-sm text-slate-400">No issued parts match the filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
