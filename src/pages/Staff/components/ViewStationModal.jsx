import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, MapPin, User, Phone, Edit, Trash2 } from 'lucide-react';

export default function ViewStationModal({ isOpen, onClose, station }) {
  if (!isOpen || !station) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
        >
          <div className="absolute top-4 right-4 z-10">
             <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
             >
               <X className="w-4 h-4" />
             </button>
          </div>

          <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-8 text-center text-white">
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
               <Building2 className="w-8 h-8 text-white" />
             </div>
             <h2 className="text-2xl font-bold tracking-tight">{station.name}</h2>
             <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20">
               {station.id}
             </span>
          </div>
          
          <div className="p-6">
             <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                    <p className="text-sm font-semibold text-gray-800">{station.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manager</p>
                    <p className="text-sm font-semibold text-gray-800">{station.manager}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</p>
                    <p className="text-sm font-semibold text-gray-800">{station.contact}</p>
                  </div>
                </div>
             </div>

             <div className="pt-6 flex gap-3">
                <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl transition-colors">
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
