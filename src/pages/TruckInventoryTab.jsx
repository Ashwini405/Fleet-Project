import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiPlus, FiRefreshCw, FiChevronDown, FiX, FiAlertTriangle } from 'react-icons/fi';

const API = 'http://localhost:5001/api';

const CONDITION_OPTIONS = ['Good', 'Damaged', 'Needs Replacement', 'Under Inspection', 'Returned'];
const RETURN_REASONS    = ['Worn Out', 'Damaged', 'Excess', 'Defective', 'Scheduled Return', 'Other'];

const CONDITION_STYLE = {
  'Good':               'bg-green-50 text-green-700 border-green-200',
  'Damaged':            'bg-red-50 text-red-700 border-red-200',
  'Needs Replacement':  'bg-orange-50 text-orange-700 border-orange-200',
  'Under Inspection':   'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Returned':           'bg-slate-100 text-slate-500 border-slate-200',
};

const getCondition = (item) => item.condition_status || item.condition || 'Good';

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Small reusable modal shell ────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto space-y-4 flex-1">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
    >
      {children}
    </select>
  );
}

function Textarea(props) {
  return (
    <textarea
      rows={2}
      {...props}
      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
    />
  );
}

// ── Return Part Modal ─────────────────────────────────────────────────────────
function ReturnModal({ item, onClose, onSuccess, showToast }) {
  const [form, setForm] = useState({
    return_quantity: '',
    return_date: new Date().toISOString().slice(0, 10),
    reason: '',
    remarks: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    const qty = Number(form.return_quantity);
    if (!qty || qty <= 0) e.return_quantity = 'Enter a valid quantity';
    if (qty > item.quantity) e.return_quantity = `Cannot exceed assigned quantity (${item.quantity})`;
    if (!form.return_date) e.return_date = 'Return date is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/vehicle-inventory/${item.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          return_quantity: Number(form.return_quantity),
          condition_on_return: getCondition(item),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast('Part returned successfully');
      onSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to return part', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Return Part"
      subtitle={item.item_name}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60">
            {saving ? 'Processing…' : 'Confirm Return'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div><span className="text-slate-400 font-semibold uppercase">Part</span><p className="font-bold text-slate-800 mt-0.5">{item.item_name}</p></div>
        <div><span className="text-slate-400 font-semibold uppercase">Assigned Qty</span><p className="font-bold text-slate-800 mt-0.5">{item.quantity}</p></div>
        <div><span className="text-slate-400 font-semibold uppercase">Category</span><p className="font-bold text-slate-800 mt-0.5">{item.category}</p></div>
        <div><span className="text-slate-400 font-semibold uppercase">Condition</span><p className="font-bold text-slate-800 mt-0.5">{getCondition(item)}</p></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Return Quantity" required error={errors.return_quantity}>
          <Input type="number" min="1" max={item.quantity} value={form.return_quantity}
            onChange={e => setForm(f => ({ ...f, return_quantity: e.target.value }))} placeholder="0" />
        </Field>
        <Field label="Return Date" required error={errors.return_date}>
          <Input type="date" value={form.return_date}
            onChange={e => setForm(f => ({ ...f, return_date: e.target.value }))} />
        </Field>
      </div>

      <Field label="Reason">
        <Select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}>
          <option value="">Select reason</option>
          {RETURN_REASONS.map(r => <option key={r}>{r}</option>)}
        </Select>
      </Field>

      <Field label="Remarks">
        <Textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes…" />
      </Field>
    </Modal>
  );
}

// ── Replace Part Modal ────────────────────────────────────────────────────────
function ReplaceModal({ item, onClose, onSuccess, showToast }) {
  const [parts, setParts] = useState([]);
  const [form, setForm] = useState({
    new_inventory_item_id: '',
    new_item_name: '',
    new_category: '',
    quantity: item.quantity,
    replace_date: new Date().toISOString().slice(0, 10),
    reason: '',
    remarks: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/vehicle-inventory/parts`)
      .then(r => r.json())
      .then(d => setParts(d.data || []))
      .catch(() => {});
  }, []);

  const selectedPart = parts.find(p => String(p.id) === String(form.new_inventory_item_id));

  const handlePartSelect = (e) => {
    const id = e.target.value;
    const p = parts.find(pt => String(pt.id) === id);
    setForm(f => ({
      ...f,
      new_inventory_item_id: id,
      new_item_name: p?.part_name || '',
      new_category: p?.category || '',
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.new_item_name) e.new_item_name = 'Select or enter a new part';
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Enter valid quantity';
    if (!form.replace_date) e.replace_date = 'Replace date is required';
    if (selectedPart && Number(form.quantity) > selectedPart.current_stock)
      e.quantity = `Only ${selectedPart.current_stock} in stock`;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/vehicle-inventory/${item.id}/replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast('Part replaced successfully');
      onSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to replace part', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Replace Part"
      subtitle={`Replacing: ${item.item_name}`}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60">
            {saving ? 'Processing…' : 'Confirm Replace'}
          </button>
        </>
      }
    >
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium">
        Old part <strong>{item.item_name}</strong> (qty {item.quantity}) will be returned to inventory.
      </div>

      <Field label="New Part" required error={errors.new_item_name}>
        <Select value={form.new_inventory_item_id} onChange={handlePartSelect}>
          <option value="">Select from inventory</option>
          {parts.map(p => (
            <option key={p.id} value={p.id}>{p.part_name} — Stock: {p.current_stock}</option>
          ))}
        </Select>
      </Field>

      {selectedPart && (
        <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div><span className="text-slate-400">Category</span><p className="font-bold text-slate-700">{selectedPart.category}</p></div>
          <div><span className="text-slate-400">Available Stock</span><p className="font-bold text-slate-700">{selectedPart.current_stock}</p></div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Quantity" required error={errors.quantity}>
          <Input type="number" min="1" value={form.quantity}
            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
        </Field>
        <Field label="Replace Date" required error={errors.replace_date}>
          <Input type="date" value={form.replace_date}
            onChange={e => setForm(f => ({ ...f, replace_date: e.target.value }))} />
        </Field>
      </div>

      <Field label="Reason">
        <Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Worn out, Upgrade" />
      </Field>

      <Field label="Remarks">
        <Textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes…" />
      </Field>
    </Modal>
  );
}

// ── Update Condition Modal ────────────────────────────────────────────────────
function ConditionModal({ item, onClose, onSuccess, showToast }) {
  const [form, setForm] = useState({ new_condition: getCondition(item), remarks: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.new_condition) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/vehicle-inventory/${item.id}/condition`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast('Condition updated');
      onSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to update condition', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Update Condition"
      subtitle={item.item_name}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60">
            {saving ? 'Saving…' : 'Update Condition'}
          </button>
        </>
      }
    >
      <Field label="Current Condition">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${CONDITION_STYLE[getCondition(item)] || CONDITION_STYLE['Good']}`}>
          {getCondition(item)}
        </div>
      </Field>

      <Field label="New Condition" required>
        <div className="flex flex-wrap gap-2">
          {CONDITION_OPTIONS.map(c => (
            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, new_condition: c }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                form.new_condition === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
              }`}>{c}</button>
          ))}
        </div>
      </Field>

      <Field label="Remarks">
        <Textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Reason for condition change…" />
      </Field>
    </Modal>
  );
}

