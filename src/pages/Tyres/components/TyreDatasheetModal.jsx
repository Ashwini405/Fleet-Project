import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Navigation, Disc, PenTool, Hash, Info, History, FileText } from 'lucide-react';

export default function TyreDatasheetModal({ isOpen, onClose, tyreData }) {
  if (!isOpen || !tyreData) return null;

  // Calculate stats based on Tyre Data 
  // Remaining = Expected - Running (where running = presentOdo - fittedOdo)
  const remainingLife = tyreData.expectedLife - tyreData.runningKm;
  const runningPercentage = Math.min((tyreData.runningKm / tyreData.expectedLife) * 100, 100);

  const getHealthColors = (health) => {
    switch(health) {
      case 'Good': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', fill: 'bg-green-500' };
      case 'Medium': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', fill: 'bg-yellow-500' };
      case 'Poor': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', fill: 'bg-red-500' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', fill: 'bg-gray-500' };
    }
  };

  const healthStyle = getHealthColors(tyreData.health);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 bg-[#0f172a] text-white shrink-0">
            <div>
               <h3 className="text-xl font-black flex items-center gap-3 tracking-tight">
                 Tyre Data Sheet <span className="px-2 py-0.5 bg-green-500 text-[10px] text-white uppercase tracking-widest rounded">Mounted</span>
               </h3>
               <p className="text-xs text-blue-400 font-bold tracking-widest mt-1 uppercase">
                  Serial ID: {tyreData.id}
               </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 bg-gray-50/50">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               
               {/* Running KM Card */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                  <Activity className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Running</p>
                  <p className="text-3xl font-black text-gray-800 tracking-tight mt-1">
                     {tyreData.runningKm.toLocaleString()} <span className="text-sm font-bold text-gray-400">km</span>
                  </p>
               </div>

               {/* Remaining Life Card */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden flex flex-col items-center justify-center text-center">
                  <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full">
                     <div className={`h-full ${healthStyle.fill}`} style={{ width: `${runningPercentage}%` }}></div>
                  </div>
                  <History className="w-6 h-6 text-blue-500 mb-2 mt-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Remaining</p>
                  <p className="text-3xl font-black text-blue-600 tracking-tight mt-1">
                     {remainingLife > 0 ? remainingLife.toLocaleString() : 0} <span className="text-sm font-bold text-blue-400">km</span>
                  </p>
               </div>

               {/* Health Card */}
               <div className={`${healthStyle.bg} border ${healthStyle.border} p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center`}>
                  <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center mb-2">
                     <div className={`w-3 h-3 rounded-full ${healthStyle.fill}`}></div>
                  </div>
                  <p className={`text-[10px] font-bold ${healthStyle.text} opacity-70 uppercase tracking-widest`}>Current Health</p>
                  <p className={`text-2xl font-black ${healthStyle.text} tracking-tight mt-1 uppercase`}>
                     {tyreData.health}
                  </p>
               </div>
               
            </div>

            {/* Details Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                 <FileText className="w-4 h-4 text-gray-400" /> Full Specification
               </h4>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  
                  {/* Left Column Items */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-500">Tyre Serial No</span>
                      <span className="text-sm font-bold text-gray-800">{tyreData.id}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-500">Brand / Make</span>
                      <span className="text-sm font-bold text-gray-800">{tyreData.make}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-500">Model</span>
                      <span className="text-sm font-bold text-gray-800">{tyreData.model}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-500">Material Type</span>
                      <span className="text-sm font-bold text-gray-800">{tyreData.material || 'Radial Steel'}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-500">Date of Issue</span>
                      <span className="text-sm font-bold text-gray-800 font-mono">{tyreData.fittedDate}</span>
                    </div>
                  </div>

                  {/* Right Column Items */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-500">Expected Life</span>
                      <span className="text-sm font-black text-gray-800 font-mono">{tyreData.expectedLife.toLocaleString()} km</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-500">Vendor</span>
                      <span className="text-sm font-bold text-gray-800">{tyreData.vendor || 'Unknown Provider'}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-500">Tyre Cost</span>
                      <span className="text-sm font-bold text-green-700 font-mono">₹ {(tyreData.cost || 14500).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-500">Current Location</span>
                      <span className="text-sm font-bold text-gray-800">{tyreData.truckNo} ({tyreData.position})</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs font-bold text-gray-500">Fitted Odometer</span>
                      <span className="text-sm font-bold text-gray-800 font-mono">{tyreData.fittedOdo.toLocaleString()} km</span>
                    </div>
                  </div>

                  {/* Footer Highlights */}
                  <div className="md:col-span-2 pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-6">
                    
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Present Odometer</span>
                      <span className="text-xl font-black text-slate-800 font-mono">{tyreData.presentOdo.toLocaleString()} km</span>
                    </div>

                    <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Bill & Picture</span>
                      <button className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm">
                         View Attachments
                      </button>
                    </div>

                  </div>

               </div>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
