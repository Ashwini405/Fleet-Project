// ─── Section 1: KPI Summary ──────────────────────────────────────────────────
export const kpiData = {
  fleet: { total: 45, active: 28, underMaintenance: 7, available: 10 },
  trips: { running: 14, completed: 218, cancelled: 6 },
  finance: { totalRevenue: 18740000, totalExpenses: 9312500, netProfit: 9427500 },
  staff: { totalDrivers: 38, onTrip: 14, available: 24 },
};

// ─── Section 2: Revenue & Expense Analytics ──────────────────────────────────
export const analyticsData = {
  monthly: [
    { month: 'Jan', revenue: 1240000, expenses: 720000 },
    { month: 'Feb', revenue: 1380000, expenses: 810000 },
    { month: 'Mar', revenue: 1560000, expenses: 890000 },
    { month: 'Apr', revenue: 1420000, expenses: 760000 },
    { month: 'May', revenue: 1680000, expenses: 920000 },
    { month: 'Jun', revenue: 1520000, expenses: 840000 },
    { month: 'Jul', revenue: 1750000, expenses: 980000 },
    { month: 'Aug', revenue: 1610000, expenses: 870000 },
    { month: 'Sep', revenue: 1840000, expenses: 1010000 },
    { month: 'Oct', revenue: 1920000, expenses: 1080000 },
    { month: 'Nov', revenue: 1780000, expenses: 950000 },
    { month: 'Dec', revenue: 1830000, expenses: 990000 },
  ],
};

// ─── Section 3: Fleet Status ──────────────────────────────────────────────────
export const fleetStatusData = {
  running: 28,
  idle: 10,
  underService: 5,
  dueForInspection: 2,
};

// ─── Section 4: Maintenance Summary ──────────────────────────────────────────
export const maintenanceData = {
  servicesDue: 6,
  inWorkshop: 5,
  pendingRepairs: 9,
  upcomingPeriodic: 4,
  recentServices: [
    { vehicle: 'AP-24-TX-5599', type: 'Oil Change',           garage: 'City Auto Works',  date: '2024-12-01', status: 'Completed' },
    { vehicle: 'TS-09-UB-1122', type: 'Brake Pad Replacement', garage: 'Highway Autocare', date: '2024-12-03', status: 'In Progress' },
    { vehicle: 'MH-12-PQ-8877', type: 'Engine Overhaul',      garage: 'Royal Truck Works', date: '2024-12-05', status: 'Pending' },
    { vehicle: 'KA-01-AA-0001', type: 'Tyre Rotation',        garage: 'Sri Ram Motors',    date: '2024-12-06', status: 'Pending' },
  ],
};

// ─── Section 5: Fuel Summary ──────────────────────────────────────────────────
export const fuelData = {
  totalFuelCost: 1082400,
  fuelFilledToday: 840,
  averageMileage: 4.2,
  topConsumer: { vehicle: 'AP-99-OW-3142', litres: 1929 },
  recent: [
    { vehicle: 'AP-24-TX-5599', litres: 120, cost: 11160, vendor: 'Indian Oil Highway', date: '2024-12-06' },
    { vehicle: 'TS-09-UB-1122', litres: 95,  cost: 8835,  vendor: 'Indian Oil Highway', date: '2024-12-06' },
    { vehicle: 'MH-12-PQ-8877', litres: 110, cost: 10230, vendor: 'HP Fuel Station',    date: '2024-12-05' },
    { vehicle: 'KA-01-AA-0001', litres: 85,  cost: 7905,  vendor: 'BPCL Highway',       date: '2024-12-05' },
  ],
};

// ─── Section 6: Driver Summary ────────────────────────────────────────────────
export const driverData = {
  total: 38,
  onTrip: 14,
  available: 24,
  pendingSettlements: 7,
  recentSettlements: [
    { driver: 'Ravi Kumar',   vehicle: 'AP-24-TX-5599', amount: 22400, status: 'Pending Approval', month: 'Nov 2024' },
    { driver: 'Suresh Reddy', vehicle: 'TS-09-UB-1122', amount: 19800, status: 'Approved',         month: 'Nov 2024' },
    { driver: 'Mahesh Babu',  vehicle: 'MH-12-PQ-8877', amount: 21500, status: 'Paid',             month: 'Oct 2024' },
    { driver: 'Arjun Singh',  vehicle: 'KA-01-AA-0001', amount: 18900, status: 'Draft',            month: 'Nov 2024' },
  ],
};

