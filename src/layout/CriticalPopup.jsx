import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const SEV_STYLE = {
  Critical: { header: 'bg-red-600',    icon: 'text-red-600',    bg: 'bg-red-50'    },
  High:     { header: 'bg-orange-500', icon: 'text-orange-500', bg: 'bg-orange-50' },
  Low:      { header: 'bg-emerald-600',icon: 'text-emerald-600',bg: 'bg-emerald-50'},
  Medium:   { header: 'bg-yellow-500', icon: 'text-yellow-600', bg: 'bg-yellow-50' },
};

function PopupIcon({ n }) {
  if (n.message?.startsWith('\u2705')) return <span className="text-white text-base">\u2705</span>;
  return <AlertTriangle className="w-4 h-4 text-white" />;
}

export default function CriticalPopup() {
  const { criticalPopup, dismissPopup, markRead } = useNotifications();
  const navigate = useNavigate();

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!criticalPopup) return;
    const t = setTimeout(dismissPopup, 8000);
    return () => clearTimeout(t);
  }, [criticalPopup, dismissPopup]);

  const handleDismiss = () => {
    if (criticalPopup) markRead(criticalPopup.id);
    dismissPopup();
  };

  const handleView = () => {
    if (criticalPopup) markRead(criticalPopup.id);
    dismissPopup();
    navigate('/notifications');
  };

  const isResolved = criticalPopup?.message?.startsWith('✅');
  const s = isResolved
    ? SEV_STYLE.Low
    : SEV_STYLE[criticalPopup?.severity] || SEV_STYLE.High;

  return (
    <AnimatePresence>
      {criticalPopup && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{    opacity: 0, y: -80, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-4 right-4 z-[200] w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        >
          {/* Coloured header bar */}
          <div className={`${s.header} px-4 py-2.5 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <PopupIcon n={criticalPopup} />
              <span className="text-xs font-black text-white uppercase tracking-widest">
                {isResolved ? 'Issue Resolved' : `${criticalPopup.severity} Alert`}
              </span>
            </div>
            <button onClick={handleDismiss} className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className={`${s.bg} px-4 py-4`}>
            <p className="text-sm font-bold text-slate-800 leading-snug">{criticalPopup.message}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {criticalPopup.vehicle_number && (
                <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  🚛 {criticalPopup.vehicle_number}
                </span>
              )}
              {criticalPopup.axle_position && (
                <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  📍 {criticalPopup.axle_position}
                </span>
              )}
              {criticalPopup.incident_type && (
                <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {criticalPopup.incident_type}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
            <button onClick={handleDismiss}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
              Dismiss
            </button>
            <button onClick={handleView}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3" /> View Details
            </button>
          </div>

          {/* Auto-dismiss progress bar */}
          <motion.div
            className={`h-1 ${s.header}`}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 8, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
