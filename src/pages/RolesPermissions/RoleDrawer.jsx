import React, { useState, useEffect } from 'react';
import { Edit2, Copy, Power, Trash2, X, Clock } from 'lucide-react';
import { MODULES, countGranted } from './data';
import { StatusBadge, RoleAvatar, ReadMatrix } from './components';
import api from '../../services/api';

const DRAWER_TABS = ['Overview', 'Permissions', 'Assigned Users', 'Audit Trail'];
const API_URL = "/roles";

export default function RoleDrawer({ role, onClose, onEdit, onDuplicate, onToggleStatus, onDelete }) {
  const [tab, setTab] = useState('Overview');
  const [users, setUsers] = useState([]);
  const [audit, setAudit] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch Data ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!role?.id) return;
    fetchPermissions();
    fetchUsers();
    fetchAuditLogs();
  }, [role]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `${API_URL}/${role.id}/permissions`
      );
      const result = response.data;
      if (result.success) {
        // Convert array of permission rows (module_name label + can_*)
        // into object keyed by module.key so ReadMatrix can render it.
        const permObj = {};
        result.data.forEach(p => {
          const mod = MODULES.find(m => m.label === p.module_name || m.key === p.module_name);
          const key = mod ? mod.key : p.module_name;
          permObj[key] = {
            view: !!p.can_view,
            create: !!p.can_create,
            edit: !!p.can_edit,
            delete: !!p.can_delete,
            approve: !!p.can_approve,
            reject: !!p.can_reject,
            export: !!p.can_export,
            print: !!p.can_print,
          };
        });
        setPermissions(permObj);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get(
        `${API_URL}/${role.id}/users`
      );
      const result = response.data;
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get(
        `${API_URL}/${role.id}/audit-logs`
      );
      const result = response.data;
      if (result.success) {
        setAudit(result.data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-3xl bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 shrink-0">
          <RoleAvatar name={role.name} color={role.color} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-black text-slate-800">{role.name}</p>
              <StatusBadge status={role.status} />
              {role.isSystem && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">System</span>}
              {role.isCustom  && <span className="text-[10px] font-black text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">Custom</span>}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{role.description}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={onEdit} title="Edit"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDuplicate} title="Duplicate"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors border border-slate-200">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button onClick={onToggleStatus} title={role.status === 'Active' ? 'Disable' : 'Enable'}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors border border-slate-200">
              <Power className="w-3.5 h-3.5" />
            </button>
            {!role.isSystem && (
              <button onClick={onDelete} title="Delete"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-200">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 shrink-0">
          {DRAWER_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-black border-b-2 transition-colors whitespace-nowrap ${
                tab === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>{t}</button>
          ))}
        </div>

        {/* Tab body */}
        <div className="flex-1 overflow-y-auto p-6">

          {tab === 'Overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  ['Users Assigned',     role.usersAssigned,                    'bg-indigo-50 text-indigo-600'],
                    ['Modules Accessible', role.modulesLabel || 'N/A',            'bg-blue-50 text-blue-600'   ],
                    ['Permission Rules',   (Array.isArray(permissions) ? permissions.length : Object.keys(permissions || {}).length) || 0,               'bg-green-50 text-green-600' ],
                  ['Role Type',          role.isSystem ? 'System' : 'Custom',   'bg-slate-100 text-slate-600'],
                  ['Status',             role.status,                           'bg-green-50 text-green-600' ],
                ].map(([label, val, color]) => (
                  <div key={label} className={`rounded-xl p-4 ${color}`}>
                    <p className="text-lg font-black">{val}</p>
                    <p className="text-[11px] font-bold opacity-70 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {[
                  ['Role Name',    role.name        ],
                  ['Description',  role.description ],
                  ['Created By',   role.createdBy   ],
                  ['Created Date', role.createdDate  ],
                  ['Updated By',   role.updatedBy   ],
                  ['Last Updated', role.lastUpdated  ],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-xs text-slate-500 font-medium shrink-0">{label}</span>
                    <span className="text-xs font-bold text-slate-800 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Permissions' && (
            <div>
              <p className="text-xs text-slate-400 font-medium mb-4">
                {(Array.isArray(permissions) ? permissions.length : Object.keys(permissions || {}).length) || 0} permissions granted across {MODULES.length} modules.
              </p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <ReadMatrix permissions={permissions} />
              </div>
            </div>
          )}

          {tab === 'Assigned Users' && (
            <div>
              <p className="text-xs text-slate-400 font-medium mb-4">{users.length} users assigned to this role.</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[500px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['Employee','Username','Department','Plant','Status'].map(h => (
                          <th key={h} className="text-left px-4 py-2.5 font-black text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-800">{u.employee_name}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{u.username}</td>
                          <td className="px-4 py-3 text-slate-600">{u.department}</td>
                          <td className="px-4 py-3 text-slate-600">{u.plant}</td>
                          <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'Audit Trail' && (
            <div className="space-y-0">
              {audit.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Clock className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm font-bold">No audit logs found</p>
                  <p className="text-xs mt-1">Changes to this role will appear here</p>
                </div>
              ) : (
                audit.map((entry, i) => {
                  const isLast = i === audit.length - 1;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-slate-200 my-1 min-h-4" />}
                      </div>
                      <div className={`flex-1 min-w-0 ${!isLast ? 'pb-5' : ''}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-black text-slate-800">{entry.action}</p>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">{entry.performed_by}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{entry.description}</p>
                        <p className="text-[10px] font-mono text-slate-300 mt-0.5">
                          {entry.created_at ? new Date(entry.created_at).toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}