// ─── Section 7: Financial Summary ────────────────────────────────────────────
export const financialSummary = {
  pendingVendorPayments: 620000,
  outstandingGarage: 215000,
  outstandingFuelVendor: 128500,
  pendingRTA: 42000,
  breakdown: [
    { name: 'Garage',     amount: 215000, color: 'bg-orange-500', light: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'Fuel Vendor',amount: 128500, color: 'bg-blue-500',   light: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Parts',      amount: 185000, color: 'bg-purple-500', light: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'Tyres',      amount: 91500,  color: 'bg-yellow-500', light: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { name: 'RTA',        amount: 42000,  color: 'bg-red-500',    light: 'bg-red-50 text-red-700 border-red-200' },
  ],
};

// ─── Section 8: Inventory Summary ────────────────────────────────────────────
export const inventoryData = {
  lowStock: 8,
  outOfStock: 3,
  pendingPOs: 5,
  items: [
    { name: 'Tyres (Apollo 10.00 R20)',     stock: 4,  min: 10, status: 'Low'     },
    { name: 'Engine Oil 15W-40 (Barrels)',  stock: 0,  min: 5,  status: 'Out'     },
    { name: 'Brake Pads (Heavy Duty)',      stock: 3,  min: 15, status: 'Low'     },
    { name: 'Air Filters',                  stock: 0,  min: 8,  status: 'Out'     },
    { name: 'Clutch Plate Assembly',        stock: 2,  min: 4,  status: 'Low'     },
    { name: 'Alternator 24V',               stock: 0,  min: 2,  status: 'Out'     },
  ],
};

// ─── Section 9: Notifications Panel ──────────────────────────────────────────
export const notificationsData = [
  { id: 1,  type: 'Insurance Expiry',              vehicle: 'AP-24-TX-5599', daysLeft: 3,   severity: 'critical' },
  { id: 2,  type: 'Permit Expiry',                 vehicle: 'TS-09-UB-1122', daysLeft: 7,   severity: 'high'     },
  { id: 3,  type: 'Fitness Due',                   vehicle: 'MH-12-PQ-8877', daysLeft: 12,  severity: 'high'     },
  { id: 4,  type: 'Service Due',                   vehicle: 'KA-01-AA-0001', daysLeft: 5,   severity: 'high'     },
  { id: 5,  type: 'Inspection Due',                vehicle: 'AP-99-OW-3142', daysLeft: 2,   severity: 'critical' },
  { id: 6,  type: 'Battery Warranty Expiry',       vehicle: 'TS-71-CF-8495', daysLeft: 18,  severity: 'medium'   },
  { id: 7,  type: 'Driver Settlement Approval',    vehicle: 'Ravi Kumar',    daysLeft: null, severity: 'medium'   },
  { id: 8,  type: 'Insurance Expiry',              vehicle: 'TN-93-CP-1825', daysLeft: 21,  severity: 'medium'   },
  { id: 9,  type: 'Permit Expiry',                 vehicle: 'KA-50-TW-9479', daysLeft: 30,  severity: 'low'      },
  { id: 10, type: 'Service Due',                   vehicle: 'MH-50-IB-1984', daysLeft: 25,  severity: 'low'      },
];

// ─── Section 10: Recent Activities ───────────────────────────────────────────
export const recentActivities = [
  { id: 1,  action: 'Trip Created',                    detail: 'TRIP-2024-0218 · AP-24-TX-5599 → Delhi',     time: '10 min ago',  icon: 'trip',        color: 'bg-indigo-100 text-indigo-600' },
  { id: 2,  action: 'Service Completed',               detail: 'Oil Change · MH-12-PQ-8877 · City Auto Works', time: '28 min ago',  icon: 'service',     color: 'bg-green-100 text-green-600'   },
  { id: 3,  action: 'Fuel Entry Added',                detail: '120 L · AP-24-TX-5599 · ₹11,160',             time: '1 hr ago',    icon: 'fuel',        color: 'bg-blue-100 text-blue-600'     },
  { id: 4,  action: 'Driver Settlement Approved',      detail: 'Suresh Reddy · Nov 2024 · ₹19,800',           time: '2 hrs ago',   icon: 'settlement',  color: 'bg-emerald-100 text-emerald-600'},
  { id: 5,  action: 'Purchase Order Created',          detail: 'PO-0031 · Brake Liners x10 · Genuine Parts',  time: '3 hrs ago',   icon: 'po',          color: 'bg-purple-100 text-purple-600' },
  { id: 6,  action: 'Vehicle Inspection Completed',    detail: 'TS-09-UB-1122 · All checks passed',            time: '4 hrs ago',   icon: 'inspection',  color: 'bg-yellow-100 text-yellow-600' },
  { id: 7,  action: 'Trip Completed',                  detail: 'TRIP-2024-0217 · KA-01-AA-0001 · Mumbai',      time: '5 hrs ago',   icon: 'trip',        color: 'bg-indigo-100 text-indigo-600' },
  { id: 8,  action: 'Vendor Payment Recorded',         detail: 'City Auto Works · ₹21,000 via UPI',            time: '6 hrs ago',   icon: 'payment',     color: 'bg-rose-100 text-rose-600'     },
  { id: 9,  action: 'Tyre Replaced',                   detail: '2x Rear Tyres · TS-09-UB-1122 · ₹6,800',       time: '7 hrs ago',   icon: 'tyre',        color: 'bg-amber-100 text-amber-600'   },
  { id: 10, action: 'New Driver Registered',           detail: 'Vikram Yadav · Lic: HR-0220110012345',          time: 'Yesterday',   icon: 'driver',      color: 'bg-cyan-100 text-cyan-600'     },
];

// ─── Section 11: Quick Actions ────────────────────────────────────────────────
export const quickActions = [
  { label: 'Add Vehicle',              path: '/vehicles/add',  color: 'bg-indigo-600 hover:bg-indigo-700',  icon: 'truck'      },
  { label: 'Create Trip',              path: '/trips/new',     color: 'bg-blue-600 hover:bg-blue-700',      icon: 'map'        },
  { label: 'Add Fuel Entry',           path: '/fuel',          color: 'bg-teal-600 hover:bg-teal-700',      icon: 'droplet'    },
  { label: 'Register Service',         path: '/service',       color: 'bg-orange-600 hover:bg-orange-700',  icon: 'wrench'     },
  { label: 'Create Purchase Order',    path: '/parts',         color: 'bg-purple-600 hover:bg-purple-700',  icon: 'package'    },
  { label: 'Driver Settlement',        path: '/payments',      color: 'bg-emerald-600 hover:bg-emerald-700',icon: 'users'      },
];
