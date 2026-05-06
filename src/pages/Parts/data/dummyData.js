export const vendorList = [
  'Lucas Supplies', 'Gulf Lubricants', 'Bosch Parts', 'Mitra Tyres',
  'ElectroPro', 'Railway Warehousing', 'Castrol India', 'MRF Tyres Ltd',
  'Philips Auto', 'Exide Industries',
];

export const dummyTruckList = ['AP21TY4455', 'KA01AA0001', 'TS09AB9988', 'MH12CD5678', 'TN07GH3321', 'DL01AB1234'];

export const warehouseList = ['Main Warehouse', 'Workshop Store', 'Regional Warehouse'];

export const initialInventory = [
  { id: 'P-101', partCode: 'SP-1011', name: 'Air Filter', category: 'Spares', brand: 'Lucas', unit: 'pcs', minStock: 6, reorderLevel: 10, openingStock: 45, received: 24, issued: 60, costPrice: 180, sellingPrice: 220, preferredVendor: 'Lucas Supplies', location: 'Main Warehouse', warehouse: 'Main Warehouse', rack: 'R-A1', bin: 'B-01', compatibleVehicles: ['AP21TY4455', 'KA01AA0001'], vehicleType: 'Truck', expiryDate: '2026-12-31', warranty: '1 Year', createdDate: '2025-01-12', lastUpdated: '2025-05-10', description: 'Heavy duty air filter for diesel engines' },
  { id: 'P-102', partCode: 'LB-1022', name: '15W40 Engine Oil', category: 'Lubricants', brand: 'Gulf', unit: 'liters', minStock: 10, reorderLevel: 20, openingStock: 60, received: 18, issued: 72, costPrice: 560, sellingPrice: 650, preferredVendor: 'Gulf Lubricants', location: 'Workshop Store', warehouse: 'Workshop Store', rack: 'R-B2', bin: 'B-05', compatibleVehicles: ['TS09AB9988', 'MH12CD5678'], vehicleType: 'All', expiryDate: '2026-06-30', warranty: '6 Months', createdDate: '2025-01-15', lastUpdated: '2025-05-12', description: 'Premium engine oil for heavy vehicles' },
  { id: 'P-103', partCode: 'TY-1033', name: '10.00-20 Tyre', category: 'Tyres', brand: 'MRF', unit: 'pcs', minStock: 4, reorderLevel: 8, openingStock: 20, received: 6, issued: 17, costPrice: 4200, sellingPrice: 4800, preferredVendor: 'Mitra Tyres', location: 'Main Warehouse', warehouse: 'Main Warehouse', rack: 'R-C1', bin: 'B-10', compatibleVehicles: ['AP21TY4455', 'TN07GH3321'], vehicleType: 'Truck', expiryDate: '2028-01-01', warranty: '2 Years', createdDate: '2025-02-01', lastUpdated: '2025-05-08', description: 'All terrain truck tyre' },
  { id: 'P-104', partCode: 'EL-1044', name: 'Headlight Bulb', category: 'Electrical', brand: 'Philips', unit: 'pcs', minStock: 8, reorderLevel: 15, openingStock: 25, received: 10, issued: 27, costPrice: 280, sellingPrice: 340, preferredVendor: 'ElectroPro', location: 'Workshop Store', warehouse: 'Workshop Store', rack: 'R-D3', bin: 'B-12', compatibleVehicles: ['KA01AA0001', 'DL01AB1234'], vehicleType: 'All', expiryDate: '2027-03-15', warranty: '1 Year', createdDate: '2025-02-10', lastUpdated: '2025-05-11', description: 'High beam headlight bulb 24V' },
  { id: 'P-105', partCode: 'SP-1055', name: 'Brake Pads', category: 'Spares', brand: 'Bosch', unit: 'pcs', minStock: 12, reorderLevel: 20, openingStock: 36, received: 18, issued: 43, costPrice: 560, sellingPrice: 680, preferredVendor: 'Bosch Parts', location: 'Main Warehouse', warehouse: 'Main Warehouse', rack: 'R-A2', bin: 'B-03', compatibleVehicles: ['MH12CD5678', 'TS09AB9988'], vehicleType: 'Truck', expiryDate: '2027-09-30', warranty: '18 Months', createdDate: '2025-02-15', lastUpdated: '2025-05-09', description: 'Heavy duty ceramic brake pads' },
  { id: 'P-106', partCode: 'LB-1066', name: 'Grease', category: 'Lubricants', brand: 'Castrol', unit: 'kg', minStock: 5, reorderLevel: 10, openingStock: 28, received: 6, issued: 25, costPrice: 160, sellingPrice: 200, preferredVendor: 'Castrol India', location: 'Workshop Store', warehouse: 'Workshop Store', rack: 'R-B1', bin: 'B-06', compatibleVehicles: [], vehicleType: 'All', expiryDate: '2026-08-20', warranty: 'N/A', createdDate: '2025-03-01', lastUpdated: '2025-05-07', description: 'Multi-purpose lithium grease' },
  { id: 'P-107', partCode: 'SP-1077', name: 'Wiper Blades', category: 'Spares', brand: 'Bosch', unit: 'pcs', minStock: 4, reorderLevel: 8, openingStock: 14, received: 2, issued: 12, costPrice: 320, sellingPrice: 380, preferredVendor: 'Bosch Parts', location: 'Regional Warehouse', warehouse: 'Regional Warehouse', rack: 'R-E1', bin: 'B-20', compatibleVehicles: ['AP21TY4455'], vehicleType: 'All', expiryDate: '2027-12-01', warranty: '1 Year', createdDate: '2025-03-10', lastUpdated: '2025-05-06', description: 'All weather wiper blades 24 inch' },
  { id: 'P-108', partCode: 'OT-1088', name: 'Electrical Tape', category: 'Others', brand: '3M', unit: 'pcs', minStock: 10, reorderLevel: 20, openingStock: 40, received: 10, issued: 38, costPrice: 55, sellingPrice: 85, preferredVendor: 'ElectroPro', location: 'Workshop Store', warehouse: 'Workshop Store', rack: 'R-D1', bin: 'B-15', compatibleVehicles: [], vehicleType: 'All', expiryDate: '2028-06-01', warranty: 'N/A', createdDate: '2025-03-15', lastUpdated: '2025-05-05', description: 'Heavy duty PVC electrical insulation tape' },
  { id: 'P-109', partCode: 'BT-1099', name: '12V Battery', category: 'Batteries', brand: 'Exide', unit: 'pcs', minStock: 3, reorderLevel: 5, openingStock: 10, received: 4, issued: 8, costPrice: 3800, sellingPrice: 4500, preferredVendor: 'Exide Industries', location: 'Main Warehouse', warehouse: 'Main Warehouse', rack: 'R-F1', bin: 'B-22', compatibleVehicles: ['KA01AA0001', 'DL01AB1234'], vehicleType: 'All', expiryDate: '2027-01-15', warranty: '2 Years', createdDate: '2025-03-20', lastUpdated: '2025-05-04', description: '12V 88Ah maintenance free battery' },
  { id: 'P-110', partCode: 'SP-1100', name: 'Clutch Plate', category: 'Spares', brand: 'Bosch', unit: 'pcs', minStock: 4, reorderLevel: 6, openingStock: 8, received: 2, issued: 9, costPrice: 2200, sellingPrice: 2700, preferredVendor: 'Bosch Parts', location: 'Main Warehouse', warehouse: 'Main Warehouse', rack: 'R-A3', bin: 'B-04', compatibleVehicles: ['TS09AB9988', 'TN07GH3321'], vehicleType: 'Truck', expiryDate: '2028-03-01', warranty: '1 Year', createdDate: '2025-04-01', lastUpdated: '2025-05-03', description: 'Heavy duty clutch plate assembly' },
  { id: 'P-111', partCode: 'LB-1111', name: 'Coolant', category: 'Lubricants', brand: 'Gulf', unit: 'liters', minStock: 8, reorderLevel: 15, openingStock: 30, received: 10, issued: 12, costPrice: 220, sellingPrice: 280, preferredVendor: 'Gulf Lubricants', location: 'Workshop Store', warehouse: 'Workshop Store', rack: 'R-B3', bin: 'B-07', compatibleVehicles: [], vehicleType: 'All', expiryDate: '2026-11-30', warranty: 'N/A', createdDate: '2025-04-05', lastUpdated: '2025-05-02', description: 'OAT coolant concentrate for diesel engines' },
  { id: 'P-112', partCode: 'TL-1122', name: 'Torque Wrench', category: 'Tools', brand: 'Stanley', unit: 'pcs', minStock: 2, reorderLevel: 3, openingStock: 5, received: 0, issued: 1, costPrice: 1800, sellingPrice: 2200, preferredVendor: 'Railway Warehousing', location: 'Workshop Store', warehouse: 'Workshop Store', rack: 'R-G1', bin: 'B-30', compatibleVehicles: [], vehicleType: 'All', expiryDate: '', warranty: '3 Years', createdDate: '2025-04-10', lastUpdated: '2025-05-01', description: '1/2 inch drive torque wrench 20-200 Nm' },
];

