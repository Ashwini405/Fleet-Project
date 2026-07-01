import React, { useState, useRef, useEffect } from 'react';
import {
  Users, UserPlus, Download, Search, Eye, Shield, MapPin,
  Building2, Clock, CheckCircle2, XCircle, AlertTriangle,
  Key, Lock, Unlock, Mail, Trash2, RefreshCw, X,
  ChevronDown, Save, Phone, Activity, Monitor, Smartphone,
  MoreVertical, LogIn, LogOut, Globe, Settings, Filter,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = ['Administrator', 'Finance Manager', 'Operations Manager', 'Maintenance Supervisor', 'HR Manager', 'Viewer'];
const PLANTS = ['Hyderabad Plant', 'Bengaluru Plant', 'Chennai Plant', 'Mumbai Plant', 'Delhi Plant', 'Pune Plant', 'Kolkata Plant', 'Ahmedabad Plant'];
const DEPARTMENTS = ['Finance', 'Operations', 'Maintenance', 'HR', 'Administration'];

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700', 'bg-green-100 text-green-700',
  'bg-blue-100 text-blue-700',    'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',    'bg-orange-100 text-orange-700',
];

const avatarColor = name =>
  AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

const initials = name =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// ─── Mock Employees (from Staff Management — read-only reference) ─────────────

const MOCK_EMPLOYEES = [
  { id: 'EMP001', name: 'Ashwini Kumar',   dept: 'Finance',      phone: '+91-98765-43210', email: 'ashwini@fleetlogistics.in',  plant: 'Hyderabad Plant'  },
  { id: 'EMP002', name: 'Sriman Reddy',    dept: 'Operations',   phone: '+91-97654-32109', email: 'sriman@fleetlogistics.in',   plant: 'Bengaluru Plant'  },
  { id: 'EMP003', name: 'Priya Sharma',    dept: 'HR',           phone: '+91-96543-21098', email: 'priya@fleetlogistics.in',    plant: 'Chennai Plant'    },
  { id: 'EMP004', name: 'Rajesh Gupta',    dept: 'Maintenance',  phone: '+91-95432-10987', email: 'rajesh@fleetlogistics.in',   plant: 'Mumbai Plant'     },
  { id: 'EMP005', name: 'Kavitha Nair',    dept: 'Finance',      phone: '+91-94321-09876', email: 'kavitha@fleetlogistics.in',  plant: 'Hyderabad Plant'  },
  { id: 'EMP006', name: 'Mohammed Aslam',  dept: 'Operations',   phone: '+91-93210-98765', email: 'aslam@fleetlogistics.in',    plant: 'Delhi Plant'      },
  { id: 'EMP007', name: 'Deepa Menon',     dept: 'HR',           phone: '+91-92109-87654', email: 'deepa@fleetlogistics.in',    plant: 'Pune Plant'       },
  { id: 'EMP008', name: 'Anand Krishnan',  dept: 'Maintenance',  phone: '+91-91098-76543', email: 'anand@fleetlogistics.in',    plant: 'Bengaluru Plant'  },
  { id: 'EMP009', name: 'Lakshmi Rao',     dept: 'Finance',      phone: '+91-90987-65432', email: 'lakshmi@fleetlogistics.in',  plant: 'Chennai Plant'    },
  { id: 'EMP010', name: 'Venkat Subramani',dept: 'Operations',   phone: '+91-89876-54321', email: 'venkat@fleetlogistics.in',   plant: 'Pune Plant'       },
];

// ─── Mock Users ───────────────────────────────────────────────────────────────

