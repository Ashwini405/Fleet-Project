export const dummyPlans = [
  {
    title: 'Weekly Tyre Check',
    type: 'MAINTENANCE',
    items: [
      'Front Left Tyre Pressure', 'Front Right Tyre Pressure', 
      'Rear Tyres Tread Depth', 'Wheel Nuts / Lugs', 'Spare Wheel Condition'
    ]
  },
  {
    title: 'Monthly Service',
    type: 'OPERATIONS',
    items: [
      'Engine Oil Level', 'Coolant Level', 'Brake Fluid', 
      'Headlights & Indicators', 'Wiper Blades'
    ]
  }
];

export const dummyHistory = [
  { id: 'INS-4272', date: '2025-12-08', vehicle: 'AP01-5555', inspector: 'Admin', status: 'Passed', details: { odo: '45,230 KM', plan: 'Weekly Tyre Check', location: 'Main Depot - Hyd' } },
  { id: 'INS-1024', date: '2023-10-26', vehicle: 'AP01-5555', inspector: 'Venkatesh (Supervisor)', status: 'Passed', details: { odo: '44,900 KM', plan: 'Monthly Service', location: 'Main Depot - Hyd' } },
  { id: 'INS-1023', date: '2023-10-25', vehicle: 'TS09-1234', inspector: 'Rajesh Kumar', status: 'Passed', details: { odo: '89,000 KM', plan: 'Weekly Tyre Check', location: 'Yard B' } },
  { id: 'INS-1022', date: '2023-10-25', vehicle: 'KA01-8877', inspector: 'Venkatesh (Supervisor)', status: 'Failed', details: { odo: '102,400 KM', plan: 'Monthly Service', location: 'On Route' } },
];

export const dummyVehicles = [
  'AP01-5555 (Tata Signa)', 'TS09-1234', 'KA01-8877', 'MH12-9999'
];
