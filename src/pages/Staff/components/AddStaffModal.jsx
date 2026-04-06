import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Building2, CreditCard, FileUp, Upload } from 'lucide-react';

export default function AddStaffModal({ isOpen, onClose, role }) {
  const [activeTab, setActiveTab] = useState('personal');

  if (!isOpen) return null;

  const roleTitle = role === 'supervisors' ? 'Supervisor' : role === 'drivers' ? 'Driver' : 'Employee';

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
    { id: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'bank', label: 'Bank', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'uploads', label: 'Uploads', icon: <FileUp className="w-4 h-4" /> }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Add New {roleTitle}</h3>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">Please fill in all the required information</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex border-b border-gray-100 px-2 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 overflow-y-auto min-h-[300px]">
             <form id="add-staff-form" className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
               
               {activeTab === 'personal' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-5">
                   <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input type="text" placeholder="John Doe" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all" required />
                   </div>
                   <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
                      <input type="text" placeholder="+91..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all" required />
                   </div>
                   <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">ID Card Number</label>
                      <input type="text" placeholder="ID/License No." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all" required />
                   </div>
                   <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                      <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all text-gray-700">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                   </div>
                   <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Address</label>
                      <textarea rows="2" placeholder="Street, City, State, ZIP..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all resize-none"></textarea>
                   </div>
                 </motion.div>
               )}

               {activeTab === 'work' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-5">
                   <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Allotted Station</label>
                      <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all">
                        <option value="">-- Select Station --</option>
                        <option value="1">Central Hub</option>
                        <option value="2">North Station</option>
                      </select>
                   </div>
                   <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Primary Truck Allocation</label>
                      <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all">
                        <option value="">-- None / Select Truck --</option>
                        <option value="t1">MH 12 AB 1234</option>
                        <option value="t2">MH 12 CD 5678</option>
                      </select>
                   </div>
                 </motion.div>
               )}

               {activeTab === 'bank' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-5">
                   <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bank Name</label>
                      <input type="text" placeholder="e.g. HDFC Bank" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all" />
                   </div>
                   <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Account Number</label>
                      <input type="password" placeholder="••••••••••••" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all" />
                   </div>
                   <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">IFSC Code</label>
                      <input type="text" placeholder="e.g. HDFC0001234" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all uppercase" />
                   </div>
                 </motion.div>
               )}

               {activeTab === 'uploads' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {['Profile Photo', 'ID Card (Aadhar/Pan)', 'Bank Passbook / Cheque'].map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                             <FileUp className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{doc}</p>
                            <p className="text-[11px] text-gray-500">PNG, JPG or PDF (Max. 5MB)</p>
                          </div>
                        </div>
                        <label className="cursor-pointer px-4 py-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-lg text-sm font-bold text-gray-600 transition-colors shadow-sm">
                           Select File
                           <input type="file" className="hidden" />
                        </label>
                      </div>
                    ))}
                 </motion.div>
               )}
             </form>
          </div>

          <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/50">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" form="add-staff-form" className="flex-1 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm shadow-slate-900/20">
              Complete Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