export const initialIssueHistory = [
  { id: 'I-01', date: '2025-05-10', partName: 'Air Filter', partCode: 'SP-1011', vehicleNumber: 'AP21TY4455', odometer: '142500 km', qty: 2, serviceType: 'Repair', cost: 360, vendor: 'Lucas Supplies', serviceId: 'SR-7541' },
  { id: 'I-02', date: '2025-05-09', partName: '15W40 Engine Oil', partCode: 'LB-1022', vehicleNumber: 'TS09AB9988', odometer: '91000 km', qty: 10, serviceType: 'Periodic', cost: 5600, vendor: 'Gulf Lubricants', serviceId: 'SR-7542' },
  { id: 'I-03', date: '2025-05-08', partName: 'Brake Pads', partCode: 'SP-1055', vehicleNumber: 'MH12CD5678', odometer: '115000 km', qty: 6, serviceType: 'Repair', cost: 3360, vendor: 'Bosch Parts', serviceId: 'SR-7543' },
  { id: 'I-04', date: '2025-05-07', partName: 'Headlight Bulb', partCode: 'EL-1044', vehicleNumber: 'KA01AA0001', odometer: '52000 km', qty: 3, serviceType: 'Repair', cost: 840, vendor: 'ElectroPro', serviceId: 'SR-7544' },
  { id: 'I-05', date: '2025-05-06', partName: 'Grease', partCode: 'LB-1066', vehicleNumber: 'AP21TY4455', odometer: '142500 km', qty: 4, serviceType: 'Periodic', cost: 640, vendor: 'Castrol India', serviceId: 'SR-7545' },
  { id: 'I-06', date: '2025-05-05', partName: 'Clutch Plate', partCode: 'SP-1100', vehicleNumber: 'TN07GH3321', odometer: '88000 km', qty: 1, serviceType: 'Repair', cost: 2200, vendor: 'Bosch Parts', serviceId: 'SR-7546' },
  { id: 'I-07', date: '2025-05-04', partName: '12V Battery', partCode: 'BT-1099', vehicleNumber: 'DL01AB1234', odometer: '61000 km', qty: 1, serviceType: 'Repair', cost: 3800, vendor: 'Exide Industries', serviceId: 'SR-7547' },
  { id: 'I-08', date: '2025-05-03', partName: 'Coolant', partCode: 'LB-1111', vehicleNumber: 'KA01AA0001', odometer: '53000 km', qty: 5, serviceType: 'Periodic', cost: 1100, vendor: 'Gulf Lubricants', serviceId: 'SR-7548' },
];

