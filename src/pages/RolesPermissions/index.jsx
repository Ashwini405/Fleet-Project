import React, { useState, useMemo } from 'react';
import {
  Shield, Users, Lock, Search, X, Plus, Download,
  ChevronLeft, ChevronRight, CheckCircle2, Check, Minus,
  Edit2, Copy, Trash2, Power, Clock, AlertTriangle, Settings,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULES = [
  { key: 'dashboard',      label: 'Dashboard',             group: 'Core'        },
  { key: 'vehicles',       label: 'Vehicle Master',         group: 'Operations'  },
  { key: 'trips',          label: 'Trip Master',            group: 'Operations'  },
  { key: 'fuel',           label: 'Fuel Management',        group: 'Operations'  },
  { key: 'maintenance',    label: 'Service & Maintenance',  group: 'Maintenance' },
  { key: 'tyres',          label: 'Tyres Management',       group: 'Maintenance' },
  { key: 'parts',          label: 'Parts & Inventory',      group: 'Maintenance' },
  { key: 'inspection',     label: 'Vehicle Inspection',     group: 'Maintenance' },
  { key: 'incidents',      label: 'Incidents',              group: 'Maintenance' },
  { key: 'warranties',     label: 'Warranties',             group: 'Maintenance' },
  { key: 'finance',        label: 'Income & Expense',       group: 'Finance'     },
  { key: 'vendors',        label: 'Vendor Ledgers',         group: 'Finance'     },
  { key: 'payments',       label: 'Operational Payments',   group: 'Finance'     },
  { key: 'reports',        label: 'P&L Reports',            group: 'Finance'     },
  { key: 'staff',          label: 'Staff Management',       group: 'HR'          },
  { key: 'documents',      label: 'Documents',              group: 'HR'          },
  { key: 'administration', label: 'Administration',         group: 'Admin'       },
  { key: 'audit',          label: 'Audit Logs',             group: 'Admin'       },
];

const PERMS     = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
const PERM_LBL  = { view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete', approve: 'Approve', export: 'Export' };
const GROUPS    = [...new Set(MODULES.map(m => m.group))];

// ─── Permission helpers ───────────────────────────────────────────────────────

const emptyPerms = () =>
  MODULES.reduce((a, m) => { a[m.key] = { view:false, create:false, edit:false, delete:false, approve:false, export:false }; return a; }, {});

const fullPerms = () =>
  MODULES.reduce((a, m) => { a[m.key] = { view:true, create:true, edit:true, delete:true, approve:true, export:true }; return a; }, {});

const buildPerms = (overrides) => {
  const base = emptyPerms();
  Object.entries(overrides).forEach(([k, v]) => { if (base[k]) base[k] = { ...base[k], ...v }; });
  return base;
};

const countGranted = (perms) =>
  Object.values(perms).reduce((n, mp) => n + Object.values(mp).filter(Boolean).length, 0);

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INIT_ROLES = [
  {
    id:'R001', name:'Administrator',
    description:'Full access to all Fleet ERP modules and system configuration.',
    color:'bg-indigo-600', usersAssigned:2,  modulesLabel:'All Modules (18)',
    createdBy:'System',        createdDate:'01-Jan-2026',
    updatedBy:'System',        lastUpdated:'01-Jan-2026',
    status:'Active', isSystem:true, isCustom:false,
    permissions: fullPerms(),
  },
  {
    id:'R002', name:'Finance Manager',
    description:'Full control over all Finance modules; read-only access to Operations.',
    color:'bg-green-600', usersAssigned:6,  modulesLabel:'Finance + View',
    createdBy:'System',        createdDate:'01-Jan-2026',
    updatedBy:'Ashwini Kumar', lastUpdated:'15-Mar-2026',
    status:'Active', isSystem:true, isCustom:false,
    permissions: buildPerms({
      dashboard:   {view:true, export:true},
      vehicles:    {view:true}, trips:{view:true}, fuel:{view:true},
      maintenance: {view:true}, tyres:{view:true}, parts:{view:true},
      inspection:  {view:true}, incidents:{view:true}, warranties:{view:true},
      finance:     {view:true,create:true,edit:true,delete:true,approve:true,export:true},
      vendors:     {view:true,create:true,edit:true,delete:true,approve:true,export:true},
      payments:    {view:true,create:true,edit:true,delete:true,approve:true,export:true},
      reports:     {view:true,create:true,edit:true,approve:true,export:true},
      staff:       {view:true}, documents:{view:true},
    }),
  },
  {
    id:'R003', name:'Operations Manager',
    description:'Full control over vehicles, trips, and fuel management.',
    color:'bg-blue-600', usersAssigned:10, modulesLabel:'Operations',
    createdBy:'System',        createdDate:'01-Jan-2026',
    updatedBy:'Rajesh Sharma', lastUpdated:'20-Apr-2026',
    status:'Active', isSystem:true, isCustom:false,
    permissions: buildPerms({
      dashboard:   {view:true, export:true},
      vehicles:    {view:true,create:true,edit:true,delete:true,approve:true,export:true},
      trips:       {view:true,create:true,edit:true,approve:true,export:true},
      fuel:        {view:true,create:true,edit:true,approve:true,export:true},
      maintenance: {view:true}, tyres:{view:true}, parts:{view:true},
      inspection:  {view:true,create:true}, incidents:{view:true,create:true},
      warranties:  {view:true}, finance:{view:true},
      staff:       {view:true}, documents:{view:true},
    }),
  },
  {
    id:'R004', name:'Maintenance Manager',
    description:'Full access to maintenance, tyres, parts, inspection, and warranty modules.',
    color:'bg-amber-600', usersAssigned:5,  modulesLabel:'Maintenance',
    createdBy:'System',        createdDate:'01-Jan-2026',
    updatedBy:'Priya Nair',    lastUpdated:'10-May-2026',
    status:'Active', isSystem:true, isCustom:false,
    permissions: buildPerms({
      dashboard:   {view:true, export:true},
      vehicles:    {view:true}, trips:{view:true}, fuel:{view:true},
      maintenance: {view:true,create:true,edit:true,delete:true,approve:true,export:true},
      tyres:       {view:true,create:true,edit:true,delete:true,export:true},
      parts:       {view:true,create:true,edit:true,delete:true,export:true},
      inspection:  {view:true,create:true,edit:true,delete:true,export:true},
      incidents:   {view:true,create:true,edit:true,delete:true,export:true},
      warranties:  {view:true,create:true,edit:true,delete:true,export:true},
      finance:     {view:true}, documents:{view:true,create:true},
    }),
  },
  {
    id:'R005', name:'HR Manager',
    description:'Full access to staff management and documents; read-only elsewhere.',
    color:'bg-purple-600', usersAssigned:3,  modulesLabel:'Staff & HR',
    createdBy:'Ashwini Kumar', createdDate:'15-Feb-2026',
    updatedBy:'Ashwini Kumar', lastUpdated:'01-Jun-2026',
    status:'Active', isSystem:false, isCustom:true,
    permissions: buildPerms({
      dashboard:  {view:true},
      vehicles:   {view:true}, trips:{view:true},
      staff:      {view:true,create:true,edit:true,delete:true,export:true},
      documents:  {view:true,create:true,edit:true,delete:true,export:true},
      finance:    {view:true}, reports:{view:true,export:true},
    }),
  },
  {
    id:'R006', name:'Viewer',
    description:'Read-only access across all modules. Cannot create, edit, or delete any records.',
    color:'bg-slate-500', usersAssigned:22, modulesLabel:'Read Only (All)',
    createdBy:'Ashwini Kumar', createdDate:'01-Mar-2026',
    updatedBy:'Rajesh Sharma', lastUpdated:'20-Jun-2026',
    status:'Active', isSystem:false, isCustom:true,
    permissions: buildPerms(MODULES.reduce((a,m) => { a[m.key]={view:true}; return a; }, {})),
  },
];

const USERS_BY_ROLE = {
  R001:[
    {name:'Ashwini Kumar', username:'ashwini.kumar', dept:'IT Administration', plant:'HQ Pune',      status:'Active'  },
    {name:'Rajesh Sharma', username:'rajesh.sharma', dept:'IT Administration', plant:'HQ Pune',      status:'Active'  },
  ],
  R002:[
    {name:'Meena Joshi',   username:'meena.joshi',   dept:'Finance',           plant:'HQ Pune',      status:'Active'  },
    {name:'Suresh Patil',  username:'suresh.patil',  dept:'Finance',           plant:'Mumbai Hub',   status:'Active'  },
    {name:'Anita Desai',   username:'anita.desai',   dept:'Accounts',          plant:'HQ Pune',      status:'Active'  },
    {name:'Kiran Mehta',   username:'kiran.mehta',   dept:'Finance',           plant:'Delhi Branch', status:'Active'  },
    {name:'Pooja Rao',     username:'pooja.rao',     dept:'Accounts',          plant:'HQ Pune',      status:'Active'  },
    {name:'Vivek Sharma',  username:'vivek.sharma',  dept:'Finance',           plant:'Mumbai Hub',   status:'Inactive'},
  ],
  R003:[
    {name:'Sunil Kumar',   username:'sunil.kumar',   dept:'Operations',        plant:'HQ Pune',      status:'Active'  },
    {name:'Arun Singh',    username:'arun.singh',    dept:'Operations',        plant:'Mumbai Hub',   status:'Active'  },
    {name:'Ramesh Nair',   username:'ramesh.nair',   dept:'Operations',        plant:'Delhi Branch', status:'Active'  },
    {name:'Deepak Verma',  username:'deepak.verma',  dept:'Fleet Ops',         plant:'HQ Pune',      status:'Active'  },
    {name:'Sanjay Gupta',  username:'sanjay.gupta',  dept:'Fleet Ops',         plant:'Nashik Unit',  status:'Active'  },
    {name:'Kavita Rao',    username:'kavita.rao',    dept:'Operations',        plant:'HQ Pune',      status:'Active'  },
    {name:'Ajay Reddy',    username:'ajay.reddy',    dept:'Operations',        plant:'Delhi Branch', status:'Active'  },
    {name:'Mohan Pillai',  username:'mohan.pillai',  dept:'Fleet Ops',         plant:'Mumbai Hub',   status:'Inactive'},
    {name:'Seema Tiwari',  username:'seema.tiwari',  dept:'Operations',        plant:'HQ Pune',      status:'Active'  },
    {name:'Nitin Kulkarni',username:'nitin.k',       dept:'Fleet Ops',         plant:'Nashik Unit',  status:'Active'  },
  ],
  R004:[
    {name:'Priya Nair',    username:'priya.nair',    dept:'Maintenance',       plant:'HQ Pune',      status:'Active'  },
    {name:'Rakesh Jain',   username:'rakesh.jain',   dept:'Maintenance',       plant:'Mumbai Hub',   status:'Active'  },
    {name:'Amit Bhatt',    username:'amit.bhatt',    dept:'Workshop',          plant:'HQ Pune',      status:'Active'  },
    {name:'Gopal Das',     username:'gopal.das',     dept:'Workshop',          plant:'Delhi Branch', status:'Active'  },
    {name:'Santosh More',  username:'santosh.more',  dept:'Maintenance',       plant:'Nashik Unit',  status:'Active'  },
  ],
  R005:[
    {name:'Lata Mishra',   username:'lata.mishra',   dept:'Human Resources',   plant:'HQ Pune',      status:'Active'  },
    {name:'Shivam Arora',  username:'shivam.arora',  dept:'Human Resources',   plant:'Mumbai Hub',   status:'Active'  },
    {name:'Renu Srivastava',username:'renu.s',       dept:'HR & Compliance',   plant:'HQ Pune',      status:'Active'  },
  ],
  R006: Array.from({length:22}, (_,i) => ({
    name:`Fleet User ${i+1}`, username:`fleet.user${String(i+1).padStart(2,'0')}`,
    dept:'General',   plant:'HQ Pune', status: i < 20 ? 'Active' : 'Inactive',
  })),
};

const AUDIT_BY_ROLE = {
  R001:[
    {date:'01-Jan-2026', action:'Role Created',   by:'System',        detail:'System role created with full permissions on all 18 modules.'},
  ],
  R002:[
    {date:'15-Mar-2026', action:'Permissions Updated', by:'Ashwini Kumar', detail:'Removed Delete permission from P&L Reports module.'},
    {date:'01-Jan-2026', action:'Role Created',         by:'System',        detail:'Role created with Finance module permissions.'},
  ],
  R003:[
    {date:'20-Apr-2026', action:'Permissions Updated', by:'Rajesh Sharma', detail:'Added Approve permission to Trip Master and Fuel modules.'},
    {date:'05-Feb-2026', action:'Users Added',          by:'Ashwini Kumar', detail:'Seema Tiwari and Nitin Kulkarni assigned to this role.'},
    {date:'01-Jan-2026', action:'Role Created',         by:'System',        detail:'Role created with Operations module permissions.'},
  ],
  R004:[
    {date:'10-May-2026', action:'Permissions Updated', by:'Priya Nair',    detail:'Added Delete permission to Tyres and Parts modules.'},
    {date:'01-Jan-2026', action:'Role Created',         by:'System',        detail:'Role created with Maintenance module permissions.'},
  ],
  R005:[
    {date:'01-Jun-2026', action:'Permissions Updated', by:'Ashwini Kumar', detail:'Added Export permission to Staff and Documents modules.'},
    {date:'15-Feb-2026', action:'Role Created',         by:'Ashwini Kumar', detail:'Custom role created for HR department.'},
  ],
  R006:[
    {date:'20-Jun-2026', action:'Permissions Updated', by:'Rajesh Sharma', detail:'Removed Export permission from Finance and Reports modules.'},
    {date:'01-Mar-2026', action:'Role Created',         by:'Ashwini Kumar', detail:'Custom Viewer role created for read-only access.'},
  ],
};

// ─── Primitive components ─────────────────────────────────────────────────────

function StatusBadge({ status }) {
  return status === 'Active'
    ? <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border bg-green-50 text-green-700 border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Active</span>
    : <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border bg-slate-100 text-slate-500 border-slate-200"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Inactive</span>;
}

function RoleAvatar({ name, color }) {
  return (
    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white text-xs font-black shrink-0`}>
      {name.split(' ').map(w => w[0]).slice(0,2).join('')}
    </div>
  );
}

// ─── Permission Matrix (read-only) ────────────────────────────────────────────

function ReadMatrix({ permissions }) {
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
                  <td colSpan={7} className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">
                    {group}
                  </td>
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

// ─── Permission Matrix (editable) ────────────────────────────────────────────

function EditMatrix({ permissions, onChange }) {
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
                <button onClick={() => toggleCol(p)}
                  className="flex flex-col items-center gap-1 mx-auto group" title={`Toggle all ${PERM_LBL[p]}`}>
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
                  <td colSpan={8} className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">
                    {group}
                  </td>
                </tr>
                {mods.map(mod => (
                  <tr key={mod.key} className="border-b border-slate-100 hover:bg-indigo-50/20">
                    <td className="px-4 py-2 font-semibold text-slate-700">{mod.label}</td>
                    {PERMS.map(p => (
                      <td key={p} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!permissions[mod.key]?.[p]}
                          onChange={e => setCell(mod.key, p, e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => toggleRow(mod.key)}
                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors whitespace-nowrap">
                        {PERMS.every(p => permissions[mod.key]?.[p]) ? 'Clear' : 'All'}
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

// ─── Role Detail Drawer ───────────────────────────────────────────────────────

const DRAWER_TABS = ['Overview', 'Permissions', 'Assigned Users', 'Audit Trail'];

function RoleDrawer({ role, onClose, onEdit, onDuplicate, onToggleStatus, onDelete }) {
  const [tab, setTab] = useState('Overview');
  const users = USERS_BY_ROLE[role.id] ?? [];
  const audit = AUDIT_BY_ROLE[role.id] ?? [];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-3xl bg-white z-50 shadow-2xl flex flex-col">

        {/* Drawer header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 shrink-0">
          <RoleAvatar name={role.name} color={role.color} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-black text-slate-800">{role.name}</p>
              <StatusBadge status={role.status} />
              {role.isSystem && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">System</span>}
              {role.isCustom && <span className="text-[10px] font-black text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">Custom</span>}
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

          {/* Overview */}
          {tab === 'Overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  ['Users Assigned',      role.usersAssigned,   'bg-indigo-50 text-indigo-600'  ],
                  ['Modules Accessible',  role.modulesLabel,    'bg-blue-50   text-blue-600'    ],
                  ['Permission Rules',    countGranted(role.permissions), 'bg-green-50 text-green-600' ],
                  ['Role Type',           role.isSystem ? 'System' : 'Custom', 'bg-slate-100 text-slate-600'],
                  ['Status',             role.status,           'bg-green-50  text-green-600'   ],
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

          {/* Permissions */}
          {tab === 'Permissions' && (
            <div>
              <p className="text-xs text-slate-400 font-medium mb-4">
                {countGranted(role.permissions)} permissions granted across {MODULES.length} modules.
              </p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <ReadMatrix permissions={role.permissions} />
              </div>
            </div>
          )}

          {/* Assigned Users */}
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
                          <td className="px-4 py-3 font-bold text-slate-800">{u.name}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{u.username}</td>
                          <td className="px-4 py-3 text-slate-600">{u.dept}</td>
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

          {/* Audit Trail */}
          {tab === 'Audit Trail' && (
            <div className="space-y-0">
              {audit.map((entry, i) => {
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
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">{entry.by}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{entry.detail}</p>
                      <p className="text-[10px] font-mono text-slate-300 mt-0.5">{entry.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ─── Role Form Modal ──────────────────────────────────────────────────────────

function RoleFormModal({ mode, initialRole, allRoles, onClose, onSave }) {
  const [name,        setName]        = useState(initialRole?.name        ?? '');
  const [description, setDescription] = useState(initialRole?.description ?? '');
  const [status,      setStatus]      = useState(initialRole?.status      ?? 'Active');
  const [cloneFrom,   setCloneFrom]   = useState('');
  const [permissions, setPermissions] = useState(
    initialRole?.permissions ? structuredClone(initialRole.permissions) : emptyPerms()
  );
  const [errors, setErrors] = useState({});

  const handleCloneChange = (id) => {
    setCloneFrom(id);
    if (id) {
      const src = allRoles.find(r => r.id === id);
      if (src) setPermissions(structuredClone(src.permissions));
    } else {
      setPermissions(emptyPerms());
    }
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Role name is required.';
    else if (allRoles.some(r => r.name.toLowerCase() === name.trim().toLowerCase() && r.id !== initialRole?.id))
      e.name = 'Role name must be unique.';
    if (countGranted(permissions) === 0) e.perms = 'At least one permission must be selected.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ name: name.trim(), description, status, permissions });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-60" onClick={onClose} />
      <div className="fixed inset-0 z-60 overflow-y-auto flex items-start justify-center p-4 pointer-events-none">
        <div className="w-full max-w-4xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto">

          {/* Modal header */}
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
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Fleet Supervisor"
                  className={`input ${errors.name ? 'border-red-400 focus:ring-red-100' : ''}`} />
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
                    {allRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              )}
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of this role's responsibilities"
                  className="input" />
              </div>
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-black text-slate-700">Permission Matrix</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {countGranted(permissions)} permissions selected
                </p>
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

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ config, onClose, onConfirm }) {
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

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;
let _nextId = 7;

export default function RolesPermissions() {
  const [roles,       setRoles]       = useState(INIT_ROLES);
  const [search,      setSearch]      = useState('');
  const [filterStatus,setFilterStatus]= useState('All');
  const [filterType,  setFilterType]  = useState('All');
  const [page,        setPage]        = useState(1);
  const [drawer,      setDrawer]      = useState(null);
  const [formModal,   setFormModal]   = useState(null);
  const [confirmCfg,  setConfirmCfg]  = useState(null);
  const [toast,       setToast]       = useState({ show: false, msg: '' });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  // Filtered list
  const filtered = useMemo(() => roles.filter(r => {
    const q = search.toLowerCase();
    if (q && !r.name.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    if (filterType === 'System' && !r.isSystem) return false;
    if (filterType === 'Custom' && !r.isCustom)  return false;
    return true;
  }), [roles, search, filterStatus, filterType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const hasFilter  = search || filterStatus !== 'All' || filterType !== 'All';

  const resetFilters = () => { setSearch(''); setFilterStatus('All'); setFilterType('All'); setPage(1); };

  // KPI counts
  const totalRoles  = roles.length;
  const activeRoles = roles.filter(r => r.status === 'Active').length;
  const totalUsers  = roles.reduce((n, r) => n + r.usersAssigned, 0);
  const customRoles = roles.filter(r => r.isCustom).length;
  const totalPerms  = roles.reduce((n, r) => n + countGranted(r.permissions), 0);

  // Handlers
  const handleSaveRole = (data) => {
    if (formModal.mode === 'add') {
      const newRole = {
        id: `R${String(_nextId++).padStart(3,'0')}`,
        name:        data.name,
        description: data.description,
        color:       'bg-teal-600',
        usersAssigned: 0,
        modulesLabel: `${countGranted(data.permissions)} permissions`,
        createdBy:   'Ashwini Kumar',
        createdDate: '02-Jul-2026',
        updatedBy:   'Ashwini Kumar',
        lastUpdated: '02-Jul-2026',
        status:      data.status,
        isSystem:    false,
        isCustom:    true,
        permissions: data.permissions,
      };
      setRoles(p => [...p, newRole]);
      showToast(`Role "${data.name}" created successfully.`);
    } else {
      setRoles(p => p.map(r => r.id === formModal.role.id
        ? { ...r, name: data.name, description: data.description, status: data.status,
            permissions: data.permissions, updatedBy: 'Ashwini Kumar', lastUpdated: '02-Jul-2026',
            modulesLabel: `${countGranted(data.permissions)} permissions` }
        : r
      ));
      if (drawer?.id === formModal.role.id) {
        setDrawer(prev => prev ? { ...prev, name: data.name, description: data.description,
          status: data.status, permissions: data.permissions } : prev);
      }
      showToast(`Role "${data.name}" updated successfully.`);
    }
    setFormModal(null);
  };

  const handleDuplicate = (role) => {
    setFormModal({
      mode: 'add',
      role: null,
      prefill: {
        name:        `${role.name} (Copy)`,
        description: role.description,
        status:      role.status,
        permissions: structuredClone(role.permissions),
      },
    });
    setDrawer(null);
  };

  const handleToggleStatus = (role) => {
    const next = role.status === 'Active' ? 'Inactive' : 'Active';
    setConfirmCfg({
      type:         next === 'Inactive' ? 'disable' : 'enable',
      title:        `${next === 'Inactive' ? 'Disable' : 'Enable'} Role`,
      body:         `${next === 'Inactive' ? 'Disabling' : 'Enabling'} "${role.name}" will ${next === 'Inactive' ? 'prevent' : 'allow'} all assigned users from logging in with this role.`,
      confirmLabel: next === 'Inactive' ? 'Disable' : 'Enable',
      onConfirm:    () => {
        setRoles(p => p.map(r => r.id === role.id ? { ...r, status: next } : r));
        if (drawer?.id === role.id) setDrawer(prev => prev ? { ...prev, status: next } : prev);
        showToast(`Role "${role.name}" ${next.toLowerCase()}.`);
      },
    });
  };

  const handleDelete = (role) => {
    if (role.isSystem) { showToast('System roles cannot be deleted.'); return; }
    setConfirmCfg({
      type:         'delete',
      title:        'Delete Role',
      body:         `"${role.name}" will be permanently deleted. All ${role.usersAssigned} assigned users will lose this role.`,
      confirmLabel: 'Delete',
      onConfirm:    () => {
        setRoles(p => p.filter(r => r.id !== role.id));
        if (drawer?.id === role.id) setDrawer(null);
        showToast(`Role "${role.name}" deleted.`);
      },
    });
  };

  const exportRoles = () => {
    const rows = [
      ['Role Name','Description','Users','Status','Type','Last Updated'],
      ...roles.map(r => [r.name, r.description, r.usersAssigned, r.status, r.isSystem?'System':'Custom', r.lastUpdated]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a   = document.createElement('a');
    a.href    = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    a.download = 'roles-permissions.csv';
    a.click();
    showToast('Roles exported as CSV.');
  };

  const kpis = [
    { label:'Total Roles',        value: totalRoles,  sub:'Across all departments',      color:'bg-indigo-50 text-indigo-600', icon: Shield   },
    { label:'Active Roles',       value: activeRoles, sub:`${totalRoles - activeRoles} inactive`, color:'bg-green-50 text-green-600',  icon: CheckCircle2 },
    { label:'Users Assigned',     value: totalUsers,  sub:'Across all roles',             color:'bg-blue-50 text-blue-600',    icon: Users    },
    { label:'Custom Roles',       value: customRoles, sub:'Admin-defined roles',          color:'bg-purple-50 text-purple-600',icon: Settings },
    { label:'Modules Controlled', value: 18,          sub:'ERP modules under RBAC',       color:'bg-amber-50 text-amber-600',  icon: Lock     },
    { label:'Permission Rules',   value: `${totalPerms}+`, sub:'Total grants across roles', color:'bg-slate-100 text-slate-600', icon: CheckCircle2 },
  ];

  return (
    <div className="w-full max-w-400 mx-auto pb-16 space-y-5">

      {/* Toast */}
      <div className={`fixed top-6 right-6 z-60 flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-2xl px-4 py-3 transition-all duration-300 max-w-xs ${
        toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}>
        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
        <p className="text-sm font-black text-slate-800 leading-snug">{toast.msg}</p>
      </div>

      {/* Modals */}
      {formModal && (
        <RoleFormModal
          mode={formModal.mode}
          initialRole={formModal.mode === 'edit' ? formModal.role : formModal.prefill ? { permissions: formModal.prefill.permissions, ...formModal.prefill } : null}
          allRoles={roles}
          onClose={() => setFormModal(null)}
          onSave={handleSaveRole}
        />
      )}
      <ConfirmModal
        config={confirmCfg}
        onClose={() => setConfirmCfg(null)}
        onConfirm={() => { confirmCfg?.onConfirm?.(); }}
      />

      {/* Role Drawer */}
      {drawer && (
        <RoleDrawer
          role={drawer}
          onClose={() => setDrawer(null)}
          onEdit={() => { setFormModal({ mode:'edit', role: drawer }); setDrawer(null); }}
          onDuplicate={() => handleDuplicate(drawer)}
          onToggleStatus={() => handleToggleStatus(drawer)}
          onDelete={() => handleDelete(drawer)}
        />
      )}

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Roles & Permissions</h1>
            <p className="text-xs text-slate-400 font-medium">Manage user roles and module-level access across Fleet ERP.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportRoles}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export Roles
          </button>
          <button onClick={() => setFormModal({ mode:'add', role:null })}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Add Role
          </button>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(k => {
          const Ico = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${k.color}`}>
                <Ico className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-slate-800">{k.value}</p>
              <p className="text-[11px] font-black text-slate-600 mt-0.5 leading-tight">{k.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Search & Filter ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search role name or description…"
              className="input pl-9" />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="input w-36 bg-white cursor-pointer text-xs">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="input w-36 bg-white cursor-pointer text-xs">
            <option value="All">All Types</option>
            <option value="System">System Roles</option>
            <option value="Custom">Custom Roles</option>
          </select>
          {hasFilter && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shrink-0">
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Roles Table ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
            Roles ({filtered.length})
          </p>
          {hasFilter && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">Filtered</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Role Name','Description','Users','Modules','Created By','Last Updated','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">No roles found</p>
                      {hasFilter
                        ? <button onClick={resetFilters} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"><X className="w-3 h-3" /> Clear Filters</button>
                        : <button onClick={() => setFormModal({ mode:'add', role:null })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"><Plus className="w-3 h-3" /> Add First Role</button>
                      }
                    </div>
                  </td>
                </tr>
              ) : paginated.map(role => (
                <tr key={role.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <RoleAvatar name={role.name} color={role.color} />
                      <div>
                        <p className="text-xs font-black text-slate-800">{role.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {role.isSystem && <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 border border-indigo-100 px-1 rounded">System</span>}
                          {role.isCustom  && <span className="text-[9px] font-black text-purple-500 bg-purple-50 border border-purple-100 px-1 rounded">Custom</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{role.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-slate-700">
                      <Users className="w-3 h-3 text-slate-400" /> {role.usersAssigned}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{role.modulesLabel}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600 whitespace-nowrap">{role.createdBy}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">{role.lastUpdated}</td>
                  <td className="px-4 py-3"><StatusBadge status={role.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDrawer(role)} title="View Details"
                        className="px-2 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap">
                        View
                      </button>
                      <button onClick={() => setFormModal({ mode:'edit', role })} title="Edit"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors border border-slate-200">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDuplicate(role)} title="Duplicate"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors border border-slate-200">
                        <Copy className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleToggleStatus(role)} title={role.status === 'Active' ? 'Disable' : 'Enable'}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors border border-slate-200">
                        <Power className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(role)} title="Delete" disabled={role.isSystem}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors border ${
                          role.isSystem
                            ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                            : 'text-slate-500 hover:bg-red-50 hover:text-red-600 border-slate-200'
                        }`}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[11px] text-slate-500 font-medium">
              Showing <span className="font-black text-slate-700">{Math.min((page-1)*PAGE_SIZE+1, filtered.length)}</span>–<span className="font-black text-slate-700">{Math.min(page*PAGE_SIZE, filtered.length)}</span> of <span className="font-black text-slate-700">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 border border-slate-200 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({length: Math.min(5, totalPages)}, (_,i) => {
                const start = Math.max(1, Math.min(page-2, totalPages-4));
                const p = start + i;
                return p <= totalPages ? (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${p===page ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{p}</button>
                ) : null;
              })}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 border border-slate-200 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* System role note */}
      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
          <span className="font-black">System roles</span> (Administrator, Finance Manager, Operations Manager, Maintenance Manager) cannot be deleted. You can edit their permissions or disable them temporarily.
          <span className="font-black ml-1">Custom roles</span> can be fully managed including deletion.
        </p>
      </div>

    </div>
  );
}
