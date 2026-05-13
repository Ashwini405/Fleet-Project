import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   X,
   Shield,
   FileText,
   List,
   AlertCircle,
   Building2,
   Paperclip,
   ClipboardCheck,
   Calendar,
   Phone,
   Truck,
   Printer,
   ArrowLeft,
   Pencil
} from 'lucide-react';
import AddClaimModal from './AddClaimModal';

// ── Category badge colors ─────────────────────────────────────────────────────
const catStyles = {
   Battery: 'bg-blue-100   text-blue-700',
   Tyres: 'bg-indigo-100 text-indigo-700',
   Parts: 'bg-orange-100 text-orange-600',
   Lubricants: 'bg-purple-100 text-purple-700',
   Engine: 'bg-red-100    text-red-700',
   Electrical: 'bg-yellow-100 text-yellow-700',
   Brakes: 'bg-pink-100   text-pink-700',
   Other: 'bg-slate-100  text-slate-600',
};

const statusStyles = {
   'Submitted': 'bg-blue-50   text-blue-600   border border-blue-200',
   'Under Review': 'bg-purple-50 text-purple-600 border border-purple-200',
   'Approved': 'bg-green-50  text-green-600  border border-green-200',
   'Rejected': 'bg-red-50    text-red-500    border border-red-200',
   'Resolved': 'bg-teal-50   text-teal-600   border border-teal-200',
   'Pending Parts': 'bg-orange-50 text-orange-500 border border-orange-200',
   'Draft': 'bg-slate-100 text-slate-500  border border-slate-200',
};

const priorityStyles = {
   High: 'bg-red-50    text-red-600   border border-red-200',
   Medium: 'bg-orange-50 text-orange-500 border border-orange-200',
   Low: 'bg-green-50  text-green-600  border border-green-200',
};

// ── Section header ────────────────────────────────────────────────────────────
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

// ── Read-only field ───────────────────────────────────────────────────────────
const ReadField = ({ label, children, className = '' }) => (
   <div className={className}>
      {label && (
         <p className="text-xs font-bold text-slate-600 mb-1.5">{label}</p>
      )}
      <div className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white shadow-sm min-h-[42px] flex items-center">
         {children}
      </div>
   </div>
);

