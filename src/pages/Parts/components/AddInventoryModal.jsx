import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, PackagePlus } from 'lucide-react';

const categories = ['Spares', 'Lubricants', 'Tyre', 'Electrical', 'Others'];
const units = ['pcs', 'liters', 'kg'];
const locations = ['Warehouse A', 'Warehouse B', 'Rack 1', 'Rack 2'];

export default function AddInventoryModal({ isOpen, onClose, onAdd, vendors }) {
  const [form, setForm] = useState({
    category: 'Spares',
    name: '',
    brand: '',
    unit: 'pcs',
    minStock: 5,
    openingStock: 1,
    costPrice: 0,
    sellingPrice: 0,
    preferredVendor: vendors[0] || '',
    location: locations[0],
    createdDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Part name is required';
    if (!form.brand.trim()) nextErrors.brand = 'Brand is required';
    if (form.openingStock < 0) nextErrors.openingStock = 'Opening stock must be positive';
    if (form.minStock < 0) nextErrors.minStock = 'Minimum stock must be positive';
    if (form.costPrice < 0) nextErrors.costPrice = 'Cost price must be positive';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onAdd(form);
    setForm({
      category: 'Spares',
      name: '',
      brand: '',
      unit: 'pcs',
      minStock: 5,
      openingStock: 1,
      costPrice: 0,
      sellingPrice: 0,
      preferredVendor: vendors[0] || '',
      location: locations[0],
      createdDate: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 bg-slate-50">
            <div className="flex items-center gap-3">
              <PackagePlus className="h-5 w-5 text-slate-700" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">Create new part</h2>
                <p className="text-sm text-slate-500">Add a part master record to your inventory catalog.</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Part name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.name ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                  placeholder="e.g. Air Filter"
                />
                {errors.name && <p className="mt-2 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Brand</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.brand ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                  placeholder="e.g. Bosch"
                />
                {errors.brand && <p className="mt-2 text-xs text-red-600">{errors.brand}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-slate-200"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-slate-200"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Storage location</label>
                <select
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-slate-200"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Opening stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.openingStock}
                  onChange={(e) => setForm({ ...form, openingStock: Number(e.target.value) })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.openingStock ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                />
                {errors.openingStock && <p className="mt-2 text-xs text-red-600">{errors.openingStock}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Minimum stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.minStock ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                />
                {errors.minStock && <p className="mt-2 text-xs text-red-600">{errors.minStock}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Created date</label>
                <input
                  type="date"
                  value={form.createdDate}
                  onChange={(e) => setForm({ ...form, createdDate: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-slate-200"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Cost price</label>
                <input
                  type="number"
                  min="0"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
                  className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${errors.costPrice ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-200'}`}
                />
                {errors.costPrice && <p className="mt-2 text-xs text-red-600">{errors.costPrice}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Selling price</label>
                <input
                  type="number"
                  min="0"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-2">Preferred vendor</label>
                <select
                  value={form.preferredVendor}
                  onChange={(e) => setForm({ ...form, preferredVendor: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-slate-200"
                >
                  {vendors.map((vendor) => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition"
            >
              Add Part
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
