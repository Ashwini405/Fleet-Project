import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Eye, ChevronDown } from 'lucide-react';

const CLAIM_STATUSES = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Resolved', 'Pending Parts'];

const catStyles = {
  Battery:      'bg-blue-100   text-blue-700',
  Tyres:        'bg-indigo-100 text-indigo-700',
  Engine:       'bg-red-100    text-red-700',
  Electrical:   'bg-yellow-100 text-yellow-700',
  Brakes:       'bg-pink-100   text-pink-700',
  'AC System':  'bg-cyan-100   text-cyan-700',
  Suspension:   'bg-lime-100   text-lime-700',
  'Fuel System':'bg-amber-100  text-amber-700',
  Other:        'bg-slate-100  text-slate-600',
};

const statusStyles = {
  'Submitted':    'bg-blue-50   text-blue-600   border border-blue-200',
  'Under Review': 'bg-purple-50 text-purple-600 border border-purple-200',
  'Approved':     'bg-green-50  text-green-600  border border-green-200',
  'Rejected':     'bg-red-50    text-red-500    border border-red-200',
  'Resolved':     'bg-teal-50   text-teal-600   border border-teal-200',
  'Pending Parts':'bg-orange-50 text-orange-500 border border-orange-200',
  'Draft':        'bg-slate-100 text-slate-500  border border-slate-200',
};

const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
};

const safeParse = (value) => {
  try {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return JSON.parse(value);
  } catch { return [value]; }
};

const SectionTitle = ({ children }) => (
  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100">{children}</p>
);

const Field = ({ label, children }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
    <div className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm font-medium text-slate-700 min-h-[36px] flex items-center">
      {children || <span className="text-slate-300">—</span>}
    </div>
  </div>
);

