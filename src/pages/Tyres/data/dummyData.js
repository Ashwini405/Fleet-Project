export const dummyTrucks = [
  { id: 'AP91 TB 9602', model: 'Tata Prima 5530',    totalTyres: 10, vehicleType: 'truck_10', recentChanges: 'No Recent Changes', currentOdo: 78500, tyreSize: '295/90R20' },
  { id: 'AP79 TB 6578', model: 'Ashok Leyland 1616', totalTyres: 6,  vehicleType: 'truck_6',  recentChanges: 'No Recent Changes', currentOdo: 54200, tyreSize: '295/90R20' },
  { id: 'AP29 TB 9293', model: 'Tata LPT 3118',      totalTyres: 12, vehicleType: 'truck_12', recentChanges: '1 Tyre Replaced',   currentOdo: 91300, tyreSize: '295/90R20' },
  { id: 'AP88 TB 9146', model: 'Volvo FH16 Trailer',  totalTyres: 18, vehicleType: 'trailer',  recentChanges: '2 Tyres Replaced',  currentOdo: 63750, tyreSize: '315/80R22.5' },
  { id: 'AP55 TB 1234', model: 'TATA Starbus Ultra',  totalTyres: 6,  vehicleType: 'bus',      recentChanges: 'No Recent Changes', currentOdo: 42100, tyreSize: '295/90R20' },
  { id: 'AP33 TB 5678', model: 'Tata LPT 2518 Tanker',totalTyres: 10, vehicleType: 'tanker',   recentChanges: 'No Recent Changes', currentOdo: 31200, tyreSize: '295/90R20' },
];

export const dummyActiveTyres = [
  { id: 'T-3457', truckNo: 'AP91 TB 9602', make: 'Ceat',     model: 'Milaze',    fittedDate: '2025-09-17', fittedOdo: 23892, presentOdo: 34210, expectedLife: 100000, material: 'Radial Steel', vendor: 'Tyre World',   position: 'FL',       health: 'Good'   },
  { id: 'T-9237', truckNo: 'AP91 TB 9602', make: 'Apollo',   model: 'Alnac',     fittedDate: '2024-12-30', fittedOdo: 59662, presentOdo: 78119, expectedLife: 100000, material: 'Radial Steel', vendor: 'Tyre World',   position: 'FR',       health: 'Medium' },
  { id: 'T-4685', truckNo: 'AP91 TB 9602', make: 'MRF',      model: 'Zapper',    fittedDate: '2025-02-03', fittedOdo: 30072, presentOdo: 31092, expectedLife: 100000, material: 'Nylon',        vendor: 'Highway Auth', position: 'L1_OUTER', health: 'Good'   },
  { id: 'T-7717', truckNo: 'AP91 TB 9602', make: 'JK Tyre',  model: 'UX Royale', fittedDate: '2025-10-28', fittedOdo: 42582, presentOdo: 51771, expectedLife: 80000,  material: 'Radial Steel', vendor: 'Global Tyres', position: 'L1_INNER', health: 'Good'   },
  { id: 'T-5547', truckNo: 'AP91 TB 9602', make: 'Ceat',     model: 'Milaze',    fittedDate: '2025-04-11', fittedOdo: 26207, presentOdo: 44400, expectedLife: 100000, material: 'Radial Steel', vendor: 'Tyre World',   position: 'R1_INNER', health: 'Medium' },
  { id: 'T-6857', truckNo: 'AP91 TB 9602', make: 'Ceat',     model: 'Milaze',    fittedDate: '2025-08-28', fittedOdo: 46980, presentOdo: 62500, expectedLife: 80000,  material: 'Radial Steel', vendor: 'Tyre World',   position: 'R1_OUTER', health: 'Medium' },
  { id: 'T-3510', truckNo: 'AP91 TB 9602', make: 'Apollo',   model: 'EnduRace',  fittedDate: '2025-05-21', fittedOdo: 45268, presentOdo: 55295, expectedLife: 100000, material: 'Radial Steel', vendor: 'Highway Auth', position: 'L2_OUTER', health: 'Good'   },
];

