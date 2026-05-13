import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   X, UploadCloud, Calendar, ShieldCheck, Truck,
   Building2, DollarSign, Bell, FileText, MapPin,
   Phone, Info, ChevronDown
} from 'lucide-react';

// ── Local constants (categories, brands, etc. can remain as they are independent of DB) ──
const CATEGORIES = [
   'Battery', 'Engine', 'Tyres', 'Brakes', 'Transmission',
   'Electrical', 'AC System', 'Suspension', 'Fuel System', 'Other',
];

const BRANDS = [
   'Amaron', 'Exide', 'Tata', 'Bosch', 'MRF',
   'Apollo', 'Ceat', 'Mahindra', 'Ashok Leyland', 'Volvo',
];

const MODELS = [
   'HD Battery 150Ah', 'Pro Series 180Ah', 'SuperMax 200Ah',
   'HeavyDuty 120Ah', 'TruckLine 160Ah',
];

const WARRANTY_TYPES = [
   'Manufacturer Warranty', 'Extended Warranty',
   'Dealer Warranty', 'Third-Party Warranty',
];

const WARRANTY_STATUSES = ['Active', 'Expired', 'Expiring Soon', 'Claimed', 'Void'];

const REMINDER_DAYS = ['7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days'];

const NOTIFY_TO = ['Driver', 'Fleet Manager', 'Admin', 'Supervisor', 'All'];

// ── Helper components (unchanged, but file inputs modified to accept onChange) ──
const Label = ({ children, required }) => (
   <label className="block text-xs font-bold text-slate-700 mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
   </label>
);

const Hint = ({ children }) => (
   <p className="text-[11px] text-slate-400 mt-1">{children}</p>
);

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm placeholder-slate-300';
const selectCls = inputCls + ' appearance-none pr-8 cursor-pointer';

const Inp = ({ label, required, hint, icon: Icon, ...props }) => (
   <div>
      <Label required={required}>{label}</Label>
      <div className="relative">
         {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />}
         <input {...props} className={inputCls + (Icon ? ' pl-9' : '')} />
      </div>
      {hint && <Hint>{hint}</Hint>}
   </div>
);

const Sel = ({ label, required, hint, icon: Icon, value, onChange, children }) => (
   <div>
      <Label required={required}>{label}</Label>
      <div className="relative">
         {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />}
         <select value={value} onChange={onChange} className={selectCls + (Icon ? ' pl-9' : '')}>
            {children}
         </select>
         <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      {hint && <Hint>{hint}</Hint>}
   </div>
);

const SectionHeader = ({ icon: Icon, num, title, iconBg = 'bg-green-100', iconColor = 'text-green-700' }) => (
   <div className="flex items-center gap-2 mb-4">
      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
         <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
         {num}. {title}
      </h3>
   </div>
);

const Divider = () => <div className="border-t border-slate-100 my-5" />;