export default function ViewClaimModal({ isOpen, onClose, itemData, onUpdated }) {
  const [status,  setStatus]  = useState(null); // null = use itemData value
  const [saving,  setSaving]  = useState(false);
  const [amount,       setAmount]       = useState(null); // null = use itemData value
  const [amountInput,  setAmountInput]  = useState(null); // draft text while editing
  const [savingAmount, setSavingAmount] = useState(false);

  // Payment history — a showroom often pays a claim back in more than one
  // installment, so this is a running log rather than a single overwritable total.
  const [payments,       setPayments]       = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [newPayment,     setNewPayment]     = useState({ amount: '', payment_date: '', notes: '' });
  const [addingPayment,  setAddingPayment]  = useState(false);

  useEffect(() => {
    if (!isOpen || !itemData?.id) return;
    setLoadingPayments(true);
    fetch(`http://localhost:5001/api/warranty-claims/${itemData.id}/payments`)
      .then(r => r.json())
      .then(data => { if (data.success) setPayments(data.data || []); })
      .catch(err => console.error('FETCH CLAIM PAYMENTS ERROR:', err))
      .finally(() => setLoadingPayments(false));
  }, [isOpen, itemData?.id]);

  if (!isOpen || !itemData) return null;

  const d           = itemData;
  const currentStatus = status ?? (d.claim_status || 'Submitted');
  const currentAmount = amount ?? (d.claim_available_amount || 0);
  const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const itemPhotos  = safeParse(d.item_photos);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setSaving(true);
    try {
      const res  = await fetch(`http://localhost:5001/api/warranty-claims/${d.id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ claim_status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to update status');
        setStatus(d.claim_status); // revert
      } else {
        onUpdated?.();
      }
    } catch {
      alert('Server Error');
      setStatus(d.claim_status);
    } finally {
      setSaving(false);
    }
  };

  const handleAmountSave = async () => {
    const newAmount = Number(amountInput);
    if (amountInput === '' || Number.isNaN(newAmount) || newAmount < 0) {
      alert('Enter a valid amount');
      return;
    }
    setSavingAmount(true);
    try {
      const res  = await fetch(`http://localhost:5001/api/warranty-claims/${d.id}/amount`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ claim_available_amount: newAmount }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to update claim amount');
      } else {
        setAmount(newAmount);
        setAmountInput(null);
        onUpdated?.();
      }
    } catch {
      alert('Server Error');
    } finally {
      setSavingAmount(false);
    }
  };

  // The showroom is the one who owes money here — this logs each payment
  // they actually pay back on the claim (there can be more than one),
  // which nothing previously tracked.
  const handleAddPayment = async () => {
    const amt = Number(newPayment.amount);
    if (!newPayment.amount || Number.isNaN(amt) || amt <= 0) {
      alert('Enter a valid amount');
      return;
    }
    if (!newPayment.payment_date) {
      alert('Pick the date received');
      return;
    }
    setAddingPayment(true);
    try {
      const res  = await fetch(`http://localhost:5001/api/warranty-claims/${d.id}/payments`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(newPayment),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to record payment');
      } else {
        setPayments(prev => [{ ...newPayment, amount: amt, id: `tmp-${Date.now()}` }, ...prev]);
        setNewPayment({ amount: '', payment_date: '', notes: '' });
        onUpdated?.();
      }
    } catch {
      alert('Server Error');
    } finally {
      setAddingPayment(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.16 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#1a4731] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Claim Details</h2>
                <p className="text-[11px] text-green-300 font-mono mt-0.5">{d.claim_number || '—'}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 bg-white">

            {/* Status changer */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Claim Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusStyles[currentStatus] || statusStyles.Draft}`}>
                  {currentStatus}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {saving && <span className="text-[11px] text-slate-400 font-medium">Saving...</span>}
                <div className="relative">
                  <select
                    value={currentStatus}
                    onChange={e => handleStatusChange(e.target.value)}
                    disabled={saving}
                    className="appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer disabled:opacity-50"
                  >
                    {CLAIM_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Claim Details */}
            <div>
              <SectionTitle>Claim Details</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Warranty Ref">{d.warranty_number}</Field>
                <Field label="Category">
                  {d.category && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${catStyles[d.category] || catStyles.Other}`}>
                      {d.category}
                    </span>
                  )}
                </Field>
                <Field label="Serial Number">
                  <span className="font-mono text-xs">{d.serial_no}</span>
                </Field>
                <Field label="Submit Date">{formatDate(d.claim_date || d.submit_date)}</Field>
                <Field label="Complaint Number">{d.complaint_number}</Field>
                <Field label="Complaint Docket">{d.complaint_docket}</Field>
                <Field label="Date Sent to Vendor">{formatDate(d.date_sent_to_vendor)}</Field>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Claim Amount (₹)</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Not yet quoted"
                      value={amountInput ?? currentAmount}
                      onChange={e => setAmountInput(e.target.value)}
                      disabled={savingAmount}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    />
                    {amountInput !== null && Number(amountInput) !== currentAmount && (
                      <button
                        onClick={handleAmountSave}
                        disabled={savingAmount}
                        className="shrink-0 px-3 py-2 rounded-lg bg-[#1a4731] hover:bg-[#153d28] text-white text-xs font-semibold disabled:opacity-50"
                      >
                        {savingAmount ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">Issue Description</p>
                <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-sm text-slate-700 min-h-[72px] leading-relaxed">
                  {d.issue_description || <span className="text-slate-300">No description provided.</span>}
                </div>
              </div>
            </div>

            {/* Amount Received — this is money the showroom pays back to you,
                not the other way around. Logged as a history since a claim
                is often settled in more than one installment. */}
            <div>
              <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Received From Showroom</p>
                <p className="text-[11px] font-semibold text-slate-400">
                  {currentAmount > totalReceived
                    ? <span className="text-amber-600">₹{(currentAmount - totalReceived).toLocaleString()} pending</span>
                    : currentAmount > 0 ? <span className="text-green-600">Fully received</span> : null}
                </p>
              </div>

              {loadingPayments ? (
                <p className="text-xs text-slate-400">Loading payment history…</p>
              ) : payments.length > 0 ? (
                <div className="space-y-1.5 mb-3">
                  {payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-700">₹{Number(p.amount).toLocaleString()}</span>
                        <span className="text-slate-400 text-xs">{formatDate(p.payment_date)}</span>
                        {p.notes && <span className="text-slate-400 text-xs truncate">· {p.notes}</span>}
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-500 font-semibold pt-1">Total received: ₹{totalReceived.toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mb-3">No payments recorded yet.</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-white border border-slate-200 rounded-xl">
                <input
                  type="number"
                  min="0"
                  placeholder="Amount (₹)"
                  value={newPayment.amount}
                  onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))}
                  disabled={addingPayment}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                />
                <input
                  type="date"
                  value={newPayment.payment_date}
                  onChange={e => setNewPayment(p => ({ ...p, payment_date: e.target.value }))}
                  disabled={addingPayment}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                />
                <button
                  onClick={handleAddPayment}
                  disabled={addingPayment}
                  className="px-3 py-2 rounded-lg bg-[#1a4731] hover:bg-[#153d28] text-white text-xs font-semibold disabled:opacity-50"
                >
                  {addingPayment ? 'Adding…' : '+ Add Payment'}
                </button>
                <input
                  type="text"
                  placeholder="Notes (optional) — e.g. reference number"
                  value={newPayment.notes}
                  onChange={e => setNewPayment(p => ({ ...p, notes: e.target.value }))}
                  disabled={addingPayment}
                  className="sm:col-span-3 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <SectionTitle>Attachments</SectionTitle>
              {itemPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {itemPhotos.map((photo, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-3 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-600 font-medium truncate">{photo}</span>
                      </div>
                      <a href={`http://localhost:5001/uploads/${photo}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 shrink-0">
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                  <p className="text-xs text-slate-400 font-medium">No photos uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-5 py-3 flex justify-end bg-white shrink-0">
            <button onClick={onClose}
              className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
