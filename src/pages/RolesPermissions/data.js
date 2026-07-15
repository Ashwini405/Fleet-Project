// Canonical module list — must match backend/migrateAuthRbac.js MODULES
// and backend/config/sidebarConfig.js `module` fields exactly (labels are
// sent to the backend as `module_name` when saving permissions).
export const MODULES = [
  { key: 'dashboard',      label: 'Dashboard',              group: 'Core'           },
  { key: 'vehicles',       label: 'Vehicle Master',         group: 'Operations'     },
  { key: 'trips',          label: 'Trip Master',            group: 'Operations'     },
  { key: 'fuel',           label: 'Fuel',                    group: 'Operations'     },
  { key: 'maintenance',    label: 'Maintenance',            group: 'Maintenance'    },
  { key: 'tyres',          label: 'Tyres',                   group: 'Maintenance'    },
  { key: 'battery',        label: 'Battery',                 group: 'Maintenance'    },
  { key: 'inventory',      label: 'Inventory',               group: 'Maintenance'    },
  { key: 'purchaseOrders', label: 'Purchase Orders',         group: 'Maintenance'    },
  { key: 'vendor',         label: 'Vendor',                  group: 'Finance'        },
  { key: 'finance',        label: 'Income & Expense',       group: 'Finance'        },
  { key: 'payments',       label: 'Operational Payments',   group: 'Finance'        },
  { key: 'reports',        label: 'Reports',                 group: 'Finance'        },
  { key: 'truckPL',        label: 'Truck Profit & Loss',    group: 'Finance'        },
  { key: 'staff',          label: 'Staff Management',       group: 'HR'             },
  { key: 'administration', label: 'Administration',         group: 'Admin'          },
  { key: 'companyProfile', label: 'Company Profile',         group: 'Admin'          },
  { key: 'userManagement', label: 'User Management',        group: 'Admin'          },
  { key: 'rolesPermissions', label: 'Roles & Permissions', group: 'Admin'          },
  { key: 'audit',          label: 'Audit Logs',              group: 'Admin'          },
  { key: 'documentVault',  label: 'Document Vault',           group: 'Admin'          },
  { key: 'systemSettings', label: 'System Settings',        group: 'Admin'          },
  { key: 'backupRestore',  label: 'Backup & Restore',       group: 'Admin'          },
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