export const initialMovementHistory = [
  { id: 'M-101', date: '2025-05-10', type: 'Stock Out', partCode: 'SP-1011', partName: 'Air Filter', openingStock: 9, added: 0, used: 2, currentStock: 7, reference: 'SR-7541', user: 'Ravi Kumar', warehouse: 'Main Warehouse' },
  { id: 'M-102', date: '2025-05-09', type: 'Stock Out', partCode: 'LB-1022', partName: '15W40 Engine Oil', openingStock: 16, added: 0, used: 10, currentStock: 6, reference: 'SR-7542', user: 'Suresh M', warehouse: 'Workshop Store' },
  { id: 'M-103', date: '2025-05-08', type: 'Stock Out', partCode: 'SP-1055', partName: 'Brake Pads', openingStock: 17, added: 0, used: 6, currentStock: 11, reference: 'SR-7543', user: 'Ravi Kumar', warehouse: 'Main Warehouse' },
  { id: 'M-104', date: '2025-05-07', type: 'Stock In', partCode: 'EL-1044', partName: 'Headlight Bulb', openingStock: 5, added: 10, used: 0, currentStock: 15, reference: 'INV-532', user: 'Admin', warehouse: 'Workshop Store' },
  { id: 'M-105', date: '2025-05-06', type: 'Transfer', partCode: 'TY-1033', partName: '10.00-20 Tyre', openingStock: 9, added: 0, used: 3, currentStock: 6, reference: 'TRF-201', user: 'Mohan D', warehouse: 'Main Warehouse' },
  { id: 'M-106', date: '2025-05-05', type: 'Stock In', partCode: 'LB-1066', partName: 'Grease', openingStock: 3, added: 6, used: 0, currentStock: 9, reference: 'INV-507', user: 'Admin', warehouse: 'Workshop Store' },
  { id: 'M-107', date: '2025-05-04', type: 'Stock Out', partCode: 'SP-1100', partName: 'Clutch Plate', openingStock: 2, added: 0, used: 1, currentStock: 1, reference: 'SR-7546', user: 'Suresh M', warehouse: 'Main Warehouse' },
];

