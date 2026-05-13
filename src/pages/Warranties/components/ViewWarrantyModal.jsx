import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShieldCheck, FileText, Truck, Shield,
  Building2, DollarSign, Bell, Paperclip,
  Phone, MapPin, Download, Eye, ChevronRight,
  Calendar, Clock, AlertCircle, CheckCircle2,
  File, Image, FileText as FileIcon, ExternalLink
} from 'lucide-react';

// ── Category badge styles (enhanced with better contrast) ────────────────────
const catStyles = {
  Battery: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200',
  Tyres: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200',
  Parts: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-600 border border-orange-200',
  Lubricants: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200',
  Engine: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200',
  Electrical: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200',
  Brakes: 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 border border-pink-200',
  Other: 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 border border-slate-200',
};

const statusStyles = {
  Active: 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200',
  Expired: 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 border border-red-200',
  Replaced: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 border border-purple-200',
  'Expiring Soon': 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-600 border border-amber-200',
  Claimed: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-600 border border-indigo-200',
};

const claimStyles = {
  Yes: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200',
  No: 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-500 border border-slate-200',
};

const taxStyles = {
  Yes: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200',
  No: 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-500 border border-slate-200',
};

// ── Helper: format date safely ───────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
};

// ── Helper: build file URL with proper cleaning ──────────────────────────────
const buildFileUrl = (fileValue) => {
  if (!fileValue) return null;
  let clean = String(fileValue);
  // Remove surrounding quotes, brackets, and JSON artifacts
  clean = clean.replace(/^["'[\]]+|["'[\]]+$/g, '');
  // Remove any leading 'uploads/' prefix to avoid duplication
  clean = clean.replace(/^uploads\//, '');
  return `http://localhost:5001/${clean}`;
};

// ── Helper: extract filename from path for display ───────────────────────────
const getDisplayFileName = (filePath) => {
  if (!filePath) return 'Document';
  const clean = String(filePath).replace(/^["'[\]]+|["'[\]]+$/g, '');
  const parts = clean.split(/[\\/]/);
  const fileName = parts.pop();
  if (!fileName) return 'Document';
  // Truncate long filenames
  return fileName.length > 30 ? fileName.slice(0, 27) + '...' : fileName;
};

// ── Reusable: section header with enhanced style ─────────────────────────────
const SectionHead = ({ icon: Icon, num, title, color = 'text-emerald-600' }) => (
  <div className="flex items-center gap-3 mb-5 pb-2 border-b border-slate-100">
    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shadow-sm">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
      {num}. {title}
    </span>
  </div>
);

// ── Reusable: info row with better spacing ───────────────────────────────────
const InfoRow = ({ label, value, children, highlight = false }) => (
  <div className={`flex items-start gap-4 py-2.5 transition-colors ${highlight ? 'bg-slate-50/50 rounded-lg px-2 -mx-2' : ''}`}>
    <span className="text-[12px] font-medium text-slate-500 w-32 shrink-0 tracking-wide">{label}</span>
    <span className="text-slate-300 shrink-0 select-none">:</span>
    <span className="text-sm font-medium text-slate-800 flex-1 break-words">
      {children || value || '—'}
    </span>
  </div>
);

// ── Reusable: warranty progress bar component ────────────────────────────────
const WarrantyProgress = ({ startDate, endDate, status }) => {
  const computeProgress = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    if (total <= 0) return null;
    let percent = (elapsed / total) * 100;
    percent = Math.min(Math.max(percent, 0), 100);
    const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.ceil(total / (1000 * 60 * 60 * 24));
    return { percent, daysRemaining, daysElapsed, totalDays };
  };
  
  const progress = computeProgress();
  if (!progress || status === 'Expired') {
    return (
      <div className="mt-3 pt-2">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Warranty coverage</span>
          <span className="font-medium text-red-500">Expired</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-red-400 h-1.5 rounded-full w-full" />
        </div>
      </div>
    );
  }
  
  const { percent, daysRemaining, totalDays } = progress;
  const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
  const colorClass = isExpiringSoon ? 'bg-amber-500' : (percent > 80 ? 'bg-emerald-500' : 'bg-emerald-500');
  
  return (
    <div className="mt-3 pt-2">
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>Coverage remaining</span>
        <span className={`font-semibold ${isExpiringSoon ? 'text-amber-600' : 'text-emerald-600'}`}>
          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`${colorClass} h-1.5 rounded-full`}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
        <span>{formatDate(startDate)}</span>
        <span>Total {totalDays} days</span>
        <span>{formatDate(endDate)}</span>
      </div>
    </div>
  );
};

export default function ViewWarrantyModal({ isOpen, onClose, itemData }) {
  if (!isOpen || !itemData) return null;

  const d = itemData || {};

  // ── File URL helpers ────────────────────────────────────────────────────────
  const warrantyCardUrl = d.warranty_card ? buildFileUrl(d.warranty_card) : null;
  const invoiceFileUrl = d.invoice_file ? buildFileUrl(d.invoice_file) : null;
  
  // ── Parse additional documents (robust handling) ───────────────────────────
  let additionalDocs = [];
  try {
    if (!d.additional_documents) {
      additionalDocs = [];
    } else if (Array.isArray(d.additional_documents)) {
      additionalDocs = d.additional_documents;
    } else if (typeof d.additional_documents === 'string') {
      try {
        const parsed = JSON.parse(d.additional_documents);
        additionalDocs = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        additionalDocs = [d.additional_documents];
      }
    }
  } catch {
    additionalDocs = [];
  }

  // ── Precompute warranty status display ─────────────────────────────────────
  const warrantyStatus = d.warranty_status || 'Active';
  const statusIcon = warrantyStatus === 'Active' ? CheckCircle2 : (warrantyStatus === 'Expiring Soon' ? AlertCircle : Shield);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
        >
          {/* ── Premium Header ── */}
          <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 px-6 py-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">Warranty Record</h2>
                <p className="text-[11px] font-medium text-emerald-100/80 mt-0.5 font-mono">
                  {d.warranty_number || 'WRN-XXXX'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-300 via-white/20 to-transparent" />
          </div>

          {/* ── Body with custom scrollbar ── */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50 px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            
            {/* ── HERO SUMMARY CARD (modern glass-like) ── */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden transition-all hover:shadow-lg">
              <div className="p-5 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                  {/* Left: Product identity */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-inner">
                        <Shield className="w-7 h-7 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{d.item_title || 'Unnamed Item'}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusStyles[warrantyStatus] || statusStyles.Active}`}>
                            {React.createElement(statusIcon, { className: "w-3 h-3" })}
                            {warrantyStatus}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${catStyles[d.category] || catStyles.Other}`}>
                            {d.category || 'Other'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><span className="font-semibold">Brand:</span> {d.brand || '—'}</span>
                          <span className="flex items-center gap-1"><span className="font-semibold">Model:</span> {d.model || '—'}</span>
                          <span className="flex items-center gap-1"><span className="font-semibold">Serial:</span> <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{d.serial_no || '—'}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Key metrics panel */}
                  <div className="lg:w-80 bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Period</p>
                        <p className="text-base font-black text-emerald-600">{d.warranty_period || '—'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Claim</p>
                        <p className={`text-sm font-bold ${d.claim_available === 'Yes' ? 'text-emerald-600' : 'text-slate-500'}`}>{d.claim_available || 'No'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start</p>
                        <p className="text-sm font-bold text-slate-700">{formatDate(d.start_date)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End</p>
                        <p className="text-sm font-bold text-slate-700">{formatDate(d.end_date)}</p>
                      </div>
                    </div>
                    {/* Warranty visual progress */}
                    <WarrantyProgress startDate={d.start_date} endDate={d.end_date} status={warrantyStatus} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2-Column Detail Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 transition-all hover:shadow-md">
                <SectionHead icon={FileText} num={1} title="Basic Information" />
                <div className="space-y-0">
                  <InfoRow label="Item Name">{d.item_title}</InfoRow>
                  <InfoRow label="Category">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${catStyles[d.category] || catStyles.Other}`}>
                      {d.category}
                    </span>
                  </InfoRow>
                  <InfoRow label="Brand">{d.brand}</InfoRow>
                  <InfoRow label="Model">{d.model}</InfoRow>
                  <InfoRow label="Serial Number" highlight>
                    <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded-md">{d.serial_no}</span>
                  </InfoRow>
                </div>
              </div>

              {/* Vehicle Mapping */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 transition-all hover:shadow-md">
                <SectionHead icon={Truck} num={2} title="Vehicle Mapping" />
                <div className="space-y-0">
                  <InfoRow label="Vehicle">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">{d.vehicle_no || '—'}</span>
                    </div>
                  </InfoRow>
                  <InfoRow label="Odometer (KM)">
                    <span className="font-medium">{d.odometer ? `${d.odometer.toLocaleString()} km` : '—'}</span>
                  </InfoRow>
                </div>
              </div>

              {/* Warranty Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 transition-all hover:shadow-md">
                <SectionHead icon={Shield} num={3} title="Warranty Details" />
                <div className="grid grid-cols-2 gap-x-4">
                  <div className="space-y-0">
                    <InfoRow label="Purchase Date">{formatDate(d.purchase_date)}</InfoRow>
                    <InfoRow label="Start Date">{formatDate(d.start_date)}</InfoRow>
                    <InfoRow label="End Date">{formatDate(d.end_date)}</InfoRow>
                  </div>
                  <div className="space-y-0">
                    <InfoRow label="Period">{d.warranty_period}</InfoRow>
                    <InfoRow label="Type">{d.warranty_type}</InfoRow>
                    <InfoRow label="Claim Available">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${claimStyles[d.claim_available] || claimStyles.No}`}>
                        {d.claim_available}
                      </span>
                    </InfoRow>
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 transition-all hover:shadow-md">
                <SectionHead icon={Building2} num={4} title="Vendor / Supplier" />
                <div className="space-y-0">
                  <InfoRow label="Vendor Name">{d.vendor_name}</InfoRow>
                  <InfoRow label="Contact">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{d.contact_number}</span>
                    </div>
                  </InfoRow>
                  <InfoRow label="Location">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{d.vendor_location}</span>
                    </div>
                  </InfoRow>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 transition-all hover:shadow-md">
                <SectionHead icon={DollarSign} num={5} title="Financial" />
                <div className="space-y-0">
                  <InfoRow label="Purchase Cost">
                    <span className="font-semibold text-emerald-600">₹ {parseFloat(d.purchase_cost || 0).toLocaleString()}</span>
                  </InfoRow>
                  <InfoRow label="Claim Amount">
                    <span className="font-medium">₹ {parseFloat(d.claim_amount || 0).toLocaleString()}</span>
                  </InfoRow>
                  <InfoRow label="Tax Included">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${taxStyles[d.tax_included] || taxStyles.No}`}>
                      {d.tax_included}
                    </span>
                  </InfoRow>
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 transition-all hover:shadow-md">
                <SectionHead icon={Bell} num={6} title="Reminders" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Before Expiry</p>
                    <p className="text-sm font-black text-slate-700 mt-1">{d.reminder_before || '—'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Notify To</p>
                    <p className="text-sm font-bold text-slate-700 mt-1 truncate">{d.notify_to || '—'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Method</p>
                    <p className="text-sm font-bold text-slate-700 mt-1">{d.notification_method || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ATTACHMENTS section (modern file browser style) ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 transition-all hover:shadow-md">
              <SectionHead icon={Paperclip} num={7} title="Attachments & Documents" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Warranty Card */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <FileIcon className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Warranty Card</p>
                  </div>
                  {warrantyCardUrl ? (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-500 truncate bg-white p-1.5 rounded border border-slate-100">
                        {getDisplayFileName(d.warranty_card)}
                      </div>
                      <div className="flex gap-2">
                        <a href={warrantyCardUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition shadow-sm">
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                        <a href={warrantyCardUrl} download className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No file uploaded</p>
                  )}
                </div>

                {/* Invoice / Bill */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Invoice / Bill</p>
                  </div>
                  {invoiceFileUrl ? (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-500 truncate bg-white p-1.5 rounded border border-slate-100">
                        {getDisplayFileName(d.invoice_file)}
                      </div>
                      <div className="flex gap-2">
                        <a href={invoiceFileUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition shadow-sm">
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                        <a href={invoiceFileUrl} download className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No file uploaded</p>
                  )}
                </div>

                {/* Additional Documents */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Additional Docs</p>
                  </div>
                  {additionalDocs.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {additionalDocs.map((doc, idx) => {
                        const docUrl = buildFileUrl(doc);
                        const fileName = getDisplayFileName(doc);
                        return (
                          <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[11px] font-mono text-slate-600 truncate">{fileName}</span>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <a href={docUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition" title="View">
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                              <a href={docUrl} download className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition" title="Download">
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No additional documents</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Description & Notes (3 column grid) ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 transition-all hover:shadow-md">
              <SectionHead icon={FileText} num={8} title="Description & Notes" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-50/50 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Item Description
                  </p>
                  <div className="text-sm text-slate-700 leading-relaxed break-words">
                    {d.item_description || '—'}
                  </div>
                </div>
                <div className="bg-slate-50/50 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Service / Usage Notes
                  </p>
                  <div className="text-sm text-slate-700 leading-relaxed break-words">
                    {d.usage_notes || '—'}
                  </div>
                </div>
                <div className="bg-slate-50/50 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Terms & Conditions
                  </p>
                  <div className="text-sm text-slate-700 leading-relaxed break-words">
                    {d.terms_conditions || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer with refined button ── */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-slate-100 px-6 py-4 flex justify-end shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}