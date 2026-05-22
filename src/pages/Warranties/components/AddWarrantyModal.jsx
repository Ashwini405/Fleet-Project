import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, ShieldCheck, ChevronDown } from 'lucide-react';

const CATEGORIES = ['Battery', 'Engine', 'Tyres', 'Brakes', 'Transmission', 'Electrical', 'AC System', 'Suspension', 'Fuel System', 'Other'];

const BRANDS_BY_CATEGORY = {
   Battery:      ['Amaron', 'Exide', 'Bosch'],
   Engine:       ['Tata', 'Cummins', 'Ashok Leyland', 'Mahindra'],
   Tyres:        ['MRF', 'Apollo', 'Ceat', 'Bridgestone'],
   Brakes:       ['Bosch', 'Tata', 'Wabco'],
   Transmission: ['ZF', 'Eaton', 'Tata'],
   Electrical:   ['Bosch', 'Denso', 'Valeo'],
   'AC System':  ['Carrier', 'Voltas', 'Mahindra'],
   Suspension:   ['Gabriel', 'Monroe', 'Tata'],
   'Fuel System':['Bosch', 'Delphi', 'Denso'],
   Other:        ['Tata', 'Mahindra', 'Bosch'],
};

const MODELS_BY_CATEGORY = {
   Battery:      ['HD Battery 150Ah', 'Pro Series 180Ah', 'SuperMax 200Ah', 'HeavyDuty 120Ah'],
   Engine:       ['Cummins X15', 'Tata Turbo Engine', 'Ashok Leyland H Series', 'Mahindra mHawk'],
   Tyres:        ['MRF ZLX', 'Apollo EnduRace', 'Ceat LoadMax', 'Bridgestone R150'],
   Brakes:       ['Bosch Brake Pro', 'Tata Air Brake Kit', 'Wabco ABS Module'],
   Transmission: ['ZF 16S', 'Eaton Fuller 10-Speed', 'Tata GBS40'],
   Electrical:   ['Bosch Alternator 24V', 'Denso Starter Motor', 'Valeo Wiper System'],
   'AC System':  ['Carrier ACX', 'Voltas HeavyCool', 'Mahindra CoolMax'],
   Suspension:   ['Gabriel HD Shock', 'Monroe OESpectrum', 'Tata Leaf Spring Kit'],
   'Fuel System':['Bosch Common Rail', 'Delphi Fuel Pump', 'Denso Injector Set'],
   Other:        ['Generic Part A', 'Generic Part B'],
};

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-slate-300';
const selectCls = inputCls + ' appearance-none pr-7 cursor-pointer';

const Label = ({ children, required }) => (
   <label className="block text-xs font-semibold text-slate-600 mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
   </label>
);

const Sel = ({ label, required, value, onChange, disabled, children }) => (
   <div>
      <Label required={required}>{label}</Label>
      <div className="relative">
         <select value={value} onChange={onChange} disabled={disabled}
            className={selectCls + (disabled ? ' opacity-50 cursor-not-allowed bg-slate-50' : '')}>
            {children}
         </select>
         <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>
   </div>
);

const Inp = ({ label, required, ...props }) => (
   <div>
      <Label required={required}>{label}</Label>
      <input {...props} className={inputCls} />
   </div>
);

