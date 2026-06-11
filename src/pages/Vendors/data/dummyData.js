export const vendorCategories = [
  { id: "dashboard", label: "Dashboard",      short: "Dashboard",      icon: "FiGrid" },
  { id: "garages",   label: "Garages",        short: "Garages",        icon: "FiTool" },
  { id: "showrooms", label: "Showrooms",      short: "Showrooms",      icon: "FiBriefcase" },
  { id: "parts",     label: "Parts & Spares", short: "Parts & Spares", icon: "FiSettings" },
  { id: "tyres",     label: "Tyres",          short: "Tyres",          icon: "FiCircle" },
  { id: "oils",      label: "Oils & Lubes",   short: "Oils & Lubes",   icon: "FiDroplet" },
  { id: "fuel",      label: "Fuel Stations",  short: "Fuel Stations",  icon: "FiFeather" },
  { id: "rta",       label: "RTA Expenses",   short: "RTA Expenses",   icon: "FiFileText" }
  // Labour removed: no vendor mapping in Service/Maintenance modules yet.
];

export const dummyVendors = [
  {
    id: "v1",
    name: "Lakshmi Toyota",
    category: "showrooms",
    vendorCategory: "Showroom",
    status: "Active",
    contact: "040-234567",
    address: "Banjara Hills, Hyderabad",
    bank: "ICICI Bank - 1234567890",
    contactPerson: "Ramesh Kumar",
    designation: "Sales Manager",
    email: "ramesh@lakshmitoyota.com",
    vehiclesPurchased: 3,
    totalPurchaseValue: 7800000,
    totalWarrantyClaims: 4,
    pendingClaims: 2,
    approvedClaims: 1,
    rejectedClaims: 1,
    pendingWarrantyAmount: 20500,
  },
  {
    id: "v2",
    name: "City Auto Works",
    category: "garages",
    vendorCategory: "Garage",
    status: "Active",
    contact: "9876543210",
    address: "Main Road, Hyderabad",
    bank: "HDFC Bank - 501002345678",
    balance: 25300,
  },
  {
    id: "v3",
    name: "Indian Oil Highway",
    category: "fuel",
    vendorCategory: "Fuel Station",
    status: "Active",
    contact: "9988776655",
    address: "NH-44 Bypass",
    bank: "SBI - 1122334455",
    balance: 12000,
  },
  {
    id: "v4",
    name: "Genuine Parts Co.",
    category: "parts",
    vendorCategory: "Parts & Spares",
    status: "Active",
    contact: "8877665544",
    address: "Auto Nagar",
    bank: "",
    balance: 5600,
  },
  {
    id: "v8",
    name: "Bosch Distributor",
    category: "parts",
    vendorCategory: "Parts & Spares",
    status: "Active",
    contact: "9900112233",
    address: "Kukatpally, Hyderabad",
    bank: "HDFC Bank",
    balance: 8200,
  },
  {
    id: "v9",
    name: "Lucas Auto Parts",
    category: "parts",
    vendorCategory: "Parts & Spares",
    status: "Active",
    contact: "9811223344",
    address: "Secunderabad",
    bank: "",
    balance: 0,
  },
  {
    id: "v10",
    name: "Castrol Distributor",
    category: "oils",
    vendorCategory: "Lubricants",
    status: "Active",
    contact: "9876001122",
    address: "Ameerpet, Hyderabad",
    bank: "SBI - 9988776655",
    balance: 3400,
  },
  {
    id: "v11",
    name: "Servo Oils",
    category: "oils",
    vendorCategory: "Lubricants",
    status: "Active",
    contact: "9700112233",
    address: "Uppal, Hyderabad",
    bank: "",
    balance: 0,
  },
  {
    id: "v12",
    name: "HP Lubricants",
    category: "oils",
    vendorCategory: "Lubricants",
    status: "Active",
    contact: "9922334455",
    address: "LB Nagar, Hyderabad",
    bank: "Axis Bank",
    balance: 1800,
  },
  {
    id: "v5",
    name: "RTA Agent Suresh",
    category: "rta",
    vendorCategory: "Other",
    status: "Active",
    contact: "7766554433",
    address: "RTO Office",
    bank: "Axis Bank",
    balance: 1500,
  },
  {
    id: "v7",
    name: "Express Repairs",
    category: "garages",
    vendorCategory: "Garage",
    status: "Active",
    contact: "9998887776",
    address: "City Center",
    bank: "SBI",
    balance: 0,
  }
];

