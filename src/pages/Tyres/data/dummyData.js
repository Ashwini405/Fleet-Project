export const dummyTrucks = [
  { id: 'AP91 TB 9602', model: 'Tata Prima 5530', totalTyres: 10, recentChanges: 'No Recent Changes' },
  { id: 'AP79 TB 6578', model: 'Tata Prima 5530', totalTyres: 10, recentChanges: 'No Recent Changes' },
  { id: 'AP29 TB 9293', model: 'Tata Prima 5530', totalTyres: 10, recentChanges: '1 Tyre Replaced' },
  { id: 'AP88 TB 9146', model: 'Tata Prima 5530', totalTyres: 10, recentChanges: '2 Tyres Replaced' },
];

export const dummyActiveTyres = [
  { id: 'T-3457', truckNo: 'AP91 TB 9602', make: 'Ceat', model: 'Milaze', fittedDate: '2025-09-17', fittedOdo: 23892, presentOdo: 34210, expectedLife: 100000, material: 'Radial Steel', vendor: 'Tyre World', position: 'Front Left', health: 'Good' },
  { id: 'T-9237', truckNo: 'AP91 TB 9602', make: 'Apollo', model: 'Alnac', fittedDate: '2024-12-30', fittedOdo: 59662, presentOdo: 78119, expectedLife: 100000, material: 'Radial Steel', vendor: 'Tyre World', position: 'Front Right', health: 'Medium' },
  { id: 'T-4685', truckNo: 'AP91 TB 9602', make: 'MRF', model: 'Zapper', fittedDate: '2025-02-03', fittedOdo: 30072, presentOdo: 31092, expectedLife: 100000, material: 'Nylon', vendor: 'Highway Auth', position: 'L1 Outer', health: 'Good' },
  { id: 'T-7717', truckNo: 'AP91 TB 9602', make: 'JK Tyre', model: 'UX Royale', fittedDate: '2025-10-28', fittedOdo: 42582, presentOdo: 51771, expectedLife: 80000, material: 'Radial Steel', vendor: 'Global Tyres', position: 'L1 Inner', health: 'Good' },
  { id: 'T-5547', truckNo: 'AP91 TB 9602', make: 'Ceat', model: 'Milaze', fittedDate: '2025-04-11', fittedOdo: 26207, presentOdo: 44400, expectedLife: 100000, material: 'Radial Steel', vendor: 'Tyre World', position: 'R1 Inner', health: 'Medium' },
  { id: 'T-6857', truckNo: 'AP91 TB 9602', make: 'Ceat', model: 'Milaze', fittedDate: '2025-08-28', fittedOdo: 46980, presentOdo: 62500, expectedLife: 80000, material: 'Radial Steel', vendor: 'Tyre World', position: 'R1 Outer', health: 'Medium' },
  { id: 'T-3510', truckNo: 'AP91 TB 9602', make: 'Apollo', model: 'EnduRace', fittedDate: '2025-05-21', fittedOdo: 45268, presentOdo: 55295, expectedLife: 100000, material: 'Radial Steel', vendor: 'Highway Auth', position: 'L2 Outer', health: 'Good' },
  // Let's add some poor health tires dynamically later or assume health logic based on percentage (e.g. running > 80% = red)
];

export const dummyOldTyres = [
  { tyreNo: 'OLD-3065', vehicleNo: 'AP51 TB 9816', entryDate: '2023-10-15', runningKm: 120000, storeLocation: 'Scrap Yard', status: 'Scrap' },
  { tyreNo: 'OLD-6703', vehicleNo: 'AP21 TB 9393', entryDate: '2023-10-15', runningKm: 120000, storeLocation: 'Retreading Area', status: 'Reusable' },
  { tyreNo: 'OLD-5146', vehicleNo: 'AP59 TB 9721', entryDate: '2023-10-15', runningKm: 120000, storeLocation: 'Retreading Area', status: 'Reusable' },
  { tyreNo: 'OLD-3091', vehicleNo: 'AP45 TB 2483', entryDate: '2023-10-15', runningKm: 120000, storeLocation: 'Scrap Yard', status: 'Scrap' },
];

export const vendors = [
  'Tyre World', 'Highway Auth', 'Global Tyres', 'Metro Dealers'
];

export const tyreBrands = [
  'Ceat', 'Apollo', 'MRF', 'JK Tyre', 'Michelin', 'Bridgestone'
];

export const layoutPositions = [
  { id: 'FL', label: 'Front Left', row: 1, side: 'left', group: 'steer' },
  { id: 'FR', label: 'Front Right', row: 1, side: 'right', group: 'steer' },
  
  { id: 'L1_OUTER', label: 'L1 Outer', row: 2, side: 'left', group: 'drive1' },
  { id: 'L1_INNER', label: 'L1 Inner', row: 2, side: 'left', group: 'drive1' },
  { id: 'R1_INNER', label: 'R1 Inner', row: 2, side: 'right', group: 'drive1' },
  { id: 'R1_OUTER', label: 'R1 Outer', row: 2, side: 'right', group: 'drive1' },
  
  { id: 'L2_OUTER', label: 'L2 Outer', row: 3, side: 'left', group: 'drive2' },
  { id: 'L2_INNER', label: 'L2 Inner', row: 3, side: 'left', group: 'drive2' },
  { id: 'R2_INNER', label: 'R2 Inner', row: 3, side: 'right', group: 'drive2' },
  { id: 'R2_OUTER', label: 'R2 Outer', row: 3, side: 'right', group: 'drive2' },
];
