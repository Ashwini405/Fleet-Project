import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiEye, FiX, FiInbox, FiPhone, FiMapPin, FiHome, FiUser, FiMail, FiShoppingBag, FiDollarSign, FiUpload, FiFileText, FiCheckCircle, FiCalendar, FiCreditCard, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { TypeBadge, StatusBadge } from './shared';
import { STATUS_PILL, MODAL_ANIM } from './shared/constants';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const DocLink = ({ filename, label }) => {
  if (!filename) return <span className="text-xs text-gray-400">Not uploaded</span>;
  return (
    <a href={`http://localhost:5001/uploads/${filename}`} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
      <FiFileText size={13}/> {label}
    </a>
  );
};

function PurchaseDetailPanel({ activity: a, isCash, onSaved }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState({ purchase_receipt: null, purchase_proof: null });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      setUploading(true);
      const fd = new FormData();
      if (files.purchase_receipt)  fd.append('purchase_receipt',  files.purchase_receipt);
      if (files.purchase_proof)    fd.append('purchase_proof',    files.purchase_proof);
      await axios.patch(`http://localhost:5001/api/vehicles/${a.vehicleId}/purchase-docs`, fd);
      setSaved(true);
      setFiles({ purchase_receipt: null, purchase_proof: null });
      onSaved();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const monthsRemaining = () => {
    if (!a.loan_tenure || !a.purchase_date) return null;
    const start = new Date(a.purchase_date);
    const end = new Date(start);
    end.setMonth(end.getMonth() + Number(a.loan_tenure));
    const now = new Date();
    const diff = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24 * 30)));
    return { total: a.loan_tenure, remaining: diff, end };
  };
  const emi = monthsRemaining();
  const emiCompleted = a.loan_tenure && a.emi_paid_count >= Number(a.loan_tenure);

  return (
    <div className="space-y-5">
      {/* Basic info */}
      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Purchase Date</p>
          <p className="font-bold text-gray-800 text-sm">{fmtDate(a.date)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicle No</p>
          <span className="font-bold text-gray-800 text-sm bg-gray-100 px-2 py-1 inline-block rounded">{a.vehicleNo}</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Purchase Amount</p>
        <p className="text-3xl font-extrabold text-indigo-600">₹{a.amount.toLocaleString()}</p>
      </div>
      {a.desc && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicle</p>
          <p className="text-sm font-semibold text-gray-700">{a.desc}</p>
        </div>
      )}

      {/* EMI / Loan — credit only */}
      {!isCash && a.financier_name && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5"><FiCreditCard size={12}/> Loan / EMI Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Financier</p>
              <p className="text-sm font-bold text-gray-700">{a.financier_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Loan A/C</p>
              <p className="text-sm font-bold text-gray-700">{a.loan_account_number || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">EMI Amount</p>
              <p className="text-sm font-bold text-indigo-600">₹{Number(a.emi_amount || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">EMI Date</p>
              <p className="text-sm font-bold text-gray-700">{a.emi_date ? `${a.emi_date}th of every month` : '—'}</p>
            </div>
          </div>
          {emiCompleted ? (
            <div className="pt-2 border-t border-amber-100 flex items-center gap-2">
              <FiCheckCircle size={14} className="text-green-500"/>
              <p className="text-xs font-bold text-green-600">Loan Fully Paid — {a.emi_paid_count}/{a.loan_tenure} EMIs completed</p>
            </div>
          ) : emi && (
            <div className="pt-2 border-t border-amber-100">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loan Progress</p>
                <p className="text-[11px] font-bold text-amber-600">{a.emi_paid_count}/{a.loan_tenure} EMIs paid</p>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((a.emi_paid_count / Number(a.loan_tenure)) * 100))}%` }}/>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Ends {fmtDate(emi.end)}</p>
            </div>
          )}
        </div>
      )}

      {/* Warranties from Warranty Module */}
      {a.warranties?.length > 0 && (
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FiCalendar size={12}/> Warranties (from Warranty Module)</p>
          {a.warranties.map(w => (
            <div key={w.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-700">{w.item_title}</p>
                  <p className="text-[10px] text-gray-400">{w.category} · {w.warranty_type}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  w.warranty_status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' :
                  w.warranty_status === 'Expired' ? 'bg-red-50 text-red-500 border-red-100' :
                  'bg-gray-100 text-gray-500 border-gray-200'
                }`}>{w.warranty_status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Start</p>
                  <p className="text-xs font-bold text-gray-700">{fmtDate(w.start_date)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">End</p>
                  <p className="text-xs font-bold text-gray-700">{fmtDate(w.end_date)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Period</p>
                  <p className="text-xs font-bold text-gray-700">{w.warranty_period || '—'}</p>
                </div>
              </div>
              {(w.warranty_card || w.invoice_file) && (
                <div className="flex gap-3">
                  {w.warranty_card && <DocLink filename={w.warranty_card} label="Warranty Card" />}
                  {w.invoice_file && <DocLink filename={w.invoice_file} label="Invoice" />}
                </div>
              )}
            </div>
          ))}
          <p className="text-[10px] text-blue-500 font-bold">To add/edit warranties, use the Warranty Module.</p>
        </div>
      )}

      {/* Document uploads */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FiUpload size={12}/> Documents</p>
        {[
          { key: 'purchase_receipt',  label: 'Purchase Receipt',   existing: a.purchase_receipt },
          { key: 'purchase_proof',    label: 'Purchase Proof',     existing: a.purchase_proof },
        ].map(({ key, label, existing }) => (
          <div key={key} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-600">{label}</p>
              {files[key] ? (
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <FiCheckCircle size={13}/> {files[key].name} — click Save to upload
                </p>
              ) : (
                <DocLink filename={existing} label="View uploaded" />
              )}
            </div>
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors shrink-0">
              <FiUpload size={12}/>
              {files[key] ? 'Change' : 'Upload'}
              <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                onChange={e => setFiles(p => ({ ...p, [key]: e.target.files[0] || null }))} />
            </label>
          </div>
        ))}
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-green-600 text-sm font-bold bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          <FiCheckCircle size={15}/> Saved successfully
        </div>
      )}

      <button onClick={handleSave} disabled={uploading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50">
        {uploading ? 'Saving…' : 'Save Documents'}
      </button>
    </div>
  );
}

// Tracks what this showroom has actually paid back on a claim — a running
// history (a claim is often settled in installments), not a single figure.
function ClaimPaymentsPanel({ claimId, claimAmount, onSaved }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ amount: '', payment_date: '', notes: '' });
  const [adding, setAdding] = useState(false);

  const loadPayments = () => {
    if (!claimId) return;
    setLoading(true);
    axios.get(`http://localhost:5001/api/warranty-claims/${claimId}/payments`)
      .then(res => setPayments(res.data?.data || []))
      .catch(err => console.error('FETCH CLAIM PAYMENTS ERROR:', err))
      .finally(() => setLoading(false));
  };

  useEffect(loadPayments, [claimId]);

  const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const handleAdd = async () => {
    const amt = Number(form.amount);
    if (!form.amount || Number.isNaN(amt) || amt <= 0) return alert('Enter a valid amount');
    if (!form.payment_date) return alert('Pick the date received');
    try {
      setAdding(true);
      await axios.post(`http://localhost:5001/api/warranty-claims/${claimId}/payments`, form);
      setForm({ amount: '', payment_date: '', notes: '' });
      loadPayments();
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert('Failed to record payment');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="border-t border-gray-100 pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FiCreditCard size={12}/> Amount Received From Showroom</p>
        {claimAmount > 0 && (
          claimAmount > totalReceived
            ? <span className="text-[11px] font-bold text-yellow-600">₹{(claimAmount - totalReceived).toLocaleString()} pending</span>
            : <span className="text-[11px] font-bold text-green-600">Fully received</span>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-gray-400">Loading payment history…</p>
      ) : payments.length > 0 ? (
        <div className="space-y-1.5">
          {payments.map(p => (
            <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm">
              <span className="font-bold text-gray-700">₹{Number(p.amount).toLocaleString()}</span>
              <span className="text-gray-400 text-xs">{fmtDate(p.payment_date)}</span>
              {p.notes && <span className="text-gray-400 text-xs truncate">· {p.notes}</span>}
            </div>
          ))}
          <p className="text-[11px] text-gray-500 font-bold pt-0.5">Total received: ₹{totalReceived.toLocaleString()}</p>
        </div>
      ) : (
        <p className="text-xs text-gray-400">No payments recorded yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <input type="number" min="0" placeholder="Amount (₹)" value={form.amount}
          onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} disabled={adding}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
        <input type="date" value={form.payment_date}
          onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} disabled={adding}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
        <button onClick={handleAdd} disabled={adding}
          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50">
          {adding ? 'Adding…' : '+ Add Payment'}
        </button>
        <input type="text" placeholder="Notes (optional) — e.g. reference number" value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} disabled={adding}
          className="sm:col-span-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
      </div>
    </div>
  );
}

