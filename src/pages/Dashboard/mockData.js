export const mockDashboardData = {
  fleetStatus: {
    totalTrucks: 45,
    active: 38,
    outOfService: 3,
    inGarage: 4
  },
  truckInspection: {
    completed: 27,
    pending: 5
  },
  issueReports: {
    open: 4,
    incidents: [
      { id: "MH-12-AB-9876", issue: "Fuel Leakage", status: "Critical" },
      { id: "KA-05-XY-1234", issue: "Headlight Broken", status: "Warning" },
      { id: "DL-01-CD-5566", issue: "AC Not Cooling", status: "Warning" },
      { id: "RJ-14-GH-2211", issue: "Tyre Burst", status: "Critical" }
    ]
  },
  vehicleRenewals: [
    { id: "GJ-05-AB-1122", dueDate: "12 Oct 2024", status: "Overdue" },
    { id: "DL-01-CD-5566", dueDate: "25 Nov 2024", status: "Upcoming" },
    { id: "MH-12-KL-3456", dueDate: "05 Dec 2024", status: "Upcoming" },
  ],
  serviceReminders: [
    { id: "RJ-14-GH-2211", dueDate: "02 Nov 2024", status: "Upcoming" },
    { id: "KA-05-XY-1234", dueDate: "08 Nov 2024", status: "Upcoming" },
    { id: "WB-02-PQ-8899", dueDate: "15 Dec 2024", status: "Upcoming" },
  ],
  currentTrips: [
    { id: "MH-12-KL-3456", destination: "Delhi Distribution Center", loadedDate: "2024-10-21", kms: 1450, status: "In Transit" },
    { id: "KA-05-XY-1234", destination: "Pune Hub", loadedDate: "2024-10-22", kms: 840, status: "Loading" },
    { id: "WB-02-PQ-8899", destination: "Chennai Port", loadedDate: "2024-10-18", kms: 1670, status: "In Transit" }
  ],
  truckCostings: {
    totalExpenseThisMonth: 1425600,
    label: "Click to drill down into expenses"
  },
  pendingPayments: {
    amount: 345000,
    transactionsPending: 6,
    attentionRequired: true
  },
  fuelManagement: {
    avgKmpl: 3.8,
    totalLitersUsed: 12450
  },
  supervisorLedger: {
    totalAdvanceGiven: 850000,
    label: "Current pending settlements"
  },
  shedStock: [
    { item: "Tyres (Apollo 10.00 R20)", stock: 8, minThreshold: 10 },
    { item: "Engine Oil (15W-40) Barrels", stock: 12, minThreshold: 5 },
    { item: "Brake Pads (Heavy Duty)", stock: 4, minThreshold: 15 }
  ],
  recentlyPurchased: [
    { item: "Clutch Assembly", assignedTo: "KA-05-XY-1234", status: "Installed" },
    { item: "Air Filters (Pack of 10)", assignedTo: "Inventory", status: "Received" },
    { item: "Alternator 24V", assignedTo: "MH-12-AB-9876", status: "Ordered" }
  ],
  vendorLedgers: {
    totalOutstanding: 620000,
    label: "Requires clearance before next quarter"
  },
  garageBills: {
    totalGarageBills: 215000,
    totalSparesBills: 480000
  }
};
