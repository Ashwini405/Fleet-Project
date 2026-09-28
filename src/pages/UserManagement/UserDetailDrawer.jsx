import React, { useState, useEffect } from 'react';
import {
  X, Save, Key, Lock, Unlock, Trash2, LogIn, Pencil,
} from 'lucide-react';
import {
  DETAIL_TABS,
  avatarColor, initials, formatDateTime,
} from './userManagementData';
import { StatusBadge, RoleBadge } from './UserManagementHelpers';
import api from '../../services/api';

const toEditForm = user => ({
  username: user?.username || '',
  email:    user?.email || '',
  phone:    user?.phone || '',
  role:     user?.role || '',
  plant:    user?.plant || '',
});

// ─── User Detail Modal ────────────────────────────────────────────────────────

export default function UserDetailDrawer({ user, onClose, onStatusChange, onUpdated, onResetPassword }) {
  const [tab, setTab] = useState('overview');
  const [loginHistory, setLoginHistory] = useState([]);
  const [roles, setRoles] = useState([]);
  const [plants, setPlants] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(toEditForm(user));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const API_URL = "http://localhost:5001/api/users";

  // ── Fetch Data ─────────────────────────────────────────────────────────────

  useEffect(() => {
    api.get('/roles')
      .then(({ data }) => { if (data.success) setRoles(data.data.filter(r => r.status === 'Active').map(r => r.role_name)); })
      .catch(err => console.error('Error fetching roles:', err));
    api.get('/users/plants')
      .then(({ data }) => { if (data.success) setPlants(data.data.map(p => p.name)); })
      .catch(err => console.error('Error fetching plants:', err));
  }, []);

  useEffect(() => {
    if (!user) return;
    setTab('overview');
    setEditing(false);
    setErrors({});
    setForm(toEditForm(user));
    setLoginHistory([]);
    fetchLoginHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchLoginHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/${user.id}/login-history`);
      const result = await res.json();
      if (result.success) setLoginHistory(result.data);
    } catch (error) {
      console.error('Error fetching login history:', error);
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const saveDetails = async () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    else if (!/^[a-z0-9._-]+$/.test(form.username.trim())) e.username = 'Use lowercase letters, numbers, . _ - only';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email';
    if (!form.role) e.role = 'Role is required';
    if (Object.keys(e).length) { setErrors(e); return; }

    try {
      setSaving(true);
      const { data } = await api.put(`/users/${user.id}`, {
        employee_name:        user.empName,
        username:             form.username.trim(),
        email:                form.email.trim(),
        phone:                form.phone.trim(),
        department:           user.dept,
        plant:                form.plant,
        role:                 form.role,
        status:               user.status,
        allow_web:            user.allowWeb,
        allow_mobile:         user.allowMobile,
        force_password_reset: user.forceReset,
      });
      if (!data.success) {
        alert(data.message || 'Failed to update user');
        return;
      }
      setEditing(false);
      if (onUpdated) onUpdated({
        username: form.username.trim(),
        email:    form.email.trim(),
        phone:    form.phone.trim(),
        role:     form.role,
        plant:    form.plant,
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update user');
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = () => {
    if (onResetPassword) onResetPassword();
  };

  const deleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_URL}/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_by: "Admin" }),
      });
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

  // The parent page performs the status PATCH and refreshes the list
  const changeStatus = newStatus => {
    if (onStatusChange) onStatusChange(newStatus);
  };

  if (!user) return null;

  const plantOptions = form.plant && !plants.includes(form.plant) ? [form.plant, ...plants] : plants;

  const Row = ({ label, children }) => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-[11px] font-bold text-slate-400 shrink-0">{label}</span>
      {children}
    </div>
  );
  const Val = ({ children }) => <span className="text-xs font-bold text-slate-800 text-right break-all">{children || '—'}</span>;

  const editInput = (key, props = {}) => (
    <div>
      <input
        value={form[key]}
        onChange={e => setField(key, props.lower ? e.target.value.toLowerCase().replace(/\s/g, '') : e.target.value)}
        className={`input w-full ${props.mono ? 'font-mono' : ''} ${errors[key] ? 'border-red-300' : ''}`}
        type={props.type || 'text'}
      />
      {errors[key] && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors[key]}</p>}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${avatarColor(user.empName)}`}>
              {initials(user.empName)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.empName}</h3>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">@{user.username} · {user.empId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={user.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
              <X className="w-5 h-5" />
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
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

              {/* Staff Details (from Staff Management) */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-white border-b border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Staff Details</p>
                </div>
                <Row label="Name"><Val>{user.empName}</Val></Row>
                <Row label="Staff ID"><Val>{user.empId}</Val></Row>
                <Row label="Department"><Val>{user.dept}</Val></Row>
                <Row label="Last Login"><Val>{user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}</Val></Row>
                <Row label="Created On"><Val>{formatDateTime(user.createdDate)}</Val></Row>
                <Row label="Updated On"><Val>{formatDateTime(user.updatedDate)}</Val></Row>
              </div>

              {/* Account Details (editable) */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Details</p>
                  {!editing && (
                    <button
                      onClick={() => { setForm(toEditForm(user)); setErrors({}); setEditing(true); }}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="p-4 space-y-3 bg-white">
                    <div>
                      <label className="label">Username <span className="text-red-500">*</span></label>
                      {editInput('username', { mono: true, lower: true })}
                    </div>
                    <div>
                      <label className="label">Email <span className="text-red-500">*</span></label>
                      {editInput('email', { type: 'email' })}
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      {editInput('phone')}
                    </div>
                    <div>
                      <label className="label">Role <span className="text-red-500">*</span></label>
                      <select
                        value={form.role}
                        onChange={e => setField('role', e.target.value)}
                        className={`input w-full bg-white cursor-pointer ${errors.role ? 'border-red-300' : ''}`}
                      >
                        <option value="">Select role...</option>
                        {(form.role && !roles.includes(form.role) ? [form.role, ...roles] : roles)
                          .map(r => <option key={r}>{r}</option>)}
                      </select>
                      {errors.role && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.role}</p>}
                    </div>
                    <div>
                      <label className="label">Assigned Plant</label>
                      <select
                        value={form.plant}
                        onChange={e => setField('plant', e.target.value)}
                        className="input w-full bg-white cursor-pointer"
                      >
                        <option value="">Select plant...</option>
                        {plantOptions.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => { setEditing(false); setErrors({}); }}
                        className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveDetails}
                        disabled={saving}
                        className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-70"
                      >
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Row label="Username"><Val>@{user.username}</Val></Row>
                    <Row label="Email"><Val>{user.email}</Val></Row>
                    <Row label="Phone"><Val>{user.phone}</Val></Row>
                    <Row label="Role"><RoleBadge role={user.role} /></Row>
                    <Row label="Assigned Plant"><Val>{user.plant}</Val></Row>
                    <Row label="Status"><StatusBadge status={user.status} /></Row>
                    <Row label="Web / Mobile Login"><Val>{user.allowWeb ? 'Yes' : 'No'} / {user.allowMobile ? 'Yes' : 'No'}</Val></Row>
                    <Row label="Password Reset Pending"><Val>{user.forceReset ? 'Yes' : 'No'}</Val></Row>
                  </>
                )}
              </div>
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
                          {['Login Time', 'IP Address', 'Browser', 'Status'].map(c => (
                            <th key={c} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loginHistory.map((row, i) => (
                          <tr key={row.id ?? i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2.5 text-xs font-medium text-slate-700 whitespace-nowrap">{formatDateTime(row.login_time)}</td>
                            <td className="px-3 py-2.5 text-xs font-mono text-slate-600 whitespace-nowrap">{(row.ip_address || '—').replace(/^::ffff:/, '')}</td>
                            <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[260px] truncate" title={row.browser}>{row.browser || '—'}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                row.status === 'Success'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`} />{row.status}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

              {/* Record Info */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Record Information</p>
                </div>
                <Row label="Created By"><Val>{user.createdBy}</Val></Row>
                <Row label="Created On"><Val>{formatDateTime(user.createdDate)}</Val></Row>
                <Row label="Last Modified By"><Val>{user.updatedBy}</Val></Row>
                <Row label="Last Modified On"><Val>{formatDateTime(user.updatedDate)}</Val></Row>
              </div>

              {/* Account Actions */}
              <div className="space-y-2">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Account Actions</p>
                {[
                  {
                    icon: Key,
                    label: 'Reset Password',
                    cls: 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
                    onClick: resetPassword,
                  },
                  user.status === 'Locked'
                    ? {
                        icon: Unlock,
                        label: 'Unlock Account',
                        cls: 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100',
                        onClick: () => changeStatus('Active'),
                      }
                    : {
                        icon: user.status === 'Active' ? Lock : Unlock,
                        label: user.status === 'Active' ? 'Disable Login' : 'Enable Login',
                        cls: user.status === 'Active'
                          ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                          : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100',
                        onClick: () => changeStatus(user.status === 'Active' ? 'Disabled' : 'Active'),
                      },
                  {
                    icon: Trash2,
                    label: 'Delete User',
                    cls: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100',
                    onClick: deleteUser,
                  },
                ].map(a => (
                  <button
                    key={a.label}
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
    </div>
  );
}
