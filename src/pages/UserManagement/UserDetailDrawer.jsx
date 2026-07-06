import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Shield, Save, Key, Lock, Unlock, Mail, Trash2,
  LogIn,
} from 'lucide-react';
import {
  DETAIL_TABS, ROLE_CARDS,
  avatarColor, initials,
} from './userManagementData';
import { StatusBadge, RoleBadge } from './UserManagementHelpers';

// ─── User Detail Drawer ───────────────────────────────────────────────────────

export default function UserDetailDrawer({ user, onClose, onStatusChange }) {
  const [tab, setTab] = useState('overview');
  const [role, setRole] = useState(user?.role ?? '');
  const [perms, setPerms] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const API_URL = "http://localhost:5001/api/users";

  // ── Fetch Data ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;
    setTab("overview");
    setRole(user.role);
    setPerms([]);
    setLoginHistory([]);
    setAuditLogs([]);
    fetchPermissions();
    fetchLoginHistory();
    fetchAuditLogs();
  }, [user]);

  const fetchPermissions = async () => {
    try {
      const res = await fetch(
        `${API_URL}/${user.id}/permissions`
      );
      const result = await res.json();
      if (result.success) {
        setPerms(result.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const res = await fetch(
        `${API_URL}/${user.id}/login-history`
      );
      const result = await res.json();
      if (result.success) {
        setLoginHistory(result.data);
      }
    } catch (error) {
      console.error('Error fetching login history:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(
        `${API_URL}/${user.id}/audit-logs`
      );
      const result = await res.json();
      if (result.success) {
        setAuditLogs(result.data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const togglePerm = (moduleName, action) => {
    setPerms(prev => {
      return prev.map(p => {
        if (p.module_name !== moduleName) return p;
        return {
          ...p,
          [action]: !p[action]
        };
      });
    });
  };

  const savePermissions = async () => {
    if (savingPermissions) return;
    setSavingPermissions(true);

    try {
      const res = await fetch(
        `${API_URL}/${user.id}/permissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            updated_by: "Admin",
            permissions: perms
          })
        }
      );
      const result = await res.json();
      if (result.success) {
        alert("Permissions Updated Successfully");
        await fetchPermissions();
      } else {
        alert(result.message || "Failed to update permissions");
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert("Unable to save permissions");
    } finally {
      setSavingPermissions(false);
    }
  };

  const saveRole = async () => {
    try {
      const res = await fetch(
        `${API_URL}/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            employee_name:        user.empName,
            username:             user.username,
            email:                user.email,
            phone:                user.phone,
            department:           user.dept,
            plant:                user.plant,
            role,
            status:               user.status,
            allow_web:            user.allowWeb,
            allow_mobile:         user.allowMobile,
            force_password_reset: user.forceReset,
            updated_by:           "Admin"
          })
        }
      );
      const result = await res.json();
      if (result.success) {
        alert("Role Updated Successfully");
      } else {
        alert(result.message || "Failed to update role");
      }
    } catch (error) {
      console.error('Error saving role:', error);
      alert("Unable to save role");
    }
  };

  const resetPassword = async () => {
    const password = prompt("Enter New Password");
    if (!password) return;
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/${user.id}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            password,
            updated_by: "Admin"
          })
        }
      );
      const result = await res.json();
      if (result.success) {
        alert("Password Reset Successfully");
      } else {
        alert(result.message || "Failed to reset password");
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert("Unable to reset password");
    }
  };

  const deleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(
        `${API_URL}/${user.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            deleted_by: "Admin"
          })
        }
      );
      const result = await res.json();
      if (result.success) {
        alert("User Deleted Successfully");
        onClose();
      } else {
        alert(result.message || "Failed to delete user");
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert("Unable to delete user");
    }
  };

  const toggleStatus = async () => {
    const newStatus = user.status === "Active" ? "Disabled" : "Active";
    try {
      const res = await fetch(
        `${API_URL}/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus,
            updated_by: "Admin"
          })
        }
      );
      const result = await res.json();
      if (result.success) {
        if (onStatusChange) {
          onStatusChange(newStatus);
        }
        alert(`User ${newStatus} Successfully`);
      } else {
        alert(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert("Unable to update status");
    }
  };

  if (!user) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${avatarColor(user.empName)}`}>
              {initials(user.empName)}
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">{user.empName}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">@{user.username} · {user.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={user.status} />
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="px-5 border-b border-slate-100 shrink-0">
          <div className="flex gap-0 overflow-x-auto">
            {DETAIL_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className="space-y-4">

              {/* Employee Details */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-white border-b border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee Details</p>
                </div>
                {[
                  { label: 'Employee ID', value: user.empId },
                  { label: 'Department',  value: user.dept  },
                  { label: 'Phone',       value: user.phone },
                  { label: 'Email',       value: user.email },
                  { label: 'Plant',       value: user.plant }
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">{r.label}</span>
                    <span className="text-xs font-bold text-slate-800 text-right">{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Account Details */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-white border-b border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Details</p>
                </div>
                {[
                  { label: 'Username',     value: `@${user.username}`              },
                  { label: 'Role',         value: user.role,    isRole: true        },
                  { label: 'Status',       value: user.status,  isStatus: true      },
                  { label: 'Last Login',   value: user.lastLogin                    },
                  { label: 'Allow Web',    value: user.allowWeb    ? 'Yes' : 'No'   },
                  { label: 'Allow Mobile', value: user.allowMobile ? 'Yes' : 'No'   },
                  { label: 'Force Reset',  value: user.forceReset  ? 'Yes' : 'No'   },
                  { label: 'Created Date', value: user.createdDate                  },
                  { label: 'Updated Date', value: user.updatedDate                  },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">{r.label}</span>
                    {r.isStatus ? <StatusBadge status={r.value} />
                     : r.isRole ? <RoleBadge role={r.value} />
                     : <span className="text-xs font-bold text-slate-800 text-right">{r.value}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Roles ── */}
          {tab === 'roles' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400 font-medium mb-1">Select one role for this user. Role determines default module access.</p>
              {ROLE_CARDS.map(rc => (
                <button
                  key={rc.role}
                  onClick={() => setRole(rc.role)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    role === rc.role ? rc.color + ' shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${role === rc.role ? 'border-current bg-current' : 'border-slate-300'}`}>
                    {role === rc.role && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{rc.role}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{rc.desc}</p>
                  </div>
                </button>
              ))}
              <button 
                onClick={saveRole}
                className="mt-2 flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Save Role
              </button>
            </div>
          )}

          {/* ── Permissions ── */}
          {tab === 'perms' && (
            <div className="space-y-4">
              <p className="text-[11px] text-slate-400 font-medium">Fine-grained permissions override the role defaults for this user.</p>
              {perms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Shield className="w-10 h-10 text-slate-200" />
                  <p className="text-sm font-bold text-slate-400">No permissions found</p>
                  <p className="text-xs text-slate-300">Click below to initialize default permissions</p>
                  <button
                    onClick={async () => {
                      await fetch(`${API_URL}/${user.id}/init-permissions`, { method: 'POST' });
                      fetchPermissions();
                    }}
                    className="mt-1 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Initialize Permissions
                  </button>
                </div>
              ) : (
                <>
                  {perms.map(permission => (
                    <div key={permission.module_name} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-xs font-black text-slate-700">{permission.module_name}</p>
                      </div>
                      <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-3">
                        {Object.entries(permission).filter(([key]) =>
                          ["can_view", "can_create", "can_edit", "can_delete", "can_approve", "can_export"].includes(key)
                        ).map(([action, val]) => (
                          <label key={action} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!val}
                              onChange={() => togglePerm(permission.module_name, action)}
                              className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-slate-700">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={savePermissions}
                    disabled={savingPermissions}
                    className={`flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-white rounded-lg transition-colors ${savingPermissions ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingPermissions ? 'Saving...' : 'Save Permissions'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Login History ── */}
          {tab === 'history' && (
            <div>
              {loginHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <LogIn className="w-10 h-10 text-slate-200 mb-3" />
                  <p className="text-sm font-bold text-slate-400">No login history</p>
                  <p className="text-xs text-slate-300 mt-1">Login records will appear here</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          {['Login Time', 'Logout Time', 'IP Address', 'Browser', 'Device', 'Status'].map(c => (
                            <th key={c} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loginHistory.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2.5 text-xs font-medium text-slate-700 whitespace-nowrap">{row.login_time}</td>
                            <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{row.logout_time}</td>
                            <td className="px-3 py-2.5 text-xs font-mono text-slate-600 whitespace-nowrap">{row.ip_address}</td>
                            <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{row.browser}</td>
                            <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{row.device}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Audit Trail ── */}
          {tab === 'audit' && (
            <div className="space-y-4">

              {/* Record Info */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Record Information</p>
                </div>
                {[
                  { label: 'Created By',         value: user.createdBy   },
                  { label: 'Created On',          value: user.createdDate },
                  { label: 'Last Modified By',    value: user.updatedBy   },
                  { label: 'Last Modified On',    value: user.updatedDate },
                  { label: 'Last Password Reset', value: 'Not recorded'   },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">{r.label}</span>
                    <span className="text-xs font-bold text-slate-800">{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Account Actions */}
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Account Actions</p>
                {[
                  {
                    icon: Key,
                    label: 'Reset Password',
                    cls: 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
                    onClick: resetPassword,
                  },
                  {
                    icon: user.status === 'Active' ? Lock : Unlock,
                    label: user.status === 'Active' ? 'Disable Login' : 'Enable Login',
                    cls: user.status === 'Active'
                      ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                      : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100',
                    onClick: toggleStatus,
                  },
                  {
                    icon: Unlock,
                    label: 'Unlock Account',
                    cls: 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50',
                    onClick: () => {},
                  },
                  {
                    icon: Mail,
                    label: 'Send Welcome Email',
                    cls: 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50',
                    onClick: () => {},
                  },
                  {
                    icon: Trash2,
                    label: 'Delete User (Soft Delete)',
                    cls: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100',
                    onClick: deleteUser,
                  },
                ].map((a, i) => (
                  <button
                    key={i}
                    onClick={a.onClick}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${a.cls}`}
                  >
                    <a.icon className="w-3.5 h-3.5 shrink-0" />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}