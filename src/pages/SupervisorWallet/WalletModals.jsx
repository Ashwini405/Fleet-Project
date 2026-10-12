import React, { useEffect, useMemo, useState } from 'react';
import { FiX, FiAlertCircle, FiLoader, FiPaperclip, FiTrash2 } from 'react-icons/fi';

const API = 'http://localhost:5001/api';
const inp = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500';
const lbl = 'block text-xs font-semibold text-slate-600 mb-1';

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const INR = (n) => `${Number(n) < 0 ? '-' : ''}₹${Math.abs(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

// Common supervisor expenses → Finance category + default title
const EXPENSE_PRESETS = [
  { label: 'Loading / Unloading (Hamali)', category: 'Miscellaneous' },
  { label: 'Toll / Parking', category: 'Toll' },
  { label: 'Food', category: 'Food Allowance' },
  { label: 'Repairs / Spares', category: 'Maintenance' },
  { label: 'Police / RTO', category: 'Miscellaneous' },
  { label: 'Other', category: 'Other' },
];

function Shell({ title, subtitle, onClose, busy, error, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} disabled={busy} className="text-slate-400 hover:text-slate-600 disabled:opacity-40">
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <FiAlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}
          {children}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">{footer}</div>
      </div>
    </div>
  );
}

function Buttons({ onClose, busy, label, color = 'bg-indigo-600 hover:bg-indigo-700' }) {
  return (
    <>
      <button type="button" onClick={onClose} disabled={busy}
        className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
        Cancel
      </button>
      <button type="submit" form="wallet-form" disabled={busy}
        className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50 ${color}`}>
        {busy && <FiLoader className="h-4 w-4 animate-spin" />}
        {busy ? 'Saving…' : label}
      </button>
    </>
  );
}

