import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Calendar } from 'lucide-react';

export default function AddClaimModal({ isOpen, onClose, activeWarranties, onSubmit }) {
  const [formData, setFormData] = useState({
    ref: '',
    itemType: '',
    sn: '',
    date: '',
    sentDate: '',
    issue: '',
    complaint: '',
    docket: ''
  });

  if (!isOpen) return null;

  const handleWarrantySelect = (e) => {
    const selectedId = e.target.value;
    const warranty = activeWarranties.find(w => w.id === selectedId);
    
    if (warranty) {
       setFormData({
          ...formData,
          ref: warranty.id,
          itemType: warranty.category,
          sn: warranty.sn
       });
    } else {
       setFormData({ ...formData, ref: '', itemType: '', sn: '' });
    }
  };

  const handleSubmit = () => {
    const refData = activeWarranties.find(w => w.id === formData.ref);
    const newRecord = {
      id: `CL-2024-${Math.floor(Math.random() * 900) + 100}`,
      status: 'Pending',
      vehicle: refData ? refData.vehicle : 'Unknown',
      ...formData
    };
    onSubmit(newRecord);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 bg-[#2563eb] text-white shrink-0">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
               New Claim Entry
            </h3>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
               <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-6">
             
             <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Select Warranty Item <span className="text-red-500">*</span></label>
                <select 
                   className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
                   value={formData.ref}
                   onChange={handleWarrantySelect}
                >
                   <option value="">-- Choose active warranty --</option>
                   {activeWarranties.map(w => (
                      <option key={w.id} value={w.id}>{w.id} - {w.item} ({w.vehicle})</option>
                   ))}
                </select>
             </div>

             <div className="grid grid-cols-2 gap-5">
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Item Type <span className="text-red-500">*</span></label>
                   <input type="text" readOnly className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 outline-none" value={formData.itemType} placeholder="Auto-filled" />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Serial NO <span className="text-red-500">*</span></label>
                   <input type="text" readOnly className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold font-mono text-slate-600 outline-none" value={formData.sn} placeholder="Auto-filled" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-5">
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Submit Date <span className="text-red-500">*</span></label>
                   <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="date" className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 shadow-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date Sent To Vendor</label>
                   <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="date" className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 shadow-sm" value={formData.sentDate} onChange={e => setFormData({...formData, sentDate: e.target.value})} />
                   </div>
                </div>
             </div>

             <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Issue Description <span className="text-red-500">*</span></label>
                <textarea 
                   className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 shadow-sm min-h-[100px] resize-none"
                   placeholder="Describe the defect or issue..."
                   value={formData.issue}
                   onChange={e => setFormData({...formData, issue: e.target.value})}
                />
             </div>

             <div className="grid grid-cols-2 gap-5">
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Complaint No</label>
                   <input type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold" value={formData.complaint} onChange={e => setFormData({...formData, complaint: e.target.value})} placeholder="e.g. CMP-1120" />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Complaint Docket</label>
                   <input type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold" value={formData.docket} onChange={e => setFormData({...formData, docket: e.target.value})} placeholder="e.g. DOCK-8822" />
                </div>
             </div>

             <div className="pt-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Item Photos Upload</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-white hover:border-blue-400 transition-colors cursor-pointer bg-slate-50/50">
                   <UploadCloud className="w-10 h-10 text-slate-300 mb-3" />
                   <p className="text-sm font-bold text-slate-600">Drag & drop photos here</p>
                   <p className="text-xs font-semibold text-slate-400 mt-1">or click to browse from your computer</p>
                </div>
             </div>

          </div>

          <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
             <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                Cancel
             </button>
             <button 
                onClick={handleSubmit}
                disabled={!formData.ref || !formData.date || !formData.issue}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
             >
                Submit Claim
             </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
