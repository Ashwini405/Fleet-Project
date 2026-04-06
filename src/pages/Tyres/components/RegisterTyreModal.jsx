import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, FileText, Upload, MapPin, DollarSign } from 'lucide-react';
import { dummyTrucks, tyreBrands, layoutPositions, vendors } from '../data/dummyData';

export default function RegisterTyreModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-[#0f172a] text-white shrink-0">
            <h3 className="text-lg font-bold flex items-center gap-2 tracking-wide">
              <Plus className="w-5 h-5 text-blue-400" /> Register New Tyre
            </h3>
            <button 
              onClick={onClose}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Main Content Form */}
          <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                
                {/* 1. Identification */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                   <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3">
                     <FileText className="w-4 h-4 text-gray-400" /> Identification
                   </h4>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tyre Serial No</label>
                        <input type="text" placeholder="e.g. T-12345" className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Brand / Make</label>
                        <select className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                           <option value="">Select Brand</option>
                           {tyreBrands.map(b => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Model</label>
                        <select className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                           <option value="">Select Model</option>
                           <option>Milaze</option>
                           <option>Zapper</option>
                           <option>UX Royale</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Material Type</label>
                        <select className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                           <option>Radial Steel</option>
                           <option>Nylon</option>
                        </select>
                      </div>
                   </div>
                </div>

                {/* 2. Placement & Life */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                   <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3">
                     <MapPin className="w-4 h-4 text-gray-400" /> Placement & Life
                   </h4>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Assign Truck</label>
                        <select className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                           <option value="">In Stock (Unassigned)</option>
                           {dummyTrucks.map(t => <option key={t.id}>{t.id}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tyre Placement</label>
                        <select className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                           <option value="">Select Position</option>
                           {layoutPositions.map(p => <option key={p.id}>{p.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date of Issue</label>
                        <input type="date" className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expected Life (KM)</label>
                        <input type="number" placeholder="e.g. 100000" className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]" />
                      </div>
                   </div>
                </div>

                {/* 3. Purchase Details */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                   <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3">
                     <DollarSign className="w-4 h-4 text-gray-400" /> Purchase Details
                   </h4>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vendor</label>
                        <select className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                           <option value="">Select Vendor</option>
                           {vendors.map(v => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tyre Cost (₹)</label>
                        <input type="number" placeholder="0.00" className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-lg font-bold text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]" />
                      </div>
                      
                      <div className="pt-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Upload Bill & Image</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer group">
                           <Upload className="w-6 h-6 text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
                           <p className="text-xs text-blue-600 font-semibold mb-1">Click to upload or drag & drop</p>
                           <p className="text-[10px] text-gray-400 font-medium">JPEG, PNG, PDF up to 10MB</p>
                        </div>
                      </div>
                   </div>
                </div>

             </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-white shrink-0">
             <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
               Cancel
             </button>
             <button className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/30">
               Save Tyre
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
