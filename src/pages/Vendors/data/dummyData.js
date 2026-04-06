export const vendorCategories = [
  { id: "dashboard", label: "Dashboard", short: "Dashboard", icon: "FiGrid" },
  { id: "garages", label: "Garages", short: "Garages", icon: "FiTool" },
  { id: "labour", label: "Labour", short: "Labor", icon: "FiUsers" },
  { id: "showrooms", label: "Showrooms", short: "Showrooms", icon: "FiBriefcase" },
  { id: "parts", label: "Parts & Spares", short: "Parts & Spares", icon: "FiSettings" },
  { id: "tyres", label: "Tyres", short: "Tyres", icon: "FiCircle" },
  { id: "oils", label: "Oils & Lubes", short: "Oils & Lubes", icon: "FiDroplet" },
  { id: "fuel", label: "Fuel Stations", short: "Fuel Stations", icon: "FiFeather" },
  { id: "rta", label: "RTA Expenses", short: "RTA Expenses", icon: "FiFileText" }
];

export const dummyVendors = [
  {
    id: "v1",
    name: "Lakshmi Toyota",
    category: "showrooms",
    contact: "040-234567",
    address: "Banjara Hills, Hyderabad",
    bank: "ICICI Bank - 1234567890",
    balance: -100000, 
    status: "Advance Paid"
  },
  {
    id: "v2",
    name: "City Auto Works",
    category: "garages",
    contact: "9876543210",
    address: "Main Road, Hyderabad",
    bank: "HDFC Bank - 501002345678",
    balance: 25000,
    status: "Payment Due"
  },
  {
    id: "v3",
    name: "Indian Oil Highway",
    category: "fuel",
    contact: "9988776655",
    address: "NH-44 Bypass",
    bank: "SBI - 1122334455",
    balance: 12000,
    status: "Payment Due"
  },
  {
    id: "v4",
    name: "Genuine Parts Co.",
    category: "parts",
    contact: "8877665544",
    address: "Auto Nagar",
    bank: "",
    balance: 5600,
    status: "Payment Due"
  },
  {
    id: "v5",
    name: "RTA Agent Suresh",
    category: "rta",
    contact: "7766554433",
    address: "RTO Office",
    bank: "Axis Bank",
    balance: 1500,
    status: "Payment Due"
  },
  {
    id: "v6",
    name: "Raju Mechanic",
    category: "labour",
    contact: "9123456789",
    address: "Patancheru",
    bank: "Cash",
    balance: 800,
    status: "Payment Due"
  },
  {
    id: "v7",
    name: "Express Repairs",
    category: "garages",
    contact: "9998887776",
    address: "City Center",
    bank: "SBI",
    balance: 0,
    status: "Settled"
  }
];

export const dummyLedger = {
  "v2": [
    { id: "t1", date: "2023-10-01", truckId: "AP02X1234", desc: "Engine Overhaul", debit: 45000, credit: 0 },
    { id: "t2", date: "2023-10-03", truckId: "", desc: "Partial Payment", debit: 0, credit: 20000 }
  ]
};
