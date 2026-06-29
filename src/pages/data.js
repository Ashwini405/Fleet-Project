// --- MOCK DATA ---
export const MOCK_TRUCKS = ["KA-01-AA-1111", "MH-04-BB-2222", "AP-21-TA-1234"];
export const MOCK_PLANTS = ["Ultratech Cement", "Ambuja Cement", "ACC Cement"];

// Vehicle Master — maps truck number to assigned driver (null = no driver assigned)
export const VEHICLE_MASTER = {
  "KA-01-AA-1111": "Raju Driver",
  "MH-04-BB-2222": "Suresh Babu",
  "AP-21-TA-1234": "Venkat Rao",
};

export const INITIAL_PENDING = [
  {
    id: 'SET-001', truckNo: "KA-01-AA-1111", driver: "Raju Driver", plant: "Ultratech Cement",
    month: "2026-01", trips: 3, netPayable: 13750, status: "Submitted",
    submittedOn: "2026-01-10", submittedBy: "Admin", salary: 18000, batthaRate: 300,
    additions: { loading: 500, unloading: 300, bonus: 300, others: 250 },
    advance: 6500, penalty: 0, otherDed: 0, notes: "",
    activityLogs: [{ date: "2026-01-10", by: "Admin", action: "Submitted" }],
  },
  {
    id: 'SET-002', truckNo: "AP-21-TA-1234", driver: "Venkat Rao", plant: "ACC Cement",
    month: "2026-01", trips: 4, netPayable: 15200, status: "Submitted",
    submittedOn: "2026-01-11", submittedBy: "Admin", salary: 18000, batthaRate: 300,
    additions: { loading: 400, unloading: 200, bonus: 0, others: 100 },
    advance: 4800, penalty: 0, otherDed: 0, notes: "",
    activityLogs: [{ date: "2026-01-11", by: "Admin", action: "Submitted" }],
  },
];

export const INITIAL_HISTORY = [
  { id: 'SET-000', truckNo: "MH-04-BB-2222", driver: "Suresh Babu",  plant: "Ambuja Cement",    month: "2025-12", trips: 4, netPayable: 15200, status: "Paid",     paidOn: "2026-01-02", mode: "Bank Transfer", ref: "TRX987654321" },
  { id: 'SET-H01', truckNo: "KA-01-AA-1111", driver: "Raju Driver",  plant: "Ultratech Cement", month: "2025-11", trips: 5, netPayable: 18750, status: "Paid",     paidOn: "2025-12-05", mode: "Cash",          ref: "" },
  { id: 'SET-H02', truckNo: "AP-21-TA-1234", driver: "Venkat Rao",   plant: "ACC Cement",       month: "2025-11", trips: 3, netPayable: 11500, status: "Approved",  paidOn: null,         mode: "",              ref: "" },
  { id: 'SET-H03', truckNo: "MH-04-BB-2222", driver: "Suresh Babu",  plant: "Ambuja Cement",    month: "2025-11", trips: 6, netPayable: 21000, status: "Paid",     paidOn: "2025-12-10", mode: "UPI",           ref: "UPI8823441" },
  { id: 'SET-H04', truckNo: "KA-01-AA-1111", driver: "Raju Driver",  plant: "Ultratech Cement", month: "2025-10", trips: 4, netPayable: 16400, status: "Paid",     paidOn: "2025-11-03", mode: "Bank Transfer", ref: "TRX112233445" },
];