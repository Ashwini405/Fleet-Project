// ==========================================================
// Canonical sidebar structure. Each item's `module` must match
// a module_name value in role_permissions/user_permissions
// (see backend/migrateAuthRbac.js MODULES list).
//
// Icons are string keys resolved on the frontend against the
// `lucide-react` export of the same name.
// ==========================================================

const SIDEBAR_CONFIG = [
    {
        title: 'Assets & Operations',
        key: 'assets',
        icon: 'Truck',
        items: [
            { name: 'Vehicle Master', path: '/vehicles', module: 'Vehicle Master' },
            { name: 'Trip Master', path: '/trips', module: 'Trip Master' },
            { name: 'Fuel Management', path: '/fuel', module: 'Fuel' },
        ],
    },
    {
        title: 'Maintenance',
        key: 'maintenance',
        icon: 'Wrench',
        items: [
            { name: 'Service & Maintenance', path: '/service', module: 'Maintenance' },
            { name: 'Tyres Management', path: '/tyres', module: 'Tyres' },
            { name: 'Parts & Inventory', path: '/parts', module: 'Inventory' },
            { name: 'Vehicle Inspection', path: '/inspection', module: 'Maintenance' },
            { name: 'Incidents', path: '/incidents', module: 'Maintenance' },
            { name: 'Warranties', path: '/warranties', module: 'Maintenance' },
        ],
    },
    {
        title: 'Finance & Staff',
        key: 'finance',
        icon: 'IndianRupee',
        items: [
            { name: 'Income & Expense', path: '/finance', module: 'Income & Expense' },
            { name: 'Vendor Ledgers', path: '/vendors', module: 'Vendor' },
            { name: 'Operational Payments', path: '/payments', module: 'Operational Payments' },
            { name: 'P & L Reports', path: '/reports', module: 'Reports' },
            { name: 'Truck Profit & Loss', path: '/reports/trucks', module: 'Truck Profit & Loss' },
            { name: 'Staff Management', path: '/staff', module: 'Staff Management' },
        ],
    },
    {
        title: 'Administration',
        key: 'admin',
        icon: 'Settings',
        items: [
            { name: 'Administration', path: '/administration', module: 'Administration' },
            { name: 'Company Profile', path: '/company-profile', module: 'Company Profile' },
            { name: 'User Management', path: '/user-management', module: 'User Management' },
            { name: 'Roles & Permissions', path: '/roles-permissions', module: 'Roles & Permissions' },
            { name: 'Backup & Restore', path: '/backup-restore', module: 'Backup & Restore' },
            { name: 'Global Audit Logs', path: '/audit', module: 'Audit Logs' },
            { name: 'Document Vault', path: '/documents', module: 'Document Vault' },
            { name: 'My Account', path: '/settings', module: 'System Settings' },
        ],
    },
];

module.exports = SIDEBAR_CONFIG;
