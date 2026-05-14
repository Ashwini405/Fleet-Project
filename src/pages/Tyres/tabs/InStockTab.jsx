import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Eye, Package, X, ChevronDown, Truck, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { layoutPositions } from '../data/dummyData';
import { useTyreLifecycle } from '../index';
import RegisterTyreModal from '../components/RegisterTyreModal';
import TyreDatasheetModal from '../components/TyreDatasheetModal';
import { Toast, useToast, TableSkeleton, EmptyState, StickyTable, StickyThead } from '../components/ERPUtils';

const today = () => new Date().toISOString().split('T')[0];

function stockAge(d) {
  if (!d) return '—';
  const diff = Math.floor((new Date() - new Date(d)) / 86400000);
  if (diff < 1) return 'Today';
  if (diff < 30) return `${diff}d`;
  const m = Math.floor(diff / 30);
  return m < 12 ? `${m} mo` : `${Math.floor(m / 12)} yr${m % 12 ? ` ${m % 12} mo` : ''}`;
}

const PLACEMENTS = layoutPositions.map(p => ({ id: p.id, label: p.label }));

function MountModal({ tyre, onClose, onMounted }) {
  const { activeTyres, mountFromStock, dummyTrucks } = useTyreLifecycle();
  const [truckId, setTruckId]     = useState('');
  const [placement, setPlacement] = useState('');
  const [fittedDate, setFittedDate] = useState(today());
  const [errors, setErrors]       = useState({});

  const selectedTruck = dummyTrucks.find(t => t.id === truckId);
  const fittedOdo     = selectedTruck?.currentOdo ?? 0;
  const mountedCount  = truckId ? activeTyres.filter(t => t.truckNo === truckId).length : 0;
  const truckCapacity = selectedTruck?.totalTyres ?? 0;
  const truckFull     = truckCapacity > 0 && mountedCount >= truckCapacity;
  const occupiedPos   = truckId ? activeTyres.filter(t => t.truckNo === truckId).map(t => t.position) : [];

  const validate = () => {
    const e = {};
    if (!truckId) e.truckId = 'Select a truck';
    else if (truckFull) e.truckId = `Truck is full (${mountedCount}/${truckCapacity})`;
    if (!placement) e.placement = 'Select a position';
    else if (occupiedPos.includes(placement)) e.placement = 'Position already occupied';
    if (!fittedDate) e.fittedDate = 'Select fitted date';
    else if (fittedDate > today()) e.fittedDate = 'Cannot be a future date';
    return e;
  };

  const handleMount = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    mountFromStock(tyre.id, { truckId, placement, fittedDate, fittedOdo });
    onMounted?.(tyre.id);
    onClose();
  };

  const inputCls = (err) =>
    `w-full pl-3.5 pr-9 h-[44px] bg-white border rounded-xl text-sm font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 transition-all ${err ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#0f172a] to-[#1e293b]">
          <div>
            <h3 className="text-[15px] font-black text-white">Mount Tyre</h3>
            <p className="text-[11px] text-blue-400 font-semibold mt-0.5 font-mono">{tyre.id} · {tyre.make} {tyre.model}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700">{tyre.make} {tyre.model}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{tyre.tyreSize} · {tyre.material}</p>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ring-1 ring-blue-200">In Stock</span>
          </div>

          <div>
            <label className="block text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Assign Truck <span className="text-rose-400">*</span></label>
            <div className="relative">
              <select value={truckId} onChange={e => { setTruckId(e.target.value); setErrors(p => ({ ...p, truckId: '' })); }} className={inputCls(errors.truckId)}>
                <option value="">Select Truck</option>
                {dummyTrucks.map(t => {
                  const cnt = activeTyres.filter(a => a.truckNo === t.id).length;
                  const full = cnt >= t.totalTyres;
                  return <option key={t.id} value={t.id} disabled={full}>{t.id} — {t.model}{full ? ' (Full)' : ` (${cnt}/${t.totalTyres})`}</option>;
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
            {errors.truckId && <p className="mt-1 text-[11px] text-red-500 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.truckId}</p>}
            {selectedTruck && !errors.truckId && <p className="mt-1 text-[10px] text-emerald-600 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Fitted ODO: {fittedOdo.toLocaleString()} km</p>}
          </div>

          <div>
            <label className="block text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Tyre Position <span className="text-rose-400">*</span></label>
            <div className="relative">
              <select value={placement} onChange={e => { setPlacement(e.target.value); setErrors(p => ({ ...p, placement: '' })); }}
                disabled={!truckId} className={inputCls(errors.placement) + (!truckId ? ' opacity-40 cursor-not-allowed' : '')}>
                <option value="">{truckId ? 'Select Position' : 'Select truck first'}</option>
                {PLACEMENTS.map(p => <option key={p.id} value={p.id} disabled={occupiedPos.includes(p.id)}>{p.label}{occupiedPos.includes(p.id) ? ' — Occupied' : ''}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
            {errors.placement && <p className="mt-1 text-[11px] text-red-500 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.placement}</p>}
          </div>

          <div>
            <label className="block text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Fitted Date <span className="text-rose-400">*</span></label>
            <input type="date" value={fittedDate} max={today()}
              onChange={e => { setFittedDate(e.target.value); setErrors(p => ({ ...p, fittedDate: '' })); }}
              className={`w-full px-3.5 h-[44px] bg-white border rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 transition-all ${errors.fittedDate ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'}`} />
            {errors.fittedDate && <p className="mt-1 text-[11px] text-red-500 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fittedDate}</p>}
          </div>

          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 pt-1">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full ring-1 ring-blue-200">In Stock</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full ring-1 ring-emerald-200">Active / Mounted</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button onClick={onClose} className="h-10 px-5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95">Cancel</button>
          <button onClick={handleMount}
            className="h-10 px-6 text-sm font-extrabold text-white rounded-xl flex items-center gap-2 transition-all shadow-md hover:-translate-y-0.5 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
            <CheckCircle className="w-4 h-4" /> Confirm Mount
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function InStockTab() {
  const { stockTyres, registerTyre } = useTyreLifecycle();
  const { toasts, push, dismiss } = useToast();
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [brandFilter, setBrandFilter]   = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [viewingTyre, setViewingTyre]   = useState(null);
  const [mountingTyre, setMountingTyre] = useState(null);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);

  const uniqueBrands  = useMemo(() => [...new Set(stockTyres.map(t => t.make))], [stockTyres]);
  const uniqueVendors = useMemo(() => [...new Set(stockTyres.map(t => t.vendor).filter(Boolean))], [stockTyres]);

  const filtered = useMemo(() => stockTyres.filter(t => {
    const q = search.toLowerCase();
    return (!search || [t.id, t.make, t.model, t.vendor || ''].some(v => v.toLowerCase().includes(q)))
      && (!brandFilter || t.make === brandFilter)
      && (!vendorFilter || t.vendor === vendorFilter);
  }), [stockTyres, search, brandFilter, vendorFilter]);

  const hasFilters = !!(search || brandFilter || vendorFilter);

  return (
    <div className="space-y-5">
      <Toast toasts={toasts} onDismiss={dismiss} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">In Stock Tyres</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500 font-medium">{stockTyres.length} Available</span>
            <span className="w-px h-3 bg-gray-300" />
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full ring-1 ring-blue-200">
              <Package className="w-3 h-3" /> Warehouse Stock
            </span>
          </div>
        </div>
        <button onClick={() => setIsRegisterOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:shadow-md active:scale-95 shrink-0">
          <Plus className="w-4 h-4" /> Register Tyre
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px] max-w-xs">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Tyre No, Brand, Vendor..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </div>
          </div>
          {[['Brand', brandFilter, setBrandFilter, uniqueBrands, 'All Brands'], ['Vendor', vendorFilter, setVendorFilter, uniqueVendors, 'All Vendors']].map(([label, val, setter, opts, ph]) => (
            <div key={label} className="min-w-[140px]">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
              <div className="relative">
                <select value={val} onChange={e => setter(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
                  <option value="">{ph}</option>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          ))}
          {hasFilters && (
            <button onClick={() => { setSearch(''); setBrandFilter(''); setVendorFilter(''); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-500 hover:text-gray-800 rounded-xl text-sm font-semibold transition-all self-end">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <StickyTable minWidth="900px">
          <StickyThead>
            <tr className="border-b border-gray-200 bg-slate-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {['Tyre No', 'Brand', 'Model', 'Size', 'Material', 'Vendor', 'Purchase Date', 'Cost', 'Stock Age', 'Status', 'Actions'].map(h => (
                <th key={h} className="py-3 px-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </StickyThead>
          {loading ? <TableSkeleton rows={5} cols={11} /> : (
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="11">
                  <EmptyState icon={Package}
                    title={hasFilters ? 'No tyres match filters' : 'No stock tyres yet'}
                    subtitle={hasFilters ? undefined : 'Register a new tyre to add it to inventory'}
                    action={hasFilters ? 'Clear Filters' : 'Register Tyre'}
                    onAction={hasFilters ? () => { setSearch(''); setBrandFilter(''); setVendorFilter(''); } : () => setIsRegisterOpen(true)} />
                </td></tr>
              ) : filtered.map((tyre, idx) => (
                <motion.tr key={tyre.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.2) }}
                  className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors duration-150 group ${idx % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'}`}>
                  <td className="py-3 px-4"><span className="text-xs font-bold text-blue-600 font-mono whitespace-nowrap">{tyre.id}</span></td>
                  <td className="py-3 px-4"><span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{tyre.make}</span></td>
                  <td className="py-3 px-4"><span className="text-xs text-gray-600 whitespace-nowrap">{tyre.model}</span></td>
                  <td className="py-3 px-4"><span className="text-xs font-mono text-gray-500 whitespace-nowrap">{tyre.tyreSize}</span></td>
                  <td className="py-3 px-4"><span className="inline-flex items-center text-[11px] font-semibold text-gray-600 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">{tyre.material}</span></td>
                  <td className="py-3 px-4"><span className="text-xs text-gray-600 font-medium whitespace-nowrap">{tyre.vendor || '—'}</span></td>
                  <td className="py-3 px-4"><span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">{tyre.purchaseDate || '—'}</span></td>
                  <td className="py-3 px-4 text-right"><span className="text-xs font-semibold text-emerald-600 font-mono whitespace-nowrap">{tyre.cost ? `₹${tyre.cost.toLocaleString('en-IN')}` : '—'}</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">{stockAge(tyre.purchaseDate)}</span></td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" /> In Stock
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setViewingTyre({ ...tyre, status: 'In Stock', expectedLife: tyre.expectedLife || 100000 })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all active:scale-95 whitespace-nowrap">
                        <Eye className="w-3 h-3 shrink-0" /> View
                      </button>
                      <button onClick={() => setMountingTyre(tyre)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all hover:shadow-md hover:-translate-y-px active:scale-95 shadow-sm whitespace-nowrap">
                        <Truck className="w-3 h-3 shrink-0" /> Mount
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          )}
        </StickyTable>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              <span className="font-bold text-gray-600">{filtered.length}</span> tyre{filtered.length !== 1 ? 's' : ''} in stock
            </p>
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-gray-400 font-medium">Warehouse inventory</span>
            </div>
          </div>
        )}
      </div>

      <RegisterTyreModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onRegister={registerTyre} />
      <TyreDatasheetModal isOpen={!!viewingTyre} onClose={() => setViewingTyre(null)} tyreData={viewingTyre} />
      <AnimatePresence>
        {mountingTyre && (
          <MountModal
            tyre={mountingTyre}
            onClose={() => setMountingTyre(null)}
            onMounted={id => push(`${id} mounted successfully`, 'success')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
