import React, { useState } from 'react';
import { Shield, X, AlertTriangle } from 'lucide-react';
import { emptyPerms, fullPerms, countGranted, MODULES } from './data';
import { EditMatrix } from './components';

export default function RoleFormModal({ mode, initialRole, allRoles, onClose, onSave }) {
  const [name,        setName]        = useState(initialRole?.name        ?? '');
  const [description, setDescription] = useState(initialRole?.description ?? '');
  const [status,      setStatus]      = useState(initialRole?.status      ?? 'Active');
  const [cloneFrom,   setCloneFrom]   = useState('');
  const [permissions, setPermissions] = useState(
    initialRole?.permissions ? structuredClone(initialRole.permissions) : emptyPerms()
  );
  const [errors, setErrors] = useState({});

  // Fallback preset roles to show in the "Clone from Role" dropdown
  const FALLBACK_ROLES = [
    { id: 'preset_manager', name: 'Manager', permissions: null },
    { id: 'preset_supervisor', name: 'Supervisor', permissions: null },
    { id: 'preset_ops', name: 'Operations Manager', permissions: null },
    { id: 'preset_finance', name: 'Finance Manager', permissions: null }
  ];

  const handleCloneChange = (id) => {
    setCloneFrom(id);
    if (id) {
      const src = (allRoles || []).find(r => r.id === id) || FALLBACK_ROLES.find(r => r.id === id);
      if (src && src.permissions) setPermissions(structuredClone(src.permissions));
      else setPermissions(emptyPerms());
    } else {
      setPermissions(emptyPerms());
    }
  };

  const validate = () => {
    const e = {};
    
    // Role name validation
    if (!name.trim()) {
      e.name = 'Role name is required.';
    } else if (name.trim().length > 100) {
      e.name = 'Role name cannot exceed 100 characters.';
    } else if (allRoles.some(r => r.name.toLowerCase() === name.trim().toLowerCase() && r.id !== initialRole?.id)) {
      e.name = 'Role name must be unique.';
    }
    
    // Description validation
    if (description.length > 500) {
      e.description = 'Description cannot exceed 500 characters.';
    }
    
    // Permissions validation
    if (countGranted(permissions) === 0) {
      e.perms = 'At least one permission must be selected.';
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    
    // ── Updated to match backend schema ──
    // Convert permissions object ({ key: {view,create,...} })
    // into array expected by backend: [{ module_name, can_view, can_create, ... }]
    const permissionsArray = Object.entries(permissions).map(([key, p]) => {
      const mod = MODULES.find(m => m.key === key);
      return {
        module_name: mod ? mod.label : key,
        can_view: !!p.view,
        can_create: !!p.create,
        can_edit: !!p.edit,
        can_delete: !!p.delete,
        can_approve: !!p.approve,
        can_export: !!p.export
      };
    });

    onSave({
      role_name: name.trim(),
      description,
      department: "",
      level: 1,
      status,
      is_system_role: false,
      color: "#6366F1",
      icon: "Shield",
      permissions: permissionsArray,
      created_by: "Admin",
      updated_by: "Admin"
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-60" onClick={onClose} />
      <div className="fixed inset-0 z-60 overflow-y-auto flex items-start justify-center p-4 pointer-events-none">
        <div className="w-full max-w-4xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto">

          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <p className="text-sm font-black text-slate-800">
                {mode === 'add' ? 'Add New Role' : `Edit Role — ${initialRole?.name}`}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Basic fields */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Fleet Supervisor"
                  maxLength={100}
                  className={`input ${errors.name ? 'border-red-400 focus:ring-red-100' : ''}`} 
                />
                {errors.name && <p className="text-[11px] text-red-600 font-bold mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="input bg-white cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {mode === 'add' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Clone from Role</label>
                  <select value={cloneFrom} onChange={e => handleCloneChange(e.target.value)} className="input bg-white cursor-pointer">
                    <option value="">— Start blank —</option>
                    {(allRoles && allRoles.length ? allRoles : FALLBACK_ROLES).map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <input 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of this role's responsibilities"
                  maxLength={500}
                  className={`input ${errors.description ? 'border-red-400 focus:ring-red-100' : ''}`} 
                />
                {errors.description && (
                  <p className="text-[11px] text-red-600 font-bold mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-black text-slate-700">Permission Matrix</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{countGranted(permissions)} permissions selected</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPermissions(fullPerms())}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                  Grant All
                </button>
                <button onClick={() => setPermissions(emptyPerms())}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Clear All
                </button>
              </div>
            </div>
            {errors.perms && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <p className="text-[11px] text-red-600 font-bold">{errors.perms}</p>
              </div>
            )}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <EditMatrix permissions={permissions} onChange={setPermissions} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex justify-end gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
              {mode === 'add' ? 'Create Role' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}