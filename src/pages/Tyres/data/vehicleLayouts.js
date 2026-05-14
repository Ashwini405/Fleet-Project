// Each axle: { name, left: [posIds], right: [posIds] }
// left/right arrays drive the TyreBlock groups on each side of the axle shaft.

export const VEHICLE_LAYOUTS = {

  truck_6: {
    label: '6 Wheeler',
    color: 'text-blue-600 bg-blue-50 ring-blue-200',
    axles: [
      { name: 'Steer Axle',  left: ['FL'],                  right: ['FR']                  },
      { name: 'Drive Axle',  left: ['L1_OUTER', 'L1_INNER'], right: ['R1_INNER', 'R1_OUTER'] },
    ],
  },

  truck_10: {
    label: '10 Wheeler',
    color: 'text-emerald-600 bg-emerald-50 ring-emerald-200',
    axles: [
      { name: 'Steer Axle',    left: ['FL'],                  right: ['FR']                  },
      { name: 'Drive Axle 1',  left: ['L1_OUTER', 'L1_INNER'], right: ['R1_INNER', 'R1_OUTER'] },
      { name: 'Drive Axle 2',  left: ['L2_OUTER', 'L2_INNER'], right: ['R2_INNER', 'R2_OUTER'] },
    ],
  },

  truck_12: {
    label: '12 Wheeler',
    color: 'text-violet-600 bg-violet-50 ring-violet-200',
    axles: [
      { name: 'Steer Axle 1',  left: ['FL'],                  right: ['FR']                  },
      { name: 'Steer Axle 2',  left: ['FL2'],                 right: ['FR2']                 },
      { name: 'Drive Axle 1',  left: ['L1_OUTER', 'L1_INNER'], right: ['R1_INNER', 'R1_OUTER'] },
      { name: 'Drive Axle 2',  left: ['L2_OUTER', 'L2_INNER'], right: ['R2_INNER', 'R2_OUTER'] },
    ],
  },

  trailer: {
    label: 'Trailer',
    color: 'text-orange-600 bg-orange-50 ring-orange-200',
    axles: [
      { name: 'Steer Axle',      left: ['FL'],                  right: ['FR']                  },
      { name: 'Drive Axle 1',    left: ['L1_OUTER', 'L1_INNER'], right: ['R1_INNER', 'R1_OUTER'] },
      { name: 'Drive Axle 2',    left: ['L2_OUTER', 'L2_INNER'], right: ['R2_INNER', 'R2_OUTER'] },
      { name: 'Trailer Axle 1',  left: ['TL1_OUTER', 'TL1_INNER'], right: ['TR1_INNER', 'TR1_OUTER'] },
      { name: 'Trailer Axle 2',  left: ['TL2_OUTER', 'TL2_INNER'], right: ['TR2_INNER', 'TR2_OUTER'] },
    ],
  },

  tanker: {
    label: 'Tanker',
    color: 'text-cyan-600 bg-cyan-50 ring-cyan-200',
    axles: [
      { name: 'Steer Axle',   left: ['FL'],                  right: ['FR']                  },
      { name: 'Drive Axle 1', left: ['L1_OUTER', 'L1_INNER'], right: ['R1_INNER', 'R1_OUTER'] },
      { name: 'Drive Axle 2', left: ['L2_OUTER', 'L2_INNER'], right: ['R2_INNER', 'R2_OUTER'] },
    ],
  },

  bus: {
    label: 'Bus',
    color: 'text-pink-600 bg-pink-50 ring-pink-200',
    axles: [
      { name: 'Front Axle', left: ['FL'], right: ['FR'] },
      { name: 'Rear Axle',  left: ['RL'], right: ['RR'] },
    ],
  },
};

// Flat position label map for all possible positions
export const POSITION_LABELS = {
  FL: 'Front Left',   FR: 'Front Right',
  FL2: 'Front Left 2', FR2: 'Front Right 2',
  RL: 'Rear Left',    RR: 'Rear Right',
  L1_OUTER: 'L1 Outer', L1_INNER: 'L1 Inner',
  R1_INNER: 'R1 Inner', R1_OUTER: 'R1 Outer',
  L2_OUTER: 'L2 Outer', L2_INNER: 'L2 Inner',
  R2_INNER: 'R2 Inner', R2_OUTER: 'R2 Outer',
  TL1_OUTER: 'TL1 Outer', TL1_INNER: 'TL1 Inner',
  TR1_INNER: 'TR1 Inner', TR1_OUTER: 'TR1 Outer',
  TL2_OUTER: 'TL2 Outer', TL2_INNER: 'TL2 Inner',
  TR2_INNER: 'TR2 Inner', TR2_OUTER: 'TR2 Outer',
};

export const getLayout = (vehicleType) =>
  VEHICLE_LAYOUTS[vehicleType] || VEHICLE_LAYOUTS['truck_10'];