export const dummyStockTyres = [
  { id: 'S-1021', make: 'Apollo',      model: 'EnduRace',  tyreSize: '295/90R20',   material: 'Radial',          vendor: 'Apollo Dealer',   purchaseDate: '2025-03-10', cost: 14500 },
  { id: 'S-1022', make: 'MRF',         model: 'Milaze',    tyreSize: '12R22.5',     material: 'Radial Tubeless', vendor: 'MRF Distributor', purchaseDate: '2025-04-22', cost: 13800 },
  { id: 'S-1023', make: 'Ceat',        model: 'Winmile',   tyreSize: '295/90R20',   material: 'Radial',          vendor: 'Tyre World',      purchaseDate: '2025-05-01', cost: 12900 },
  { id: 'S-1024', make: 'Bridgestone', model: 'R154',      tyreSize: '315/80R22.5', material: 'Radial Tubeless', vendor: 'Global Tyres',    purchaseDate: '2025-06-15', cost: 18200 },
  { id: 'S-1025', make: 'JK Tyre',     model: 'Jet Xtra',  tyreSize: '295/90R20',   material: 'Radial',          vendor: 'Highway Auth',    purchaseDate: '2025-07-03', cost: 13100 },
];

export const dummyOldTyres = [
  { tyreNo: 'OLD-3065', make: 'MRF',     model: 'Zapper',   tyreSize: '295/90R20',   material: 'Radial', vehicleNo: 'AP51 TB 9816', lastPosition: 'FL',       removedDate: '2024-03-10', runningKm: 120000, expectedLife: 100000, remainingTread: 5,  removalReason: 'Worn Out',   condition: 'Poor',   storeLocation: 'Scrap Yard',       status: 'SCRAP',      notes: '' },
  { tyreNo: 'OLD-6703', make: 'Apollo',  model: 'EnduRace', tyreSize: '315/80R22.5', material: 'Radial', vehicleNo: 'AP21 TB 9393', lastPosition: 'FR',       removedDate: '2024-06-22', runningKm: 42000,  expectedLife: 100000, remainingTread: 55, removalReason: 'Rotation',   condition: 'Good',   storeLocation: 'Reusable Storage', status: 'REUSABLE',   notes: 'Good condition, suitable for remount' },
  { tyreNo: 'OLD-5146', make: 'Ceat',    model: 'Milaze',   tyreSize: '12R22.5',     material: 'Radial', vehicleNo: 'AP59 TB 9721', lastPosition: 'L1_OUTER', removedDate: '2024-05-15', runningKm: 60000,  expectedLife: 100000, remainingTread: 28, removalReason: 'Retreading', condition: 'Medium', storeLocation: 'Retreading Area',  status: 'RETREADING', notes: '' },
  { tyreNo: 'OLD-3091', make: 'JK Tyre', model: 'Jet Xtra', tyreSize: '295/90R20',   material: 'Radial', vehicleNo: 'AP45 TB 2483', lastPosition: 'R1_OUTER', removedDate: '2024-01-08', runningKm: 115000, expectedLife: 100000, remainingTread: 3,  removalReason: 'Burst',      condition: 'Poor',   storeLocation: 'Scrap Yard',       status: 'SCRAP',      notes: '' },
  { tyreNo: 'OLD-7821', make: 'Bridgestone', model: 'R154', tyreSize: '315/80R22.5', material: 'Radial', vehicleNo: 'AP88 TB 9146', lastPosition: 'L2_INNER', removedDate: '2024-08-30', runningKm: 48000,  expectedLife: 100000, remainingTread: 62, removalReason: 'Rotation',   condition: 'Good',   storeLocation: 'Reusable Storage', status: 'REUSABLE',   notes: 'Low mileage, excellent condition' },
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
