// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { X, Building2, MapPin, User, Phone, Edit, Trash2 } from 'lucide-react';

// export default function ViewStationModal({ isOpen, onClose, station }) {
//   if (!isOpen || !station) return null;

//   return (
//     <AnimatePresence>
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//         <motion.div 
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.95 }}
//           className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
//         >
//           <div className="absolute top-4 right-4 z-10">
//              <button 
//               onClick={onClose}
//               className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
//              >
//                <X className="w-4 h-4" />
//              </button>
//           </div>

//           <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-8 text-center text-white">
//              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
//                <Building2 className="w-8 h-8 text-white" />
//              </div>
//              <h2 className="text-2xl font-bold tracking-tight">{station.name}</h2>
//              <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20">
//                {station.id}
//              </span>
//           </div>

//           <div className="p-6">
//              <div className="space-y-4">
//                 <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
//                   <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
//                     <MapPin className="w-5 h-5" />
//                   </div>
//                   <div>
//                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
//                     <p className="text-sm font-semibold text-gray-800">{station.location}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
//                   <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
//                     <User className="w-5 h-5" />
//                   </div>
//                   <div>
//                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manager</p>
//                     <p className="text-sm font-semibold text-gray-800">{station.manager}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
//                   <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
//                     <Phone className="w-5 h-5" />
//                   </div>
//                   <div>
//                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</p>
//                     <p className="text-sm font-semibold text-gray-800">{station.contact}</p>
//                   </div>
//                 </div>
//              </div>

//              <div className="pt-6 flex gap-3">
//                 <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl transition-colors">
//                   <Edit className="w-4 h-4" /> Edit
//                 </button>
//                 <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-xl transition-colors">
//                   <Trash2 className="w-4 h-4" /> Delete
//                 </button>
//              </div>
//           </div>
//         </motion.div>
//       </div>
//     </AnimatePresence>
//   );
// }


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, MapPin, User, Phone, Edit, Trash2, Truck } from 'lucide-react';

export default function ViewStationModal({ isOpen, onClose, station, onEdit, onSuccess }) {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useEffect(() => {
    if (!isOpen || !station?.id) {
      setVehicles([]);
      return;
    }

    setLoadingVehicles(true);
    fetch(`http://localhost:5001/api/stations/${station.id}/vehicles`)
      .then(res => res.json())
      .then(data => { if (data.success) setVehicles(data.data); })
      .catch(err => console.error('Error fetching station vehicles:', err))
      .finally(() => setLoadingVehicles(false));
  }, [isOpen, station?.id]);

  if (!isOpen || !station) return null;

  const handleDelete = async () => {
    if (!window.confirm("Delete this station?")) return;

    try {
      const res = await fetch(`http://localhost:5001/api/stations/${station.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        onSuccess?.();
        onClose();
      } else {
        alert(data.message || "Failed to delete station");
      }
    } catch (err) {
      console.error(err);
      alert("Server error — could not delete station");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative max-h-[85vh] flex flex-col"
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

            {/* ✅ DB Mapping */}
            <h2 className="text-2xl font-bold tracking-tight">
              {station.station_name}
            </h2>

            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20">
              {station.station_code}
            </span>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="space-y-4">

              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {station.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manager</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {station.manager_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {station.contact_number}
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <Truck className="w-3.5 h-3.5" /> Vehicles
                </p>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {vehicles.length}
                </span>
              </div>

              {loadingVehicles ? (
                <p className="text-xs text-gray-400 py-3 text-center">Loading vehicles...</p>
              ) : vehicles.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center bg-gray-50 rounded-xl border border-gray-100">
                  No vehicles assigned to this station
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {vehicles.map(v => (
                    <div key={v.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{v.vehicle_no}</p>
                        <p className="text-[11px] text-gray-400 truncate">{v.driver_name || 'No driver assigned'}</p>
                      </div>
                      {v.vehicle_status && (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                          {v.vehicle_status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 flex gap-3">
              <button
                type="button"
                onClick={() => onEdit?.(station)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}