import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, UploadCloud, ChevronDown } from 'lucide-react';

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls  = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-slate-300';
const selectCls = inputCls + ' appearance-none pr-7 cursor-pointer';
const readCls   = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 cursor-not-allowed';

// ── Sub-components ────────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100">{children}</p>
);

const Label = ({ children, required }) => (
  <label className="block text-xs font-semibold text-slate-600 mb-1">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const Inp = ({ label, required, ...props }) => (
  <div>
    <Label required={required}>{label}</Label>
    <input {...props} className={inputCls} />
  </div>
);

const Sel = ({ label, required, value, onChange, children }) => (
  <div>
    <Label required={required}>{label}</Label>
    <div className="relative">
      <select value={value} onChange={onChange} className={selectCls}>
        {children}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

const ReadField = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
    <div className={readCls + ' min-h-[36px] flex items-center'}>
      {value || <span className="text-slate-300">—</span>}
    </div>
  </div>
);

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function AddClaimModal({ isOpen, onClose, onSubmit }) {
  const [warranties, setWarranties]           = useState([]);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [files, setFiles]                     = useState({ itemPhotos: [] });
  const [fd, setFd] = useState({
    warrantyId:       '',
    submitDate:       '',
    dateSentToVendor: '',
    issueDescription: '',
    complaintNumber:  '',
    complaintDocket:  '',
  });

  const set = (f, v) => setFd(p => ({ ...p, [f]: v }));

  useEffect(() => {
    fetch('http://localhost:5001/api/warranties')
      .then(r => r.json())
      .then(data => {
        if (data.success) setWarranties(data.data || []);
      })
      .catch(err => console.error('FETCH WARRANTIES ERROR:', err));
  }, []);

  const handleWarrantySelect = (e) => {
    const id = Number(e.target.value);
    const w  = warranties.find(x => x.id === id) || null;
    setSelectedWarranty(w);
    set('warrantyId', id || '');
  };

  const isValid =
    fd.warrantyId &&
    fd.submitDate &&
    fd.issueDescription &&
    fd.complaintNumber &&
    fd.complaintDocket &&
    files.itemPhotos.length > 0;

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('claim_number',       `CL-${Date.now()}`);
      formData.append('warranty_id',        fd.warrantyId);
      formData.append('submit_date',        fd.submitDate);
      formData.append('date_sent_to_vendor',fd.dateSentToVendor);
      formData.append('issue_description',  fd.issueDescription);
      formData.append('complaint_number',   fd.complaintNumber);
      formData.append('complaint_docket',   fd.complaintDocket);
      formData.append('claim_status',        'Submitted');
      formData.append('created_by',           'Admin');

      // Snapshot fields from selected warranty
      if (selectedWarranty) {
        formData.append('warranty_number', selectedWarranty.warranty_number || '');
        formData.append('item_title',      selectedWarranty.item_title      || '');
        formData.append('category',        selectedWarranty.category        || '');
        formData.append('brand',           selectedWarranty.brand           || '');
        formData.append('model',           selectedWarranty.model           || '');
        formData.append('serial_no',       selectedWarranty.serial_no       || '');
        formData.append('vehicle_id',      selectedWarranty.vehicle_id      || '');
        formData.append('vehicle_no',      selectedWarranty.vehicle_no      || '');
      }

      files.itemPhotos.forEach(file => formData.append('item_photos', file));

      const res  = await fetch('http://localhost:5001/api/warranty-claims', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        alert('Warranty Claim Submitted Successfully');
        onSubmit?.(data.data);
        onClose();
      } else {
        alert(data.message || 'Failed to submit claim');
      }
    } catch (err) {
      console.error('SUBMIT CLAIM ERROR:', err);
      alert('Server Error');
    }
  };

  if (!isOpen) return null;

  const w = selectedWarranty;

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
              <h2 className="text-base font-bold text-white">New Claim Entry</h2>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 bg-white">

            {/* Warranty Selection */}
            <div>
              <SectionTitle>Warranty Selection</SectionTitle>
              <Sel label="Select Warranty" required value={fd.warrantyId} onChange={handleWarrantySelect}>
                <option value="">— Choose a warranty —</option>
                {warranties.map(wt => (
                  <option key={wt.id} value={wt.id}>
                    {wt.warranty_number} — {wt.item_title || wt.category} ({wt.vehicle_no || '—'})
                  </option>
                ))}
              </Sel>
            </div>

            {/* Auto-filled Details */}
            <div>
              <SectionTitle>Item Details</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ReadField label="Category"     value={w?.category}  />
                <ReadField label="Serial Number" value={w?.serial_no} />
              </div>
            </div>

            {/* Claim Details */}
            <div>
              <SectionTitle>Claim Details</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Inp label="Submit Date"          required type="date" value={fd.submitDate}       onChange={e => set('submitDate', e.target.value)} />
                <Inp label="Date Sent to Vendor"  type="date"          value={fd.dateSentToVendor} onChange={e => set('dateSentToVendor', e.target.value)} />
                <Inp label="Complaint Number"     required placeholder="e.g. CMP-123456" value={fd.complaintNumber} onChange={e => set('complaintNumber', e.target.value)} />
                <Inp label="Complaint Docket"     required placeholder="e.g. DOC-789012" value={fd.complaintDocket} onChange={e => set('complaintDocket', e.target.value)} />
              </div>
              <div className="mt-3">
                <Label required>Issue Description</Label>
                <textarea
                  value={fd.issueDescription}
                  onChange={e => set('issueDescription', e.target.value)}
                  placeholder="Describe the defect or issue..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none placeholder-slate-300"
                />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <SectionTitle>Attachments</SectionTitle>
              <label className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center gap-2 bg-white hover:border-green-400 hover:bg-green-50/20 transition-colors cursor-pointer group">
                <UploadCloud className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-semibold text-slate-700">
                  Item Photos <span className="text-red-500">*</span>
                </p>
                <p className="text-xs text-slate-400">Click to upload or drag photos here</p>
                <p className="text-[10px] text-slate-400">JPG, PNG up to 5MB</p>
                {files.itemPhotos.length > 0 && (
                  <p className="text-xs font-semibold text-green-700">{files.itemPhotos.length} photo(s) selected</p>
                )}
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={e => setFiles(p => ({ ...p, itemPhotos: Array.from(e.target.files) }))}
                />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-white shrink-0">
            <button onClick={onClose}
              className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="flex items-center gap-2 px-6 py-2 bg-[#1a4731] hover:bg-[#153d28] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" /> Submit Claim
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
