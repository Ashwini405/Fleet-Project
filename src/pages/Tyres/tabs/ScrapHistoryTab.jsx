import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Search, X, Archive, IndianRupee, TrendingUp, Calendar } from 'lucide-react';
import { StickyTable, StickyThead, EmptyState } from '../components/ERPUtils';

const todayStr = () => new Date().toISOString().split('T')[0];
const thisMonth = () => new Date().toISOString().slice(0, 7); // YYYY-MM

export default function ScrapHistoryTab({ records = [] }) {
  const [search, setSearch]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]   = useState('');

  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.tyreNo?.toLowerCase().includes(q) ||
      r.vendorName?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q) ||
      r.make?.toLowerCase().includes(q);
    const matchFrom = !dateFrom || r.scrapDate >= dateFrom;
    const matchTo   = !dateTo   || r.scrapDate <= dateTo;
    return matchSearch && matchFrom && matchTo;
  }), [records, search, dateFrom, dateTo]);

  const totalRevenue   = records.reduce((s, r) => s + (r.saleAmount || 0), 0);
  const monthRevenue   = records
    .filter(r => r.scrapDate?.startsWith(thisMonth()))
    .reduce((s, r) => s + (r.saleAmount || 0), 0);

  const hasFilters = search || dateFrom || dateTo;
  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); };

  return (
    <div className="space-y-4">

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Scrapped',   value: records.length,                 icon: Trash2,       bg: 'bg-slate-800', text: 'text-white',       sub: 'text-slate-400',  iconBg: 'bg-white/10',   iconColor: 'text-white',      border: 'border-slate-700' },
          { label: 'Total Revenue',    value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, bg: 'bg-white', text: 'text-emerald-700', sub: 'text-emerald-400', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', border: 'border-emerald-200', accent: 'border-t-2 border-t-emerald-500' },
          { label: 'This Month',       value: `₹${monthRevenue.toLocaleString()}`, icon: TrendingUp,  bg: 'bg-white', text: 'text-blue-700',    sub: 'text-blue-400',    iconBg: 'bg-blue-100',    iconColor: 'text-blue-600',   border: 'border-blue-200',   accent: 'border-t-2 border-t-blue-500' },
        ].map(card => (
          <motion.div key={card.label}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
            transition={{ duration: 0.18 }}
            className={`${card.bg} ${card.accent || ''} rounded-2xl border ${card.border} shadow-sm p-4 flex items-center gap-3`}>
            <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-xl font-black leading-none ${card.text}`}>{card.value}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${card.sub}`}>{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Scrap History</h2>
        <p className="text-xs text-gray-500 mt-0.5">Complete record of all scrapped tyres and sale transactions</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[180px] max-w-xs relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Tyre No, Vendor, Reason..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 h-[38px] bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="h-[38px] px-3 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all" />
            <span className="text-gray-300 font-bold">–</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="h-[38px] px-3 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all" />
          </div>
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-800 rounded-xl text-sm font-semibold transition-all">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        <StickyTable minWidth="880px">
          <StickyThead>
            <tr className="border-b border-gray-200 bg-slate-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="py-2.5 px-3 whitespace-nowrap">Txn No</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Tyre No</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Brand / Size</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Scrap Buyer</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Scrap Date</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Reason</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Sale Amount</th>
            </tr>
          </StickyThead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7">
                <EmptyState icon={Archive}
                  title={records.length === 0 ? 'No scrap records yet' : 'No records match filters'}
                  subtitle={records.length === 0 ? 'Mark a tyre as scrap from Old Tyres Stock' : undefined} />
              </td></tr>
            ) : filtered.map((rec, idx) => (
              <motion.tr key={rec.id}
                initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`border-b border-gray-100 hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="text-[11px] font-bold text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded">{rec.txnNo}</span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="text-xs font-bold text-slate-800 font-mono">{rec.tyreNo}</span>
                  {rec.vehicleNo && <div className="text-[10px] text-gray-400">{rec.vehicleNo}</div>}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <div className="text-xs font-semibold text-gray-800">{rec.make || '—'}</div>
                  <div className="text-[10px] text-gray-400 font-mono">{rec.tyreSize || ''}</div>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="text-xs font-semibold text-gray-700">{rec.vendorName}</span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="text-[11px] font-medium text-gray-500 tabular-nums">{rec.scrapDate}</span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="text-[11px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">{rec.reason}</span>
                </td>
                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  <span className="text-xs font-bold text-emerald-600 font-mono">₹{(rec.saleAmount || 0).toLocaleString()}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </StickyTable>

        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/40 flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">
              Showing <span className="font-bold text-gray-600">{filtered.length}</span> of{' '}
              <span className="font-bold text-gray-600">{records.length}</span> records
            </p>
            <p className="text-xs font-bold text-emerald-600">
              Total: ₹{filtered.reduce((s, r) => s + (r.saleAmount || 0), 0).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