export const dummyLedger = {
  // Garage ledger
  "v2": [
    { id: "t1", date: "2024-01-05", truckId: "AP02X1234", type: "Repair Work",      ref: "REP-0001", desc: "Engine Overhaul",        debit: 45000, credit: 0 },
    { id: "t2", date: "2024-01-18", truckId: "AP02X1234", type: "Periodic Service", ref: "SER-0005", desc: "Oil Change & Filter",    debit: 1300,  credit: 0 },
    { id: "t3", date: "2024-02-02", truckId: "",           type: "Payment",          ref: "PAY-0001", desc: "Payment via UPI",        debit: 0,     credit: 21000 },
    { id: "t4", date: "2024-02-20", truckId: "TS09-8899", type: "Repair Work",      ref: "REP-0002", desc: "Brake Pad Replacement",  debit: 8500,  credit: 0 },
    { id: "t5", date: "2024-03-10", truckId: "KA01-8877", type: "Periodic Service", ref: "SER-0009", desc: "Tyre Rotation",          debit: 1800,  credit: 0 },
    { id: "t6", date: "2024-03-25", truckId: "",           type: "Payment",          ref: "PAY-0002", desc: "Cheque Payment",         debit: 0,     credit: 10300 }
  ],
  // Parts & Spares ledger
  "v4": [
    { id: "p1", date: "2024-01-08", truckId: "AP02X1234", type: "Purchase",   ref: "PO-0011", desc: "Air Filter Set (x5)",          debit: 4500,  credit: 0 },
    { id: "p2", date: "2024-01-22", truckId: "",           type: "Purchase",   ref: "PO-0015", desc: "Brake Liners Bulk Order",      debit: 12000, credit: 0 },
    { id: "p3", date: "2024-02-05", truckId: "",           type: "Payment",    ref: "PAY-0010", desc: "Bank Transfer",               debit: 0,     credit: 10900 },
    { id: "p4", date: "2024-02-19", truckId: "TS09-8899", type: "Purchase",   ref: "PO-0021", desc: "Clutch Plate Assembly",        debit: 6800,  credit: 0 },
    { id: "p5", date: "2024-03-03", truckId: "",           type: "Adjustment", ref: "ADJ-001", desc: "Return — Damaged Air Filter",  debit: 0,     credit: 900 },
    { id: "p6", date: "2024-03-20", truckId: "KA01-8877", type: "Purchase",   ref: "PO-0028", desc: "Wiper Blades & Bulbs",         debit: 1200,  credit: 0 }
  ],
  // Fuel Station ledger
  "v3": [
    { id: "f1", date: "2024-01-03", truckId: "AP02X1234", type: "Fuel Fill",  ref: "FUL-001", desc: "Diesel 80L @ ₹92",             debit: 7360,  credit: 0 },
    { id: "f2", date: "2024-01-10", truckId: "TS09-8899", type: "Fuel Fill",  ref: "FUL-002", desc: "Diesel 60L @ ₹92",             debit: 5520,  credit: 0 },
    { id: "f3", date: "2024-01-18", truckId: "",           type: "Payment",    ref: "PAY-021", desc: "UPI Payment",                  debit: 0,     credit: 12880 },
    { id: "f4", date: "2024-02-04", truckId: "KA01-8877", type: "Fuel Fill",  ref: "FUL-003", desc: "Diesel 100L @ ₹93",            debit: 9300,  credit: 0 },
    { id: "f5", date: "2024-02-20", truckId: "AP02X1234", type: "Fuel Fill",  ref: "FUL-004", desc: "Diesel 75L @ ₹93",             debit: 6975,  credit: 0 },
    { id: "f6", date: "2024-03-01", truckId: "",           type: "Payment",    ref: "PAY-022", desc: "Cash Payment",                 debit: 0,     credit: 4275 }
  ],
  // RTA ledger
  "v5": [
    { id: "r1", date: "2024-01-15", truckId: "AP02X1234", type: "RTA Fee",   ref: "RTA-001", desc: "Fitness Certificate Renewal",   debit: 1500,  credit: 0 },
    { id: "r2", date: "2024-02-10", truckId: "",           type: "Payment",   ref: "PAY-031", desc: "Cash Payment",                  debit: 0,     credit: 1500 }
  ]
};

