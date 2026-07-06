import React from 'react';
import { Check, Minus, Trash2, Power } from 'lucide-react';
import { MODULES, PERMS, PERM_LBL, GROUPS } from './data';

export function StatusBadge({ status }) {
  return status === 'Active'
    ? <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border bg-green-50 text-green-700 border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Active</span>
    : <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border bg-slate-100 text-slate-500 border-slate-200"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Inactive</span>;
}

// ── CHANGE 1: Safe RoleAvatar with fallbacks ──
export function RoleAvatar({ name, color }) {
  const roleName = name || "";

  return (
    <div
      className={`w-8 h-8 rounded-lg ${color || "bg-indigo-600"} flex items-center justify-center text-white text-xs font-black shrink-0`}
    >
      {roleName
        .split(" ")
        .filter(Boolean)
        .map(word => word[0])
        .slice(0, 2)
        .join("")}
    </div>
  );
}

export function ReadMatrix({ permissions }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-2.5 font-black text-slate-500 uppercase tracking-wider w-48">Module</th>
            {PERMS.map(p => (
              <th key={p} className="px-3 py-2.5 font-black text-slate-500 uppercase tracking-wider text-center">{PERM_LBL[p]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GROUPS.map(group => {
            const mods = MODULES.filter(m => m.group === group);
            return (
              <React.Fragment key={group}>
                <tr className="bg-slate-50/60">
                  <td colSpan={7} className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">{group}</td>
                </tr>
                {mods.map(mod => (
                  <tr key={mod.key} className="border-b border-slate-100 hover:bg-slate-50/40">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">{mod.label}</td>
                    {PERMS.map(p => {
                      const granted = permissions?.[mod.key]?.[p];
                      return (
                        <td key={p} className="px-3 py-2.5 text-center">
                          {granted
                            ? <Check className="w-3.5 h-3.5 text-green-600 mx-auto" />
                            : <Minus className="w-3.5 h-3.5 text-slate-300 mx-auto" />
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function EditMatrix({ permissions, onChange }) {
  const setCell = (mod, perm, val) =>
    onChange({ ...permissions, [mod]: { ...permissions[mod], [perm]: val } });

  const toggleCol = (perm) => {
    const allOn = MODULES.every(m => permissions[m.key]?.[perm]);
    const next = { ...permissions };
    MODULES.forEach(m => { next[m.key] = { ...next[m.key], [perm]: !allOn }; });
    onChange(next);
  };

  const toggleRow = (modKey) => {
    const allOn = PERMS.every(p => permissions[modKey]?.[p]);
    onChange({ ...permissions, [modKey]: PERMS.reduce((a,p) => { a[p] = !allOn; return a; }, {}) });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[660px] text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-2.5 font-black text-slate-500 uppercase tracking-wider w-48">Module</th>
            {PERMS.map(p => (
              <th key={p} className="px-3 py-2.5 text-center">
                <button onClick={() => toggleCol(p)} className="flex flex-col items-center gap-1 mx-auto group" title={`Toggle all ${PERM_LBL[p]}`}>
                  <span className="font-black text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">{PERM_LBL[p]}</span>
                  <span className="text-[9px] font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Toggle all</span>
                </button>
              </th>
            ))}
            <th className="px-3 py-2.5 text-center font-black text-slate-500 uppercase tracking-wider text-[10px]">All</th>
          </tr>
        </thead>
        <tbody>
          {GROUPS.map(group => {
            const mods = MODULES.filter(m => m.group === group);
            return (
              <React.Fragment key={group}>
                <tr className="bg-slate-50/60">
                  <td colSpan={8} className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">{group}</td>
                </tr>
                {mods.map(mod => (
                  <tr key={mod.key} className="border-b border-slate-100 hover:bg-indigo-50/20">
                    <td className="px-4 py-2 font-semibold text-slate-700">{mod.label}</td>
                    {PERMS.map(p => (
                      <td key={p} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          // ── CHANGE 2: Added optional chaining ──
                          checked={!!permissions?.[mod.key]?.[p]}
                          onChange={e => setCell(mod.key, p, e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => toggleRow(mod.key)}
                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors whitespace-nowrap">
                        {PERMS.every(p => permissions?.[mod.key]?.[p]) ? 'Clear' : 'All'}
                      </button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ConfirmModal({ config, onClose, onConfirm }) {
  if (!config) return null;
  const isDelete = config.type === 'delete';
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-60" onClick={onClose} />
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto">
          <div className="p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isDelete ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              {isDelete ? <Trash2 className="w-5 h-5" /> : <Power className="w-5 h-5" />}
            </div>
            <p className="text-sm font-black text-slate-800">{config.title}</p>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{config.body}</p>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <button onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => { onConfirm(); onClose(); }}
              className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-colors ${isDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
              {config.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}