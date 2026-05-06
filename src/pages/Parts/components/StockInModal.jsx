import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, PlusCircle } from 'lucide-react';

export default function StockInModal({ isOpen, onClose, item, onSubmit, vendors }) {
  const [form, setForm] = useState({ qty: 1, costPerUnit: item?.costPrice || 0, vendor: item?.preferredVendor || vendors[0] || '', invoiceNumber: '', date: new Date().toISOString().split('T')[0] });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      qty: 1,
      costPerUnit: item?.costPrice || 0,
      vendor: item?.preferredVendor || vendors[0] || '',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
    });
    setErrors({});
  }, [isOpen, item, vendors]);

  if (!isOpen || !item) return null;

  const handleSubmit = () => {
    const nextErrors = {};
    if (!form.qty || Number(form.qty) <= 0) nextErrors.qty = 'Quantity is required';
    if (!form.costPerUnit || Number(form.costPerUnit) <= 0) nextErrors.costPerUnit = 'Cost per unit is required';
    if (!form.vendor) nextErrors.vendor = 'Vendor is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit({ partId: item.id, qty: Number(form.qty), costPerUnit: Number(form.costPerUnit), vendor: form.vendor, invoiceNumber: form.invoiceNumber, date: form.date });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 bg-slate-50">
            <div className="flex items-center gap-3">
              <PlusCircle className="h-5 w-5 text-blue-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">Receive Stock</h2>
                <p className="text-sm text-slate-500">Add purchased quantity to inventory.</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Part</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{item.name}</p>
              <p className="text-sm text-slate-500">Available stock: {calculateCurrentStock(item)}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Quantity added</label>
                <input
                  type="number"
                  min="1"
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.qty ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                />
                {errors.qty && <p className="mt-2 text-xs text-red-600">{errors.qty}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Cost per unit</label>
                <input
                  type="number"
                  min="0"
                  value={form.costPerUnit}
                  onChange={(e) => setForm({ ...form, costPerUnit: Number(e.target.value) })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.costPerUnit ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                />
                {errors.costPerUnit && <p className="mt-2 text-xs text-red-600">{errors.costPerUnit}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Vendor</label>
                <select
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.vendor ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                >
                  {vendors.map((vendor) => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
                {errors.vendor && <p className="mt-2 text-xs text-red-600">{errors.vendor}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Invoice number</label>
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button onClick={onClose} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition">
              Cancel
            </button>
            <button onClick={handleSubmit} className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition">
              Receive Stock
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function calculateCurrentStock(item) {
  return Math.max(0, Number(item.openingStock || 0) + Number(item.received || 0) - Number(item.issued || 0));
}