export const initialPurchaseOrders = [
  { id: 'PO-001', poNumber: 'PO-2025-001', vendor: 'Bosch Parts', items: [{ partName: 'Brake Pads', qty: 20, unitPrice: 560 }, { partName: 'Wiper Blades', qty: 10, unitPrice: 320 }], totalAmount: 14400, status: 'Pending', createdDate: '2025-05-08', expectedDelivery: '2025-05-18', createdBy: 'Store Manager' },
  { id: 'PO-002', poNumber: 'PO-2025-002', vendor: 'Gulf Lubricants', items: [{ partName: '15W40 Engine Oil', qty: 50, unitPrice: 560 }, { partName: 'Coolant', qty: 20, unitPrice: 220 }], totalAmount: 32400, status: 'Approved', createdDate: '2025-05-06', expectedDelivery: '2025-05-15', createdBy: 'Admin' },
  { id: 'PO-003', poNumber: 'PO-2025-003', vendor: 'Exide Industries', items: [{ partName: '12V Battery', qty: 5, unitPrice: 3800 }], totalAmount: 19000, status: 'Received', createdDate: '2025-04-28', expectedDelivery: '2025-05-05', createdBy: 'Store Manager' },
  { id: 'PO-004', poNumber: 'PO-2025-004', vendor: 'Mitra Tyres', items: [{ partName: '10.00-20 Tyre', qty: 8, unitPrice: 4200 }], totalAmount: 33600, status: 'Pending', createdDate: '2025-05-09', expectedDelivery: '2025-05-20', createdBy: 'Supervisor' },
  { id: 'PO-005', poNumber: 'PO-2025-005', vendor: 'Lucas Supplies', items: [{ partName: 'Air Filter', qty: 30, unitPrice: 180 }], totalAmount: 5400, status: 'Approved', createdDate: '2025-05-07', expectedDelivery: '2025-05-14', createdBy: 'Admin' },
];

