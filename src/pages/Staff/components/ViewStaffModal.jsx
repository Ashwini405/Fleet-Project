import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Briefcase, FileText, CheckCircle2, ShieldAlert, CreditCard, Edit, Trash2 } from 'lucide-react';

export default function ViewStaffModal({ isOpen, onClose, staff }) {
  if (!isOpen || !staff) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
        >
          <div className="absolute top-4 right-4 z-10 bg-black/10 backdrop-blur rounded-full p-1 border border-white/20">
             <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-black/20 text-white transition-colors"
             >
               <X className="w-5 h-5" />
             </button>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white shrink-0 relative overflow-hidden">
             {/* Decorative background shape */}
             <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl mix-blend-screen"></div>
             
             <div className="flex items-center gap-6 relative z-10">
                <div className="w-24 h-24 bg-white/10 rounded-full border-[4px] border-white/20 flex items-center justify-center text-3xl font-bold shadow-2xl backdrop-blur-md">
                   {staff.name?.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                   <div className="flex items-center gap-3">
                     <h2 className="text-3xl font-extrabold tracking-tight">{staff.name}</h2>
                     {staff.status === 'Active' ? (
                       <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-green-400 bg-green-500/20 px-2.5 py-1 rounded-full border border-green-500/30">
                         <CheckCircle2 className="w-3 h-3" /> Active
                       </span>
                     ) : (
                       <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-red-400 bg-red-500/20 px-2.5 py-1 rounded-full border border-red-500/30">
                         <ShieldAlert className="w-3 h-3" /> Inactive
                       </span>
                     )}
                   </div>
                   <p className="text-blue-200 mt-1.5 flex items-center gap-2 font-medium">
                     <span className="px-2 py-0.5 bg-blue-500/20 rounded text-xs tracking-wider uppercase">{staff.role}</span>
                     <span className="text-white/40">•</span>
                     <span className="tracking-widest font-mono text-sm">{staff.id}</span>
                   </p>
                </div>
             </div>
          </div>
          
          <div className="p-6 overflow-y-auto space-y-8">
             
             {/* Info Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <Phone className="w-5 h-5 text-gray-400 mb-2" />
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                   <p className="text-sm font-semibold text-gray-800">{staff.contact}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <MapPin className="w-5 h-5 text-gray-400 mb-2" />
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Station</p>
                   <p className="text-sm font-semibold text-gray-800">{staff.allotment}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 col-span-2 md:col-span-2 shadow-sm shadow-blue-100/50">
                   <CreditCard className="w-5 h-5 text-blue-500 mb-2" />
                   <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Wallet Holding / Balance</p>
                   <p className="text-2xl font-black text-blue-700 tracking-tight">₹{staff.wallet?.toLocaleString()}</p>
                </div>
             </div>

             {/* Documents & Bank placeholder */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                     <Briefcase className="w-4 h-4 text-gray-400" /> Work Details
                   </h4>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="text-sm text-gray-500">Date of Joining</span>
                       <span className="text-sm font-semibold text-gray-800">12 Jan, 2024</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-gray-100">
                       <span className="text-sm text-gray-500">Assigned Vehicle</span>
                       <span className="text-sm font-semibold text-gray-800">MH 12 AB 1234</span>
                     </div>
                   </div>
                </div>
                <div>
                   <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                     <FileText className="w-4 h-4 text-gray-400" /> Documents
                   </h4>
                   <div className="space-y-2">
                     <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                        <span className="text-sm font-medium text-gray-700">Aadhar Card</span>
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded uppercase">Verified</span>
                     </div>
                     <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                        <span className="text-sm font-medium text-gray-700">Bank Passbook</span>
                        <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded uppercase">Pending</span>
                     </div>
                   </div>
                </div>
             </div>

          </div>

          <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/50">
             <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
               <Edit className="w-4 h-4" /> Edit Profile
             </button>
             <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-xl transition-colors">
               <Trash2 className="w-4 h-4" /> Terminate / Delete
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
