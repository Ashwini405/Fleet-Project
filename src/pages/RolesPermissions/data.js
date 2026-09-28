// Canonical module list — one row per page in the sidebar
// (backend/config/sidebarConfig.js `module` fields). `label` is the
// module_name stored in role_permissions and checked by ProtectedRoute /
// protect(); `name` is what the matrix shows (the sidebar page name).
export const MODULES = [
  { key: 'dashboard',        label: 'Dashboard',            name: 'Dashboard',              group: 'Core'                },
  { key: 'vehicles',         label: 'Vehicle Master',       name: 'Vehicle Master',         group: 'Assets & Operations' },
  { key: 'trips',            label: 'Trip Master',          name: 'Trip Master',            group: 'Assets & Operations' },
  { key: 'fuel',             label: 'Fuel',                 name: 'Fuel Management',        group: 'Assets & Operations' },
  { key: 'maintenance',      label: 'Maintenance',          name: 'Service & Maintenance',  group: 'Maintenance'         },
  { key: 'tyres',            label: 'Tyres',                name: 'Tyres Management',       group: 'Maintenance'         },
  { key: 'inventory',        label: 'Inventory',            name: 'Parts & Inventory',      group: 'Maintenance'         },
  { key: 'inspection',       label: 'Vehicle Inspection',   name: 'Vehicle Inspection',     group: 'Maintenance'         },
  { key: 'incidents',        label: 'Incidents',            name: 'Incidents',              group: 'Maintenance'         },
  { key: 'warranties',       label: 'Warranties',           name: 'Warranties',             group: 'Maintenance'         },
  { key: 'finance',          label: 'Income & Expense',     name: 'Income & Expense',       group: 'Finance & Staff'     },
  { key: 'vendor',           label: 'Vendor',               name: 'Vendor Ledgers',         group: 'Finance & Staff'     },
  { key: 'payments',         label: 'Operational Payments', name: 'Operational Payments',   group: 'Finance & Staff'     },
  { key: 'fastag',           label: 'Fastag',               name: 'Fastag Management',      group: 'Finance & Staff'     },
  { key: 'reports',          label: 'Reports',              name: 'Profit & Loss Reports',  group: 'Finance & Staff'     },
  { key: 'truckPL',          label: 'Truck Profit & Loss',  name: 'Truck P&L (detail)',     group: 'Finance & Staff'     },
  { key: 'staff',            label: 'Staff Management',     name: 'Staff Management',       group: 'Finance & Staff'     },
  { key: 'administration',   label: 'Administration',       name: 'Administration',         group: 'Administration'      },
  { key: 'companyProfile',   label: 'Company Profile',      name: 'Company Profile',        group: 'Administration'      },
  { key: 'userManagement',   label: 'User Management',      name: 'User Management',        group: 'Administration'      },
  { key: 'rolesPermissions', label: 'Roles & Permissions',  name: 'Roles & Permissions',    group: 'Administration'      },
];

export const PERMS = ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export', 'print'];
export const PERM_LBL = {
  view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete',
  approve: 'Approve', reject: 'Reject', export: 'Export', print: 'Print',
};
export const GROUPS = [...new Set(MODULES.map(m => m.group))];

export const emptyPerms = () =>
  MODULES.reduce((a, m) => {
    a[m.key] = PERMS.reduce((p, action) => { p[action] = false; return p; }, {});
    return a;
  }, {});

export const fullPerms = () =>
  MODULES.reduce((a, m) => {
    a[m.key] = PERMS.reduce((p, action) => { p[action] = true; return p; }, {});
    return a;
  }, {});

export const buildPerms = (overrides) => {
  const base = emptyPerms();
  Object.entries(overrides).forEach(([k, v]) => { if (base[k]) base[k] = { ...base[k], ...v }; });
  return base;
};

export const countGranted = (perms) =>
  Object.values(perms).reduce((n, mp) => n + Object.values(mp).filter(Boolean).length, 0);