// ── Remove Assignment Confirm Modal ───────────────────────────────────────────
function RemoveModal({ item, onClose, onSuccess, showToast }) {
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/vehicle-inventory/${item.id}/remove`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast('Assignment removed');
      onSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to remove assignment', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Remove Assignment" onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleConfirm} disabled={saving} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition disabled:opacity-60">
            {saving ? 'Removing…' : 'Confirm Remove'}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <FiAlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-700">Remove inventory assignment?</p>
          <p className="text-xs text-red-600 mt-1">
            <strong>{item.item_name}</strong> (qty {item.quantity}) will be unassigned from this truck and stock will be restored to central inventory.
          </p>
        </div>
      </div>
    </Modal>
  );
}

// ── Actions Dropdown ──────────────────────────────────────────────────────────
function ActionsDropdown({ item, onAction }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const btnRef = React.useRef(null);

  const actions = [
    { key: 'return',    label: 'Return Part',       color: 'text-amber-700' },
    { key: 'replace',   label: 'Replace Part',      color: 'text-blue-700' },
    { key: 'condition', label: 'Update Condition',  color: 'text-indigo-700' },
    { key: 'remove',    label: 'Remove Assignment', color: 'text-red-600' },
  ];

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 192;
      const left = Math.min(rect.left, window.innerWidth - menuWidth - 12);
      setDropPos({
        top: Math.min(rect.bottom + 8, window.innerHeight - 180),
        left: Math.max(12, left),
      });
    }
    setOpen(o => !o);
  };

  return (
    <div className="relative inline-block overflow-visible">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
      >
        Actions <FiChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[9999] bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-48"
            style={{ top: `${dropPos.top}px`, left: `${dropPos.left}px` }}
          >
            {actions.map(a => (
              <button
                key={a.key}
                onClick={() => { setOpen(false); onAction(a.key, item); }}
                className={`block w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition ${a.color}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

// ── Main TruckInventoryTab ────────────────────────────────────────────────────
export default function TruckInventoryTab({ vehicle, onAddItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // { type, item }
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    if (!vehicle?.vehicle_no) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vehicle-inventory/${encodeURIComponent(vehicle.vehicle_no)}`);
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch {
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  }, [vehicle]);

  useEffect(() => { load(); }, [load]);

  const handleAction = (type, item) => setActiveModal({ type, item });
  const handleSuccess = () => { setActiveModal(null); load(); };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Truck Inventory</h2>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Refresh">
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <button onClick={onAddItem}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm">
            <FiPlus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto overflow-visible">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Item Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-center">Quantity</th>
                <th className="px-5 py-3">Assigned Date</th>
                <th className="px-5 py-3">Condition</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">Loading inventory…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">No inventory items assigned to this truck.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{item.item_name}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2 py-1 rounded bg-slate-100 text-slate-600 font-medium text-xs border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-800">{item.quantity}</td>
                    <td className="px-5 py-3.5 text-slate-600">{fmt(item.assigned_date)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${CONDITION_STYLE[getCondition(item)] || CONDITION_STYLE['Good']}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {getCondition(item)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <ActionsDropdown item={item} onAction={handleAction} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {activeModal?.type === 'return' && (
        <ReturnModal item={activeModal.item} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} showToast={showToast} />
      )}
      {activeModal?.type === 'replace' && (
        <ReplaceModal item={activeModal.item} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} showToast={showToast} />
      )}
      {activeModal?.type === 'condition' && (
        <ConditionModal item={activeModal.item} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} showToast={showToast} />
      )}
      {activeModal?.type === 'remove' && (
        <RemoveModal item={activeModal.item} onClose={() => setActiveModal(null)} onSuccess={handleSuccess} showToast={showToast} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-xl transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
