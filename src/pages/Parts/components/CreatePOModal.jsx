import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { dummyVendors } from '../../Vendors/data/dummyData';

const today = () => new Date().toISOString().split('T')[0];

// Two categories — mapped to vendor ledger category IDs
const CATEGORIES = [
  { id: 'Parts & Spares', vendorCat: 'parts',  color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'Oils & Lubes',   vendorCat: 'oils',   color: 'bg-amber-50  text-amber-700  border-amber-200'  },
];

// Items per category — matching inventory
const ITEMS_BY_CATEGORY = {
  'Parts & Spares': [
    { id: 'i1',  name: 'Brake Pads',     unit: 'pcs',    price: 560  },
    { id: 'i2',  name: 'Clutch Plate',   unit: 'pcs',    price: 2200 },
    { id: 'i3',  name: 'Air Filter',     unit: 'pcs',    price: 180  },
    { id: 'i4',  name: 'Wiper Blades',   unit: 'pcs',    price: 320  },
    { id: 'i5',  name: 'Fuel Filter',    unit: 'pcs',    price: 420  },
    { id: 'i6',  name: 'Headlight Bulb', unit: 'pcs',    price: 280  },
  ],
  'Oils & Lubes': [
    { id: 'i7',  name: 'Engine Oil 15W40', unit: 'liters', price: 560 },
    { id: 'i8',  name: 'Gear Oil',         unit: 'liters', price: 380 },
    { id: 'i9',  name: 'Grease',           unit: 'kg',     price: 160 },
    { id: 'i10', name: 'Coolant',          unit: 'liters', price: 220 },
    { id: 'i11', name: 'Brake Fluid',      unit: 'liters', price: 310 },
  ],
};

const EMPTY = {
  category: '', vendorId: '', vendor: '',
  itemId: '', item_name: '', unit: '',
  quantity: '', unit_price: '', expected_delivery: '', notes: '',
};

const iCls = (err) =>
  `w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition
   ${err ? 'border-red-300 focus:ring-red-300' : 'border-slate-200'}`;

const sCls = (err) =>
  `w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none transition
   ${err ? 'border-red-300 focus:ring-red-300' : 'border-slate-200'}`;

