import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus, X, ChevronDown, Save, Key, Globe, Smartphone,
} from 'lucide-react';
import {
  EMPTY_FORM,
  avatarColor, initials,
} from './userManagementData';
import { Toggle } from './UserManagementHelpers';
import api from '../../services/api';

// ─── Add User Drawer ──────────────────────────────────────────────────────────

const TYPE_BADGE = {
  Employee:   'bg-blue-50 text-blue-700 border-blue-200',
  Supervisor: 'bg-amber-50 text-amber-700 border-amber-200',
  Driver:     'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function AddUserDrawer({ open, onClose, existingUsers, onSave }) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [empSearch, setEmpSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles]         = useState([]);
  const [plants, setPlants]       = useState([]);
  const [staffType, setStaffType] = useState('All');
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [empOpen, setEmpOpen]     = useState(false);
  const empRef = useRef(null);

  // ── Fetch employees + roles on open ──
  useEffect(() => {
    if (open) { fetchEmployees(); fetchRoles(); fetchPlants(); }
  }, [open]);

  const fetchRoles = async () => {
    try {
      const { data } = await api.get('/roles');
      if (data.success) setRoles(data.data.filter(r => r.status === 'Active').map(r => r.role_name));
    } catch (e) {
      console.error('Error fetching roles:', e);
    }
  };

  const fetchPlants = async () => {
    try {
      const { data } = await api.get('/users/plants');
      if (data.success) setPlants(data.data.map(p => p.name));
    } catch (e) {
      console.error('Error fetching plants:', e);
    }
  };

  // Employees, supervisors and drivers from Staff Management without a login yet
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const { data } = await api.get('/users/available-staff');
      if (data.success) setEmployees(data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const selectedEmp = employees.find(e => e.id === form.empId);

  const availableEmps = employees.filter(e =>
    (staffType === 'All' || e.type === staffType) &&
    (e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
     e.id.toLowerCase().includes(empSearch.toLowerCase()))
  );

  const plantOptions = form.plant && !plants.includes(form.plant) ? [form.plant, ...plants] : plants;

  // Close dropdown on outside click
  useEffect(() => {
    const h = e => { if (empRef.current && !empRef.current.contains(e.target)) setEmpOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleEmpSearch = value => {
    setEmpSearch(value);
    setEmpOpen(true);

    // Typing clears any previous pick; an employee is linked only when chosen from the list
    if (form.empId) {
      setForm(f => ({ ...f, empId: '', email: '', phone: '', plant: '', username: '', role: '' }));
    }
  };

  const handleEmpSelect = emp => {
    setForm(f => ({
      ...f,
      empId:    emp.id,
      email:    emp.email || '',
      phone:    emp.phone || '',
      plant:    emp.plant || '',
      role:     emp.suggested_role && roles.includes(emp.suggested_role) ? emp.suggested_role : f.role,
      username: emp.name.trim().replace(/\s+/g, ".").toLowerCase()
    }));
    setEmpSearch(emp.name.trim());
    setEmpOpen(false);
    setErrors(e => ({ ...e, empId: '', email: '', phone: '' }));
  };

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.empId)           e.empId    = 'Select a staff member';
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
        employee_name: emp?.name.trim() || '',
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0 bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" /> Add User Account
            </h3>
            <p className="text-[12px] font-medium text-gray-500 mt-0.5">Select an employee and create their ERP login</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Select Staff Member ── */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="label !mb-0">Select Staff Member <span className="text-red-500">*</span></label>
              <div className="flex gap-1">
                {['All', 'Employee', 'Supervisor', 'Driver'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setStaffType(t); setEmpOpen(true); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      staffType === t
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t === 'All' ? 'All' : `${t}s`}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative" ref={empRef}>
              <input
                value={empSearch}
                onChange={e => { handleEmpSearch(e.target.value); setEmpOpen(true); }}
                onFocus={() => setEmpOpen(true)}
                placeholder="Search by name or ID (EMP / SUP / DRV)"
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
                      <p className="text-xs text-slate-400 text-center py-4 font-medium">No staff without a login</p>
                    ) : availableEmps.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleEmpSelect(emp)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${avatarColor(emp.name)}`}>
                          {initials(emp.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800">{emp.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {[emp.id, emp.type === 'Employee' ? emp.dept : null, emp.plant].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${TYPE_BADGE[emp.type]}`}>
                          {emp.type}
                        </span>
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
                <p className="text-[11px] text-slate-400 font-medium">
                  {[selectedEmp.type, selectedEmp.type === 'Employee' ? selectedEmp.dept : null, selectedEmp.plant, selectedEmp.phone].filter(Boolean).join(' · ')}
                </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* ── Access Configuration ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Access Configuration</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {plantOptions.map(p => <option key={p}>{p}</option>)}
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
          </div>

          {/* ── Password ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-70"
          >
            {saving
              ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              : <><Save className="w-4 h-4" /> Create User</>
            }
          </button>
        </div>

      </div>
      </div>
    </>
  );
}
