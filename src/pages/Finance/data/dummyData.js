export const dummyTrucks = [
  { id: "AP-24-TX-5599", model: "Volvo FH16",    driver: "Ravi Kumar",   route: "Hyderabad – Mumbai" },
  { id: "TS-09-UB-1122", model: "Tata Prima",    driver: "Suresh Reddy", route: "Hyderabad – Pune"   },
  { id: "MH-12-PQ-8877", model: "Ashok Leyland", driver: "Mahesh Babu",  route: "Mumbai – Delhi"     },
];

export const dummyTrips = [
  { id: "TRIP-2023-0041", label: "TRIP-2023-0041 · Hyderabad → Mumbai",    truckId: "AP-24-TX-5599", route: "Hyderabad – Mumbai",    startDate: "2023-10-28", endDate: "2023-11-01" },
  { id: "TRIP-2023-0038", label: "TRIP-2023-0038 · Pune → Hyderabad",      truckId: "TS-09-UB-1122", route: "Pune – Hyderabad",      startDate: "2023-11-02", endDate: "2023-11-05" },
  { id: "TRIP-2023-0035", label: "TRIP-2023-0035 · Mumbai → Delhi",        truckId: "MH-12-PQ-8877", route: "Mumbai – Delhi",        startDate: "2023-10-19", endDate: "2023-10-22" },
  { id: "TRIP-2023-0031", label: "TRIP-2023-0031 · Hyderabad → Bangalore", truckId: "TS-09-UB-1122", route: "Hyderabad – Bangalore", startDate: "2023-11-09", endDate: "2023-11-12" },
  { id: "TRIP-2023-0029", label: "TRIP-2023-0029 · Chennai → Hyderabad",   truckId: "AP-24-TX-5599", route: "Chennai – Hyderabad",   startDate: "2023-10-20", endDate: "2023-10-24" },
];

export const dummyInvoices = [
  { id: "INV-2023-0091", label: "INV-2023-0091 · Ramesh Traders · ₹15,000" },
  { id: "INV-2023-0085", label: "INV-2023-0085 · Sunil Logistics · ₹9,500" },
  { id: "INV-2023-0078", label: "INV-2023-0078 · Apex Cargo · ₹22,000"    },
  { id: "INV-2023-0071", label: "INV-2023-0071 · Bharat Freight · ₹7,800" },
];

export const dummyRentals = [];