function Label({ text, required }) {
  return (
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {text}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Err({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
      <AlertCircle className="h-3 w-3 shrink-0" />{msg}
    </p>
  );
}

export default function CreatePOModal({ isOpen, onClose, onSuccess, requestedBy }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: null }));
  };

  const handleCategoryChange = (cat) => {
    setForm({ ...EMPTY, category: cat });
    setErrors({});
  };

  const handleVendorChange = (vendorId) => {
    const v = vendorsForCategory.find(x => x.id === vendorId);
    setForm(f => ({ ...f, vendorId, vendor: v?.name || '', itemId: '', item_name: '', unit: '', unit_price: '' }));
    setErrors(e => ({ ...e, vendorId: null }));
  };

  const handleItemChange = (itemId) => {
    const item = itemsForCategory.find(x => x.id === itemId);
    setForm(f => ({
      ...f, itemId,
      item_name:  item?.name  || '',
      unit:       item?.unit  || '',
      unit_price: item ? String(item.price) : '',
    }));
    setErrors(e => ({ ...e, itemId: null }));
  };

  const catMeta = CATEGORIES.find(c => c.id === form.category);
  const vendorsForCategory = form.category
    ? dummyVendors.filter(v => v.category === catMeta?.vendorCat)
    : [];
  const itemsForCategory = ITEMS_BY_CATEGORY[form.category] || [];

  const total = (Number(form.quantity) || 0) * (Number(form.unit_price) || 0);

  const validate = () => {
    const e = {};
    if (!form.category)                              e.category = 'Select a category';
    if (!form.vendorId)                              e.vendorId = 'Select a vendor';
    if (!form.itemId && !form.item_name.trim())      e.itemId   = 'Select or enter an item';
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Enter a valid quantity';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const localPO = {
      id:               `PO-LOCAL-${Date.now()}`,
      poNumber:         `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      vendor:           form.vendor,
      category:         form.category,
      item_name:        form.item_name,
      quantity:         Number(form.quantity),
      items:            [{ partName: form.item_name, qty: Number(form.quantity), unitPrice: Number(form.unit_price) || 0 }],
      totalAmount:      total,
      status_id:        0,
      requested_date:   today(),
      expected_delivery: form.expected_delivery || null,
      notes:            form.notes,
      requested_by:     requestedBy || 'Supervisor',
    };

    try {
      const res = await fetch('http://localhost:5001/api/inventory/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor: form.vendor, item_name: form.item_name,
          quantity: Number(form.quantity), unit_price: Number(form.unit_price) || 0,
          total_amount: total, category: form.category,
          expected_delivery: form.expected_delivery || null,
          notes: form.notes, requested_by: requestedBy || 'Supervisor',
          requested_date: today(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Server error');
      onSuccess?.();
    } catch {
      onSuccess?.(localPO);
    } finally {
      setLoading(false);
      setForm(EMPTY);
      setErrors({});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800">Create Purchase Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {requestedBy ? `Requested by ${requestedBy}` : 'Parts & Inventory'}
            </p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="text-slate-400 hover:text-slate-600 transition disabled:opacity-40 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* 1. Category */}
          <div>
            <Label text="Category" required />
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3 py-3 rounded-xl border text-xs font-bold transition-all text-center
                    ${form.category === cat.id
                      ? `${cat.color} ring-2 ring-offset-1 ring-violet-400`
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                    }`}>
                  {cat.id}
                </button>
              ))}
            </div>
            <Err msg={errors.category} />
          </div>

          {/* 2. Vendor */}
          {form.category && (
            <div>
              <Label text="Vendor" required />
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catMeta?.color}`}>
                  {form.category}
                </span>
                <span className="text-[10px] text-slate-400">
                  {vendorsForCategory.length} vendor{vendorsForCategory.length !== 1 ? 's' : ''} available
                </span>
              </div>
              <select value={form.vendorId} onChange={e => handleVendorChange(e.target.value)}
                className={sCls(errors.vendorId)}>
                <option value="">— Select Vendor —</option>
                {vendorsForCategory.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <Err msg={errors.vendorId} />
            </div>
          )}

          {/* 3. Item */}
          {form.vendorId && (
            <div>
              <Label text="Item" required />
              <select value={form.itemId} onChange={e => handleItemChange(e.target.value)}
                className={sCls(errors.itemId)}>
                <option value="">— Select Item —</option>
                {itemsForCategory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.unit}) — ₹{item.price.toLocaleString()}
                  </option>
                ))}
              </select>
              <Err msg={errors.itemId} />
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">or type manually</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <input
                value={form.itemId ? '' : form.item_name}
                onChange={e => setForm(f => ({ ...f, itemId: '', item_name: e.target.value, unit: '', unit_price: '' }))}
                placeholder="e.g. Custom part name…"
                className={iCls(false)} />
            </div>
          )}

          {/* 4. Qty + Unit Price */}
          {form.vendorId && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label text="Quantity" required />
                <input type="number" min="1" value={form.quantity}
                  onChange={e => set('quantity', e.target.value)}
                  placeholder="0" className={iCls(errors.quantity)} />
                {form.unit && <p className="text-[10px] text-slate-400 mt-1">Unit: {form.unit}</p>}
                <Err msg={errors.quantity} />
              </div>
              <div>
                <Label text="Unit Price (₹)" />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">₹</span>
                  <input type="number" min="0" value={form.unit_price}
                    onChange={e => set('unit_price', e.target.value)}
                    placeholder="0" className={iCls(false) + ' pl-7'} />
                </div>
              </div>
            </div>
          )}

          {/* Total preview */}
          {total > 0 && (
            <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
              <span className="text-xs font-semibold text-violet-600">Estimated Total</span>
              <span className="text-sm font-black text-violet-700">₹{total.toLocaleString()}</span>
            </div>
          )}

          {/* 5. Delivery + Remarks */}
          {form.vendorId && (
            <>
              <div>
                <Label text="Expected Delivery" />
                <input type="date" value={form.expected_delivery} min={today()}
                  onChange={e => set('expected_delivery', e.target.value)}
                  className={iCls(false)} />
              </div>
              <div>
                <Label text="Remarks" />
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  placeholder="Optional notes…" rows={2}
                  className={iCls(false) + ' resize-none'} />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Submitting…' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