const UploadBox = ({ label, required, onChange, fileName }) => (
   <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-white hover:border-green-400 hover:bg-green-50/30 transition-colors cursor-pointer group block">
      <UploadCloud className="w-5 h-5 mx-auto mb-1 text-green-600 group-hover:scale-110 transition-transform" />
      <p className="text-xs font-semibold text-slate-700">
         {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </p>
      <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, PDF · Max 5MB</p>
      {fileName && <p className="mt-1.5 text-[11px] font-semibold text-green-700 truncate">{fileName}</p>}
      <input type="file" hidden onChange={onChange} />
   </label>
);

const SectionTitle = ({ children }) => (
   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100">{children}</p>
);

export default function AddWarrantyModal({ isOpen, onClose, onSubmit }) {
   const [vehicles, setVehicles] = useState([]);
   const [files, setFiles] = useState({ warrantyCard: null, invoiceFile: null });
   const [fd, setFd] = useState({
      category: '', brand: '', model: '', serialNo: '',
      vehicle_id: '', vehicle_no: '', odometer: '',
      startDate: '', endDate: '', warrantyPeriod: '',
      description: '',
   });

   const set = (f, v) => setFd(p => ({ ...p, [f]: v }));

   const handleCategoryChange = (e) => {
      const cat = e.target.value;
      setFd(p => ({ ...p, category: cat, brand: '', model: '' }));
   };

   useEffect(() => {
      fetch('http://localhost:5001/api/vehicles')
         .then(r => r.json())
         .then(data => { if (data.success) setVehicles(data.data || []); })
         .catch(err => console.error('FETCH VEHICLES ERROR:', err));
   }, []);

   const handleVehicleChange = (e) => {
      const selected = vehicles.find(v => v.id === Number(e.target.value));
      setFd(p => ({
         ...p,
         vehicle_id: selected?.id || '',
         vehicle_no: selected?.vehicle_no || '',
         odometer: selected?.initial_odometer || '',
      }));
   };

   const isValid = fd.category && fd.vehicle_id && fd.brand && fd.model && fd.startDate && fd.endDate && files.warrantyCard && files.invoiceFile;

   const handleSubmit = async () => {
      try {
         const formData = new FormData();
         formData.append('warranty_number', `WR-${Date.now()}`);
         formData.append('category', fd.category);
         formData.append('brand', fd.brand);
         formData.append('model', fd.model);
         formData.append('serial_no', fd.serialNo);
         formData.append('vehicle_id', fd.vehicle_id);
         formData.append('vehicle_no', fd.vehicle_no);
         formData.append('odometer', fd.odometer);
         formData.append('start_date', fd.startDate);
         formData.append('end_date', fd.endDate);
         formData.append('warranty_period', fd.warrantyPeriod);
         formData.append('description', fd.description);
         formData.append('created_by', 'Admin');
         if (files.warrantyCard) formData.append('warranty_card', files.warrantyCard);
         if (files.invoiceFile) formData.append('invoice_file', files.invoiceFile);

         const response = await fetch('http://localhost:5001/api/warranties', { method: 'POST', body: formData });
         const data = await response.json();
         if (data.success) {
            alert('Warranty Registered Successfully');
            onSubmit?.(data.data);
            onClose();
         } else {
            alert(data.message || 'Failed to register warranty');
         }
      } catch (err) {
         console.error('CREATE WARRANTY ERROR:', err);
         alert('Server Error');
      }
   };

   if (!isOpen) return null;

   return (
      <AnimatePresence>
         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
               initial={{ opacity: 0, scale: 0.96, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.96, y: 10 }}
               transition={{ duration: 0.16 }}
               className="w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden"
            >
               {/* Header */}
               <div className="bg-[#1a4731] px-5 py-4 flex items-center justify-between shrink-0">
                  <h2 className="text-base font-bold text-white">Add New Warranty</h2>
                  <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                     <X className="w-4 h-4 text-white" />
                  </button>
               </div>

               {/* Body */}
               <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

                  {/* Basic Details */}
                  <div>
                     <SectionTitle>Basic Details</SectionTitle>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Sel label="Category" required value={fd.category} onChange={handleCategoryChange}>
                           <option value="">Select Category</option>
                           {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </Sel>
                        <Sel label="Truck / Vehicle" required value={fd.vehicle_id} onChange={handleVehicleChange}>
                           <option value="">Select Vehicle</option>
                           {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}
                        </Sel>
                        <Sel label="Brand" required value={fd.brand} onChange={e => set('brand', e.target.value)} disabled={!fd.category}>
                           <option value="">{fd.category ? 'Select Brand' : 'Select category first'}</option>
                           {(BRANDS_BY_CATEGORY[fd.category] || []).map(b => <option key={b}>{b}</option>)}
                        </Sel>
                        <Sel label="Model" required value={fd.model} onChange={e => set('model', e.target.value)} disabled={!fd.category}>
                           <option value="">{fd.category ? 'Select Model' : 'Select category first'}</option>
                           {(MODELS_BY_CATEGORY[fd.category] || []).map(m => <option key={m}>{m}</option>)}
                        </Sel>
                        <Inp label="Serial Number" value={fd.serialNo} onChange={e => set('serialNo', e.target.value)} placeholder="e.g. SN1234567890" />
                     </div>
                  </div>

                  {/* Warranty Details */}
                  <div>
                     <SectionTitle>Warranty Details</SectionTitle>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Inp label="Start Date" required type="date" value={fd.startDate} onChange={e => set('startDate', e.target.value)} />
                        <Inp label="End Date" required type="date" value={fd.endDate} onChange={e => set('endDate', e.target.value)} />
                        <Inp label="Odometer (KM)" type="number" value={fd.odometer} onChange={e => set('odometer', e.target.value)} placeholder="e.g. 45680" />
                        <Inp label="Warranty Period" value={fd.warrantyPeriod} onChange={e => set('warrantyPeriod', e.target.value)} placeholder="e.g. 24 Months" />
                     </div>
                  </div>

                  {/* Attachments */}
                  <div>
                     <SectionTitle>Attachments</SectionTitle>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <UploadBox
                           label="Warranty Card"
                           required
                           fileName={files.warrantyCard?.name}
                           onChange={e => setFiles(p => ({ ...p, warrantyCard: e.target.files[0] }))}
                        />
                        <UploadBox
                           label="Invoice / Bill"
                           required
                           fileName={files.invoiceFile?.name}
                           onChange={e => setFiles(p => ({ ...p, invoiceFile: e.target.files[0] }))}
                        />
                     </div>
                  </div>

                  {/* Notes */}
                  <div>
                     <SectionTitle>Notes</SectionTitle>
                     <textarea
                        value={fd.description}
                        onChange={e => set('description', e.target.value)}
                        placeholder="Add any notes or description (optional)..."
                        rows={3}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none placeholder-slate-300"
                     />
                  </div>
               </div>

               {/* Footer */}
               <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between shrink-0 bg-white">
                  <button
                     onClick={onClose}
                     className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={handleSubmit}
                     disabled={!isValid}
                     className="flex items-center gap-2 px-6 py-2 bg-[#1a4731] hover:bg-[#153d28] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
