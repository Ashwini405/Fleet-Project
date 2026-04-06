export const dummyTrucks = [
  { id: 'AP21TY4455', model: 'Ashok Leyland 3518' },
  { id: 'KA01AA0001', model: 'Tata Signa 4225.T' },
  { id: 'TS09AB9988', model: 'Eicher Pro 6040' },
  { id: 'MH12CD5678', model: 'BharatBenz 4228R' },
];

export const dummyGarages = [
  { id: 'g1', name: 'In-House Workshop' },
  { id: 'g2', name: 'Highway Autocare' },
  { id: 'g3', name: 'Royal Truck Works' },
  { id: 'g4', name: 'Sri Ram Motors' },
];

export const dummyPeriodicLogs = [
  {
    id: 'ps1',
    date: '2023-11-15',
    truckNo: 'AP21TY4455',
    garage: 'In-House Workshop',
    odometer: 140000,
    interval: 10000,
    nextDue: 150000,
    totalCost: 4500,
    status: 'Completed',
  },
  {
    id: 'ps2',
    date: '2023-12-01',
    truckNo: 'KA01AA0001',
    garage: 'Highway Autocare',
    odometer: 50000,
    interval: 20000,
    nextDue: 70000,
    totalCost: 800,
    status: 'Completed',
  },
  {
    id: 'ps3',
    date: '2024-01-10',
    truckNo: 'TS09AB9988',
    garage: 'Royal Truck Works',
    odometer: 85000,
    interval: 15000,
    nextDue: 100000,
    totalCost: 6500,
    status: 'Pending',
  }
];

export const dummyRepairLogs = [
  {
    id: 'rw1',
    date: '2023-11-18',
    truckNo: 'TS09AB9988',
    garage: 'Royal Truck Works',
    type: 'Brake System',
    odometer: 88500,
    totalCost: 3200,
    status: 'Completed',
  },
  {
    id: 'rw2',
    date: '2023-12-05',
    truckNo: 'MH12CD5678',
    garage: 'Sri Ram Motors',
    type: 'Electrical',
    odometer: 112000,
    totalCost: 1500,
    status: 'Pending',
  }
];
