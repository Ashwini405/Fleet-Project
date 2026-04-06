import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCcw, Gauge } from 'lucide-react';
import { dummyActiveTyres, layoutPositions } from '../data/dummyData';

export default function TruckTyreLayoutModal({ isOpen, onClose, truckData }) {
  if (!isOpen || !truckData) return null;

  // Filter tyres assigned to this specific truck
  const truckTyres = dummyActiveTyres.filter(t => t.truckNo === truckData.id);

  const getTyreByPosition = (posId) => {
    return truckTyres.find(t => t.position === layoutPositions.find(p => p.id === posId)?.label);
  };

  const TyreBlock = ({ posId, label }) => {
    const tyre = getTyreByPosition(posId);

    if (!tyre) {
      return (
        <div className="w-16 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-1 opacity-60">
          <span className="text-[9px] font-bold text-gray-400 capitalize">{label}</span>
          <span className="text-[10px] font-medium text-gray-400 mt-1">Empty</span>
        </div>
      );
    }

    let colorClass = 'bg-gray-500';
    if (tyre.health === 'Good') colorClass = 'bg-green-500';
    if (tyre.health === 'Medium') colorClass = 'bg-yellow-500';
    if (tyre.health === 'Poor') colorClass = 'bg-red-500';

    return (
      <div className={`w-16 h-24 rounded-lg ${colorClass} shadow-md flex flex-col items-center justify-between p-2 text-white relative transition-transform hover:scale-105 cursor-pointer`}>
         <div className="text-[9px] font-bold uppercase w-full text-center truncate border-b border-white/20 pb-1">{tyre.id.split('-')[1]}</div>
         <div className="text-xl font-black">{Math.round((tyre.presentOdo - tyre.fittedOdo) / 1000)}k</div>
         <div className="text-[8px] font-medium tracking-wide uppercase opacity-80">{label}</div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 bg-[#0f172a] text-white shrink-0">
            <div>
               <h3 className="text-xl font-black flex items-center gap-3 tracking-tight">
                 Vehicle Axle Layout
               </h3>
               <div className="flex gap-4 mt-1">
                 <p className="text-xs text-blue-400 font-bold tracking-widest uppercase">
                    Truck No: <span className="text-white">{truckData.id}</span>
                 </p>
                 <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                    Model: <span className="text-white">{truckData.model}</span>
                 </p>
                 <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                    Tyres: <span className="text-white">{truckData.totalTyres}</span>
                 </p>
               </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col items-center justify-center relative">
             
             {/* Legend */}
             <div className="absolute top-4 right-6 flex flex-col gap-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="w-3 h-3 rounded bg-green-500"></span> Good Health</div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="w-3 h-3 rounded bg-yellow-500"></span> Medium Health</div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="w-3 h-3 rounded bg-red-500"></span> Poor Health</div>
             </div>

             {/* Graphical Representation Wrapper */}
             <div className="relative py-12 px-8 bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 min-w-[400px]">
                
                {/* Central Chassis Line */}
                <div className="absolute left-1/2 top-10 bottom-10 w-2.5 bg-slate-800 -translate-x-1/2 z-0 rounded-full"></div>

                {/* STEER AXLE */}
                <div className="relative z-10 w-full mb-16">
                  <div className="absolute top-1/2 left-10 right-10 h-1.5 bg-slate-600 -translate-y-1/2 z-0"></div>
                  <div className="flex justify-between items-center w-full px-10 relative z-10">
                     <TyreBlock posId="FL" label="Front L" />
                     <TyreBlock posId="FR" label="Front R" />
                  </div>
                  <div className="text-center font-bold text-[10px] text-gray-400 uppercase tracking-widest mt-4">Steer Axle</div>
                </div>

                {/* DRIVE AXLE 1 */}
                <div className="relative z-10 w-full mb-16">
                  <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-600 -translate-y-1/2 z-0"></div>
                  <div className="flex justify-between w-full relative z-10">
                     <div className="flex gap-1.5">
                       <TyreBlock posId="L1_OUTER" label="L1 Out" />
                       <TyreBlock posId="L1_INNER" label="L1 Inn" />
                     </div>
                     <div className="flex gap-1.5">
                       <TyreBlock posId="R1_INNER" label="R1 Inn" />
                       <TyreBlock posId="R1_OUTER" label="R1 Out" />
                     </div>
                  </div>
                  <div className="text-center font-bold text-[10px] text-gray-400 uppercase tracking-widest mt-4">Drive Axle 1</div>
                </div>

                {/* DRIVE AXLE 2 */}
                <div className="relative z-10 w-full">
                  <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-600 -translate-y-1/2 z-0"></div>
                  <div className="flex justify-between w-full relative z-10">
                     <div className="flex gap-1.5">
                       <TyreBlock posId="L2_OUTER" label="L2 Out" />
                       <TyreBlock posId="L2_INNER" label="L2 Inn" />
                     </div>
                     <div className="flex gap-1.5">
                       <TyreBlock posId="R2_INNER" label="R2 Inn" />
                       <TyreBlock posId="R2_OUTER" label="R2 Out" />
                     </div>
                  </div>
                  <div className="text-center font-bold text-[10px] text-gray-400 uppercase tracking-widest mt-4">Drive Axle 2</div>
                </div>

             </div>

             <div className="flex items-center gap-4 mt-8">
               <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                 <RefreshCcw className="w-4 h-4" /> Rotate Tyres
               </button>
               <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                 <Gauge className="w-4 h-4" /> Log Pressure Check
               </button>
             </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