const INITIAL_USERS = [
  {
    id: 'USR001', empId: 'EMP001', empName: 'Ashwini Kumar',
    username: 'ashwini', email: 'ashwini@fleetlogistics.in',
    phone: '+91-98765-43210', dept: 'Finance', role: 'Finance Manager',
    plant: 'Hyderabad Plant', status: 'Active', lastLogin: 'Today 09:15 AM',
    createdDate: '01-Jan-2026', updatedDate: '15-Jun-2026',
    createdBy: 'Admin', updatedBy: 'Admin',
    allowMobile: true, allowWeb: true, forceReset: false,
    loginHistory: [
      { loginTime: '01-Jul-2026 09:15 AM', logoutTime: '01-Jul-2026 06:30 PM', ip: '192.168.1.10', browser: 'Chrome 125', device: 'Desktop', status: 'Success' },
      { loginTime: '30-Jun-2026 08:55 AM', logoutTime: '30-Jun-2026 05:45 PM', ip: '192.168.1.10', browser: 'Chrome 125', device: 'Desktop', status: 'Success' },
      { loginTime: '29-Jun-2026 09:02 AM', logoutTime: '29-Jun-2026 06:10 PM', ip: '192.168.1.12', browser: 'Chrome 125', device: 'Desktop', status: 'Success' },
      { loginTime: '28-Jun-2026 10:30 AM', logoutTime: '28-Jun-2026 04:00 PM', ip: '10.0.0.5',     browser: 'Edge 124',   device: 'Laptop',  status: 'Success' },
    ],
  },
  {
    id: 'USR002', empId: 'EMP002', empName: 'Sriman Reddy',
    username: 'sriman', email: 'sriman@fleetlogistics.in',
    phone: '+91-97654-32109', dept: 'Operations', role: 'Operations Manager',
    plant: 'Bengaluru Plant', status: 'Active', lastLogin: 'Today 08:30 AM',
    createdDate: '01-Jan-2026', updatedDate: '20-Jun-2026',
    createdBy: 'Admin', updatedBy: 'Admin',
    allowMobile: true, allowWeb: true, forceReset: false,
    loginHistory: [
      { loginTime: '01-Jul-2026 08:30 AM', logoutTime: '01-Jul-2026 07:00 PM', ip: '10.0.0.5',    browser: 'Firefox 127', device: 'Desktop', status: 'Success' },
      { loginTime: '30-Jun-2026 09:00 AM', logoutTime: '30-Jun-2026 06:00 PM', ip: '10.0.0.5',    browser: 'Firefox 127', device: 'Desktop', status: 'Success' },
    ],
  },
  {
    id: 'USR003', empId: 'EMP003', empName: 'Priya Sharma',
    username: 'priya.sharma', email: 'priya@fleetlogistics.in',
    phone: '+91-96543-21098', dept: 'HR', role: 'HR Manager',
    plant: 'Chennai Plant', status: 'Active', lastLogin: '30-Jun-2026 02:15 PM',
    createdDate: '15-Jan-2026', updatedDate: '10-Jun-2026',
    createdBy: 'Admin', updatedBy: 'Ashwini',
    allowMobile: false, allowWeb: true, forceReset: false,
    loginHistory: [
      { loginTime: '30-Jun-2026 02:15 PM', logoutTime: '30-Jun-2026 05:00 PM', ip: '172.16.0.3', browser: 'Safari 17', device: 'MacBook', status: 'Success' },
    ],
  },
  {
    id: 'USR004', empId: 'EMP004', empName: 'Rajesh Gupta',
    username: 'rajesh.g', email: 'rajesh@fleetlogistics.in',
    phone: '+91-95432-10987', dept: 'Maintenance', role: 'Maintenance Supervisor',
    plant: 'Mumbai Plant', status: 'Active', lastLogin: '28-Jun-2026 11:30 AM',
    createdDate: '01-Feb-2026', updatedDate: '01-Jun-2026',
    createdBy: 'Admin', updatedBy: 'Admin',
    allowMobile: true, allowWeb: true, forceReset: false,
    loginHistory: [],
  },
  {
    id: 'USR005', empId: 'EMP005', empName: 'Kavitha Nair',
    username: 'kavitha', email: 'kavitha@fleetlogistics.in',
    phone: '+91-94321-09876', dept: 'Finance', role: 'Finance Manager',
    plant: 'Hyderabad Plant', status: 'Active', lastLogin: 'Today 10:00 AM',
    createdDate: '01-Feb-2026', updatedDate: '25-Jun-2026',
    createdBy: 'Admin', updatedBy: 'Admin',
    allowMobile: false, allowWeb: true, forceReset: true,
    loginHistory: [],
  },
  {
    id: 'USR006', empId: 'EMP006', empName: 'Mohammed Aslam',
    username: 'maslam', email: 'aslam@fleetlogistics.in',
    phone: '+91-93210-98765', dept: 'Operations', role: 'Operations Manager',
    plant: 'Delhi Plant', status: 'Disabled', lastLogin: '15-Jun-2026 09:00 AM',
    createdDate: '01-Mar-2026', updatedDate: '15-Jun-2026',
    createdBy: 'Admin', updatedBy: 'Admin',
    allowMobile: false, allowWeb: false, forceReset: false,
    loginHistory: [],
  },
  {
    id: 'USR007', empId: 'EMP007', empName: 'Deepa Menon',
    username: 'deepa.m', email: 'deepa@fleetlogistics.in',
    phone: '+91-92109-87654', dept: 'HR', role: 'Viewer',
    plant: 'Pune Plant', status: 'Disabled', lastLogin: '10-Jun-2026 04:00 PM',
    createdDate: '01-Apr-2026', updatedDate: '10-Jun-2026',
    createdBy: 'Admin', updatedBy: 'Sriman',
    allowMobile: false, allowWeb: true, forceReset: false,
    loginHistory: [],
  },
  {
    id: 'USR008', empId: 'EMP008', empName: 'Anand Krishnan',
    username: 'anand.k', email: 'anand@fleetlogistics.in',
    phone: '+91-91098-76543', dept: 'Maintenance', role: 'Maintenance Supervisor',
    plant: 'Bengaluru Plant', status: 'Active', lastLogin: 'Yesterday 05:30 PM',
    createdDate: '01-Apr-2026', updatedDate: '20-Jun-2026',
    createdBy: 'Admin', updatedBy: 'Admin',
    allowMobile: true, allowWeb: true, forceReset: false,
    loginHistory: [],
  },
];