export default function ShowroomLedger({ vendor, onBack }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showVehiclesModal, setShowVehiclesModal] = useState(false);
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load ledger data from database
  useEffect(() => {
    if (!vendor?.id) return;
    loadLedger();
  }, [vendor]);

  // Refetch when the tab regains focus, so status changes made
  // elsewhere (e.g. Warranty module) show up without a full remount
  useEffect(() => {
    if (!vendor?.id) return;
    const onFocus = () => loadLedger(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [vendor]);

  const loadLedger = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await axios.get(`http://localhost:5001/api/showroom-ledger/${vendor.id}`);
      setLedgerData(res.data.data);
    } catch (error) {
      console.error("LEDGER LOAD ERROR:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Build activities array from vehicles and claims
  const vehicles = ledgerData?.vehicles || [];
  const claims = ledgerData?.claims || [];

  const activities = [
    ...(ledgerData?.vehicles || []).map(v => ({
      id: `vehicle-${v.id}`,
      vehicleId: v.id,
      type: 'Vehicle Purchase',
      vehicleNo: v.vehicle_no,
      date: v.purchase_date,
      amount: Number(v.purchase_amount || 0),
      desc: `${v.make_brand || ''} ${v.model_year || ''}`.trim(),
      ref: v.vehicle_no,
      status: 'Purchased',
      // documents
      purchase_receipt: v.purchase_receipt,
      warranty_document: v.warranty_document,
      purchase_proof: v.purchase_proof,
      // warranty dates
      warranty_start_date: v.warranty_start_date,
      warranty_end_date: v.warranty_end_date,
      warranty_period_months: v.warranty_period_months,
      // EMI / loan
      financier_name: v.financier_name,
      loan_account_number: v.loan_account_number,
      emi_amount: v.emi_amount,
      emi_date: v.emi_date ? new Date(v.emi_date).getDate() : null,
      loan_tenure: v.loan_tenure,
      emi_paid_count: Number(v.emi_paid_count || 0),
      // warranties from warranties table
      warranties: (ledgerData?.warranties || []).filter(w => w.vehicle_no === v.vehicle_no),
    })),
    ...(ledgerData?.claims || []).map(c => ({
      id: `claim-${c.id}`,
      type: 'Warranty Claim Raised',
      vehicleNo: c.vehicle_no,
      date: c.claim_date,
      amount: Number(c.claim_available_amount || 0),
      desc: c.issue_description,
      ref: c.claim_number,
      claimId: c.claim_number,
      claimDbId: c.id,
      receivedAmount: Number(c.approved_amount || 0),
      category: c.category,
      status: c.claim_status,
      submittedDate: c.claim_date,
      lastUpdated: c.updated_at
    }))
  ];

  // Keep the open detail modal in sync with freshly reloaded ledger data
  // (selectedActivity is a snapshot taken at click-time and won't otherwise
  // pick up e.g. newly uploaded document filenames after a save/refresh)
  useEffect(() => {
    setSelectedActivity(prev => {
      if (!prev) return prev;
      return activities.find(x => x.id === prev.id) || prev;
    });
  }, [ledgerData]);

  // Summary values from database
  const vehiclesPurchased = ledgerData?.summary?.totalVehicles || 0;
  const totalPurchaseValue = ledgerData?.summary?.totalPurchaseValue || 0;
  const totalClaims = ledgerData?.summary?.totalClaims || 0;
  const pendingClaims = ledgerData?.summary?.pendingClaims || 0;
  const approvedClaims = ledgerData?.summary?.approvedClaims || 0;
  const rejectedClaims = ledgerData?.summary?.rejectedClaims || 0;
  const pendingWarrantyAmt = ledgerData?.summary?.pendingAmount || 0;
  const totalReceivedAmt = ledgerData?.summary?.totalReceived || 0;

  const FILTERS = [
    { label: 'All' },
    { label: 'Purchases' },
    { label: 'Claims Raised' },
    { label: 'Approved' },
    { label: 'Rejected' },
    { label: 'Settled' },
  ];

  const visible = activeFilter === 'All'
    ? activities
    : activities.filter(a => {
      if (activeFilter === 'Purchases') {
        return a.type === 'Vehicle Purchase';
      }
      if (activeFilter === 'Claims Raised') {
        return a.type === 'Warranty Claim Raised';
      }
      if (activeFilter === 'Approved') {
        return a.status?.toLowerCase() === 'approved';
      }
      if (activeFilter === 'Rejected') {
        return a.status?.toLowerCase() === 'rejected';
      }
      if (activeFilter === 'Settled') {
        return a.status?.toLowerCase() === 'resolved';
      }
      return true;
    });

  const showroom = ledgerData?.showroom || {};
  const isCash = (showroom.payment_terms || vendor?.payment_terms) === 'cash';
  const bankName =
    showroom.bank_name ||
    showroom.custom_bank_name ||
    'Not provided';
  const bankAccNo = showroom.account_number || null;
  const isPurchase = (a) => a.type === 'Vehicle Purchase';

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-pulse text-gray-400">Loading ledger...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Nav */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
          <FiArrowLeft /> Showroom Accounts
        </button>
        <button
          onClick={() => loadLedger(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw size={13} className={refreshing ? 'animate-spin' : ''}/> Refresh
        </button>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-50">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Showroom / Dealer</div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-3">{showroom.showroom_name}</h2>
            <div className="space-y-1.5 mb-5">
              {showroom.mobile_number && <div className="flex items-center gap-2 text-sm text-gray-500 font-medium"><FiPhone className="text-gray-400 shrink-0" size={13}/> {showroom.mobile_number}</div>}
              {showroom.address_location && <div className="flex items-center gap-2 text-sm text-gray-500 font-medium"><FiMapPin className="text-gray-400 shrink-0" size={13}/> {showroom.address_location}</div>}
              {showroom.contact_person && (
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <FiUser className="text-gray-400 shrink-0" size={13}/> {showroom.contact_person}
                  {showroom.designation && <span className="text-gray-400 text-xs">&nbsp;· {showroom.designation}</span>}
                </div>
              )}
              {showroom.email && <div className="flex items-center gap-2 text-sm text-gray-500 font-medium"><FiMail className="text-gray-400 shrink-0" size={13}/> {showroom.email}</div>}
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl max-w-xs border border-gray-100">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 shrink-0"><FiHome size={16}/></div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Bank Details</div>
                <div className="text-xs font-bold text-gray-700">{bankName}</div>
                {bankAccNo && <div className="text-[11px] text-gray-500 font-medium">A/C: {bankAccNo}</div>}
              </div>
            </div>
          </div>

          {/* Pending warranty card — the showroom owes this to us, not the other way around */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl md:min-w-[210px] text-right shrink-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Warranty Amount</div>
            {pendingWarrantyAmt === 0 ? (
              <>
                <div className="text-4xl font-black tracking-tighter text-gray-400">₹0</div>
                <span className="inline-block mt-2 text-[11px] font-bold text-green-600 bg-green-50 border border-green-100 px-3 py-0.5 rounded-full">Warranty Cleared</span>
              </>
            ) : (
              <>
                <div className="text-xs font-bold text-yellow-600 mb-1">{pendingClaims} Claim{pendingClaims !== 1 ? 's' : ''} Pending</div>
                <div className="text-4xl font-black tracking-tighter text-yellow-600">₹{pendingWarrantyAmt.toLocaleString()}</div>
              </>
            )}
            {totalReceivedAmt > 0 && (
              <div className="text-[11px] text-gray-400 font-medium mt-2">₹{totalReceivedAmt.toLocaleString()} received so far</div>
            )}
          </div>
        </div>

        {/* Purchase summary */}
        <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
          <button onClick={() => setShowVehiclesModal(true)} className="p-4 text-center hover:bg-indigo-50/50 transition-colors group">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicles Purchased</div>
            <div className="text-lg font-black text-indigo-600 group-hover:underline">{vehiclesPurchased}</div>
            <div className="text-[10px] text-indigo-400 font-medium mt-0.5">Click to view list</div>
          </button>
          <div className="p-4 text-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Purchase Value</div>
            <div className="text-lg font-black text-gray-800">₹{totalPurchaseValue.toLocaleString()}</div>
          </div>
        </div>

        {/* Warranty summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
          {[
            ['Total Claims', totalClaims, 'text-gray-700'],
            ['Pending', pendingClaims, 'text-yellow-500'],
            ['Approved', approvedClaims, 'text-green-500'],
            ['Rejected', rejectedClaims, 'text-red-400']
          ].map(([lbl, val, cls]) => (
            <div key={lbl} className="p-4 text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{lbl}</div>
              <div className={`text-lg font-black ${cls}`}>{val}</div>
            </div>
          ))}
        </div>

        {/* Activity table */}
        <div className="overflow-x-auto p-4">
          {activities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {FILTERS.map(f => (
                <button
                  key={f.label}
                  onClick={() => setActiveFilter(f.label)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${activeFilter === f.label ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <FiInbox size={40} className="text-gray-300"/>
              <p className="font-semibold text-sm">{activities.length === 0 ? 'No activity recorded.' : 'No activity matches this filter.'}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2 px-2 md:px-4">Date</th>
                  <th className="py-2 px-2 md:px-4">Activity Type</th>
                  <th className="py-2 px-2 md:px-4 hidden sm:table-cell">Vehicle No</th>
                  <th className="py-2 px-2 md:px-4">Description</th>
                  <th className="py-2 px-2 md:px-4 text-right">Amount</th>
                  <th className="py-2 px-2 md:px-4 text-center hidden sm:table-cell">Status</th>
                  <th className="py-2 px-2 md:px-4 text-center hidden md:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-2 md:px-4"><span className="text-xs font-bold text-gray-600 whitespace-nowrap">{fmtDate(a.date)}</span></td>
                    <td className="py-3 px-2 md:px-4"><TypeBadge type={a.type}/></td>
                    <td className="py-3 px-2 md:px-4 hidden sm:table-cell"><span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{a.vehicleNo}</span></td>
                    <td className="py-3 px-2 md:px-4">
                      <div className="text-xs md:text-sm font-semibold text-gray-700">{a.desc}</div>
                      <div className="text-[10px] text-gray-400 font-medium mt-0.5">REF: {a.ref}</div>
                    </td>
                    <td className="py-3 px-2 md:px-4 text-right">
                      {a.amount > 0 ? (
                        <span className={`inline-flex items-center gap-1 font-bold text-xs md:text-sm ${
                          isPurchase(a)
                            ? 'text-indigo-600'
                            : a.receivedAmount >= a.amount ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {!isPurchase(a) && a.receivedAmount >= a.amount && <FiCheckCircle size={12}/>}
                          ₹{a.amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300 font-bold">—</span>
                      )}
                    </td>
                    <td className="py-3 px-2 md:px-4 text-center hidden sm:table-cell"><StatusBadge status={a.status}/></td>
                    <td className="py-3 px-2 md:px-4 text-center hidden md:table-cell">
                      <button onClick={() => setSelectedActivity(a)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <FiEye size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Vehicles Purchased Modal */}
      {showVehiclesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" style={{ animation: 'modalSlideIn 0.2s ease-out' }}>
            <div className="flex justify-between items-center p-4 bg-gray-900">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="text-indigo-400" size={16}/>
                <h3 className="text-sm font-bold text-white">Vehicles Purchased — {showroom.showroom_name}</h3>
              </div>
              <button onClick={() => setShowVehiclesModal(false)} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <FiX size={18}/>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {vehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                  <FiInbox size={36} className="text-gray-300"/>
                  <p className="text-sm font-semibold">No vehicles linked.</p>
                </div>
              ) : (
                <>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2 px-3">Vehicle No</th>
                        <th className="py-2 px-3">Brand</th>
                        <th className="py-2 px-3 hidden sm:table-cell">Model</th>
                        <th className="py-2 px-3 hidden sm:table-cell">Purchase Date</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {vehicles.map((v, i) => (
                        <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-3"><span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">{v.vehicle_no}</span></td>
                          <td className="py-3 px-3 text-sm font-semibold text-gray-700">{v.make_brand}</td>
                          <td className="py-3 px-3 text-sm text-gray-500 hidden sm:table-cell">{v.model_year}</td>
                          <td className="py-3 px-3 text-xs text-gray-500 hidden sm:table-cell">{fmtDate(v.purchase_date)}</td>
                          <td className="py-3 px-3 text-right font-bold text-indigo-600 text-sm">₹{Number(v.purchase_amount).toLocaleString()}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_PILL[v.vehicle_status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              {v.vehicle_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pt-4 border-t border-gray-100 mt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} · Total: <span className="font-bold text-indigo-600">₹{vehicles.reduce((s, v) => s + Number(v.purchase_amount), 0).toLocaleString()}</span>
                    </div>
                    <button onClick={() => setShowVehiclesModal(false)} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors">
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <style>{MODAL_ANIM}</style>
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ animation: 'modalSlideIn 0.2s ease-out' }}>
            <div className="flex justify-between items-center p-4 bg-gray-900">
              <h3 className="text-sm font-bold text-white">{isPurchase(selectedActivity) ? 'Purchase Details' : 'Warranty Claim Details'}</h3>
              <button onClick={() => setSelectedActivity(null)} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <FiX size={18}/>
              </button>
            </div>
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {isPurchase(selectedActivity) ? (
                <PurchaseDetailPanel activity={selectedActivity} isCash={isCash} onSaved={() => loadLedger(true)} />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Claim Number</p>
                      <p className="font-bold text-gray-800 text-sm">{selectedActivity.claimId || selectedActivity.ref}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <StatusBadge status={selectedActivity.status}/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicle No</p>
                      <span className="font-bold text-gray-800 text-sm bg-gray-100 px-2 py-1 inline-block rounded">{selectedActivity.vehicleNo}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</p>
                      <p className="font-bold text-gray-700 text-sm">{selectedActivity.category || '—'}</p>
                    </div>
                  </div>
                  {selectedActivity.amount > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Claim Amount</p>
                      <p className="text-3xl font-extrabold text-yellow-600">₹{selectedActivity.amount.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Submitted</p>
                      <p className="font-bold text-gray-700 text-sm">{fmtDate(selectedActivity.submittedDate || selectedActivity.date)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Updated</p>
                      <p className="font-bold text-gray-700 text-sm">{fmtDate(selectedActivity.lastUpdated)}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                    <div className="bg-gray-50 text-gray-600 p-3 rounded-lg border border-gray-100 text-sm">{selectedActivity.desc}</div>
                  </div>
                  <ClaimPaymentsPanel
                    claimId={selectedActivity.claimDbId}
                    claimAmount={selectedActivity.amount}
                    onSaved={() => loadLedger(true)}
                  />
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-bold text-blue-500">Status can only be updated in the Warranty Module.</p>
                  </div>
                </>
              )}
              <button onClick={() => setSelectedActivity(null)} className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">
                Close
              </button>
            </div>
          </div>
          <style>{MODAL_ANIM}</style>
        </div>
      )}
    </div>
  );
}