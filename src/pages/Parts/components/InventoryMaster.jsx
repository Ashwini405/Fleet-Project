import React, { useContext, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryContext } from '../../../context/InventoryContext';
import {
  ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Eye, Edit2, ArrowLeftRight, Plus, FileText, Trash2, ChevronLeft, ChevronRight,
  ArrowUpDown, CheckSquare, Square, TrendingUp, TrendingDown, AlertTriangle,
  AlertCircle, MapPin, Building2, Package, Clock, Truck, RefreshCw,
} from 'lucide-react';

const statusStyles = {
  'In Stock':     'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Low Stock':    'bg-amber-100 text-amber-700 border-amber-200',
  'Critical':     'bg-red-100 text-red-700 border-red-200',
  'Out of Stock': 'bg-red-200 text-red-800 border-red-300',
};

const MOVE_STYLE = {
  'Stock In':  { dot: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', sign: '+' },
  'Stock Out': { dot: 'bg-orange-500',  text: 'text-orange-600',  badge: 'bg-orange-50 text-orange-700 border-orange-200',   sign: '-' },
  'Transfer':  { dot: 'bg-blue-500',    text: 'text-blue-600',    badge: 'bg-blue-50 text-blue-700 border-blue-200',          sign: '→' },
  'Addition':  { dot: 'bg-violet-500',  text: 'text-violet-600',  badge: 'bg-violet-50 text-violet-700 border-violet-200',    sign: '+' },
};

function ExpandedRow({ item, movementHistory, issueHistory }) {
  const movements = movementHistory.filter((m) => m.partCode === item.partCode).slice(0, 5);
  const issues    = issueHistory.filter((h) => h.partCode === item.partCode).slice(0, 4);
  const totalUsed = issueHistory.filter((h) => h.partCode === item.partCode).reduce((s, h) => s + Number(h.qty || 0), 0);
  const totalIn   = movementHistory.filter((m) => m.partCode === item.partCode && m.type === 'Stock In').reduce((s, m) => s + Number(m.added || 0), 0);
  const daysToExpiry = item.expiryDate ? Math.ceil((new Date(item.expiryDate) - new Date()) / 86400000) : null;
  const stockPct = item.reorderLevel > 0 ? Math.min(100, Math.round((item.currentStock / (item.reorderLevel * 2)) * 100)) : 100;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
    >
      <td colSpan={11} className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 px-5 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

          {/* A — Stock Movement Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Movements</p>
              <span className="text-[10px] font-bold text-slate-400">{movements.length} recent</span>
            </div>
            {movements.length === 0
              ? <p className="text-xs text-slate-400 italic">No movements recorded.</p>
              : <div className="relative pl-4">
                  <div className="absolute left-1.5 top-0 bottom-0 w-px bg-slate-100" />
                  <div className="space-y-3">
                    {movements.map((m, idx) => {
                      const s = MOVE_STYLE[m.type] || MOVE_STYLE['Addition'];
                      const qty = m.type === 'Stock In' ? m.added : m.type === 'Stock Out' ? m.used : m.added || m.used;
                      return (
                        <motion.div key={m.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="relative">
                          <span className={`absolute -left-[13px] top-1 h-2 w-2 rounded-full border-2 border-white ${s.dot}`} />
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${s.badge}`}>{m.type}</span>
                              <p className="text-[10px] text-slate-400 mt-0.5">{m.date} · {m.user}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-xs font-black ${s.text}`}>{s.sign}{qty}</p>
                              <p className="text-[10px] text-slate-400">→ {m.currentStock}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
            }
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-center">
                <p className="text-xs font-black text-emerald-700">+{totalIn}</p>
                <p className="text-[9px] text-emerald-500">Total In</p>
              </div>
              <div className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-center">
                <p className="text-xs font-black text-orange-700">{totalUsed}</p>
                <p className="text-[9px] text-orange-500">Total Used</p>
              </div>
            </div>
          </div>

          {/* B — Vendor & Service History */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Vendor & Service</p>
            <div className="space-y-1.5 mb-3">
              {[['Preferred Vendor', item.preferredVendor], ['GST', item.gst || '—'], ['Contact', item.vendorContact || '—'], ['Last Purchase', item.lastUpdated || '—']].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-semibold text-slate-700 text-right max-w-[55%] truncate">{v}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Recent Issues</p>
              {issues.length === 0
                ? <p className="text-xs text-slate-400 italic">No service usage yet.</p>
                : <div className="space-y-2">
                    {issues.map((h) => (
                      <div key={h.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{h.vehicleNumber}</p>
                          <p className="text-[10px] text-slate-400">{h.date} · {h.serviceType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-700">×{h.qty}</p>
                          <p className="text-[10px] text-slate-400">₹{Number(h.cost).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>

          {/* C — Inventory Insights */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Inventory Insights</p>
            <div className="space-y-2.5">
              {/* Stock level bar */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500 font-medium">Stock Level</span>
                  <span className={`font-bold ${
                    item.stockStatus === 'In Stock' ? 'text-emerald-600' :
                    item.stockStatus === 'Low Stock' ? 'text-amber-600' : 'text-red-600'
                  }`}>{stockPct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stockPct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      item.stockStatus === 'In Stock' ? 'bg-emerald-500' :
                      item.stockStatus === 'Low Stock' ? 'bg-amber-400' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>

              {/* Alert badges */}
              <div className="space-y-1.5">
                {item.currentStock <= item.reorderLevel && item.currentStock > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5">
                    <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                    <p className="text-[10px] font-semibold text-amber-700">Reorder alert — stock at {item.currentStock} {item.unit}</p>
                  </div>
                )}
                {item.currentStock === 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5">
                    <AlertCircle className="h-3 w-3 text-red-600 shrink-0" />
                    <p className="text-[10px] font-semibold text-red-700">Out of stock — immediate reorder required</p>
                  </div>
                )}
                {daysToExpiry !== null && daysToExpiry <= 90 && daysToExpiry >= 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-orange-50 border border-orange-200 px-2.5 py-1.5">
                    <Clock className="h-3 w-3 text-orange-600 shrink-0" />
                    <p className="text-[10px] font-semibold text-orange-700">Expires in {daysToExpiry} days — {item.expiryDate}</p>
                  </div>
                )}
                {item.currentStock > item.reorderLevel && daysToExpiry === null && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5">
                    <TrendingUp className="h-3 w-3 text-emerald-600 shrink-0" />
                    <p className="text-[10px] font-semibold text-emerald-700">Stock healthy — no alerts</p>
                  </div>
                )}
              </div>

              {/* Usage trend */}
              <div className="pt-1 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium mb-1.5">Usage Summary</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Total Issued', value: totalUsed, unit: item.unit, color: 'text-orange-600' },
                    { label: 'Inv. Value', value: `₹${(item.currentStock * item.costPrice).toLocaleString('en-IN')}`, unit: '', color: 'text-indigo-600' },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label} className="rounded-lg bg-slate-50 px-2 py-1.5">
                      <p className={`text-xs font-black ${color}`}>{value} <span className="text-[9px] font-medium text-slate-400">{unit}</span></p>
                      <p className="text-[9px] text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* D — Warehouse Placement */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Warehouse Placement</p>
            <div className="space-y-2 mb-3">
              {[
                { icon: Building2, label: 'Warehouse', value: item.warehouse },
                { icon: MapPin,    label: 'Rack',      value: item.rack || 'Not assigned' },
                { icon: Package,   label: 'Bin',       value: item.bin  || 'Not assigned' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2">
                  <Icon className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-slate-400 font-medium">{label}</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              {[['Vehicle Type', item.vehicleType], ['Service Interval', item.serviceInterval || '—'], ['Warranty', item.warranty || '—'], ['Last Updated', item.lastUpdated]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-semibold text-slate-700">{v}</span>
                </div>
              ))}
            </div>
            {item.compatibleVehicles?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[9px] text-slate-400 font-medium mb-1.5">Compatible Vehicles</p>
                <div className="flex flex-wrap gap-1">
                  {item.compatibleVehicles.map((v) => (
                    <span key={v} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600">
                      <Truck className="h-2 w-2" />{v}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {item.description && (
              <p className="mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-500 italic leading-relaxed">{item.description}</p>
            )}
          </div>
        </div>
      </td>
    </motion.tr>
  );
}

const PAGE_SIZE = 8;

export default function InventoryMaster({ filteredInventory, onStockIn, onStockOut, onEdit, onView, onDelete }) {
  const { movementHistory, issueHistory, lastAddedId, lastEditedId } = useContext(InventoryContext);
  const [expandedRow, setExpandedRow] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Jump to page 1 when a new item is added so it's immediately visible
  useEffect(() => {
    if (lastAddedId) setPage(1);
  }, [lastAddedId]);

  const sorted = useMemo(() => {
    return [...filteredInventory].sort((a, b) => {
      const av = a[sortKey] ?? ''; const bv = b[sortKey] ?? '';
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [filteredInventory, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => { if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc'); } };
  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === pageData.length ? [] : pageData.map((i) => i.id));

  const SortTh = ({ label, k, className = '' }) => (
    <th className={`px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition ${className}`} onClick={() => toggleSort(k)}>
      <span className="flex items-center gap-1">{label}<ArrowUpDown className="h-3 w-3 text-slate-400" /></span>
    </th>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
        <div>
          <h2 className="text-base font-bold text-slate-900">Inventory Master</h2>
          <p className="text-xs text-slate-500 mt-0.5">{filteredInventory.length} parts · {selected.length > 0 ? `${selected.length} selected` : 'Click row to expand'}</p>
        </div>
        {selected.length > 0 && (
          <div className="flex gap-2">
            <button className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition">Export Selected</button>
            <button onClick={() => setSelected([])} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition">Clear</button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <th className="px-4 py-3 w-8">
                <button onClick={toggleAll}>{selected.length === pageData.length && pageData.length > 0 ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4" />}</button>
              </th>
              <SortTh label="Part" k="name" />
              <SortTh label="Category" k="category" />
              <th className="px-4 py-3">Warehouse</th>
              <th className="px-4 py-3">Vendor</th>
              <SortTh label="Stock" k="currentStock" className="text-center" />
              <th className="px-4 py-3 text-center">Min</th>
              <SortTh label="Unit Price" k="costPrice" className="text-right" />
              <SortTh label="Value" k="inventoryValue" className="text-right" />
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence>
              {pageData.map((item) => (
                <React.Fragment key={item.id}>
                  <motion.tr
                    initial={{ opacity: 0, backgroundColor: '#eef2ff' }}
                    animate={
                      lastAddedId === item.id
                        ? { opacity: 1, backgroundColor: ['#c7d2fe', '#eef2ff', '#ffffff'], transition: { duration: 1.8, times: [0, 0.4, 1] } }
                        : lastEditedId === item.id
                        ? { opacity: 1, backgroundColor: ['#fef9c3', '#fefce8', '#ffffff'], transition: { duration: 1.8, times: [0, 0.4, 1] } }
                        : { opacity: 1, backgroundColor: '#ffffff' }
                    }
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${selected.includes(item.id) ? 'bg-indigo-50/50' : ''} ${item.stockStatus === 'Critical' || item.stockStatus === 'Out of Stock' ? 'bg-red-50/30' : ''}`}
                    onClick={() => onView && onView(item)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(item.id)}>
                        {selected.includes(item.id) ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4 text-slate-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.partCode} · {item.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{item.category}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{item.warehouse}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{item.preferredVendor}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex w-12 items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-sm font-bold text-slate-800">{item.currentStock}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{item.minStock}</td>
                    <td className="px-4 py-3 text-right text-xs text-slate-700">₹{item.costPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-slate-900">₹{item.inventoryValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold ${statusStyles[item.stockStatus]}`}>{item.stockStatus}</span>
                      {item.expiringSoon && <span className="ml-1 inline-flex items-center rounded-full border border-orange-200 bg-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-700">Expiring</span>}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => onStockIn(item)} title="Stock In" className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100 transition"><ArrowUpRight className="h-3.5 w-3.5" /></button>
                        <button onClick={() => onStockOut(item)} disabled={item.currentStock <= 0} title="Stock Out" className="rounded-lg bg-orange-50 p-1.5 text-orange-700 hover:bg-orange-100 transition disabled:opacity-40 disabled:cursor-not-allowed"><ArrowDownRight className="h-3.5 w-3.5" /></button>
                        <div className="relative">
                          <button onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)} className="rounded-lg bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100 transition"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                          {openMenu === item.id && (
                            <div className="absolute right-0 top-8 z-30 w-44 rounded-2xl border border-slate-200 bg-white shadow-xl py-1">
                              {[
                                { icon: Eye, label: 'View Details', action: () => { onView && onView(item); setOpenMenu(null); } },
                                { icon: Edit2, label: 'Edit Part', action: () => { onEdit && onEdit(item); setOpenMenu(null); } },
                                { icon: ArrowLeftRight, label: 'Transfer', action: () => setOpenMenu(null) },
                                { icon: Plus, label: 'Add Stock', action: () => { onStockIn(item); setOpenMenu(null); } },
                                { icon: FileText, label: 'Generate PO', action: () => setOpenMenu(null) },
                                { icon: Trash2, label: 'Delete', action: () => { onDelete && onDelete(item); setOpenMenu(null); }, danger: true },
                              ].map(({ icon: Icon, label, action, danger }) => (
                                <button key={label} onClick={action} className={`flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition ${danger ? 'text-red-600' : 'text-slate-700'}`}>
                                  <Icon className="h-3.5 w-3.5" />{label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === item.id ? null : item.id); }} className="rounded-lg bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100 transition">
                          {expandedRow === item.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expanded Row */}
                  <AnimatePresence>
                    {expandedRow === item.id && (
                      <ExpandedRow key={`exp-${item.id}`} item={item} movementHistory={movementHistory} issueHistory={issueHistory} />
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </AnimatePresence>
            {pageData.length === 0 && (
              <tr>
                <td colSpan={11}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-600">No matching inventory items found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search or clearing active filters</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
        <p className="text-xs text-slate-500">Showing {Math.min((page - 1) * PAGE_SIZE + 1, sorted.length)}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-40 transition"><ChevronLeft className="h-4 w-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${p === page ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>{p}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-40 transition"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
