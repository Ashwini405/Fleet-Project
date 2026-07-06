// ─── Constants ────────────────────────────────────────────────────────────────

export const ROLES = [
  'Administrator', 'Finance Manager', 'Operations Manager',
  'Maintenance Supervisor', 'HR Manager', 'Viewer',
];

export const PLANTS = [
  'Hyderabad Plant', 'Bengaluru Plant', 'Chennai Plant', 'Mumbai Plant',
  'Delhi Plant', 'Pune Plant', 'Kolkata Plant', 'Ahmedabad Plant',
];

export const DEPARTMENTS = ['Finance', 'Operations', 'Maintenance', 'HR', 'Administration'];

export const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700', 'bg-green-100 text-green-700',
  'bg-blue-100 text-blue-700',     'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',   'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',     'bg-orange-100 text-orange-700',
];

export const avatarColor = name =>
  AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

export const initials = name =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// ─── Mock Employees (from Staff Management — read-only reference) ─────────────

export const MOCK_EMPLOYEES = [
  { id: 'EMP001', name: 'Ashwini Kumar',    dept: 'Finance',     phone: '+91-98765-43210', email: 'ashwini@fleetlogistics.in', plant: 'Hyderabad Plant'  },
  { id: 'EMP002', name: 'Sriman Reddy',     dept: 'Operations',  phone: '+91-97654-32109', email: 'sriman@fleetlogistics.in',  plant: 'Bengaluru Plant'  },
  { id: 'EMP003', name: 'Priya Sharma',     dept: 'HR',          phone: '+91-96543-21098', email: 'priya@fleetlogistics.in',   plant: 'Chennai Plant'    },
  { id: 'EMP004', name: 'Rajesh Gupta',     dept: 'Maintenance', phone: '+91-95432-10987', email: 'rajesh@fleetlogistics.in',  plant: 'Mumbai Plant'     },
  { id: 'EMP005', name: 'Kavitha Nair',     dept: 'Finance',     phone: '+91-94321-09876', email: 'kavitha@fleetlogistics.in', plant: 'Hyderabad Plant'  },
  { id: 'EMP006', name: 'Mohammed Aslam',   dept: 'Operations',  phone: '+91-93210-98765', email: 'aslam@fleetlogistics.in',   plant: 'Delhi Plant'      },
  { id: 'EMP007', name: 'Deepa Menon',      dept: 'HR',          phone: '+91-92109-87654', email: 'deepa@fleetlogistics.in',   plant: 'Pune Plant'       },
  { id: 'EMP008', name: 'Anand Krishnan',   dept: 'Maintenance', phone: '+91-91098-76543', email: 'anand@fleetlogistics.in',   plant: 'Bengaluru Plant'  },
  { id: 'EMP009', name: 'Lakshmi Rao',      dept: 'Finance',     phone: '+91-90987-65432', email: 'lakshmi@fleetlogistics.in', plant: 'Chennai Plant'    },
  { id: 'EMP010', name: 'Venkat Subramani', dept: 'Operations',  phone: '+91-89876-54321', email: 'venkat@fleetlogistics.in',  plant: 'Pune Plant'       },
];

// ─── Mock Users ───────────────────────────────────────────────────────────────

export const INITIAL_USERS = [
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
      { loginTime: '01-Jul-2026 08:30 AM', logoutTime: '01-Jul-2026 07:00 PM', ip: '10.0.0.5', browser: 'Firefox 127', device: 'Desktop', status: 'Success' },
      { loginTime: '30-Jun-2026 09:00 AM', logoutTime: '30-Jun-2026 06:00 PM', ip: '10.0.0.5', browser: 'Firefox 127', device: 'Desktop', status: 'Success' },
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

// ─── Permissions Template ─────────────────────────────────────────────────────

export const defaultPermissions = () => ({
  'Vehicle Master': { View: true,  Create: false, Edit: false, Delete: false },
  'Trip Master':    { View: true,  Create: false, Edit: false, Delete: false },
  'Fuel':           { View: true,  Create: false, Approve: false },
  'Maintenance':    { View: true,  Create: false, Approve: false },
  'Tyres':          { View: true,  Edit: false },
  'Finance':        { View: true,  Approve: false },
});

// ─── Role Cards Config ────────────────────────────────────────────────────────

export const ROLE_CARDS = [
  { role: 'Administrator',          desc: 'Full system access. Manage all modules.',         color: 'border-purple-200 bg-purple-50 text-purple-700' },
  { role: 'Finance Manager',        desc: 'Access to Finance, Vendors and Payments.',        color: 'border-blue-200 bg-blue-50 text-blue-700'       },
  { role: 'Operations Manager',     desc: 'Access to Trips, Vehicles and Fuel.',             color: 'border-indigo-200 bg-indigo-50 text-indigo-700'  },
  { role: 'Maintenance Supervisor', desc: 'Service, Tyres, Parts and Inspection access.',    color: 'border-amber-200 bg-amber-50 text-amber-700'     },
  { role: 'HR Manager',             desc: 'Staff Management and Document Vault access.',     color: 'border-pink-200 bg-pink-50 text-pink-700'        },
  { role: 'Viewer',                 desc: 'Read-only access to all non-sensitive modules.',  color: 'border-slate-200 bg-slate-50 text-slate-600'     },
];

// ─── Detail Drawer Tabs ───────────────────────────────────────────────────────

export const DETAIL_TABS = [
  { id: 'overview', label: 'Overview'      },
  { id: 'roles',    label: 'Roles'         },
  { id: 'perms',    label: 'Permissions'   },
  { id: 'history',  label: 'Login History' },
  { id: 'audit',    label: 'Audit Trail'   },
];

// ─── Add User Empty Form ──────────────────────────────────────────────────────

export const EMPTY_FORM = {
  empId: '', username: '', email: '', phone: '',
  role: '', plant: '', password: '', confirmPassword: '',
  status: 'Active', forceReset: true, allowMobile: false, allowWeb: true,
};