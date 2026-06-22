// Mock data for Driver Profile Page
// Replace with API calls in production

export const MOCK_DRIVERS = [
  {
    id: 'DRV-101',
    name: 'Raju Driver',
    mobile: '+91 98765 43210',
    licenseNo: 'KA-2019-0012345',
    address: '12, 3rd Cross, Rajajinagar, Bengaluru - 560010',
    joiningDate: '2020-03-15',
    plant: 'Ultratech Cement',
    vehicle: 'KA-01-AA-1111',
    status: 'Active',
    driverId: 'DRV-101',
  },
  {
    id: 'DRV-102',
    name: 'Suresh Babu',
    mobile: '+91 91234 56789',
    licenseNo: 'MH-2018-0078901',
    address: '45, Sion West, Mumbai - 400022',
    joiningDate: '2019-07-01',
    plant: 'Ambuja Cement',
    vehicle: 'MH-04-BB-2222',
    status: 'Active',
    driverId: 'DRV-102',
  },
  {
    id: 'DRV-103',
    name: 'Venkat Rao',
    mobile: '+91 87654 32109',
    licenseNo: 'AP-2020-0056789',
    address: '78, Ameerpet, Hyderabad - 500016',
    joiningDate: '2021-01-10',
    plant: 'ACC Cement',
    vehicle: 'AP-21-TA-1234',
    status: 'Active',
    driverId: 'DRV-103',
  },
];

export const MOCK_TRIPS = {
  'DRV-101': [
    { id: 'TRP-001', date: '2026-01-05', vehicle: 'KA-01-AA-1111', route: 'Bengaluru → Mysuru', distance: '145 km', status: 'Completed' },
    { id: 'TRP-002', date: '2026-01-12', vehicle: 'KA-01-AA-1111', route: 'Mysuru → Hubli',    distance: '220 km', status: 'Completed' },
    { id: 'TRP-003', date: '2026-01-20', vehicle: 'KA-01-AA-1111', route: 'Hubli → Bengaluru', distance: '330 km', status: 'Completed' },
    { id: 'TRP-004', date: '2026-02-03', vehicle: 'KA-01-AA-1111', route: 'Bengaluru → Chennai','distance': '350 km', status: 'In Progress' },
  ],
  'DRV-102': [
    { id: 'TRP-010', date: '2026-01-08', vehicle: 'MH-04-BB-2222', route: 'Mumbai → Pune',   distance: '155 km', status: 'Completed' },
    { id: 'TRP-011', date: '2026-01-18', vehicle: 'MH-04-BB-2222', route: 'Pune → Nashik',   distance: '212 km', status: 'Completed' },
    { id: 'TRP-012', date: '2026-02-01', vehicle: 'MH-04-BB-2222', route: 'Nashik → Mumbai',  distance: '167 km', status: 'Completed' },
  ],
  'DRV-103': [
    { id: 'TRP-020', date: '2026-01-10', vehicle: 'AP-21-TA-1234', route: 'Hyderabad → Vijayawada', distance: '275 km', status: 'Completed' },
    { id: 'TRP-021', date: '2026-01-22', vehicle: 'AP-21-TA-1234', route: 'Vijayawada → Vizag',     distance: '350 km', status: 'Completed' },
  ],
};

export const MOCK_ADVANCES = {
  'DRV-101': [
    { date: '2025-10-05', ref: 'ADV-2025-001', amount: 3000,  remarks: 'Emergency advance' },
    { date: '2025-11-15', ref: 'ADV-2025-002', amount: 2000,  remarks: 'Festival advance' },
    { date: '2025-12-01', ref: 'ADV-2025-003', amount: 1500,  remarks: 'Medical advance' },
  ],
  'DRV-102': [
    { date: '2025-11-10', ref: 'ADV-2025-010', amount: 5000,  remarks: 'Travel advance' },
    { date: '2025-12-20', ref: 'ADV-2025-011', amount: 2500,  remarks: 'House repair' },
  ],
  'DRV-103': [
    { date: '2025-12-05', ref: 'ADV-2025-020', amount: 4000,  remarks: 'Festival advance' },
  ],
};

export const MOCK_PAYMENTS = {
  'DRV-101': [
    { month: '2025-10', salary: 18000, battha: 1500, additions: 1350, deductions: 3000, netPayable: 17850, status: 'Paid' },
    { month: '2025-11', salary: 18000, battha: 1800, additions: 1000, deductions: 2000, netPayable: 18800, status: 'Paid' },
    { month: '2025-12', salary: 18000, battha: 900,  additions: 1350, deductions: 1500, netPayable: 18750, status: 'Paid' },
    { month: '2026-01', salary: 18000, battha: 900,  additions: 1350, deductions: 6500, netPayable: 13750, status: 'Pending' },
  ],
  'DRV-102': [
    { month: '2025-11', salary: 18000, battha: 1800, additions: 1350, deductions: 5000, netPayable: 16150, status: 'Paid' },
    { month: '2025-12', salary: 18000, battha: 1200, additions: 1350, deductions: 2500, netPayable: 18050, status: 'Paid' },
    { month: '2026-01', salary: 18000, battha: 1500, additions: 1350, deductions: 6500, netPayable: 14350, status: 'Approved' },
  ],
  'DRV-103': [
    { month: '2025-12', salary: 18000, battha: 900,  additions: 700,  deductions: 4000, netPayable: 15600, status: 'Paid' },
    { month: '2026-01', salary: 18000, battha: 1200, additions: 700,  deductions: 4000, netPayable: 15900, status: 'Draft' },
  ],
};

export const MOCK_DOCUMENTS = {
  'DRV-101': [
    { type: 'Driving License', docNo: 'KA-2019-0012345', expiry: '2029-03-14', status: 'Valid' },
    { type: 'Aadhaar Card',    docNo: 'XXXX-XXXX-3210',  expiry: null,         status: 'Valid' },
    { type: 'Medical Certificate', docNo: 'MED-2025-101', expiry: '2026-03-01', status: 'Valid' },
  ],
  'DRV-102': [
    { type: 'Driving License', docNo: 'MH-2018-0078901', expiry: '2028-07-01', status: 'Valid' },
    { type: 'Aadhaar Card',    docNo: 'XXXX-XXXX-6789',  expiry: null,         status: 'Valid' },
    { type: 'Medical Certificate', docNo: 'MED-2025-102', expiry: '2025-12-15', status: 'Expired' },
  ],
  'DRV-103': [
    { type: 'Driving License', docNo: 'AP-2020-0056789', expiry: '2030-01-10', status: 'Valid' },
    { type: 'Aadhaar Card',    docNo: 'XXXX-XXXX-2109',  expiry: null,         status: 'Valid' },
  ],
};
