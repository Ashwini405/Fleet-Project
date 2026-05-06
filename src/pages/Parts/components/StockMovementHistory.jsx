import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Clock, Layers } from 'lucide-react';

export default function StockMovementHistory({ movementHistory }) {
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredHistory = useMemo(() => {
    return movementHistory.filter((entry) => typeFilter === 'All' || entry.type === typeFilter);
  }, [movementHistory, typeFilter]);

  const types = ['All', 'Stock In', 'Stock Out', 'Addition'];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Stock Movement History</h2>
          <p className="text-sm text-slate-500">Complete log of stock activity across inventory.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          <ArrowUpDown className="h-4 w-4" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent outline-none"
          >
            {types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Opening</th>
              <th className="px-4 py-3 text-right">Added</th>
              <th className="px-4 py-3 text-right">Used</th>
              <th className="px-4 py-3 text-right">Current</th>
              <th className="px-4 py-3">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.slice(0, 8).map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600">{record.date}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">{record.partName}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{record.type}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-600">{record.openingStock}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-600">{record.added}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-600">{record.used}</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">{record.currentStock}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{record.reference}</td>
              </tr>
            ))}
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-sm text-slate-400">No stock movement entries yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredHistory.length > 8 && (
        <div className="mt-4 text-right text-sm text-slate-500">Showing latest 8 entries</div>
      )}
    </div>
  );
}
