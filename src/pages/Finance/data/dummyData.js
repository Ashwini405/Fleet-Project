export const dummyTrucks = [
  { id: "AP-24-TX-5599", model: "Volvo FH16" },
  { id: "TS-09-UB-1122", model: "Tata Prima" },
  { id: "MH-12-PQ-8877", model: "Ashok Leyland" },
];

export const dummyIncome = [
  {
    id: 1,
    truckId: "AP-24-TX-5599",
    truckModel: "Volvo FH16",
    type: "Freight",
    date: "2023-11-01",
    amount: 8000,
    route: "Hyderabad - Mumbai",
    refNumber: "NEFT-8822311",
    desc: "Return Load",
  },
  {
    id: 2,
    truckId: "AP-24-TX-5599",
    truckModel: "Volvo FH16",
    type: "Freight",
    date: "2023-10-24",
    amount: 12500,
    route: "Mumbai - Hyderabad",
    refNumber: "NEFT-9911223",
    desc: "Advance payment",
  },
];

export const dummyExpense = [
  {
    id: 1,
    truckId: "TS-09-UB-1122",
    category: "Food/Allowance",
    date: "2023-11-02",
    amount: 500,
    desc: "Driver daily allowance",
  },
  {
    id: 2,
    truckId: "AP-24-TX-5599",
    category: "Toll",
    date: "2023-11-02",
    amount: 850,
    desc: "NH-65 Toll Plaza",
  },
  {
    id: 3,
    truckId: "TS-09-UB-1122",
    category: "Maintenance",
    date: "2023-10-26",
    amount: 1200,
    desc: "Oil Change",
  },
  {
    id: 4,
    truckId: "AP-24-TX-5599",
    category: "Fuel",
    date: "2023-10-25",
    amount: 4500,
    desc: "Diesel refill at Pune",
  },
];