// ── View file box (dynamic based on real file arrays) ─────────────────────
const ViewFileBox = ({
   label,
   linkText,
   hint,
   file,
   color = 'text-green-600',
   icon: Icon = Paperclip
}) => (
   <div className="border border-slate-200 rounded-xl p-4 text-center bg-white flex flex-col items-center gap-1.5">
      <p className="text-xs font-bold text-slate-700">{label}</p>
      {file ? (
         <a
            href={`http://localhost:5001/uploads/${file}`}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-1.5 ${color} hover:underline`}
         >
            <Icon className="w-4 h-4" />
            <span className="text-xs font-bold">{linkText}</span>
         </a>
      ) : (
         <div className="flex items-center gap-1.5 text-slate-400">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-bold">No File</span>
         </div>
      )}
      <p className="text-[10px] text-slate-400">{hint}</p>
   </div>
);

// Helper to safely format dates
const formatDate = (dateStr) => {
   if (!dateStr) return '—';
   const d = new Date(dateStr);
   return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB');
};

// ── Safe parser for file fields (handles arrays, JSON strings, or raw filenames)
const safeParse = (value) => {
   try {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return JSON.parse(value);
   } catch {
      return [value];
   }
};

export default function ViewClaimModal({ isOpen, onClose, itemData, onUpdated }) {
   const [editOpen, setEditOpen] = React.useState(false);

   if (!isOpen) return null;

   // Use the actual backend data – no fallback, no dummy values
   const d = itemData || {};

   // Map database fields to the display structure expected by the UI
   const claim = {
      id: d.claim_number,
      warrantyRef: d.warranty_number,
      warrantyDisplay: `${d.warranty_number || ''} - ${d.item_title || ''}`,
      warrantyStatus: d.warranty_status,
      claimEligible: d.claim_available,
      item: d.item_title,
      category: d.category,
      brand: d.brand,
      model: d.model,
      serial: d.serial_no,
      vehicle: d.vehicle_no,
      warrantyType: d.warranty_type,
      warrantyPeriod: d.warranty_period ? `${d.warranty_period} Months` : '—',
      vendorName: d.vendor_name,
      contactNumber: d.vendor_contact_number,
      claimAmount: d.claim_available_amount,
      claimUsed: d.claim_used_amount,
      claimDate: formatDate(d.claim_date),
      issueType: d.issue_type,
      priority: d.priority,
      complaintNumber: d.complaint_number,
      complaintDocket: d.complaint_docket,
      issueDescription: d.issue_description,
      vendorContactPerson: d.vendor_contact_person,
      vendorContactNumber: d.communication_contact_number,
      dateSentToVendor: formatDate(d.date_sent_to_vendor),
      expectedResolutionDate: formatDate(d.expected_resolution_date),
      vendorRemarks: d.vendor_remarks,
      claimStatus: d.claim_status,
      assignedTo: d.assigned_to,
      internalNotes: d.internal_notes,
      // File arrays – safely parsed
      itemPhotos: safeParse(d.item_photos),
      invoiceCopy: safeParse(d.invoice_copy),
      warrantyCardCopy: safeParse(d.warranty_card_copy),
      complaintReport: safeParse(d.complaint_report),
      additionalDocuments: safeParse(d.additional_documents),
   };

   return (
      <>
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
                        <h2 className="text-base font-black text-white">Warranty Claim Details</h2>
                        <p className="text-xs text-green-300 mt-0.5">View warranty claim information and tracking details</p>
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
                              <ReadField label="Warranty Selected">
                                 <span className="text-slate-700 font-medium">{claim.warrantyDisplay}</span>
                              </ReadField>
                           </div>
                           <ReadField label="Warranty ID">
                              <span className="font-semibold">{claim.warrantyRef}</span>
                           </ReadField>
                           <div className="flex items-end gap-3">
                              <div className="flex-1">
                                 <p className="text-xs font-bold text-slate-600 mb-1.5">Warranty Status</p>
                                 <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-white shadow-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold ${claim.warrantyStatus === 'Active'
                                          ? 'bg-green-50 text-green-600 border border-green-200'
                                          : 'bg-red-50 text-red-500 border border-red-200'
                                       }`}>
                                       {claim.warrantyStatus || '—'}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex-1">
                                 <p className="text-xs font-bold text-slate-600 mb-1.5">Claim Eligible</p>
                                 <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-white shadow-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold ${claim.claimEligible === 'Yes'
                                          ? 'bg-green-50 text-green-600 border border-green-200'
                                          : 'bg-red-50 text-red-500 border border-red-200'
                                       }`}>
                                       {claim.claimEligible || '—'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* ══ 2. ITEM INFORMATION ══════════════════════════════════════ */}
                     <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                        <SectionHead icon={FileText} num={2} title="Item Information (From Warranty)" />

                        <div className="grid grid-cols-4 gap-4 mb-3">
                           <ReadField label="Item Title">
                              <span>{claim.item || '—'}</span>
                           </ReadField>
                           <div>
                              <p className="text-xs font-bold text-slate-600 mb-1.5">Category</p>
                              <div className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-white shadow-sm min-h-[42px] flex items-center">
                                 <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${catStyles[claim.category] || catStyles.Other}`}>
                                    {claim.category || 'Other'}
                                 </span>
                              </div>
                           </div>
                           <ReadField label="Brand">
                              <span>{claim.brand || '—'}</span>
                           </ReadField>
                           <ReadField label="Model">
                              <span>{claim.model || '—'}</span>
                           </ReadField>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-3">
                           <ReadField label="Serial Number">
                              <span className="font-mono text-sm">{claim.serial || '—'}</span>
                           </ReadField>
                           <ReadField label="Vehicle">
                              <Truck className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                              <span className="font-bold">{claim.vehicle || '—'}</span>
                           </ReadField>
                           <ReadField label="Warranty Type">
                              <span>{claim.warrantyType || '—'}</span>
                           </ReadField>
                           <ReadField label="Warranty Period">
                              <span className="text-xs">{claim.warrantyPeriod}</span>
                           </ReadField>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                           <ReadField label="Vendor / Supplier">
                              <span>{claim.vendorName || '—'}</span>
                           </ReadField>
                           <ReadField label="Contact Number">
                              <Phone className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                              <span>{claim.contactNumber || '—'}</span>
                           </ReadField>
                           <ReadField label="Claim Available Amount (₹)">
                              <span>{claim.claimAmount || '0.00'}</span>
                           </ReadField>
                           <ReadField label="Claim Already Used (₹)">
                              <span>{claim.claimUsed || '0.00'}</span>
                           </ReadField>
                        </div>
                     </div>

                     {/* ══ 3 & 4 SPLIT ══════════════════════════════════════════════ */}
                     <div className="grid grid-cols-2 gap-4">

                        {/* 3. CLAIM INFORMATION */}
                        <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                           <SectionHead icon={List} num={3} title="Claim Information" iconBg="bg-blue-100" iconColor="text-blue-600" />
                           <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                 <ReadField label="Claim ID">
                                    <span className="font-bold">{claim.id || '—'}</span>
                                 </ReadField>
                                 <ReadField label="Claim Date">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                                    <span>{claim.claimDate}</span>
                                 </ReadField>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                 <ReadField label="Issue Type">
                                    <span>{claim.issueType || '—'}</span>
                                 </ReadField>
                                 <div>
                                    <p className="text-xs font-bold text-slate-600 mb-1.5">Priority</p>
                                    <div className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-white shadow-sm min-h-[42px] flex items-center">
                                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold ${priorityStyles[claim.priority] || priorityStyles.Low}`}>
                                          {claim.priority || 'Low'}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                 <ReadField label="Complaint Number">
                                    <span className="font-mono">{claim.complaintNumber || '—'}</span>
                                 </ReadField>
                                 <ReadField label="Complaint Docket / Reference">
                                    <span className="font-mono">{claim.complaintDocket || '—'}</span>
                                 </ReadField>
                              </div>
                           </div>
                        </div>

                        {/* 4. ISSUE DESCRIPTION */}
                        <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                           <SectionHead icon={AlertCircle} num={4} title="Issue Description" iconBg="bg-red-100" iconColor="text-red-500" />
                           <div>
                              <p className="text-xs font-bold text-slate-600 mb-1.5">Describe the issue in detail</p>
                              <div className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white shadow-sm min-h-[148px] leading-relaxed">
                                 {claim.issueDescription || '—'}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* ══ 5. VENDOR COMMUNICATION ═══════════════════════════════════ */}
                     <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                        <SectionHead icon={Building2} num={5} title="Vendor Communication" />
                        <div className="grid grid-cols-4 gap-4 mb-3">
                           <ReadField label="Vendor Contact Person">
                              <span>{claim.vendorContactPerson || '—'}</span>
                           </ReadField>
                           <ReadField label="Contact Number">
                              <Phone className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                              <span>{claim.vendorContactNumber || '—'}</span>
                           </ReadField>
                           <ReadField label="Date Sent to Vendor">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                              <span>{claim.dateSentToVendor}</span>
                           </ReadField>
                           <ReadField label="Expected Resolution Date">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                              <span>{claim.expectedResolutionDate}</span>
                           </ReadField>
                        </div>
                        <div>
                           <p className="text-xs font-bold text-slate-600 mb-1.5">Communication / Remarks</p>
                           <div className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 bg-white shadow-sm min-h-[52px] leading-relaxed">
                              {claim.vendorRemarks || '—'}
                           </div>
                        </div>
                     </div>

                     {/* ══ 6. ATTACHMENTS (dynamic based on real file arrays) ════════ */}
                     <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                        <SectionHead icon={Paperclip} num={6} title="Attachments" />
                        <div className="grid grid-cols-5 gap-3">
                           <ViewFileBox
                              label="Item Photos"
                              file={claim.itemPhotos?.[0]}
                              linkText={`View Files (${claim.itemPhotos?.length || 0})`}
                              hint="Uploaded Item Photos"
                           />
                           <ViewFileBox
                              label="Invoice Copy"
                              file={claim.invoiceCopy?.[0]}
                              linkText="View Invoice"
                              hint="Invoice Attachment"
                           />
                           <ViewFileBox
                              label="Warranty Card Copy"
                              file={claim.warrantyCardCopy?.[0]}
                              linkText="View Warranty Card"
                              hint="Warranty Attachment"
                           />
                           <ViewFileBox
                              label="Complaint Report"
                              file={claim.complaintReport?.[0]}
                              linkText="View Complaint Report"
                              hint="Complaint Report"
                           />
                           <ViewFileBox
                              label="Additional Documents"
                              file={claim.additionalDocuments?.[0]}
                              linkText={`View Documents (${claim.additionalDocuments?.length || 0})`}
                              hint="Additional Uploads"
                           />
                        </div>
                     </div>

                     {/* ══ 7. CLAIM STATUS & ASSIGNMENT ══════════════════════════════ */}
                     <div className="border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                        <SectionHead icon={ClipboardCheck} num={7} title="Claim Status & Assignment" />
                        <div className="grid grid-cols-3 gap-4">
                           <div className="space-y-3">
                              <div>
                                 <p className="text-xs font-bold text-slate-600 mb-1.5">Claim Status</p>
                                 <div className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-white shadow-sm min-h-[42px] flex items-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold ${statusStyles[claim.claimStatus] || statusStyles.Draft}`}>
                                       {claim.claimStatus || 'Draft'}
                                    </span>
                                 </div>
                              </div>
                              <ReadField label="Assigned To">
                                 <span>{claim.assignedTo || '—'}</span>
                              </ReadField>
                           </div>
                           <div className="col-span-2">
                              <p className="text-xs font-bold text-slate-600 mb-1.5">Internal Notes</p>
                              <div className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 bg-white shadow-sm min-h-[96px] leading-relaxed">
                                 {claim.internalNotes || '—'}
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
                        Close
                     </button>
                     <div className="flex items-center gap-3">
                        <button
                           onClick={() => setEditOpen(true)}
                           className="flex items-center gap-2 px-5 py-2.5 border border-blue-200 rounded-xl text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 shadow-sm transition-colors"
                        >
                           <Pencil className="w-4 h-4" />
                           Edit Claim
                        </button>
                        <button
                           onClick={() => window.print()}
                           className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
                        >
                           <Printer className="w-4 h-4" /> Print Claim
                        </button>
                        <button
                           onClick={onClose}
                           className="flex items-center gap-2 px-5 py-2.5 bg-[#1a4731] hover:bg-[#153d28] text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
                        >
                           <ArrowLeft className="w-4 h-4" /> Back to Claims
                        </button>
                     </div>
                  </div>

               </motion.div>
            </div>
         </AnimatePresence>

         {/* Edit modal (reuses AddClaimModal in edit mode) */}
         <AddClaimModal
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            isEdit={true}
            editData={{

               ...itemData,

               id: itemData.dbId

            }}
            onSubmit={() => {
               setEditOpen(false);
               onClose();
               if (onUpdated) onUpdated();
            }}
         />
      </>
   );
}