async function send(url, body, isForm = false) {
  const res = await fetch(url, {
    method: 'POST',
    ...(isForm ? { body } : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Add Money (money given to the supervisor) ──────────────────────────────
export function AddMoneyModal({ supervisor, onClose, onSaved }) {
  const [form, setForm] = useState({ amount: '', date: todayStr(), payment_mode: 'Cash', reference_no: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    if (!(Number(form.amount) > 0)) return setError('Enter an amount greater than 0.');
    setBusy(true);
    try { await send(`${API}/supervisor-wallet/${supervisor.id}/add-money`, form); onSaved(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <Shell title="Add Money to Wallet" subtitle={`${supervisor.full_name} · balance ${INR(supervisor.balance)}`}
      onClose={onClose} busy={busy} error={error}
      footer={<Buttons onClose={onClose} busy={busy} label="Add Money" color="bg-emerald-600 hover:bg-emerald-700" />}>
      <form id="wallet-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Amount (₹) <span className="text-red-500">*</span></label>
            <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} className={inp} autoFocus />
          </div>
          <div>
            <label className={lbl}>Date</label>
            <input type="date" max={todayStr()} value={form.date} onChange={e => set('date', e.target.value)} className={inp} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Paid By</label>
            <select value={form.payment_mode} onChange={e => set('payment_mode', e.target.value)} className={inp}>
              {['Cash', 'Bank Transfer', 'UPI', 'Cheque'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Reference / UTR No.</label>
            <input value={form.reference_no} onChange={e => set('reference_no', e.target.value)} maxLength={100} className={inp} />
          </div>
        </div>
        <div>
          <label className={lbl}>Notes</label>
          <input value={form.notes} onChange={e => set('notes', e.target.value)} className={inp} />
        </div>
        {Number(form.amount) > 0 && (
          <p className="text-xs text-slate-500">New balance will be <strong className="text-emerald-700">{INR(Number(supervisor.balance) + Number(form.amount))}</strong></p>
        )}
      </form>
    </Shell>
  );
}

// ── Record Expense (paid by the supervisor from the wallet) ────────────────
export function ExpenseModal({ supervisor, onClose, onSaved }) {
  const [form, setForm] = useState({
    date: todayStr(), preset: EXPENSE_PRESETS[0].label, title: EXPENSE_PRESETS[0].label,
    amount: '', vehicle_id: '', trip_id: '', paid_to: '', notes: '',
  });
  const [bill, setBill] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  useEffect(() => {
    fetch(`${API}/vehicles`).then(r => r.json()).then(d => setVehicles(d.data || [])).catch(() => {});
    fetch(`${API}/trips`).then(r => r.json()).then(d => setTrips(d.data || [])).catch(() => {});
  }, []);

  // Trips of the chosen vehicle (or all), newest first
  const tripOptions = useMemo(() => trips
    .filter(t => t.trip_status !== 'Draft' && (!form.vehicle_id || String(t.vehicle_id) === String(form.vehicle_id)))
    .slice(0, 100), [trips, form.vehicle_id]);

  const preset = EXPENSE_PRESETS.find(p => p.label === form.preset) || EXPENSE_PRESETS[0];

  const submit = async (e) => {
    e.preventDefault();
    if (!(Number(form.amount) > 0)) return setError('Enter an amount greater than 0.');
    if (!form.title.trim()) return setError('Enter what the expense was for.');
    if (bill && bill.size > 10 * 1024 * 1024) return setError('Bill must be 10 MB or smaller.');
    const fd = new FormData();
    fd.append('date', form.date);
    fd.append('category', preset.category);
    fd.append('title', form.title.trim());
    fd.append('amount', form.amount);
    if (form.vehicle_id) fd.append('vehicle_id', form.vehicle_id);
    if (form.trip_id) fd.append('trip_id', form.trip_id);
    if (form.paid_to) fd.append('paid_to', form.paid_to);
    if (form.notes) fd.append('notes', form.notes);
    if (bill) fd.append('bill', bill);
    setBusy(true);
    try { await send(`${API}/supervisor-wallet/${supervisor.id}/expense`, fd, true); onSaved(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <Shell title="Record Expense" subtitle={`Paid by ${supervisor.full_name} from wallet · balance ${INR(supervisor.balance)}`}
      onClose={onClose} busy={busy} error={error}
      footer={<Buttons onClose={onClose} busy={busy} label="Record Expense" color="bg-rose-600 hover:bg-rose-700" />}>
      <form id="wallet-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Expense Type</label>
            <select value={form.preset}
              onChange={e => setForm(f => ({ ...f, preset: e.target.value, title: f.title === f.preset || !f.title ? e.target.value : f.title }))}
              className={inp}>
              {EXPENSE_PRESETS.map(p => <option key={p.label}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Amount (₹) <span className="text-red-500">*</span></label>
            <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} className={inp} autoFocus />
          </div>
        </div>
        <div>
          <label className={lbl}>Description <span className="text-red-500">*</span></label>
          <input value={form.title} onChange={e => set('title', e.target.value)} maxLength={255} className={inp} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Vehicle</label>
            <select value={form.vehicle_id} onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value, trip_id: '' }))} className={inp}>
              <option value="">— Not for a vehicle —</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Trip</label>
            <select value={form.trip_id} onChange={e => set('trip_id', e.target.value)} className={inp}>
              <option value="">— No trip —</option>
              {tripOptions.map(t => <option key={t.id} value={t.id}>{t.trip_id} · {t.truck_no}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Date</label>
            <input type="date" max={todayStr()} value={form.date} onChange={e => set('date', e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Paid To</label>
            <input value={form.paid_to} onChange={e => set('paid_to', e.target.value)} placeholder="e.g. Hamali team" className={inp} />
          </div>
        </div>
        <div>
          <label className={lbl}>Bill / Receipt</label>
          {bill ? (
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
              <span className="text-sm text-indigo-800 truncate">{bill.name}</span>
              <button type="button" onClick={() => setBill(null)} className="text-red-400 hover:text-red-600 shrink-0"><FiTrash2 className="w-4 h-4" /></button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 w-full px-3 py-2.5 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
              <FiPaperclip className="w-4 h-4" /> Upload bill (optional)
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { setBill(e.target.files?.[0] || null); e.target.value = ''; }} />
            </label>
          )}
        </div>
        <div>
          <label className={lbl}>Notes</label>
          <input value={form.notes} onChange={e => set('notes', e.target.value)} className={inp} />
        </div>
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
          Deducted from the wallet and added to <strong>Finance → Expenses</strong> ({preset.category}){form.vehicle_id ? ' for this truck' : ''}.
          {Number(form.amount) > 0 && <> Balance after: <strong className={Number(supervisor.balance) - Number(form.amount) < 0 ? 'text-red-600' : 'text-slate-800'}>{INR(Number(supervisor.balance) - Number(form.amount))}</strong></>}
        </p>
      </form>
    </Shell>
  );
}

// ── Adjustment (correction, + or −) ────────────────────────────────────────
export function AdjustModal({ supervisor, onClose, onSaved }) {
  const [form, setForm] = useState({ direction: 'add', amount: '', date: todayStr(), reason: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };
  const signed = (form.direction === 'add' ? 1 : -1) * Number(form.amount || 0);

  const submit = async (e) => {
    e.preventDefault();
    if (!(Number(form.amount) > 0)) return setError('Enter an amount greater than 0.');
    if (!form.reason.trim()) return setError('Enter the reason for this adjustment.');
    setBusy(true);
    try { await send(`${API}/supervisor-wallet/${supervisor.id}/adjust`, { amount: signed, date: form.date, reason: form.reason.trim() }); onSaved(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <Shell title="Wallet Adjustment" subtitle={`${supervisor.full_name} · balance ${INR(supervisor.balance)}`}
      onClose={onClose} busy={busy} error={error}
      footer={<Buttons onClose={onClose} busy={busy} label="Save Adjustment" />}>
      <form id="wallet-form" onSubmit={submit} className="space-y-4">
        <p className="text-xs text-slate-500">Use only to correct a mistake. It appears on the statement with the reason.</p>
        <div className="grid grid-cols-2 gap-2">
          {[['add', 'Increase balance (+)'], ['reduce', 'Reduce balance (−)']].map(([key, label]) => (
            <button key={key} type="button" onClick={() => set('direction', key)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${form.direction === key ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Amount (₹) <span className="text-red-500">*</span></label>
            <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Date</label>
            <input type="date" max={todayStr()} value={form.date} onChange={e => set('date', e.target.value)} className={inp} />
          </div>
        </div>
        <div>
          <label className={lbl}>Reason <span className="text-red-500">*</span></label>
          <input value={form.reason} onChange={e => set('reason', e.target.value)} maxLength={255} placeholder="e.g. Wrong advance entered on TRIP-1012" className={inp} />
        </div>
        {Number(form.amount) > 0 && (
          <p className="text-xs text-slate-500">New balance will be <strong>{INR(Number(supervisor.balance) + signed)}</strong></p>
        )}
      </form>
    </Shell>
  );
}
