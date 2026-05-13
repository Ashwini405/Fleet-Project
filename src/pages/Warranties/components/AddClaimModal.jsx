import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, FileText, List, AlertCircle,
  Building2, Paperclip, ClipboardCheck,
  Calendar, Phone, Truck, ChevronDown,
  UploadCloud, Info, Save
} from 'lucide-react';

const ISSUE_TYPES = [
  'Manufacturing Defect', 'Physical Damage', 'Performance Issue',
  'Early Failure', 'Installation Issue', 'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const CLAIM_STATUSES = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Closed'];

const USERS = [
  'Arjun Patil', 'Vikram S', 'Suresh N', 'Ravi Teja',
  'Maintenance Team', 'Fleet Manager',
];

const catStyles = {
  Battery:    'bg-blue-100   text-blue-700',
  Tyres:      'bg-indigo-100 text-indigo-700',
  Parts:      'bg-orange-100 text-orange-600',
  Lubricants: 'bg-purple-100 text-purple-700',
  Engine:     'bg-red-100    text-red-700',
  Electrical: 'bg-yellow-100 text-yellow-700',
  Brakes:     'bg-pink-100   text-pink-700',
  Other:      'bg-slate-100  text-slate-600',
};

// ── Reusable field components ─────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-xs font-bold text-slate-600 mb-1.5">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm placeholder-slate-300';
const readonlyCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 shadow-sm cursor-not-allowed';
const selectCls = inputCls + ' appearance-none pr-8 cursor-pointer';

const Inp = ({ label, required, readOnly, icon: Icon, ...props }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />}
      <input
        {...props}
        readOnly={readOnly}
        className={(readOnly ? readonlyCls : inputCls) + (Icon ? ' pl-9' : '')}
      />
    </div>
  </div>
);

const Sel = ({ label, required, icon: Icon, value, onChange, children }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />}
      <select value={value} onChange={onChange} className={selectCls + (Icon ? ' pl-9' : '')}>
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

