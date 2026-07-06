export const MODULES = [
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

export const PERMS    = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
export const PERM_LBL = { view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete', approve: 'Approve', export: 'Export' };
export const GROUPS   = [...new Set(MODULES.map(m => m.group))];

export const emptyPerms = () =>
  MODULES.reduce((a, m) => { a[m.key] = { view:false, create:false, edit:false, delete:false, approve:false, export:false }; return a; }, {});

export const fullPerms = () =>
  MODULES.reduce((a, m) => { a[m.key] = { view:true, create:true, edit:true, delete:true, approve:true, export:true }; return a; }, {});

export const buildPerms = (overrides) => {
  const base = emptyPerms();
  Object.entries(overrides).forEach(([k, v]) => { if (base[k]) base[k] = { ...base[k], ...v }; });
  return base;
};

export const countGranted = (perms) =>
  Object.values(perms).reduce((n, mp) => n + Object.values(mp).filter(Boolean).length, 0);