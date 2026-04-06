export const initialInventory = [
  { id: 'I-1', name: 'Air Filter', brand: 'Lucas', serialNo: 'AF-101', category: 'Spares', qty: 5, dateOfEntry: '2025-10-10' },
  { id: 'I-2', name: 'Clutch Plate', brand: 'Valeo', serialNo: 'CP-900', category: 'Spares', qty: 1, dateOfEntry: '2025-10-10' },
  { id: 'I-3', name: 'Brake Pads', brand: 'Bosch', serialNo: '', category: 'Spares', qty: 15, dateOfEntry: '2025-10-12' },
  { id: 'I-4', name: 'Headlight Bulb', brand: 'Philips', serialNo: '', category: 'Spares', qty: 8, dateOfEntry: '2025-10-15' },
  { id: 'I-5', name: '15W40 Engine Oil', brand: 'Gulf', serialNo: '', category: 'Lubricants', qty: 2, dateOfEntry: '2025-10-01' },
  { id: 'I-6', name: 'Grease', brand: 'Castrol', serialNo: '', category: 'Lubricants', qty: 12, dateOfEntry: '2025-10-05' },
  { id: 'I-7', name: 'Inner Tube 10.00-20', brand: 'MRF', serialNo: '', category: 'Tubes', qty: 6, dateOfEntry: '2025-10-20' },
  { id: 'I-8', name: 'Wiper Blades', brand: 'Bosch', serialNo: '', category: 'Others', qty: 4, dateOfEntry: '2025-10-22' },
];

export const initialIssuedHistory = [
  { id: 'H-1', date: '26 Oct 2025', itemName: 'Air Filter', truckNo: 'AP01-5555', odometer: '45000 km', qty: 1 },
  { id: 'H-2', date: '25 Oct 2025', itemName: '15W40 Engine Oil', truckNo: 'TS09-8899', odometer: '42100 km', qty: 2 },
  { id: 'H-3', date: '24 Oct 2025', itemName: 'Brake Pads', truckNo: 'AP29-1122', odometer: '38900 km', qty: 4 },
  { id: 'H-4', date: '22 Oct 2025', itemName: 'Grease', truckNo: 'AP01-5555', odometer: '44800 km', qty: 1 },
  { id: 'H-5', date: '20 Oct 2025', itemName: 'Headlight Bulb', truckNo: 'TS09-8899', odometer: '41950 km', qty: 2 },
];

export const dummyTruckList = [
  'AP01-5555', 'TS09-8899', 'AP29-1122', 'MH12-3434', 'KA04-9898'
];
