import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowRightCircle } from 'lucide-react';
import { dummyTruckList } from '../data/dummyData';

export default function StockOutModal({ isOpen, onClose, item, onSubmit }) {
  const [form, setForm] = useState({ truckNo: '', qty: 1, serviceId: '', odometer: '', serviceType: 'Repair', date: new Date().toISOString().split('T')[0] });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setForm({ truckNo: '', qty: 1, serviceId: '', odometer: '', serviceType: 'Repair', date: new Date().toISOString().split('T')[0] });
    setErrors({});
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const availableStock = Math.max(0, Number(item.openingStock || 0) + Number(item.received || 0) - Number(item.issued || 0));

  const handleSubmit = () => {
    const nextErrors = {};
    if (!form.truckNo) nextErrors.truckNo = 'Select vehicle';
    if (!form.qty || Number(form.qty) <= 0) nextErrors.qty = 'Quantity is required';
    if (Number(form.qty) > availableStock) nextErrors.qty = 'Not enough stock available';
    if (!form.odometer) nextErrors.odometer = 'Odometer is required';
    if (!form.serviceId.trim()) nextErrors.serviceId = 'Service ID is required';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSubmit({
      partId: item.id,
      qty: Number(form.qty),
      vehicleNumber: form.truckNo,
      odometer: Number(form.odometer),
      serviceId: form.serviceId.trim(),
      date: form.date,
      serviceType: form.serviceType,
      costPerUnit: item.costPrice,
      vendor: item.preferredVendor,
    });
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
              <ArrowRightCircle className="h-5 w-5 text-orange-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">Issue Part to Service</h2>
                <p className="text-sm text-slate-500">Deduct stock and attach it to a service record.</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Selected part</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{item.name}</p>
              <p className="text-sm text-slate-500">Available stock: {availableStock}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Truck / Vehicle</label>
                <select
                  value={form.truckNo}
                  onChange={(e) => setForm({ ...form, truckNo: e.target.value })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.truckNo ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                >
                  <option value="">Select truck</option>
                  {dummyTruckList.map((truck) => (
                    <option key={truck} value={truck}>{truck}</option>
                  ))}
                </select>
                {errors.truckNo && <p className="mt-2 text-xs text-red-600">{errors.truckNo}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Service ID</label>
                <input
                  type="text"
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.serviceId ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                />
                {errors.serviceId && <p className="mt-2 text-xs text-red-600">{errors.serviceId}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Quantity used</label>
                <input
                  type="number"
                  min="1"
                  max={availableStock}
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.qty ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                />
                {errors.qty && <p className="mt-2 text-xs text-red-600">{errors.qty}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Odometer</label>
                <input
                  type="number"
                  value={form.odometer}
                  onChange={(e) => setForm({ ...form, odometer: e.target.value })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.odometer ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                />
                {errors.odometer && <p className="mt-2 text-xs text-red-600">{errors.odometer}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Service type</label>
                <select
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-slate-200"
                >
                  <option value="Repair">Repair</option>
                  <option value="Periodic">Periodic</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Issued date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-slate-200"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Unit cost</p>
              <p className="mt-1 text-lg font-bold text-slate-900">₹{item.costPrice.toFixed(2)} / {item.unit}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button onClick={onClose} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition">
              Cancel
            </button>
            <button onClick={handleSubmit} className="rounded-full bg-orange-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-700 transition">
              Issue Part
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
