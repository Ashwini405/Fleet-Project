import React, { useEffect, useState } from 'react';
import { BarChart3, Loader2, RefreshCw } from 'lucide-react';

const API = 'http://localhost:5001/api/inventory/workflow';
const REPORTS = [
  ['inventory', 'Current Inventory', ['part_name', 'category', 'current_stock', 'stock_value']],
  ['installed', 'Vehicle Installed Parts', ['vehicle_no', 'item_name', 'quantity', 'condition_status']],
  ['warrantyExpiring', 'Warranty Expiring', ['warranty_number', 'item_title', 'vehicle_no', 'end_date', 'warranty_status']],
  ['damaged', 'Damaged Inventory', ['vehicle_number', 'part_id', 'quantity', 'reason', 'created_at']],
  ['claims', 'Warranty Claims', ['vehicle_number', 'vendor', 'quantity', 'claim_status', 'created_at']],
  ['vendorPerformance', 'Vendor Performance', ['vendor', 'total_cost', 'cost_entries']],
  ['movements', 'Stock Movement History', ['movement_type', 'event_type', 'quantity', 'reference_number', 'movement_date']],
  ['lifecycle', 'Vehicle Lifecycle History', ['vehicle_inventory_id', 'event_type', 'event_date', 'condition_status', 'reason']],
];

function label(key) { return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function value(row, key) {
  const raw = row[key];
  if (raw === null || raw === undefined || raw === '') return '—';
  if (key.includes('cost') || key === 'stock_value' || key === 'amount') return `₹${Number(raw).toLocaleString('en-IN')}`;
  return String(raw);
}

export default function InventoryReports() {
  const [reportData, setReportData] = useState(null);
  const [active, setActive] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/reports`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load reports.');
      setReportData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const current = REPORTS.find(([key]) => key === active) || REPORTS[0];
  const rows = reportData?.[current[0]] || [];

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Parts & Inventory</p>
          <h2 className="text-lg font-bold text-slate-800">Inventory Reports</h2>
        </div>
        <button onClick={load} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {REPORTS.map(([key, title]) => (
          <button key={key} onClick={() => setActive(key)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${active === key ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {title}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <BarChart3 className="h-4 w-4 text-violet-600" />
          <h3 className="text-sm font-bold text-slate-800">{current[1]}</h3>
          {!loading && <span className="ml-auto text-xs text-slate-400">{rows.length} records</span>}
        </div>
        {loading ? (
          <div className="py-16 text-center"><Loader2 className="h-5 w-5 mx-auto animate-spin text-violet-500" /></div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-500">{error}</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">{current[2].map(key => <th key={key} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{label(key)}</th>)}</tr></thead>
              <tbody>{rows.map((row, index) => <tr key={row.id || index} className="border-b border-slate-50 hover:bg-slate-50/60">{current[2].map(key => <td key={key} className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{value(row, key)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
