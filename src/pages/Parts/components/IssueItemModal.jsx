import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, ChevronDown, Search, Loader2 } from 'lucide-react';

const emptyForm = {
  issue_date: new Date().toISOString().split('T')[0],
  quantity: '',
  price_per_unit: '',
  odometer: '',
};

export default function IssueItemModal({ isOpen, item, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setSelectedVehicle(null);
      setSearch('');
      setError('');
      setDropdownOpen(false);
      fetchVehicles();
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/vehicles');
      const data = await res.json();
      setVehicles(data.data || []);
    } catch {
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  const available = Number(item.current_stock || 0);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const filteredVehicles = vehicles.filter(v =>
    v.vehicle_no?.toLowerCase().includes(search.toLowerCase())
  );

  const qty = Number(form.quantity);
  const isOverStock = qty > 0 && qty > available;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return setError('Please select a truck.');
    if (!qty || qty <= 0) return setError('Enter a valid quantity.');
    if (qty > available) return setError(`Insufficient stock available. Only ${available} unit(s) in stock.`);
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/inventory/stock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partId: item.id,
          qty,
          vehicleNumber: selectedVehicle.vehicle_no,
          odometer: Number(form.odometer) || 0,
          costPerUnit: Number(form.price_per_unit) || 0,
          date: form.issue_date,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to issue item.');
      onSuccess(qty);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Issue Item</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {item.part_name}
              <span className="mx-1.5 text-slate-300">—</span>
              <span className={`font-bold ${available <= 5 ? 'text-red-500' : available <= 15 ? 'text-amber-500' : 'text-emerald-600'}`}>
                {available} available
              </span>
            </p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="text-slate-400 hover:text-slate-600 transition disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Truck Dropdown */}
          <div ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Truck Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button type="button" onClick={() => setDropdownOpen(o => !o)}
                className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm text-left transition focus:outline-none focus:ring-2 focus:ring-violet-500 ${selectedVehicle ? 'border-slate-200 text-slate-800' : 'border-slate-200 text-slate-400'}`}>
                <span>{selectedVehicle ? selectedVehicle.vehicle_no : 'Select truck...'}</span>
                {vehiclesLoading
                  ? <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                  : <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                }
              </button>

              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                      <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <input
                        autoFocus
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search vehicle..."
                        className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-44 overflow-y-auto">
                    {vehiclesLoading ? (
                      <div className="py-6 text-center text-xs text-slate-400">Loading vehicles...</div>
                    ) : filteredVehicles.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">No vehicles found.</div>
                    ) : (
                      filteredVehicles.map(v => (
                        <button key={v.id} type="button"
                          onClick={() => { setSelectedVehicle(v); setDropdownOpen(false); setSearch(''); setError(''); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-violet-50 transition ${selectedVehicle?.id === v.id ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-700'}`}>
                          {v.vehicle_no}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Issue Date + Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Date</label>
              <input type="date" value={form.issue_date} onChange={e => set('issue_date', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" max={available} value={form.quantity}
                onChange={e => set('quantity', e.target.value)} placeholder="0"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 ${isOverStock ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
              {isOverStock && (
                <p className="text-[10px] text-red-500 mt-1">Exceeds available stock ({available})</p>
              )}
            </div>
          </div>

          {/* Price + Odometer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Price Per Unit</label>
              <input type="number" min="0" step="0.01" value={form.price_per_unit}
                onChange={e => set('price_per_unit', e.target.value)} placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Odometer (km)</label>
              <input type="number" min="0" value={form.odometer}
                onChange={e => set('odometer', e.target.value)} placeholder="0"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || isOverStock}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Issuing...' : 'Confirm Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
