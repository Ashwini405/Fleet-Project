import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Package, Tag, Boxes, TrendingUp, Building2, User2, CalendarClock,
  Truck, Wrench, Phone, FileText, ArrowUpRight, ArrowDownRight, ShoppingCart,
  AlertCircle, AlertTriangle, CheckCircle2, PackageX, Barcode, MapPin, Hash,
} from 'lucide-react';

const STATUS = {
  'In Stock':     { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  'Low Stock':    { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200',   Icon: AlertTriangle },
  'Critical':     { cls: 'bg-red-100 text-red-700 border-red-200',            Icon: AlertCircle },
  'Out of Stock': { cls: 'bg-slate-100 text-slate-600 border-slate-200',      Icon: PackageX },
};

const CAT_COLOR = {
  Spares: 'bg-blue-100 text-blue-700', Lubricants: 'bg-amber-100 text-amber-700',
  Tyres: 'bg-slate-100 text-slate-700', Electrical: 'bg-yellow-100 text-yellow-700',
  Batteries: 'bg-red-100 text-red-700', Tools: 'bg-violet-100 text-violet-700',
  Others: 'bg-slate-100 text-slate-600',
};

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const SectionTitle = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{children}</p>
);

const Row = ({ icon: Icon, label, value, mono }) => (
  <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0">
    <span className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 min-w-[110px]">
      <Icon className="h-3 w-3" />{label}
    </span>
    <span className={`text-xs font-semibold text-slate-800 text-right ${mono ? 'font-mono' : ''}`}>
      {value || '—'}
    </span>
  </div>
);

export default function PartDetailDrawer({ item, onClose, onStockIn, onStockOut, onEdit }) {
  const isOpen = !!item;
  const status = item ? (STATUS[item.stockStatus] || STATUS['In Stock']) : null;
  const StatusIcon = status?.Icon;
  const invValue = item ? item.currentStock * item.costPrice : 0;
  const profit = item ? item.sellingPrice - item.costPrice : 0;
  const profitPct = item?.costPrice > 0 ? ((profit / item.costPrice) * 100).toFixed(1) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white leading-tight">{item.name}</h2>
                    <p className="text-xs text-indigo-200 mt-0.5">{item.brand} · {item.partCode}</p>
                  </div>
                </div>
                <button onClick={onClose} className="rounded-xl bg-white/20 p-1.5 text-white hover:bg-white/30 transition shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold bg-white/90 ${status.cls}`}>
                  <StatusIcon className="h-2.5 w-2.5" />{item.stockStatus}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${CAT_COLOR[item.category] || 'bg-slate-100 text-slate-600'} bg-white/90`}>
                  {item.category}
                </span>
                {item.expiringSoon && (
                  <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-200 px-2.5 py-0.5 text-[10px] font-bold text-orange-700">
                    Expiring Soon
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 shrink-0">
              {[
                { icon: ArrowUpRight,  label: 'Stock In',   color: 'text-emerald-600 hover:bg-emerald-50', action: () => { onStockIn(item); onClose(); } },
                { icon: ArrowDownRight,label: 'Stock Out',  color: 'text-orange-600 hover:bg-orange-50',   action: () => { onStockOut(item); onClose(); }, disabled: item.currentStock <= 0 },
                { icon: ShoppingCart,  label: 'Generate PO',color: 'text-indigo-600 hover:bg-indigo-50',   action: () => {} },
              ].map(({ icon: Icon, label, color, action, disabled }) => (
                <button key={label} onClick={action} disabled={disabled}
                  className={`flex flex-col items-center gap-1 py-3 text-[10px] font-bold transition ${color} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Metrics Strip */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Current Stock', value: `${item.currentStock} ${item.unit}`, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
                  { label: 'Inv. Value',    value: fmt(invValue),                        color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
                  { label: 'Cost Price',    value: fmt(item.costPrice),                  color: 'text-slate-700',   bg: 'bg-slate-50 border-slate-200' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`rounded-xl border px-3 py-2.5 text-center ${bg}`}>
                    <p className={`text-sm font-black ${color}`}>{value}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Profit insight */}
              {item.sellingPrice > 0 && (
                <div className={`rounded-xl border px-4 py-2.5 flex items-center justify-between ${profit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <span className="text-xs text-slate-500 font-medium">Profit Margin</span>
                  <span className={`text-sm font-black ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {profit >= 0 ? '+' : ''}{fmt(profit)} <span className="text-[10px] font-bold">({profit >= 0 ? '▲' : '▼'}{Math.abs(profitPct)}%)</span>
                  </span>
                </div>
              )}

              {/* A. Basic Info */}
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <SectionTitle>Basic Info</SectionTitle>
                <Row icon={Barcode}   label="SKU / Part Code" value={item.partCode} mono />
                <Row icon={Tag}       label="Brand"           value={item.brand} />
                <Row icon={Package}   label="Category"        value={item.category} />
                <Row icon={Hash}      label="Unit"            value={item.unit} />
                {item.description && (
                  <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[10px] text-slate-400 font-medium mb-0.5">Description</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                  </div>
                )}
              </div>

              {/* B. Inventory Info */}
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <SectionTitle>Inventory Info</SectionTitle>
                <Row icon={Boxes}        label="Current Stock"  value={`${item.currentStock} ${item.unit}`} />
                <Row icon={AlertTriangle} label="Min Stock"      value={`${item.minStock} ${item.unit}`} />
                <Row icon={AlertCircle}  label="Reorder Level"  value={`${item.reorderLevel} ${item.unit}`} />
                <Row icon={TrendingUp}   label="Cost Price"      value={fmt(item.costPrice)} />
                <Row icon={TrendingUp}   label="Selling Price"   value={fmt(item.sellingPrice)} />
                <Row icon={CalendarClock} label="Expiry Date"    value={item.expiryDate || 'Not set'} />
                <Row icon={FileText}     label="Warranty"        value={item.warranty || 'N/A'} />

                {/* Stock level bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Stock Level</span>
                    <span>{item.currentStock} / {Math.max(item.reorderLevel * 2, item.currentStock)} {item.unit}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (item.currentStock / Math.max(item.reorderLevel * 2, 1)) * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        item.stockStatus === 'In Stock' ? 'bg-emerald-500' :
                        item.stockStatus === 'Low Stock' ? 'bg-yellow-400' :
                        item.stockStatus === 'Critical' ? 'bg-red-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* C. Fleet & Vendor */}
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <SectionTitle>Fleet & Vendor</SectionTitle>
                <Row icon={Truck}   label="Vehicle Type"     value={item.vehicleType} />
                <Row icon={Wrench}  label="Service Interval" value={item.serviceInterval || 'Not set'} />
                <Row icon={User2}   label="Preferred Vendor" value={item.preferredVendor} />
                <Row icon={Phone}   label="Vendor Contact"   value={item.vendorContact || 'Not set'} />
                <Row icon={FileText} label="GST Number"      value={item.gst || 'Not set'} mono />
                {item.compatibleVehicles?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-slate-400 font-medium mb-1.5">Compatible Vehicles</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.compatibleVehicles.map((v) => (
                        <span key={v} className="rounded-lg bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">{v}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* D. Warehouse Info */}
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <SectionTitle>Warehouse Info</SectionTitle>
                <Row icon={Building2} label="Warehouse" value={item.warehouse} />
                <Row icon={MapPin}    label="Rack"      value={item.rack || 'Not assigned'} />
                <Row icon={Hash}      label="Bin"       value={item.bin || 'Not assigned'} />
                {item.notes && (
                  <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[10px] text-slate-400 font-medium mb-0.5">Notes</p>
                    <p className="text-xs text-slate-600">{item.notes}</p>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 flex justify-between text-[10px] text-slate-400">
                <span>Created: <span className="font-semibold text-slate-600">{item.createdDate || '—'}</span></span>
                <span>Updated: <span className="font-semibold text-slate-600">{item.lastUpdated || '—'}</span></span>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 shrink-0">
              <button
                onClick={() => { onEdit && onEdit(item); onClose(); }}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition"
              >
                Edit Part
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