export const activityFeed = [
  { id: 'A-01', type: 'Stock In', message: '20 units of Engine Oil received from Gulf Lubricants', user: 'Admin', avatar: 'A', time: '2 hours ago', color: 'emerald' },
  { id: 'A-02', type: 'Stock Out', message: '6 Brake Pads issued for service SR-7543 (MH12CD5678)', user: 'Ravi Kumar', avatar: 'R', time: '4 hours ago', color: 'orange' },
  { id: 'A-03', type: 'Transfer', message: '3 Tyres transferred to Workshop Store', user: 'Mohan D', avatar: 'M', time: '6 hours ago', color: 'blue' },
  { id: 'A-04', type: 'PO Approved', message: 'Purchase Order PO-2025-002 approved by Admin', user: 'Admin', avatar: 'A', time: '1 day ago', color: 'violet' },
  { id: 'A-05', type: 'Alert', message: 'Clutch Plate stock critically low — only 1 unit remaining', user: 'System', avatar: 'S', time: '1 day ago', color: 'red' },
  { id: 'A-06', type: 'Stock In', message: '10 Headlight Bulbs received from ElectroPro', user: 'Admin', avatar: 'A', time: '2 days ago', color: 'emerald' },
  { id: 'A-07', type: 'PO Created', message: 'New PO PO-2025-004 raised for Mitra Tyres', user: 'Supervisor', avatar: 'S', time: '2 days ago', color: 'slate' },
];

export const inventoryValueTrend = [
  { month: 'Dec', value: 180000 }, { month: 'Jan', value: 210000 }, { month: 'Feb', value: 195000 },
  { month: 'Mar', value: 230000 }, { month: 'Apr', value: 215000 }, { month: 'May', value: 248000 },
];

export const monthlyUsageData = [
  { month: 'Dec', spares: 42, lubricants: 38, tyres: 8, electrical: 15, batteries: 3 },
  { month: 'Jan', spares: 55, lubricants: 45, tyres: 10, electrical: 18, batteries: 4 },
  { month: 'Feb', spares: 48, lubricants: 40, tyres: 7, electrical: 12, batteries: 2 },
  { month: 'Mar', spares: 62, lubricants: 52, tyres: 12, electrical: 20, batteries: 5 },
  { month: 'Apr', spares: 58, lubricants: 48, tyres: 9, electrical: 16, batteries: 3 },
  { month: 'May', spares: 70, lubricants: 55, tyres: 14, electrical: 22, batteries: 6 },
];

export const categoryDistribution = [
  { name: 'Spares', value: 35, color: '#6366f1' },
  { name: 'Lubricants', value: 25, color: '#f59e0b' },
  { name: 'Tyres', value: 18, color: '#10b981' },
  { name: 'Electrical', value: 12, color: '#3b82f6' },
  { name: 'Batteries', value: 6, color: '#ef4444' },
  { name: 'Tools', value: 4, color: '#8b5cf6' },
];

export const vendorSpendData = [
  { vendor: 'Bosch Parts', spend: 48000 },
  { vendor: 'Gulf Lubricants', spend: 36000 },
  { vendor: 'Mitra Tyres', spend: 33600 },
  { vendor: 'Exide Industries', spend: 19000 },
  { vendor: 'Lucas Supplies', spend: 12600 },
  { vendor: 'ElectroPro', spend: 9800 },
];

export const warehouseData = [
  { name: 'Main Warehouse', parts: 6, value: 142000, utilization: 72 },
  { name: 'Workshop Store', parts: 5, value: 86000, utilization: 58 },
  { name: 'Regional Warehouse', parts: 1, value: 20000, utilization: 30 },
];