// Showroom activities — auto-generated from Vehicle Master & Warranty Management.
// READ-ONLY in Showroom Accounts. Status changes only via Warranty Module.
export const dummyShowroomActivities = {
  "v1": [
    // Vehicle Purchases (auto from Vehicle Master)
    { id: "a1", date: "2022-06-10", vehicleNo: "AP01-5555", type: "Vehicle Purchase",      ref: "VH-001",      desc: "Tata Prima 4028.S",             amount: 2800000, status: null },
    { id: "a2", date: "2022-09-15", vehicleNo: "TS09-8899", type: "Vehicle Purchase",      ref: "VH-002",      desc: "Tata LPT 2518",                 amount: 2500000, status: null },
    { id: "a3", date: "2023-03-20", vehicleNo: "KA01-8877", type: "Vehicle Purchase",      ref: "VH-003",      desc: "Tata Ultra 1918",               amount: 2500000, status: null },
    // Warranty Activities (auto from Warranty Management — status reflects live warranty claim status)
    {
      id: "a4", date: "2024-03-10", vehicleNo: "TS09-8899", type: "Warranty Claim Raised",
      ref: "CL-2024-001", desc: "Sidewall crack on tyre", amount: 12000, status: "Pending",
      claimId: "CL-2024-001", category: "TYRES", complaint: "CMP-9928",
      showroom: "Lakshmi Toyota", submittedDate: "2024-03-11", lastUpdated: "2024-03-11"
    },
    {
      id: "a5", date: "2024-02-15", vehicleNo: "AP01-5555", type: "Warranty Claim Raised",
      ref: "CL-2024-002", desc: "Battery not holding charge", amount: 8500, status: "Pending",
      claimId: "CL-2024-002", category: "BATTERY", complaint: "CMP-1120",
      showroom: "Lakshmi Toyota", submittedDate: "2024-02-16", lastUpdated: "2024-02-16"
    },
    {
      id: "a6", date: "2023-08-06", vehicleNo: "TS09-8899", type: "Warranty Approved",
      ref: "CL-2023-098", desc: "Tread separating — approved", amount: 9500, status: "Approved",
      claimId: "CL-2023-098", category: "TYRES", complaint: "CMP-5511",
      showroom: "Lakshmi Toyota", submittedDate: "2023-08-06", lastUpdated: "2023-08-20"
    },
    {
      id: "a7", date: "2023-11-21", vehicleNo: "KA01-8877", type: "Warranty Rejected",
      ref: "CL-2023-104", desc: "Voltage drops under load", amount: 0, status: "Rejected",
      claimId: "CL-2023-104", category: "PARTS", complaint: "CMP-3329",
      showroom: "Lakshmi Toyota", submittedDate: "2023-11-21", lastUpdated: "2023-12-01"
    }
  ]
};
// v1 purchase total: 2800000 + 2500000 + 2500000 = 7800000
// v1 pending warranty: 12000 + 8500 = 20500

// PO payment state per vendor — frontend only, used for allocation tracking.
export const dummyVendorPOs = {
  "v4": [
    { poRef: "PO-0011", desc: "Air Filter Set (x5)",       date: "2024-01-08", amount: 4500  },
    { poRef: "PO-0015", desc: "Brake Liners Bulk Order",   date: "2024-01-22", amount: 12000 },
    { poRef: "PO-0021", desc: "Clutch Plate Assembly",     date: "2024-02-19", amount: 6800  },
    { poRef: "PO-0028", desc: "Wiper Blades & Bulbs",      date: "2024-03-20", amount: 1200  },
  ],
  "v2": [
    { poRef: "REP-0001", desc: "Engine Overhaul",          date: "2024-01-05", amount: 45000 },
    { poRef: "SER-0005", desc: "Oil Change & Filter",      date: "2024-01-18", amount: 1300  },
    { poRef: "REP-0002", desc: "Brake Pad Replacement",    date: "2024-02-20", amount: 8500  },
    { poRef: "SER-0009", desc: "Tyre Rotation",            date: "2024-03-10", amount: 1800  },
  ],
  "v3": [
    { poRef: "FUL-001",  desc: "Diesel 80L @ ₹92",        date: "2024-01-03", amount: 7360  },
    { poRef: "FUL-002",  desc: "Diesel 60L @ ₹92",        date: "2024-01-10", amount: 5520  },
    { poRef: "FUL-003",  desc: "Diesel 100L @ ₹93",       date: "2024-02-04", amount: 9300  },
    { poRef: "FUL-004",  desc: "Diesel 75L @ ₹93",        date: "2024-02-20", amount: 6975  },
  ],
  "v5": [
    { poRef: "RTA-001",  desc: "Fitness Certificate Renewal", date: "2024-01-15", amount: 1500 },
  ],
};

// Vehicles purchased from showroom — sourced from Vehicle Master.
export const dummyShowroomVehicles = {
  "v1": [
    { vehicleNo: "AP01-5555", brand: "Tata", model: "Prima 4028.S",  purchaseDate: "2022-06-10", purchaseAmount: 2800000, currentStatus: "Active" },
    { vehicleNo: "TS09-8899", brand: "Tata", model: "LPT 2518",      purchaseDate: "2022-09-15", purchaseAmount: 2500000, currentStatus: "Active" },
    { vehicleNo: "KA01-8877", brand: "Tata", model: "Ultra 1918",    purchaseDate: "2023-03-20", purchaseAmount: 2500000, currentStatus: "Under Maintenance" }
  ]
};