const SectionHead = ({ icon: Icon, num, title, iconBg = 'bg-green-100', iconColor = 'text-green-700' }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className={`w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
    </div>
    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
      {num}. {title}
    </span>
  </div>
);

// ── UploadBox with file input support ─────────────────────────────────────────
const UploadBox = ({
  label,
  required,
  hint,
  color = 'text-green-600',
  icon: Icon = UploadCloud,
  multiple = true,
  onChange,
  fileCount
}) => (
  <label className="border border-dashed border-slate-200 rounded-xl p-4 text-center bg-white hover:border-green-400 hover:bg-green-50/20 transition-colors cursor-pointer group flex flex-col items-center gap-1.5">
    <p className="text-xs font-bold text-slate-700">
      {label}
      {required && <span className="text-red-500">*</span>}
    </p>
    <div className={`flex items-center gap-1.5 ${color}`}>
      <Icon className="w-4 h-4" />
      <span className="text-xs font-bold">{hint}</span>
    </div>
    <p className="text-[10px] text-slate-400">JPG, PNG, PDF (Max. 5MB)</p>
    {fileCount > 0 && (
      <p className="text-[10px] text-green-600 font-bold">{fileCount} file(s) selected</p>
    )}
    <input type="file" hidden multiple={multiple} onChange={onChange} />
  </label>
);

// ── Main Modal (Create + Edit) ────────────────────────────────────────────────
export default function AddClaimModal({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  isEdit = false
}) {
  // State for warranties fetched from DB
  const [warranties, setWarranties] = useState([]);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [files, setFiles] = useState({
    itemPhotos: [],
    invoiceCopy: [],
    warrantyCardCopy: [],
    complaintReport: [],
    additionalDocuments: []
  });

  const [fd, setFd] = useState({
    warrantyId: '',
    claimDate: '',
    issueType: '',
    priority: '',
    complaintNumber: '',
    complaintDocket: '',
    issueDescription: '',
    vendorContactPerson: '',
    vendorContactNumber: '',
    dateSentToVendor: '',
    expectedResolutionDate: '',
    vendorRemarks: '',
    claimStatus: 'Draft',
    assignedTo: '',
    internalNotes: '',
  });

  const set = (f, v) => setFd(p => ({ ...p, [f]: v }));

  // ── Fetch active warranties from backend ────────────────────────────────────
  const fetchWarranties = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/warranties');
      const data = await response.json();
      if (data.success) {
        const activeOnly = data.data.filter(w => w.warranty_status === 'Active');
        setWarranties(activeOnly);
      }
    } catch (error) {
      console.error('FETCH WARRANTIES ERROR:', error);
    }
  };

  useEffect(() => {
    fetchWarranties();
  }, []);

  // ── Prefill form when editing ──────────────────────────────────────────────
  useEffect(() => {
    if (isEdit && editData) {
      setFd({
        warrantyId: editData.warranty_id || '',
        claimDate: editData.claim_date
          ? editData.claim_date.split('T')[0]
          : '',
        issueType: editData.issue_type || '',
        priority: editData.priority || '',
        complaintNumber: editData.complaint_number || '',
        complaintDocket: editData.complaint_docket || '',
        issueDescription: editData.issue_description || '',
        vendorContactPerson: editData.vendor_contact_person || '',
        vendorContactNumber: editData.communication_contact_number || '',
        dateSentToVendor: editData.date_sent_to_vendor
          ? editData.date_sent_to_vendor.split('T')[0]
          : '',
        expectedResolutionDate: editData.expected_resolution_date
          ? editData.expected_resolution_date.split('T')[0]
          : '',
        vendorRemarks: editData.vendor_remarks || '',
        claimStatus: editData.claim_status || 'Draft',
        assignedTo: editData.assigned_to || '',
        internalNotes: editData.internal_notes || ''
      });

      setSelectedWarranty({
        id: editData.warranty_id,
        warranty_number: editData.warranty_number,
        item_title: editData.item_title,
        category: editData.category,
        brand: editData.brand,
        model: editData.model,
        serial_no: editData.serial_no,
        vehicle_no: editData.vehicle_no,
        warranty_type: editData.warranty_type,
        warranty_period: editData.warranty_period,
        start_date: editData.warranty_start_date,
        end_date: editData.warranty_end_date,
        warranty_status: editData.warranty_status,
        claim_available: editData.claim_available,
        vendor_name: editData.vendor_name,
        contact_number: editData.vendor_contact_number,
        claim_amount: editData.claim_available_amount,
        claim_used_amount: editData.claim_used_amount
      });
    }
  }, [isEdit, editData]);

  // ── Handle warranty selection ─────────────────────────────────────────────
  const handleWarrantySelect = (e) => {
    const id = Number(e.target.value);
    const w = warranties.find(x => x.id === id) || null;
    setSelectedWarranty(w);
    set('warrantyId', id);
    if (w) {
      set('vendorContactNumber', w.contact_number || '');
    }
  };

  // ── Submit claim (Create or Update) ────────────────────────────────────────
  const handleSubmit = async (asDraft = false) => {
    if (!selectedWarranty) {
      alert('Please select a warranty');
      return;
    }
    const w = selectedWarranty;
    try {
      const formData = new FormData();
      formData.append('claim_number', isEdit ? editData.claim_number : `CL-${Date.now()}`);

      // Warranty snapshot
      formData.append('warranty_id', w.id || '');
      formData.append('warranty_number', w.warranty_number || '');
      formData.append('item_title', w.item_title || '');
      formData.append('category', w.category || '');
      formData.append('brand', w.brand || '');
      formData.append('model', w.model || '');
      formData.append('serial_no', w.serial_no || '');
      formData.append('vehicle_id', w.vehicle_id || '');
      formData.append('vehicle_no', w.vehicle_no || '');
      formData.append('warranty_type', w.warranty_type || '');
      formData.append('warranty_period', w.warranty_period || '');
      formData.append(
        'warranty_start_date',
        w.start_date ? new Date(w.start_date).toISOString().split('T')[0] : ''
      );
      formData.append(
        'warranty_end_date',
        w.end_date ? new Date(w.end_date).toISOString().split('T')[0] : ''
      );
      formData.append('warranty_status', w.warranty_status || '');
      formData.append('claim_available', w.claim_available || '');
      formData.append('vendor_name', w.vendor_name || '');
      formData.append('vendor_contact_number', w.contact_number || '');
      formData.append('claim_available_amount', w.claim_amount || 0);
      formData.append('claim_used_amount', w.claim_used_amount || 0);

      // Claim form fields
      formData.append('claim_date', fd.claimDate);
      formData.append('issue_type', fd.issueType);
      formData.append('priority', fd.priority);
      formData.append('complaint_number', fd.complaintNumber);
      formData.append('complaint_docket', fd.complaintDocket);
      formData.append('issue_description', fd.issueDescription);
      formData.append('vendor_contact_person', fd.vendorContactPerson);
      formData.append('communication_contact_number', fd.vendorContactNumber);
      formData.append('date_sent_to_vendor', fd.dateSentToVendor);
      formData.append('expected_resolution_date', fd.expectedResolutionDate);
      formData.append('vendor_remarks', fd.vendorRemarks);
      formData.append('claim_status', asDraft ? 'Draft' : fd.claimStatus);
      formData.append('assigned_to', fd.assignedTo);
      formData.append('internal_notes', fd.internalNotes);
      formData.append('created_by', 'Admin');

      // Files (only new uploads – existing files are not removed)
      files.itemPhotos.forEach(file => formData.append('item_photos', file));
      files.invoiceCopy.forEach(file => formData.append('invoice_copy', file));
      files.warrantyCardCopy.forEach(file => formData.append('warranty_card_copy', file));
      files.complaintReport.forEach(file => formData.append('complaint_report', file));
      files.additionalDocuments.forEach(file => formData.append('additional_documents', file));

      const url = isEdit
        ? `http://localhost:5001/api/warranty-claims/${editData.id}`
        : 'http://localhost:5001/api/warranty-claims';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: formData });
      const data = await response.json();

      if (data.success) {
        alert(isEdit ? 'Warranty Claim Updated Successfully' : 'Warranty Claim Created Successfully');
        onSubmit?.(data.data);
        onClose();
      } else {
        alert(data.message || (isEdit ? 'Failed to update claim' : 'Failed to create claim'));
      }
    } catch (error) {
      console.error('SUBMIT CLAIM ERROR:', error);
      alert('Server Error');
    }
  };

  const w = selectedWarranty;

  // Early return after all hooks
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
        >

          {/* ── HEADER ───────────────────────────────────────────────────── */}
          <div className="bg-[#1a4731] px-6 py-4 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-base font-black text-white">
                {isEdit ? 'Edit Warranty Claim' : 'Add Warranty Claim'}
              </h2>
              <p className="text-xs text-green-300 mt-0.5">
                {isEdit ? 'Modify warranty claim details' : 'Submit a warranty claim for approval and tracking'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* ── SCROLLABLE BODY ───────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto bg-white px-6 py-5 space-y-5">

            {/* ══ 1. WARRANTY SELECTION ════════════════════════════════════ */}
            <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
              <SectionHead icon={Shield} num={1} title="Warranty Selection" />

              <div className="grid grid-cols-4 gap-4 items-end">
                <div className="col-span-2">
                  <Label required>Select Warranty</Label>
                  <div className="relative">
                    <select
                      value={fd.warrantyId}
                      onChange={handleWarrantySelect}
                      className={selectCls + ' pr-16'}
                    >
                      <option value="">-- Choose active warranty --</option>
                      {warranties.map(wt => (
                        <option key={wt.id} value={wt.id}>
                          {wt.warranty_number} - {wt.item_title}
                        </option>
                      ))}
                    </select>
                    {fd.warrantyId && (
                      <button
                        onClick={() => { setSelectedWarranty(null); set('warrantyId', ''); }}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
                      >×</button>
                    )}
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Search and select the warranty for which claim is being raised</p>
                </div>

                <div>
                  <Label>Warranty ID</Label>
                  <input readOnly value={w?.warranty_number || ''} placeholder="—" className={readonlyCls} />
                </div>

                <div>
                  <Label>Warranty Status</Label>
                  <div className="flex items-center gap-3">
                    {w ? (
                      <span className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-bold border ${
                        w.warranty_status === 'Active'
                          ? 'bg-green-50 text-green-600 border-green-200'
                          : 'bg-red-50 text-red-500 border-red-200'
                      }`}>
                        {w.warranty_status}
                      </span>
                    ) : (
                      <input readOnly value="" placeholder="—" className={readonlyCls} />
                    )}
                    {w && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 mb-1">Claim Eligible</p>
                        <span className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-bold border ${
                          w.claim_available === 'Yes'
                            ? 'bg-green-50 text-green-600 border-green-200'
                            : 'bg-red-50 text-red-500 border-red-200'
                        }`}>
                          {w.claim_available}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ══ 2. ITEM INFORMATION (AUTO-FILLED) ════════════════════════ */}
            <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
              <SectionHead icon={FileText} num={2} title="Item Information (Auto-Filled From Warranty)" />

              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <Label>Item Title</Label>
                  <input readOnly value={w?.item_title || ''} placeholder="—" className={readonlyCls} />
                </div>
                <div>
                  <Label>Category</Label>
                  {w ? (
                    <div className={`border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 shadow-sm`}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${catStyles[w.category] || catStyles.Other}`}>
                        {w.category}
                      </span>
                    </div>
                  ) : (
                    <input readOnly value="" placeholder="—" className={readonlyCls} />
                  )}
                </div>
                <div>
                  <Label>Brand</Label>
                  <input readOnly value={w?.brand || ''} placeholder="—" className={readonlyCls} />
                </div>
                <div>
                  <Label>Model</Label>
                  <input readOnly value={w?.model || ''} placeholder="—" className={readonlyCls} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <Label>Serial Number</Label>
                  <input readOnly value={w?.serial_no || ''} placeholder="—" className={readonlyCls + ' font-mono'} />
                </div>
                <div>
                  <Label>Vehicle</Label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input readOnly value={w?.vehicle_no || ''} placeholder="—" className={readonlyCls + ' pl-9'} />
                  </div>
                </div>
                <div>
                  <Label>Warranty Type</Label>
                  <input readOnly value={w?.warranty_type || ''} placeholder="—" className={readonlyCls} />
                </div>
                <div>
                  <Label>Warranty Period</Label>
                  <input
                    readOnly
                    value={w ? `${w.warranty_period || ''} (${w.start_date || ''} to ${w.end_date || ''})` : ''}
                    placeholder="—"
                    className={readonlyCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Vendor / Supplier</Label>
                  <input readOnly value={w?.vendor_name || ''} placeholder="—" className={readonlyCls} />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input readOnly value={w?.contact_number || ''} placeholder="—" className={readonlyCls + ' pl-9'} />
                  </div>
                </div>
                <div>
                  <Label>Claim Available Amount (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">₹</span>
                    <input readOnly value={w?.claim_amount || ''} placeholder="—" className={readonlyCls + ' pl-7'} />
                  </div>
                </div>
                <div>
                  <Label>Claim Already Used (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">₹</span>
                    <input readOnly value={w?.claim_used_amount || '0.00'} placeholder="—" className={readonlyCls + ' pl-7'} />
                  </div>
                </div>
              </div>
            </div>

            {/* ══ 3 & 4 split ══════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 gap-4">

              {/* 3. CLAIM INFORMATION */}
              <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                <SectionHead icon={List} num={3} title="Claim Information" iconBg="bg-blue-100" iconColor="text-blue-600" />
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label required>Claim ID</Label>
                      <input readOnly value={isEdit ? (editData?.claim_number || 'Auto-generated') : 'Auto-generated'} className={readonlyCls + ' italic text-slate-400'} />
                    </div>
                    <Inp label="Claim Date" required icon={Calendar} type="date"
                      value={fd.claimDate} onChange={e => set('claimDate', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Sel label="Issue Type" required value={fd.issueType} onChange={e => set('issueType', e.target.value)}>
                      <option value="">Select Issue Type</option>
                      {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </Sel>
                    <Sel label="Priority" required value={fd.priority} onChange={e => set('priority', e.target.value)}>
                      <option value="">Select Priority</option>
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </Sel>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Inp label="Complaint Number" value={fd.complaintNumber}
                      onChange={e => set('complaintNumber', e.target.value)} placeholder="e.g. CMP123456" />
                    <Inp label="Complaint Docket / Reference" value={fd.complaintDocket}
                      onChange={e => set('complaintDocket', e.target.value)} placeholder="e.g. DOC789012" />
                  </div>
                </div>
              </div>

              {/* 4. ISSUE DESCRIPTION */}
              <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                <SectionHead icon={AlertCircle} num={4} title="Issue Description" iconBg="bg-red-100" iconColor="text-red-500" />
                <div>
                  <Label required>Describe the issue in detail</Label>
                  <textarea
                    value={fd.issueDescription}
                    onChange={e => set('issueDescription', e.target.value)}
                    placeholder="Enter detailed description of the issue / problem..."
                    maxLength={1000}
                    rows={8}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none shadow-sm placeholder-slate-300"
                  />
                  <div className="text-right text-[10px] text-slate-400 mt-1">
                    {fd.issueDescription.length}/1000
                  </div>
                </div>
              </div>
            </div>

            {/* ══ 5. VENDOR COMMUNICATION ═══════════════════════════════════ */}
            <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
              <SectionHead icon={Building2} num={5} title="Vendor Communication" />
              <div className="grid grid-cols-4 gap-4 mb-3">
                <Inp label="Vendor Contact Person" value={fd.vendorContactPerson}
                  onChange={e => set('vendorContactPerson', e.target.value)}
                  placeholder="e.g. Rajesh Kumar" />
                <Inp label="Contact Number" icon={Phone} value={fd.vendorContactNumber}
                  onChange={e => set('vendorContactNumber', e.target.value)}
                  placeholder="e.g. +91 98765 43210" />
                <Inp label="Date Sent to Vendor" icon={Calendar} type="date"
                  value={fd.dateSentToVendor} onChange={e => set('dateSentToVendor', e.target.value)} />
                <Inp label="Expected Resolution Date" icon={Calendar} type="date"
                  value={fd.expectedResolutionDate} onChange={e => set('expectedResolutionDate', e.target.value)} />
              </div>
              <div>
                <Label>Communication / Remarks</Label>
                <textarea
                  value={fd.vendorRemarks}
                  onChange={e => set('vendorRemarks', e.target.value)}
                  placeholder="Enter communication details with vendor..."
                  maxLength={500}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none shadow-sm placeholder-slate-300"
                />
                <div className="text-right text-[10px] text-slate-400 mt-1">
                  {fd.vendorRemarks.length}/500
                </div>
              </div>
            </div>

            {/* ══ 6. ATTACHMENTS ════════════════════════════════════════════ */}
            <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
              <SectionHead icon={Paperclip} num={6} title="Attachments" />
              <p className="text-xs text-slate-400 font-medium -mt-2 mb-3">Upload relevant documents and images related to the claim</p>
              <div className="grid grid-cols-5 gap-3">
                <UploadBox
                  label="Item Photos" required hint="Upload Photos" color="text-green-600"
                  onChange={(e) => setFiles(prev => ({ ...prev, itemPhotos: Array.from(e.target.files) }))}
                  fileCount={files.itemPhotos.length}
                />
                <UploadBox
                  label="Invoice Copy" hint="Upload Invoice" color="text-green-600"
                  onChange={(e) => setFiles(prev => ({ ...prev, invoiceCopy: Array.from(e.target.files) }))}
                  fileCount={files.invoiceCopy.length}
                />
                <UploadBox
                  label="Warranty Card Copy" hint="Upload Warranty Card" color="text-green-600"
                  onChange={(e) => setFiles(prev => ({ ...prev, warrantyCardCopy: Array.from(e.target.files) }))}
                  fileCount={files.warrantyCardCopy.length}
                />
                <UploadBox
                  label="Complaint / Service Report" hint="Upload Document" color="text-green-600"
                  onChange={(e) => setFiles(prev => ({ ...prev, complaintReport: Array.from(e.target.files) }))}
                  fileCount={files.complaintReport.length}
                />
                <UploadBox
                  label="Additional Documents" hint="Upload Document" color="text-green-600"
                  onChange={(e) => setFiles(prev => ({ ...prev, additionalDocuments: Array.from(e.target.files) }))}
                  fileCount={files.additionalDocuments.length}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <p className="text-[11px] text-slate-500 font-medium">You can upload multiple files in each category.</p>
              </div>
            </div>

            {/* ══ 7. CLAIM STATUS & ASSIGNMENT ══════════════════════════════ */}
            <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
              <SectionHead icon={ClipboardCheck} num={7} title="Claim Status & Assignment" />
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                  <Sel label="Claim Status" required value={fd.claimStatus} onChange={e => set('claimStatus', e.target.value)}>
                    {CLAIM_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </Sel>
                  <Sel label="Assigned To" value={fd.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
                    <option value="">Select User / Team</option>
                    {USERS.map(u => <option key={u}>{u}</option>)}
                  </Sel>
                </div>
                <div className="col-span-2">
                  <Label>Internal Notes</Label>
                  <textarea
                    value={fd.internalNotes}
                    onChange={e => set('internalNotes', e.target.value)}
                    placeholder="Enter internal notes (optional)..."
                    maxLength={500}
                    rows={5}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none shadow-sm placeholder-slate-300"
                  />
                  <div className="text-right text-[10px] text-slate-400 mt-1">
                    {fd.internalNotes.length}/500
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── FOOTER ───────────────────────────────────────────────────── */}
          <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSubmit(true)}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" /> Save Draft
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={!fd.warrantyId || !fd.claimDate || !fd.issueDescription}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1a4731] hover:bg-[#153d28] text-white rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Shield className="w-4 h-4" /> {isEdit ? 'Update Claim' : 'Submit Claim'}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}