export const dummyIncome = [
  { id: 1,  truckId: "AP-24-TX-5599", truckModel: "Volvo FH16",    type: "Freight",        paymentStatus: "Received", totalAmount: 8000,  paidAmount: 8000,  date: "2023-11-01", freightStart: "2023-10-28", freightEnd: "2023-11-01", amount: 8000,  route: "Hyderabad – Mumbai",    refNumber: "NEFT-8822311", desc: "Full freight – auto parts consignment",    linkedTrip: "TRIP-2023-0041", linkedInvoice: null,           linkedRental: null },
  { id: 2,  truckId: "AP-24-TX-5599", truckModel: "Volvo FH16",    type: "Freight",        paymentStatus: "Partial",  totalAmount: 18000, paidAmount: 12500, date: "2023-10-24", freightStart: "2023-10-20", freightEnd: "2023-10-24", amount: 12500, route: "Mumbai – Hyderabad",   refNumber: "NEFT-9911223", desc: "Advance payment – textile goods",         linkedTrip: "TRIP-2023-0029", linkedInvoice: null,           linkedRental: null },
  { id: 3,  truckId: "TS-09-UB-1122", truckModel: "Tata Prima",    type: "Return Load",    paymentStatus: "Received", totalAmount: 6500,  paidAmount: 6500,  date: "2023-11-05", freightStart: "2023-11-02", freightEnd: "2023-11-05", amount: 6500,  route: "Pune – Hyderabad",      refNumber: "IMPS-4421009", desc: "Return load – cement bags",               linkedTrip: "TRIP-2023-0038", linkedInvoice: null,           linkedRental: null },
  { id: 4,  truckId: "MH-12-PQ-8877", truckModel: "Ashok Leyland", type: "Rental Income",  paymentStatus: "Received", totalAmount: 9000,  paidAmount: 9000,  date: "2023-10-30", freightStart: "2023-10-27", freightEnd: "2023-10-30", amount: 9000,  route: "Mumbai – Delhi",        refNumber: "RTGS-7731002", desc: "3-day vehicle rental – construction site", linkedTrip: null,              linkedInvoice: null,           linkedRental: "RNT-2023-0012" },
  { id: 5,  truckId: "AP-24-TX-5599", truckModel: "Volvo FH16",    type: "Client Payment", paymentStatus: "Received", totalAmount: 15000, paidAmount: 15000, date: "2023-11-10", freightStart: "2023-11-07", freightEnd: "2023-11-10", amount: 15000, route: "Hyderabad – Chennai",   refNumber: "NEFT-1122334", desc: "Full payment – steel coils delivery",     linkedTrip: null,              linkedInvoice: "INV-2023-0091", linkedRental: null },
  { id: 6,  truckId: "TS-09-UB-1122", truckModel: "Tata Prima",    type: "Freight",        paymentStatus: "Pending",  totalAmount: 7200,  paidAmount: 0,     date: "2023-11-12", freightStart: "2023-11-09", freightEnd: "2023-11-12", amount: 7200,  route: "Hyderabad – Bangalore", refNumber: "IMPS-9988001", desc: "Partial freight received",                linkedTrip: "TRIP-2023-0031", linkedInvoice: null,           linkedRental: null },
  { id: 7,  truckId: "MH-12-PQ-8877", truckModel: "Ashok Leyland", type: "Client Payment", paymentStatus: "Received", totalAmount: 22000, paidAmount: 22000, date: "2023-11-08", freightStart: "2023-11-05", freightEnd: "2023-11-08", amount: 22000, route: "Mumbai – Nagpur",       refNumber: "RTGS-5544221", desc: "Invoice settlement – Apex Cargo",         linkedTrip: null,              linkedInvoice: "INV-2023-0078", linkedRental: null },
  { id: 8,  truckId: "TS-09-UB-1122", truckModel: "Tata Prima",    type: "Miscellaneous",  paymentStatus: "Received", totalAmount: 1800,  paidAmount: 1800,  date: "2023-11-03", freightStart: "2023-11-03", freightEnd: "2023-11-03", amount: 1800,  route: "Hyderabad",             refNumber: "CASH-0031",    desc: "Detention charges – loading delay",       linkedTrip: null,              linkedInvoice: null,           linkedRental: null },
  { id: 9,  truckId: "AP-24-TX-5599", truckModel: "Volvo FH16",    type: "Rental Income",  paymentStatus: "Partial",  totalAmount: 20000, paidAmount: 14500, date: "2023-10-18", freightStart: "2023-10-13", freightEnd: "2023-10-18", amount: 14500, route: "Pune – Nashik",         refNumber: "NEFT-3312009", desc: "5-day rental – infrastructure project",    linkedTrip: null,              linkedInvoice: null,           linkedRental: "RNT-2023-0009" },
  { id: 10, truckId: "MH-12-PQ-8877", truckModel: "Ashok Leyland", type: "Return Load",    paymentStatus: "Pending",  totalAmount: 5400,  paidAmount: 0,     date: "2023-10-22", freightStart: "2023-10-19", freightEnd: "2023-10-22", amount: 5400,  route: "Delhi – Jaipur",        refNumber: "IMPS-7712300", desc: "Return load – FMCG goods",                linkedTrip: "TRIP-2023-0035", linkedInvoice: null,           linkedRental: null },
];

export const dummyExpense = [
  { id: 1,  truckId: "TS-09-UB-1122", truckModel: "Tata Prima",    category: "Food/Allowance", date: "2023-11-02", amount: 500,  desc: "Driver daily allowance" },
  { id: 2,  truckId: "AP-24-TX-5599", truckModel: "Volvo FH16",    category: "Toll",           date: "2023-11-02", amount: 850,  desc: "NH-65 Toll Plaza" },
  { id: 3,  truckId: "TS-09-UB-1122", truckModel: "Tata Prima",    category: "Maintenance",    date: "2023-10-26", amount: 1200, desc: "Oil Change" },
  { id: 4,  truckId: "AP-24-TX-5599", truckModel: "Volvo FH16",    category: "Fuel",           date: "2023-10-25", amount: 4500, desc: "Diesel refill at Pune" },
  { id: 5,  truckId: "MH-12-PQ-8877", truckModel: "Ashok Leyland", category: "Driver Salary",  date: "2023-10-31", amount: 3000, desc: "October salary – Mahesh Babu" },
  { id: 6,  truckId: "AP-24-TX-5599", truckModel: "Volvo FH16",    category: "Fuel",           date: "2023-11-08", amount: 5200, desc: "Diesel refill at Nagpur" },
  { id: 7,  truckId: "TS-09-UB-1122", truckModel: "Tata Prima",    category: "Toll",           date: "2023-11-05", amount: 620,  desc: "Expressway toll – Pune bypass" },
  { id: 8,  truckId: "MH-12-PQ-8877", truckModel: "Ashok Leyland", category: "Service",        date: "2023-11-01", amount: 2800, desc: "Brake pad + filter replacement" },
  { id: 9,  truckId: "AP-24-TX-5599", truckModel: "Volvo FH16",    category: "Food/Allowance", date: "2023-11-09", amount: 400,  desc: "Driver meal allowance – 2 days" },
  { id: 10, truckId: "TS-09-UB-1122", truckModel: "Tata Prima",    category: "Tyres",          date: "2023-11-11", amount: 6800, desc: "2x rear tyre replacement" },
];
