import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus, X, ChevronDown, Save, Key, Globe, Smartphone,
} from 'lucide-react';
import {
  ROLES, PLANTS, EMPTY_FORM,
  avatarColor, initials,
} from './userManagementData';
import { Toggle } from './UserManagementHelpers';
import api from '../../services/api';

// ─── Add User Drawer ──────────────────────────────────────────────────────────

export default function AddUserDrawer({ open, onClose, existingUsers, onSave }) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [empSearch, setEmpSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles]         = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [empOpen, setEmpOpen]     = useState(false);
  const empRef = useRef(null);

  // ── Fetch employees + roles on open ──
  useEffect(() => {
    if (open) { fetchEmployees(); fetchRoles(); }
  }, [open]);

  const fetchRoles = async () => {
    try {
      const { data } = await api.get('/roles');
      if (data.success) setRoles(data.data.filter(r => r.status === 'Active').map(r => r.role_name));
    } catch (e) {
      console.error('Error fetching roles:', e);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const { data } = await api.get('/employees/dropdown');
      if (data.success) setEmployees(data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const selectedEmp = employees.find(e => e.id === form.empId);

  const usedEmpIds    = existingUsers.map(u => u.empId);
  const availableEmps = employees.filter(e =>
    !usedEmpIds.includes(e.id) &&
    (e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
     e.id.toLowerCase().includes(empSearch.toLowerCase()))
  );

  // Close dropdown on outside click
  useEffect(() => {
    const h = e => { if (empRef.current && !empRef.current.contains(e.target)) setEmpOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleEmpSearch = value => {
    setEmpSearch(value);
    setEmpOpen(!!value);

    // Try to find employee by ID or name
    const emp = employees.find(e =>
      e.id.toLowerCase() === value.toLowerCase() || 
      e.name.toLowerCase().includes(value.toLowerCase())
    );

    if (emp) {
      setForm(f => ({
        ...f,
        empId: emp.id,
        email: emp.email,
        phone: emp.phone,
        plant: emp.plant,
        username: emp.name.replace(/\s+/g, ".").toLowerCase()
      }));
      setErrors(e => ({ ...e, empId: '', email: '', phone: '' }));
    } else {
      setForm(f => ({ ...f, empId: '', email: '', phone: '', plant: '', username: '' }));
    }
  };

  const handleEmpSelect = emp => {
    setForm(f => ({
      ...f,
      empId:    emp.id,
      email:    emp.email,
      phone:    emp.phone,
      plant:    emp.plant,
      username: emp.name.replace(/\s+/g, ".").toLowerCase()
    }));
    setEmpSearch(emp.name);
    setEmpOpen(false);
    setErrors(e => ({ ...e, empId: '', email: '', phone: '' }));
  };

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.empId)           e.empId    = 'Select an employee';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (existingUsers.some(u => u.username === form.username.trim())) e.username = 'Username already taken';
    if (!form.email.trim())    e.email    = 'Email is required';
    else if (existingUsers.some(u => u.email === form.email.trim())) e.email = 'Email already registered';
    if (!form.role)            e.role     = 'Role is required';
    if (!form.plant)           e.plant    = 'Assign a plant';
    if (!form.password)        e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  // ── STEP 2: Updated handleSave function ──
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    try {
      setSaving(true);
      const emp = employees.find(x => x.id === form.empId);

      const { data: result } = await api.post('/users', {
        employee_id: form.empId,
        employee_name: emp?.name || '',
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone,
        department: emp?.dept || '',
        plant: form.plant,
        role: form.role,
        password: form.password,
        status: form.status,
        allow_web: form.allowWeb,
        allow_mobile: form.allowMobile,
        force_password_reset: form.forceReset,
      });

      if (!result.success) {
        alert(result.message || 'Failed to create user');
        setSaving(false);
        return;
      }

      alert("User created successfully.");

      // ── STEP 6: Reset form and close ──
      setForm(EMPTY_FORM);
      setErrors({});
      setEmpSearch("");
      setSaving(false);
      
      // Refresh employee list
      await fetchEmployees();
      
      if (onSave) {
        onSave();
      }
      
      onClose();

    } catch (error) {
      console.error('Error creating user:', error);
      alert("Unable to create user. Please try again.");
      setSaving(false);
    }
  };

  // ── STEP 1: Updated handleClose function ──
  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEmpSearch("");
    onClose();
  };

  if (!open) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={handleClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Add User Account</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Link an employee to an ERP login</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ── Select Employee ── */}
          <div>
            <label className="label">Select Employee <span className="text-red-500">*</span></label>
            <div className="relative" ref={empRef}>
              <input
                value={empSearch}
                onChange={e => { handleEmpSearch(e.target.value); setEmpOpen(true); }}
                onFocus={() => setEmpOpen(true)}
                placeholder="Search Employee Name or Employee ID"
                className={`input w-full ${errors.empId ? 'border-red-300' : ''}`}
              />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              {loadingEmployees && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              )}

              {empOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {availableEmps.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4 font-medium">No available employees</p>
                    ) : availableEmps.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => handleEmpSelect(emp)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${avatarColor(emp.name)}`}>
                          {initials(emp.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{emp.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{emp.id} · {emp.dept} · {emp.plant}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.empId && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.empId}</p>}
          </div>

          {/* Employee info preview */}
          {selectedEmp && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${avatarColor(selectedEmp.name)}`}>
                {initials(selectedEmp.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">{selectedEmp.name}</p>
                <p className="text-[11px] text-slate-400 font-medium">{selectedEmp.dept} · {selectedEmp.plant} · {selectedEmp.phone}</p>
              </div>
              <span className="ml-auto text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full shrink-0">
                {selectedEmp.id}
              </span>
            </div>
          )}

          {/* ── Login Credentials ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Login Credentials</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div>
              <label className="label">Username <span className="text-red-500">*</span></label>
              <input
                value={form.username}
                onChange={e => set('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                className={`input font-mono ${errors.username ? 'border-red-300' : ''}`}
                placeholder="e.g. ashwini.kumar"
              />
              {errors.username && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.username}</p>}
            </div>
            <div>
              <label className="label">Official Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={`input ${errors.email ? 'border-red-300' : ''}`}
                placeholder="email@company.com"
              />
              {errors.email && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.email}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="input"
                placeholder="+91-98765-43210"
              />
            </div>
          </div>

          {/* ── Access Configuration ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Access Configuration</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div>
              <label className="label">Role <span className="text-red-500">*</span></label>
              <select
                value={form.role}
                onChange={e => set('role', e.target.value)}
                className={`input bg-white cursor-pointer ${errors.role ? 'border-red-300' : ''}`}
              >
                <option value="">Select role...</option>
                {roles.map(r => <option key={r}>{r}</option>)}
              </select>
              {errors.role && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.role}</p>}
            </div>
            <div>
              <label className="label">Assigned Plant <span className="text-red-500">*</span></label>
              <select
                value={form.plant}
                onChange={e => set('plant', e.target.value)}
                className={`input bg-white cursor-pointer ${errors.plant ? 'border-red-300' : ''}`}
              >
                <option value="">Select plant...</option>
                {PLANTS.map(p => <option key={p}>{p}</option>)}
              </select>
              {errors.plant && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.plant}</p>}
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="input bg-white cursor-pointer"
              >
                <option>Active</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>

          {/* ── Password ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div>
              <label className="label">Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                className={`input ${errors.password ? 'border-red-300' : ''}`}
                placeholder="Min. 8 characters"
              />
              {errors.password && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.password}</p>}
            </div>
            <div>
              <label className="label">Confirm Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                className={`input ${errors.confirmPassword ? 'border-red-300' : ''}`}
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* ── Login Options ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Login Options</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            {[
              { key: 'forceReset',  label: 'Force Password Change on First Login', icon: Key        },
              { key: 'allowWeb',    label: 'Allow Web Login',                       icon: Globe      },
              { key: 'allowMobile', label: 'Allow Mobile Login',                    icon: Smartphone },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">{label}</span>
                </div>
                <Toggle checked={form[key]} onChange={v => set(key, v)} />
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 shrink-0 flex items-center gap-2 bg-slate-50">
          <button
            onClick={handleClose}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
          >
            {saving
              ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              : <><Save className="w-3.5 h-3.5" /> Create User</>
            }
          </button>
        </div>

      </div>
    </>
  );
}