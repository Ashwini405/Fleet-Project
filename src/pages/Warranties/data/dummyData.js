export const dummyWarranties = [
  { id: 'WR-001', item: 'Amaron Heavy Duty', category: 'BATTERY', vehicle: 'AP01-5555', start: '2023-01-15', end: '2025-01-15', coverage: '24 Months', status: 'Active', brand: 'Amaron', model: 'HD-500', sn: 'AM88392X', odo: '42,000 KM', desc: 'Main heavy duty battery.' },
  { id: 'WR-002', item: 'MRF Steel Muscle', category: 'TYRES', vehicle: 'TS09-8899', start: '2023-06-10', end: '2024-06-10', coverage: '50,000 KM', status: 'Replaced', brand: 'MRF', model: 'Steel Muscle', sn: 'MRF99283L', odo: '95,000 KM', desc: 'Front right tyre batch 2.' },
  { id: 'WR-003', item: 'Bosch Alternator', category: 'PARTS', vehicle: 'KA01-8877', start: '2021-12-01', end: '2022-12-01', coverage: '12 Months', status: 'Expired', brand: 'Bosch', model: 'Alt-X1', sn: 'BSH77192', odo: '112,000 KM', desc: 'Engine alternator.' },
];

export const dummyClaims = [
  { id: 'CL-2024-001', date: '2024-03-10', ref: 'WR-002', vehicle: 'TS09-8899', complaint: 'CMP-9928', issue: 'Sidewall crack observed', status: 'Pending', itemType: 'TYRES', sn: 'MRF99283L', sentDate: '2024-03-11', docket: 'DOCK-1110' },
  { id: 'CL-2024-002', date: '2024-02-15', ref: 'WR-001', vehicle: 'AP01-5555', complaint: 'CMP-1120', issue: 'Battery not holding charge', status: 'Submitted', itemType: 'BATTERY', sn: 'AM88392X', sentDate: '2024-02-16', docket: 'DOCK-8822' },
  { id: 'CL-2023-104', date: '2023-11-20', ref: 'WR-003', vehicle: 'KA01-8877', complaint: 'CMP-3329', issue: 'Voltage drops under load', status: 'Rejected', itemType: 'PARTS', sn: 'BSH77192', sentDate: '2023-11-21', docket: 'DOCK-7711' },
  { id: 'CL-2023-098', date: '2023-08-05', ref: 'WR-002', vehicle: 'TS09-8899', complaint: 'CMP-5511', issue: 'Tread separating early', status: 'Approved', itemType: 'TYRES', sn: 'MRF99283L', sentDate: '2023-08-06', docket: 'DOCK-4400' },
];

export const dummyVehicles = ['AP01-5555', 'TS09-8899', 'KA01-8877', 'MH12-1234'];
export const categoriesList = ['BATTERY', 'TYRES', 'PARTS', 'ENGINE', 'ELECTRICAL'];
