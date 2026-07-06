import React from 'react';
import { Database, Upload, Trash2, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ modal, onClose, onConfirm, restoreType, setRestoreType, restoreConfirm, setRestoreConfirm }) {
  if (!modal.type) return null;

  const configs = {
    create: {
      icon: Database,
      iconColor: 'bg-indigo-50 text-indigo-600',
      title: 'Create Manual Backup',
      body: 'A new backup snapshot will be created from the current database state. This may take a few minutes depending on database size.',
      warning: 'The system may experience minor slowdowns during backup creation.',
      confirmLabel: 'Start Backup',
      confirmColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    restore: {
      icon: Upload,
      iconColor: 'bg-amber-50 text-amber-600',
      title: 'Restore Database',
      body: `Restore point: ${modal.backup?.id ?? 'selected backup'} · ${modal.backup?.date ?? ''} · ${modal.backup?.size ?? ''}`,
      warning: 'Restoring a backup cannot be undone. All data changes made after this backup was created will be permanently lost.',
      confirmLabel: 'Restore',
      confirmColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    delete: {
      icon: Trash2,
      iconColor: 'bg-red-50 text-red-600',
      title: 'Delete Backup',
      body: `Permanently delete: ${modal.backup?.id ?? ''} (${modal.backup?.date ?? ''} · ${modal.backup?.size ?? ''})`,
      warning: 'This backup file will be permanently deleted from all storage locations and cannot be recovered.',
      confirmLabel: 'Delete Permanently',
      confirmColor: 'bg-red-600 hover:bg-red-700 text-white',
    },
  };

  const cfg = configs[modal.type];
  if (!cfg) return null;
  const Ico = cfg.icon;
  const canConfirm = modal.type === 'restore' ? restoreConfirm : true;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconColor}`}>
              <Ico className="w-4 h-4" />
            </div>
            <p className="text-sm font-black text-slate-800">{cfg.title}</p>
          </div>

          <div className="px-5 py-4 space-y-4">
            <p className="text-xs font-medium text-slate-600 leading-relaxed">{cfg.body}</p>

            {/* Restore type selection */}
            {modal.type === 'restore' && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Restore Type</p>
                {[
                  { v:'full',   l:'Full Database',             d:'All data, configuration, and master records.' },
                  { v:'config', l:'System Configuration Only', d:'ERP settings and preferences only.'           },
                  { v:'master', l:'Master Data Only',          d:'Vehicles, vendors, staff — no transactions.'  },
                  { v:'trans',  l:'Transactional Data Only',   d:'Trips, payments, fuel records only.'          },
                ].map(o => (
                  <label key={o.v} className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    restoreType === o.v ? 'bg-amber-50 border-amber-300' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input type="radio" name="restoreTypeModal" value={o.v} checked={restoreType === o.v}
                      onChange={() => setRestoreType(o.v)} className="mt-0.5 accent-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{o.l}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{o.d}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Warning banner */}
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-amber-700 leading-relaxed">{cfg.warning}</p>
            </div>

            {/* Restore confirmation checkbox */}
            {modal.type === 'restore' && (
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={restoreConfirm} onChange={e => setRestoreConfirm(e.target.checked)}
                  className="mt-0.5 accent-indigo-600 w-4 h-4" />
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  I understand that restoring a backup will overwrite the current database and this action cannot be undone.
                </p>
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
            <button onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => canConfirm && onConfirm()} disabled={!canConfirm}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                canConfirm ? cfg.confirmColor : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}>
              {cfg.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