// ─── Permissions template ─────────────────────────────────────────────────────

const defaultPermissions = () => ({
  'Vehicle Master':  { View: true,  Create: false, Edit: false, Delete: false },
  'Trip Master':     { View: true,  Create: false, Edit: false, Delete: false },
  'Fuel':            { View: true,  Create: false, Approve: false },
  'Maintenance':     { View: true,  Create: false, Approve: false },
  'Tyres':           { View: true,  Edit: false },
  'Finance':         { View: true,  Approve: false },
});

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionLabel({ title, sub }) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h2>
      {sub && <p className="text-[11px] text-slate-300 font-medium mt-0.5">{sub}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    Active:   { cls: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500'  },
    Disabled: { cls: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-500'    },
    Locked:   { cls: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500'  },
  }[status] ?? { cls: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function RoleBadge({ role }) {
  const colors = {
    'Administrator':         'bg-purple-50 text-purple-700 border-purple-200',
    'Finance Manager':       'bg-blue-50 text-blue-700 border-blue-200',
    'Operations Manager':    'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Maintenance Supervisor':'bg-amber-50 text-amber-700 border-amber-200',
    'HR Manager':            'bg-pink-50 text-pink-700 border-pink-200',
    'Viewer':                'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${colors[role] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {role}
    </span>
  );
}

function KpiCard({ label, value, icon: Icon, iconBg, valueColor = 'text-slate-800', sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 leading-tight">{label}</p>
        <p className={`text-2xl font-black leading-tight ${valueColor}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Action Menu ──────────────────────────────────────────────────────────────

function ActionMenu({ user, onView, onToggleStatus, onDelete, onResetPwd }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const actions = [
    { icon: Eye,       label: 'View Details',    onClick: () => { onView(); setOpen(false); } },
    { icon: Key,       label: 'Reset Password',  onClick: () => { onResetPwd(); setOpen(false); } },
    user.status === 'Active'
      ? { icon: Lock,   label: 'Disable Login',  onClick: () => { onToggleStatus('Disabled'); setOpen(false); } }
      : { icon: Unlock, label: 'Enable Login',   onClick: () => { onToggleStatus('Active');   setOpen(false); } },
    { icon: Mail,      label: 'Send Welcome Email', onClick: () => setOpen(false) },
    { icon: Trash2,    label: 'Delete User',     onClick: () => { onDelete(); setOpen(false); }, danger: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1 overflow-hidden">
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition-colors text-left ${
                a.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <a.icon className="w-3.5 h-3.5 shrink-0" />
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add User Drawer ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
  empId: '', username: '', email: '', phone: '',
  role: '', plant: '', password: '', confirmPassword: '',
  status: 'Active', forceReset: true, allowMobile: false, allowWeb: true,
};

function AddUserDrawer({ open, onClose, existingUsers, onSave }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [empSearch, setEmpSearch] = useState('');
  const [empOpen, setEmpOpen]   = useState(false);
  const empRef = useRef(null);

  const usedEmpIds = existingUsers.map(u => u.empId);
  const availableEmps = MOCK_EMPLOYEES.filter(e =>
    !usedEmpIds.includes(e.id) &&
    (e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
     e.id.toLowerCase().includes(empSearch.toLowerCase()))
  );

  const selectedEmp = MOCK_EMPLOYEES.find(e => e.id === form.empId);

  useEffect(() => {
    const h = e => { if (empRef.current && !empRef.current.contains(e.target)) setEmpOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleEmpSelect = emp => {
    setForm(f => ({
      ...f, empId: emp.id,
      email: emp.email, phone: emp.phone,
      plant: emp.plant,
      username: emp.name.split(' ')[0].toLowerCase(),
    }));
    setEmpSearch('');
    setEmpOpen(false);
    setErrors(e => ({ ...e, empId: '', email: '', phone: '' }));
  };

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

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

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    setTimeout(() => {
      const emp = MOCK_EMPLOYEES.find(x => x.id === form.empId);
      onSave({
        id: `USR${String(existingUsers.length + 1).padStart(3, '0')}`,
        empId: form.empId, empName: emp.name,
        username: form.username.trim(), email: form.email.trim(),
        phone: form.phone, dept: emp.dept, role: form.role,
        plant: form.plant, status: form.status,
        lastLogin: 'Never', createdDate: new Date().toLocaleDateString('en-IN'),
        updatedDate: new Date().toLocaleDateString('en-IN'),
        createdBy: 'Admin', updatedBy: 'Admin',
        allowMobile: form.allowMobile, allowWeb: form.allowWeb,
        forceReset: form.forceReset, loginHistory: [],
      });
      setForm(EMPTY_FORM);
      setErrors({});
      setSaving(false);
      onClose();
    }, 900);
  };

  const handleClose = () => { setForm(EMPTY_FORM); setErrors({}); onClose(); };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={handleClose} />
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

          {/* Select Employee */}
          <div>
            <label className="label">Select Employee <span className="text-red-500">*</span></label>
            <div className="relative" ref={empRef}>
              <button
                type="button"
                onClick={() => setEmpOpen(v => !v)}
                className={`input flex items-center justify-between w-full text-left ${errors.empId ? 'border-red-300' : ''}`}
              >
                {selectedEmp ? (
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${avatarColor(selectedEmp.name)}`}>
                      {initials(selectedEmp.name)}
                    </span>
                    <span className="font-semibold text-slate-800">{selectedEmp.name}</span>
                    <span className="text-slate-400 text-xs">· {selectedEmp.id}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 font-normal">Search and select employee...</span>
                )}
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
              {empOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
                  <div className="p-2 border-b border-slate-100">
                    <input
                      autoFocus
                      value={empSearch}
                      onChange={e => setEmpSearch(e.target.value)}
                      placeholder="Search by name or ID..."
                      className="input text-xs"
                    />
                  </div>
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

          {/* Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Login Credentials</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div>
              <label className="label">Username <span className="text-red-500">*</span></label>
              <input value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/\s/g,''))}
                className={`input font-mono ${errors.username ? 'border-red-300' : ''}`} placeholder="e.g. ashwini.kumar" />
              {errors.username && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.username}</p>}
            </div>
            <div>
              <label className="label">Official Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className={`input ${errors.email ? 'border-red-300' : ''}`} placeholder="email@company.com" />
              {errors.email && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.email}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input" placeholder="+91-98765-43210" />
            </div>
          </div>

          {/* Role & Plant */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Access Configuration</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div>
              <label className="label">Role <span className="text-red-500">*</span></label>
              <select value={form.role} onChange={e => set('role', e.target.value)}
                className={`input bg-white cursor-pointer ${errors.role ? 'border-red-300' : ''}`}>
                <option value="">Select role...</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              {errors.role && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.role}</p>}
            </div>
            <div>
              <label className="label">Assigned Plant <span className="text-red-500">*</span></label>
              <select value={form.plant} onChange={e => set('plant', e.target.value)}
                className={`input bg-white cursor-pointer ${errors.plant ? 'border-red-300' : ''}`}>
                <option value="">Select plant...</option>
                {PLANTS.map(p => <option key={p}>{p}</option>)}
              </select>
              {errors.plant && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.plant}</p>}
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input bg-white cursor-pointer">
                <option>Active</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div>
              <label className="label">Password <span className="text-red-500">*</span></label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                className={`input ${errors.password ? 'border-red-300' : ''}`} placeholder="Min. 8 characters" />
              {errors.password && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.password}</p>}
            </div>
            <div>
              <label className="label">Confirm Password <span className="text-red-500">*</span></label>
              <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                className={`input ${errors.confirmPassword ? 'border-red-300' : ''}`} placeholder="Re-enter password" />
              {errors.confirmPassword && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Access toggles */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Login Options</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            {[
              { key: 'forceReset',   label: 'Force Password Change on First Login', icon: Key       },
              { key: 'allowWeb',     label: 'Allow Web Login',                       icon: Globe     },
              { key: 'allowMobile',  label: 'Allow Mobile Login',                    icon: Smartphone },
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
          <button onClick={handleClose} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70">
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

// ─── User Detail Drawer ───────────────────────────────────────────────────────

const DETAIL_TABS = [
  { id: 'overview',  label: 'Overview'      },
  { id: 'roles',     label: 'Roles'         },
  { id: 'perms',     label: 'Permissions'   },
  { id: 'history',   label: 'Login History' },
  { id: 'audit',     label: 'Audit Trail'   },
];

const ROLE_CARDS = [
  { role: 'Administrator',         desc: 'Full system access. Manage all modules.',          color: 'border-purple-200 bg-purple-50 text-purple-700' },
  { role: 'Finance Manager',       desc: 'Access to Finance, Vendors and Payments.',         color: 'border-blue-200 bg-blue-50 text-blue-700'   },
  { role: 'Operations Manager',    desc: 'Access to Trips, Vehicles and Fuel.',              color: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
  { role: 'Maintenance Supervisor',desc: 'Service, Tyres, Parts and Inspection access.',     color: 'border-amber-200 bg-amber-50 text-amber-700' },
  { role: 'HR Manager',            desc: 'Staff Management and Document Vault access.',      color: 'border-pink-200 bg-pink-50 text-pink-700'   },
  { role: 'Viewer',                desc: 'Read-only access to all non-sensitive modules.',   color: 'border-slate-200 bg-slate-50 text-slate-600' },
];

function UserDetailDrawer({ user, onClose, onStatusChange }) {
  const [tab, setTab]     = useState('overview');
  const [perms, setPerms] = useState(defaultPermissions());
  const [role, setRole]   = useState(user?.role ?? '');

  useEffect(() => { if (user) { setTab('overview'); setRole(user.role); } }, [user]);

  if (!user) return null;

  const togglePerm = (module, action) =>
    setPerms(p => ({ ...p, [module]: { ...p[module], [action]: !p[module][action] } }));

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
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

        {/* Tab bar */}
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

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Overview ─── */}
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-white border-b border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee Details</p>
                </div>
                {[
                  { label: 'Employee ID', value: user.empId },
                  { label: 'Department',  value: user.dept  },
                  { label: 'Phone',       value: user.phone },
                  { label: 'Email',       value: user.email },
                  { label: 'Plant',       value: user.plant },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">{r.label}</span>
                    <span className="text-xs font-bold text-slate-800 text-right">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-white border-b border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Details</p>
                </div>
                {[
                  { label: 'Username',      value: `@${user.username}` },
                  { label: 'Role',          value: user.role, isRole: true },
                  { label: 'Status',        value: user.status, isStatus: true },
                  { label: 'Last Login',    value: user.lastLogin },
                  { label: 'Allow Web',     value: user.allowWeb    ? 'Yes' : 'No' },
                  { label: 'Allow Mobile',  value: user.allowMobile ? 'Yes' : 'No' },
                  { label: 'Force Reset',   value: user.forceReset  ? 'Yes' : 'No' },
                  { label: 'Created Date',  value: user.createdDate },
                  { label: 'Updated Date',  value: user.updatedDate },
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

          {/* ── Roles ─── */}
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
              <button className="mt-2 flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                <Save className="w-3.5 h-3.5" /> Save Role
              </button>
            </div>
          )}

          {/* ── Permissions ─── */}
          {tab === 'perms' && (
            <div className="space-y-4">
              <p className="text-[11px] text-slate-400 font-medium">Fine-grained permissions override the role defaults for this user.</p>
              {Object.entries(perms).map(([mod, actions]) => (
                <div key={mod} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs font-black text-slate-700">{mod}</p>
                  </div>
                  <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-3">
                    {Object.entries(actions).map(([action, checked]) => (
                      <label key={action} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePerm(mod, action)}
                          className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-700">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                <Save className="w-3.5 h-3.5" /> Save Permissions
              </button>
            </div>
          )}

          {/* ── Login History ─── */}
          {tab === 'history' && (
            <div>
              {user.loginHistory.length === 0 ? (
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
                        {user.loginHistory.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2.5 text-xs font-medium text-slate-700 whitespace-nowrap">{row.loginTime}</td>
                            <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{row.logoutTime}</td>
                            <td className="px-3 py-2.5 text-xs font-mono text-slate-600 whitespace-nowrap">{row.ip}</td>
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

          {/* ── Audit Trail ─── */}
          {tab === 'audit' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Record Information</p>
                </div>
                {[
                  { label: 'Created By',           value: user.createdBy   },
                  { label: 'Created On',            value: user.createdDate },
                  { label: 'Last Modified By',      value: user.updatedBy   },
                  { label: 'Last Modified On',      value: user.updatedDate },
                  { label: 'Last Password Reset',   value: 'Not recorded'   },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">{r.label}</span>
                    <span className="text-xs font-bold text-slate-800">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Account Actions</p>
                {[
                  { icon: Key,    label: 'Reset Password',   cls: 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
                  { icon: user.status === 'Active' ? Lock : Unlock,
                    label: user.status === 'Active' ? 'Disable Login' : 'Enable Login',
                    cls: user.status === 'Active'
                      ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                      : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100',
                    onClick: () => { onStatusChange(user.status === 'Active' ? 'Disabled' : 'Active'); },
                  },
                  { icon: Unlock,   label: 'Unlock Account',   cls: 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50' },
                  { icon: Mail,     label: 'Send Welcome Email',cls: 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50' },
                  { icon: Trash2,   label: 'Delete User (Soft Delete)', cls: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' },
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const [users, setUsers]           = useState(INITIAL_USERS);
  const [search, setSearch]         = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlant, setFilterPlant]   = useState('');
  const [filterDept, setFilterDept]     = useState('');
  const [addOpen, setAddOpen]           = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saved, setSaved]               = useState(false);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.empName.toLowerCase().includes(q)
      || u.username.toLowerCase().includes(q)
      || u.email.toLowerCase().includes(q)
      || u.empId.toLowerCase().includes(q);
    const matchRole   = !filterRole   || u.role   === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    const matchPlant  = !filterPlant  || u.plant  === filterPlant;
    const matchDept   = !filterDept   || u.dept   === filterDept;
    return matchSearch && matchRole && matchStatus && matchPlant && matchDept;
  });

  const kpis = {
    total:    users.length,
    active:   users.filter(u => u.status === 'Active').length,
    disabled: users.filter(u => u.status === 'Disabled').length,
    loggedIn: users.filter(u => u.lastLogin.startsWith('Today')).length,
    admins:   users.filter(u => u.role === 'Administrator').length,
    pendingReset: users.filter(u => u.forceReset).length,
  };

  const handleAddUser = user => {
    setUsers(prev => [...prev, user]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    if (selectedUser?.id === userId) setSelectedUser(prev => ({ ...prev, status: newStatus }));
  };

  const handleDelete = userId => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (selectedUser?.id === userId) setSelectedUser(null);
  };

  const handleExport = () => {
    const rows = [
      ['ID', 'Employee', 'Username', 'Email', 'Department', 'Role', 'Plant', 'Status', 'Last Login'],
      ...users.map(u => [u.id, u.empName, u.username, u.email, u.dept, u.role, u.plant, u.status, u.lastLogin]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => { setFilterRole(''); setFilterStatus(''); setFilterPlant(''); setFilterDept(''); setSearch(''); };
  const hasFilters = search || filterRole || filterStatus || filterPlant || filterDept;

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-12 space-y-6">

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      <div className={`fixed top-6 right-6 z-[60] flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-2xl px-4 py-3.5 transition-all duration-300 ${
        saved ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}>
        <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800 leading-tight">User Created</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">New user account has been added successfully.</p>
        </div>
      </div>

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">User Management</h1>
            <p className="text-xs text-slate-400 font-medium">Create, manage and control ERP user login accounts and permissions.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export Users
          </button>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <UserPlus className="w-3.5 h-3.5" /> Add User
          </button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div>
        <SectionLabel title="System Overview" sub="User accounts across all plants and roles" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard label="Total Users"           value={kpis.total}       icon={Users}        iconBg="bg-blue-50 text-blue-600"     valueColor="text-blue-700"   />
          <KpiCard label="Active Users"          value={kpis.active}      icon={CheckCircle2} iconBg="bg-green-50 text-green-600"   valueColor="text-green-700"  />
          <KpiCard label="Disabled Users"        value={kpis.disabled}    icon={XCircle}      iconBg="bg-red-50 text-red-500"       valueColor="text-red-600"    />
          <KpiCard label="Logged In Today"       value={kpis.loggedIn}    icon={LogIn}        iconBg="bg-indigo-50 text-indigo-600" valueColor="text-indigo-700" />
          <KpiCard label="Administrators"        value={kpis.admins}      icon={Shield}       iconBg="bg-purple-50 text-purple-600" valueColor="text-purple-700" />
          <KpiCard label="Password Reset Pending"value={kpis.pendingReset}icon={Key}          iconBg="bg-amber-50 text-amber-600"   valueColor="text-amber-700"  sub="Force reset on login" />
        </div>
      </div>

      {/* ── Search & Filters ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, username or email..."
              className="input pl-9 w-full"
            />
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Role',       value: filterRole,   set: setFilterRole,   opts: ROLES       },
              { label: 'Status',     value: filterStatus, set: setFilterStatus, opts: ['Active','Disabled','Locked'] },
              { label: 'Plant',      value: filterPlant,  set: setFilterPlant,  opts: PLANTS      },
              { label: 'Department', value: filterDept,   set: setFilterDept,   opts: DEPARTMENTS },
            ].map(f => (
              <div key={f.label} className="relative">
                <select
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  className={`input bg-white cursor-pointer pr-8 text-xs ${f.value ? 'border-indigo-400 text-indigo-700 font-bold' : ''}`}
                >
                  <option value="">All {f.label}s</option>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
        {hasFilters && (
          <p className="text-[11px] text-slate-400 font-medium mt-2">
            Showing <span className="font-black text-slate-700">{filtered.length}</span> of {users.length} users
          </p>
        )}
      </div>

      {/* ── Users Table ────────────────────────────────────────────────────── */}
      <div>
        <SectionLabel title="User Accounts" sub={`${filtered.length} record${filtered.length !== 1 ? 's' : ''} found`} />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Users className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-sm font-black text-slate-400">No users found</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">Try adjusting your search or filters</p>
              <button onClick={() => setAddOpen(true)} className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                <UserPlus className="w-3.5 h-3.5" /> Add User
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['User', 'Username', 'Emp ID', 'Department', 'Role', 'Assigned Plant', 'Status', 'Last Login', ''].map(col => (
                      <th key={col} className="px-4 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(user => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedUser(user)}
                    >
                      {/* Avatar + Name */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${avatarColor(user.empName)}`}>
                            {initials(user.empName)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{user.empName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Username */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs font-mono font-bold text-slate-600">@{user.username}</span>
                      </td>
                      {/* Emp ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-bold text-slate-400">{user.empId}</span>
                      </td>
                      {/* Department */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-slate-600">{user.dept}</td>
                      {/* Role */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      {/* Plant */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-600">{user.plant}</span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={user.status} />
                          {user.forceReset && (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                              <Key className="w-2.5 h-2.5" /> Reset pending
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Last Login */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-300 shrink-0" />
                          <span className="text-xs text-slate-500 font-medium">{user.lastLogin}</span>
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <ActionMenu
                            user={user}
                            onView={() => setSelectedUser(user)}
                            onToggleStatus={s => handleStatusChange(user.id, s)}
                            onDelete={() => handleDelete(user.id)}
                            onResetPwd={() => {}}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Drawers ─────────────────────────────────────────────────────────── */}
      <AddUserDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        existingUsers={users}
        onSave={handleAddUser}
      />
      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onStatusChange={s => selectedUser && handleStatusChange(selectedUser.id, s)}
      />

    </div>
  );
}
