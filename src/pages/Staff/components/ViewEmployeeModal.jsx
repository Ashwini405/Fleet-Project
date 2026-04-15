import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MapPin, Phone, Briefcase, CalendarCheck } from 'lucide-react';

export default function ViewEmployeeModal({ isOpen, onClose, staff }) {
  if (!isOpen || !staff) return null;

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
              <h2 className="text-xl font-bold text-gray-900">Employee Details</h2>
              <p className="text-sm text-gray-500 mt-1">Review all assigned employee information</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-6">
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white grid place-items-center text-xl font-bold">
                    {staff.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{staff.name}</h3>
                    <p className="text-sm text-gray-500">Employee ID • {staff.id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-5 bg-white rounded-3xl border border-gray-100">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Contact</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{staff.contact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{staff.allotment}</span>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-gray-100">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Role</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>Employee</span>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">Current Status</p>
                    <p>{staff.status}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-white rounded-3xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Assigned Since</p>
                    <p className="text-sm font-bold text-slate-900">{staff.assignedSince || 'N/A'}</p>
                  </div>
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Notes</h4>
                <p className="text-sm text-slate-600">{staff.notes || 'No additional notes available.'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
