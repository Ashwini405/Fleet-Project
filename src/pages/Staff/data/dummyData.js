export const userRoles = [
  { id: "dashboard", label: "Dashboard", short: "Dashboard", icon: "LayoutDashboard" },
  { id: "stations", label: "Operational Station", short: "Operational Station", icon: "Building2" },
  { id: "supervisors", label: "Supervisors", short: "Supervisors", icon: "UsersRound" },
  { id: "drivers", label: "Drivers", short: "Drivers", icon: "SteeringWheel" },
  { id: "employees", label: "Employees", short: "Employees", icon: "Briefcase" },
  { id: "ledgers", label: "Ledgers", short: "Ledgers", icon: "BookOpen" }
];

export const dummyStations = [
  { id: "HUB-NYC", name: "Central Hub", location: "New York, NY", manager: "Robert Ford", contact: "555-0101" },
  { id: "STN-BOS", name: "North Station", location: "Boston, MA", manager: "Bernard Lowe", contact: "555-0102" }
];

export const dummyStaff = [
  {
    id: "SUP-001",
    name: "Robert Ford",
    role: "supervisors",
    contact: "555-0101",
    allotment: "Central Hub",
    wallet: 45500,
    status: "Active",
    bank: "Chase Bank",
    accNo: "123456789012",
    ifsc: "CHA50001",
    branch: "Downtown NY"
  },
  {
    id: "SUP-002",
    name: "Bernard Lowe",
    role: "supervisors",
    contact: "555-0102",
    allotment: "North Station",
    wallet: 67500,
    status: "Active"
  },
  {
    id: "DRV-101",
    name: "Caleb Nichols",
    role: "drivers",
    contact: "555-0201",
    allotment: "Truck #55",
    wallet: 12000,
    status: "Active"
  },
  {
    id: "EMP-201",
    name: "Maeve Millay",
    role: "employees",
    contact: "555-0301",
    allotment: "HQ",
    wallet: 0,
    status: "Inactive"
  }
];

export const dummyTransactions = [
  { id: "tx1", date: "03/01/2026", title: "Monthly Allocation", type: "credit", amount: 80000 },
  { id: "tx2", date: "03/01/2026", title: "Emergency Maintenance", type: "debit", amount: 12500 },
  { id: "tx3", date: "03/01/2026", title: "Weekly Operation Fund", type: "credit", amount: 50000 },
  { id: "tx4", date: "03/01/2026", title: "Fuel for Fleet A", type: "debit", amount: 4500 }
];
