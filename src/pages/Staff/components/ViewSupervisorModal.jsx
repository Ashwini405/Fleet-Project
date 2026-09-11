// import React from 'react';
// import { AnimatePresence, motion } from 'framer-motion';
// import { X, MapPin, Phone, Briefcase, CalendarCheck } from 'lucide-react';

// export default function ViewSupervisorModal({ isOpen, onClose, staff }) {
//   if (!isOpen || !staff) return null;

//   return (
//     <AnimatePresence>
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95, y: 10 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           exit={{ opacity: 0, scale: 0.95, y: 10 }}
//           className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
//         >
//           <div className="flex items-start justify-between p-5 border-b border-gray-100">
//             <div>
//               <h2 className="text-xl font-bold text-gray-900">Supervisor Details</h2>
//               <p className="text-sm text-gray-500 mt-1">Review all assigned supervisor information</p>
//             </div>
//             <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-6">
//             <div className="space-y-4">
//               <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
//                 <div className="flex items-center gap-4">
//                   <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white grid place-items-center text-xl font-bold">
//                     {staff.name.split(' ').map((n) => n[0]).join('')}
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-gray-900">{staff.name}</h3>
//                     <p className="text-sm text-gray-500">Supervisor ID • {staff.id}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <div className="p-5 bg-white rounded-3xl border border-gray-100">
//                   <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Contact</p>
//                   <div className="flex items-center gap-2 text-sm text-slate-600">
//                     <Phone className="w-4 h-4 text-slate-400" />
//                     <span>{staff.contact}</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-sm text-slate-600 mt-3">
//                     <MapPin className="w-4 h-4 text-slate-400" />
//                     <span>{staff.allotment}</span>
//                   </div>
//                 </div>

//                 <div className="p-5 bg-white rounded-3xl border border-gray-100">
//                   <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Role</p>
//                   <div className="flex items-center gap-2 text-sm text-slate-600">
//                     <Briefcase className="w-4 h-4 text-slate-400" />
//                     <span>Supervisor</span>
//                   </div>
//                   <div className="mt-3 text-sm text-slate-600">
//                     <p className="font-semibold text-slate-800">Current Status</p>
//                     <p>{staff.status}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div className="p-5 bg-white rounded-3xl border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Assigned Since</p>
//                     <p className="text-sm font-bold text-slate-900">{staff.assignedSince || 'N/A'}</p>
//                   </div>
//                   <CalendarCheck className="w-5 h-5 text-blue-600" />
//                 </div>
//               </div>
//               <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
//                 <h4 className="text-sm font-bold text-slate-900 mb-3">Notes</h4>
//                 <p className="text-sm text-slate-600">{staff.notes || 'No additional notes available.'}</p>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </AnimatePresence>
//   );
// }


import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MapPin, Phone, Briefcase, CalendarCheck, Trash2, Edit } from 'lucide-react';

const UPLOADS_BASE_URL = 'http://localhost:5001/uploads/';

export default function ViewSupervisorModal({ isOpen, onClose, staff, onSuccess, onEdit }) {
  if (!isOpen || !staff) return null;

  const handleDelete = async () => {
    if (!window.confirm(`Remove supervisor "${staff.full_name}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5001/api/supervisors/${staff.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        onSuccess?.();
        onClose();
      } else {
        alert(data.message || "Failed to remove supervisor");
      }
    } catch (err) {
      console.error(err);
      alert("Server error — could not remove supervisor");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          <div className="flex items-start justify-between p-5 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Supervisor Details</h2>
              <p className="text-sm text-gray-500 mt-1">Review all assigned supervisor information</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-6">
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-4">
                  {staff.profile_photo ? (
                    <img
                      src={`${UPLOADS_BASE_URL}${staff.profile_photo}`}
                      alt={`${staff.full_name || 'Supervisor'} profile`}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white grid place-items-center text-xl font-bold">
                      {(staff.full_name || '').split(' ').map((n) => n[0]).join('')}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{staff.full_name}</h3>
                    <p className="text-sm text-gray-500">Supervisor ID • {staff.supervisor_code || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-5 bg-white rounded-3xl border border-gray-100">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Contact</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{staff.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{staff.station_name || 'Unassigned'}</span>
                  </div>
                  {staff.id_card_number && (
                    <p className="text-xs text-slate-400 font-medium mt-3">
                      ID Card: <span className="text-slate-600 font-semibold">{staff.id_card_number}</span>
                    </p>
                  )}
                </div>

                <div className="p-5 bg-white rounded-3xl border border-gray-100">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Role</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>Supervisor</span>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">Current Status</p>
                    <p>{staff.status === 'active' ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-white rounded-3xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Assigned Since</p>
                    <p className="text-sm font-bold text-slate-900">
                      {staff.created_at
                        ? new Date(staff.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              {/* Wallet Balance */}
              <div className={`p-5 rounded-3xl border ${
                (staff.wallet_balance ?? 0) < 1000
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Wallet Balance</p>
                <p className={`text-2xl font-black ${
                  (staff.wallet_balance ?? 0) < 1000 ? 'text-red-600' : 'text-green-700'
                }`}>
                  ₹{Number(staff.wallet_balance ?? 0).toLocaleString('en-IN')}
                </p>
                {(staff.wallet_balance ?? 0) < 1000 && (
                  <p className="text-xs text-red-500 font-semibold mt-1">⚠️ Low balance — top up needed</p>
                )}
              </div>

              {/* Documents */}
              <div className="p-5 bg-white rounded-3xl border border-gray-100">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Documents</p>
                <div className="space-y-2">
                  {[
                    { label: 'Profile Photo',           file: staff.profile_photo },
                    { label: 'ID Card (Aadhar/Pan)',    file: staff.id_document },
                    { label: 'Bank Passbook / Cheque',  file: staff.bank_document },
                  ].map(doc => (
                    <div key={doc.label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-medium">{doc.label}</span>
                      {doc.file ? (
                        <a
                          href={`${UPLOADS_BASE_URL}${doc.file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not uploaded</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Notes</h4>
                <p className="text-sm text-slate-600">{staff.notes || 'No additional notes available.'}</p>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onEdit?.(staff)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Remove Supervisor
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}