// ── Updated UploadBox to accept onChange and multiple ──
const UploadBox = ({

   label,
   required,
   hint,
   subhint,
   color = 'text-green-600',

   multiple = false,

   onChange,

   fileName

}) => (

   <label className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-white hover:border-green-400 hover:bg-green-50/30 transition-colors cursor-pointer group block">

      <p className="text-xs font-black text-slate-700 mb-2">

         {label}

         {required && (
            <span className="text-red-500">*</span>
         )}

      </p>

      <UploadCloud
         className={`w-5 h-5 mx-auto mb-1.5 ${color} group-hover:scale-110 transition-transform`}
      />

      <p className={`text-xs font-bold ${color}`}>
         {hint}
      </p>

      <p className="text-[10px] text-slate-400 mt-0.5">
         JPG, PNG, PDF (Max. 5MB)
      </p>

      <p className="text-[10px] text-slate-400">
         {subhint}
      </p>

      {/* FILE NAME DISPLAY */}

      {fileName && (

         <div className="mt-3 text-[11px] font-semibold text-green-700 break-all">

            {fileName}

         </div>

      )}

      <input
         type="file"
         hidden
         multiple={multiple}
         onChange={onChange}
      />

   </label>
);

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function AddWarrantyModal({ isOpen, onClose, onSubmit }) {
   const [vehicles, setVehicles] = useState([]);
   const [files, setFiles] = useState({
      warrantyCard: null,
      invoiceFile: null,
      additionalDocuments: [],
   });
   const [fd, setFd] = useState({
      itemTitle: '', category: '', brand: '', model: '', serialNo: '',
      vehicle_id: '', vehicle_no: '', odometer: '',
      purchaseDate: '', startDate: '', endDate: '', warrantyPeriod: '',
      warrantyType: '', warrantyStatus: '', claimAvailable: '',
      vendorName: '', contactNumber: '', vendorLocation: '',
      purchaseCost: '', claimAmount: '', taxIncluded: 'Yes',
      reminderBefore: '', notifyTo: '', notificationMethod: 'Email',
      itemDesc: '', usageNotes: '', termsConditions: '',
   });

   const set = (f, v) => setFd(p => ({ ...p, [f]: v }));

   // Fetch vehicles from backend
   useEffect(() => {
      const fetchVehicles = async () => {
         try {
            const response = await fetch('http://localhost:5001/api/vehicles');
            const data = await response.json();
            if (data.success) {
               setVehicles(data.data || []);
            }
         } catch (error) {
            console.error('FETCH VEHICLES ERROR:', error);
         }
      };
      fetchVehicles();
   }, []);

   // Handle vehicle selection → auto‑fill vehicle_no and odometer
   const handleVehicleChange = (e) => {
      const vehicleId = e.target.value;
      const selected = vehicles.find(v => v.id === Number(vehicleId));
      setFd(prev => ({
         ...prev,
         vehicle_id: selected?.id || '',
         vehicle_no: selected?.vehicle_no || '',
         odometer: selected?.initial_odometer || '',
      }));
   };

   if (!isOpen) return null;

   const handleSubmit = async () => {
      try {
         const formData = new FormData();

         formData.append('warranty_number', `WR-${Date.now()}`);
         formData.append('item_title', fd.itemTitle);
         formData.append('category', fd.category);
         formData.append('brand', fd.brand);
         formData.append('model', fd.model);
         formData.append('serial_no', fd.serialNo);
         formData.append('vehicle_id', fd.vehicle_id);
         formData.append('vehicle_no', fd.vehicle_no);
         formData.append('odometer', fd.odometer);
         formData.append('purchase_date', fd.purchaseDate);
         formData.append('start_date', fd.startDate);
         formData.append('end_date', fd.endDate);
         formData.append('warranty_period', fd.warrantyPeriod);
         formData.append('warranty_type', fd.warrantyType);
         formData.append('warranty_status', fd.warrantyStatus);
         formData.append('claim_available', fd.claimAvailable);
         formData.append('vendor_name', fd.vendorName);
         formData.append('contact_number', fd.contactNumber);
         formData.append('vendor_location', fd.vendorLocation);
         formData.append('purchase_cost', fd.purchaseCost);
         formData.append('claim_amount', fd.claimAmount);
         formData.append('tax_included', fd.taxIncluded);
         formData.append('reminder_before', fd.reminderBefore);
         formData.append('notify_to', fd.notifyTo);
         formData.append('notification_method', fd.notificationMethod);
         formData.append('item_description', fd.itemDesc);
         formData.append('usage_notes', fd.usageNotes);
         formData.append('terms_conditions', fd.termsConditions);
         formData.append('created_by', 'Admin');

         // Append files
         if (files.warrantyCard) formData.append('warranty_card', files.warrantyCard);
         if (files.invoiceFile) formData.append('invoice_file', files.invoiceFile);
         files.additionalDocuments.forEach(file => {
            formData.append('additional_documents', file);
         });

         const response = await fetch('http://localhost:5001/api/warranties', {
            method: 'POST',
            body: formData,
         });
         const data = await response.json();
         if (data.success) {
            alert('Warranty Registered Successfully');
            onSubmit?.(data.data);
            onClose();
         } else {
            alert(data.message || 'Failed to register warranty');
         }
      } catch (error) {
         console.error('CREATE WARRANTY ERROR:', error);
         alert('Server Error');
      }
   };

   return (
      <AnimatePresence>
         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
               initial={{ opacity: 0, scale: 0.96, y: 12 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.96, y: 12 }}
               transition={{ duration: 0.18 }}
               className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
            >
               {/* Header */}
               <div className="bg-[#1a4731] px-6 py-4 flex items-center justify-between shrink-0">
                  <div>
                     <h2 className="text-lg font-black text-white">Add New Warranty</h2>
                     <p className="text-xs text-green-300 mt-0.5">Register a new item warranty and track coverage details</p>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                     <X className="w-4 h-4 text-white" />
                  </button>
               </div>

               {/* Scrollable body */}
               <div className="flex-1 overflow-y-auto bg-white px-6 py-5 space-y-0">
                  {/* 1. Basic Information */}
                  <SectionHeader icon={FileText} num={1} title="Basic Information" />
                  <div className="grid grid-cols-5 gap-4 mb-5">
                     <div className="col-span-1">
                        <Inp label="Item Title" required
                           value={fd.itemTitle} onChange={e => set('itemTitle', e.target.value)}
                           placeholder="e.g. Amaron Heavy Duty Battery"
                           hint="Name of the item under warranty" />
                     </div>
                     <div>
                        <Sel label="Category" required hint="Select the item category"
                           value={fd.category} onChange={e => set('category', e.target.value)}>
                           <option value="">Select Category</option>
                           {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </Sel>
                     </div>
                     <div>
                        <Sel label="Brand" required hint="Select the brand"
                           value={fd.brand} onChange={e => set('brand', e.target.value)}>
                           <option value="">Select Brand</option>
                           {BRANDS.map(b => <option key={b}>{b}</option>)}
                        </Sel>
                     </div>
                     <div>
                        <Sel label="Model" required hint="Select the model"
                           value={fd.model} onChange={e => set('model', e.target.value)}>
                           <option value="">Select Model</option>
                           {MODELS.map(m => <option key={m}>{m}</option>)}
                        </Sel>
                     </div>
                     <div>
                        <Inp label="Serial Number" required
                           value={fd.serialNo} onChange={e => set('serialNo', e.target.value)}
                           placeholder="e.g. SN1234567890"
                           hint="Unique serial number" />
                     </div>
                  </div>

                  <Divider />

                  {/* 2 & 3: Vehicle Mapping & Warranty Information */}
                  <div className="grid grid-cols-2 gap-6 mb-5">
                     <div>
                        <SectionHeader icon={Truck} num={2} title="Vehicle Mapping" />
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <Sel label="Truck / Vehicle" required hint="Select the vehicle / truck"
                                 icon={Truck} value={fd.vehicle_id} onChange={handleVehicleChange}>
                                 <option value="">Select Vehicle</option>
                                 {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.vehicle_no}</option>
                                 ))}
                              </Sel>
                           </div>
                           <div>
                              <Label required>Current Odometer (KM)</Label>
                              <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">KM</span>
                                 <input
                                    type="number"
                                    value={fd.odometer}
                                    onChange={e => set('odometer', e.target.value)}
                                    placeholder="e.g. 45680"
                                    className={inputCls + ' pl-10'}
                                 />
                              </div>
                              <Hint>Enter current odometer reading</Hint>
                           </div>
                        </div>
                     </div>

                     <div>
                        <SectionHeader icon={ShieldCheck} num={3} title="Warranty Information" />
                        <div className="grid grid-cols-4 gap-3 mb-3">
                           <Inp label="Purchase Date" required type="date"
                              value={fd.purchaseDate} onChange={e => set('purchaseDate', e.target.value)}
                              hint="Date of purchase" icon={Calendar} />
                           <Inp label="Start Date" required type="date"
                              value={fd.startDate} onChange={e => set('startDate', e.target.value)}
                              hint="Warranty start date" icon={Calendar} />
                           <Inp label="End Date" required type="date"
                              value={fd.endDate} onChange={e => set('endDate', e.target.value)}
                              hint="Warranty end date" icon={Calendar} />
                           <Inp label="Warranty Period" required
                              value={fd.warrantyPeriod} onChange={e => set('warrantyPeriod', e.target.value)}
                              placeholder="e.g. 24 Months"
                              hint="Total warranty period" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                           <Sel label="Warranty Type" required hint="e.g. Manufacturer, Extended"
                              value={fd.warrantyType} onChange={e => set('warrantyType', e.target.value)}>
                              <option value="">Select Type</option>
                              {WARRANTY_TYPES.map(t => <option key={t}>{t}</option>)}
                           </Sel>
                           <Sel label="Warranty Status" required hint="Current warranty status"
                              value={fd.warrantyStatus} onChange={e => set('warrantyStatus', e.target.value)}>
                              <option value="">Select Status</option>
                              {WARRANTY_STATUSES.map(s => <option key={s}>{s}</option>)}
                           </Sel>
                           <Sel label="Claim Available?" required hint="Is claim available?"
                              value={fd.claimAvailable} onChange={e => set('claimAvailable', e.target.value)}>
                              <option value="">Select</option>
                              <option>Yes</option>
                              <option>No</option>
                           </Sel>
                        </div>
                     </div>
                  </div>

                  <Divider />

                  {/* 4 & 5: Vendor & Financial Information */}
                  <div className="grid grid-cols-2 gap-6 mb-5">
                     <div>
                        <SectionHeader icon={Building2} num={4} title="Vendor / Supplier Information" />
                        <div className="space-y-3">
                           <div className="grid grid-cols-2 gap-3">
                              <Inp label="Vendor Name" required
                                 value={fd.vendorName} onChange={e => set('vendorName', e.target.value)}
                                 placeholder="e.g. Exide Industries Ltd."
                                 hint="Name of vendor / supplier" />
                              <Inp label="Contact Number" required icon={Phone}
                                 value={fd.contactNumber} onChange={e => set('contactNumber', e.target.value)}
                                 placeholder="e.g. +91 98765 43210"
                                 hint="Vendor contact number" />
                           </div>
                           <Inp label="Vendor Location" required icon={MapPin}
                              value={fd.vendorLocation} onChange={e => set('vendorLocation', e.target.value)}
                              placeholder="e.g. Bengaluru, Karnataka, India" />
                        </div>
                     </div>

                     <div>
                        <SectionHeader icon={DollarSign} num={5} title="Financial Information" iconBg="bg-blue-100" iconColor="text-blue-700" />
                        <div className="grid grid-cols-3 gap-3">
                           <div>
                              <Label required>Purchase Cost (₹)</Label>
                              <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                                 <input type="number" value={fd.purchaseCost} onChange={e => set('purchaseCost', e.target.value)}
                                    placeholder="e.g. 12500.00"
                                    className={inputCls + ' pl-7'} />
                              </div>
                              <Hint>Total purchase cost</Hint>
                           </div>
                           <div>
                              <Label>Claim Available Amount (₹)</Label>
                              <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                                 <input type="number" value={fd.claimAmount} onChange={e => set('claimAmount', e.target.value)}
                                    placeholder="e.g. 12500.00"
                                    className={inputCls + ' pl-7'} />
                              </div>
                              <Hint>Claimable warranty amount</Hint>
                           </div>
                           <div>
                              <Label>Tax Included?</Label>
                              <div className="flex mt-1 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                 {['Yes', 'No'].map(opt => (
                                    <button
                                       key={opt}
                                       type="button"
                                       onClick={() => set('taxIncluded', opt)}
                                       className={`flex-1 py-2.5 text-sm font-bold transition-colors
                            ${fd.taxIncluded === opt
                                             ? opt === 'Yes' ? 'bg-green-600 text-white' : 'bg-slate-700 text-white'
                                             : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                                    >{opt}</button>
                                 ))}
                              </div>
                              <Hint>Is tax included in amount?</Hint>
                           </div>
                        </div>
                     </div>
                  </div>

                  <Divider />

                  {/* 6 & 7: Reminder Settings & Attachments */}
                  <div className="grid grid-cols-2 gap-6 mb-5">
                     <div>
                        <SectionHeader icon={Bell} num={6} title="Reminder Settings" iconBg="bg-orange-100" iconColor="text-orange-600" />
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4">
                           <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                              <span className="text-white text-[9px] font-black">✓</span>
                           </div>
                           <p className="text-xs font-semibold text-green-700">You will get notified before warranty expires.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                           <Sel label="Reminder Before Expiry" required hint="How many days before expiry"
                              value={fd.reminderBefore} onChange={e => set('reminderBefore', e.target.value)}>
                              <option value="">Select</option>
                              {REMINDER_DAYS.map(d => <option key={d}>{d}</option>)}
                           </Sel>
                           <Sel label="Notify To" required hint="Who should be notified"
                              value={fd.notifyTo} onChange={e => set('notifyTo', e.target.value)}>
                              <option value="">Select</option>
                              {NOTIFY_TO.map(n => <option key={n}>{n}</option>)}
                           </Sel>
                           <div>
                              <div className="flex items-center gap-1 mb-1">
                                 <Label>Notification Method</Label>
                                 <Info className="w-3 h-3 text-slate-400" />
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                 {['Email', 'SMS', 'Both'].map(opt => (
                                    <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                                       <input
                                          type="radio"
                                          name="notifMethod"
                                          value={opt}
                                          checked={fd.notificationMethod === opt}
                                          onChange={() => set('notificationMethod', opt)}
                                          className="accent-green-600 w-3.5 h-3.5"
                                       />
                                       <span className="text-xs font-semibold text-slate-600">{opt}</span>
                                    </label>
                                 ))}
                              </div>
                              <Hint>How you want to receive alerts</Hint>
                           </div>
                        </div>
                     </div>

                     <div>
                        <SectionHeader icon={UploadCloud} num={7} title="Attachments" iconBg="bg-blue-100" iconColor="text-blue-600" />
                        <div className="grid grid-cols-3 gap-3">
                           <UploadBox

                              label="Warranty Card"

                              required

                              hint="Upload Warranty Card"

                              subhint="Upload warranty card copy"

                              color="text-green-600"

                              fileName={files.warrantyCard?.name}

                              onChange={(e) =>

                                 setFiles(prev => ({

                                    ...prev,

                                    warrantyCard: e.target.files[0]

                                 }))

                              }

                           />


                           <UploadBox

                              label="Invoice / Bill"

                              required

                              hint="Upload Invoice"

                              subhint="Upload purchase invoice"

                              color="text-green-600"

                              fileName={files.invoiceFile?.name}

                              onChange={(e) =>

                                 setFiles(prev => ({

                                    ...prev,

                                    invoiceFile: e.target.files[0]

                                 }))

                              }

                           />


                           <UploadBox

                              label="Additional Documents"

                              hint="Upload Documents"

                              subhint="Upload any other documents"

                              color="text-blue-500"

                              multiple

                              fileName={

                                 files.additionalDocuments?.length > 0

                                    ? `${files.additionalDocuments.length} files selected`

                                    : ''

                              }

                              onChange={(e) =>

                                 setFiles(prev => ({

                                    ...prev,

                                    additionalDocuments: Array.from(

                                       e.target.files

                                    )

                                 }))

                              }

                           />
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                           <Info className="w-3 h-3 text-blue-500 shrink-0" />
                           <p className="text-[11px] text-slate-500 font-medium">You can upload multiple files in Additional Documents.</p>
                        </div>
                     </div>
                  </div>

                  <Divider />

                  {/* 8. Description & Notes */}
                  <div className="mb-2">
                     <SectionHeader icon={FileText} num={8} title="Description & Notes" iconBg="bg-green-100" iconColor="text-green-700" />
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                           <Label>Item Description</Label>
                           <textarea
                              value={fd.itemDesc}
                              onChange={e => set('itemDesc', e.target.value)}
                              placeholder="Enter item description..."
                              rows={4}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none shadow-sm placeholder-slate-300"
                           />
                           <Hint>Describe the item and its usage</Hint>
                        </div>
                        <div>
                           <Label>Service / Usage Notes</Label>
                           <textarea
                              value={fd.usageNotes}
                              onChange={e => set('usageNotes', e.target.value)}
                              placeholder="Enter service or usage notes (optional)..."
                              rows={4}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none shadow-sm placeholder-slate-300"
                           />
                           <Hint>Notes about service / usage conditions</Hint>
                        </div>
                        <div>
                           <Label>Warranty Terms & Conditions</Label>
                           <textarea
                              value={fd.termsConditions}
                              onChange={e => set('termsConditions', e.target.value)}
                              placeholder="Enter warranty terms and conditions (optional)..."
                              rows={4}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none shadow-sm placeholder-slate-300"
                           />
                           <Hint>Terms and conditions of warranty</Hint>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Footer */}
               <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
                  <button
                     onClick={onClose}
                     className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={handleSubmit}
                     disabled={!fd.itemTitle || !fd.vehicle_id}
                     className="flex items-center gap-2 px-8 py-2.5 bg-[#1a4731] hover:bg-[#153d28] text-white rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                     <ShieldCheck className="w-4 h-4" />
                     Register Warranty
                  </button>
               </div>
            </motion.div>
         </div>
      </AnimatePresence>
   );
}