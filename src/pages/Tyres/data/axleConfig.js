// ── Central Axle / Wheel Configuration ───────────────────────────────────────
// Each entry defines the visual axle rows and tyre position IDs for a wheel type.
// axles: array of { label, positions: [posId, ...] }
//   - single-item positions array  → single tyre per side (steer)
//   - two-item positions array     → dual tyre per side (drive)
// The layout renderer in TruckTyreLayoutModal reads this config dynamically.

export const WHEEL_CONFIGS = {
  '4 Wheeler': {
    totalTyres: 4,
    axleCount: 2,
    layoutType: '4x2',
    axles: [
      { label: 'Front Axle',  left: ['FL'],           right: ['FR'] },
      { label: 'Rear Axle',   left: ['RL'],            right: ['RR'] },
    ],
  },
  '6 Wheeler': {
    totalTyres: 6,
    axleCount: 2,
    layoutType: '6x2',
    axles: [
      { label: 'Steer Axle',  left: ['FL'],            right: ['FR'] },
      { label: 'Rear Axle',   left: ['RL1', 'RL2'],    right: ['RR1', 'RR2'] },
    ],
  },
  '8 Wheeler': {
    totalTyres: 8,
    axleCount: 2,
    layoutType: '8x4',
    axles: [
      { label: 'Steer Axle',  left: ['FL1', 'FL2'],    right: ['FR1', 'FR2'] },
      { label: 'Rear Axle',   left: ['RL1', 'RL2'],    right: ['RR1', 'RR2'] },
    ],
  },
  '10 Wheeler': {
    totalTyres: 10,
    axleCount: 3,
    layoutType: '10x4',
    axles: [
      { label: 'Steer Axle',   left: ['FL'],                right: ['FR'] },
      { label: 'Drive Axle 1', left: ['L1_OUTER', 'L1_INNER'], right: ['R1_INNER', 'R1_OUTER'] },
      { label: 'Drive Axle 2', left: ['L2_OUTER', 'L2_INNER'], right: ['R2_INNER', 'R2_OUTER'] },
    ],
  },
  '12 Wheeler': {
    totalTyres: 12,
    axleCount: 3,
    layoutType: '12x4',
    axles: [
      { label: 'Steer Axle',   left: ['FL1', 'FL2'],            right: ['FR1', 'FR2'] },
      { label: 'Drive Axle 1', left: ['L1_OUTER', 'L1_INNER'],  right: ['R1_INNER', 'R1_OUTER'] },
      { label: 'Drive Axle 2', left: ['L2_OUTER', 'L2_INNER'],  right: ['R2_INNER', 'R2_OUTER'] },
    ],
  },
  '14 Wheeler': {
    totalTyres: 14,
    axleCount: 4,
    layoutType: '14x4',
    axles: [
      { label: 'Steer Axle',   left: ['FL'],                    right: ['FR'] },
      { label: 'Drive Axle 1', left: ['L1_OUTER', 'L1_INNER'],  right: ['R1_INNER', 'R1_OUTER'] },
      { label: 'Drive Axle 2', left: ['L2_OUTER', 'L2_INNER'],  right: ['R2_INNER', 'R2_OUTER'] },
      { label: 'Tag Axle',     left: ['L3_OUTER', 'L3_INNER'],  right: ['R3_INNER', 'R3_OUTER'] },
    ],
  },
  '18 Wheeler Trailer': {
    totalTyres: 18,
    axleCount: 5,
    layoutType: 'Trailer Layout',
    axles: [
      { label: 'Steer Axle',     left: ['FL'],                    right: ['FR'] },
      { label: 'Drive Axle 1',   left: ['L1_OUTER', 'L1_INNER'],  right: ['R1_INNER', 'R1_OUTER'] },
      { label: 'Drive Axle 2',   left: ['L2_OUTER', 'L2_INNER'],  right: ['R2_INNER', 'R2_OUTER'] },
      { label: 'Trailer Axle 1', left: ['T1_OUTER', 'T1_INNER'],  right: ['T1R_INNER', 'T1R_OUTER'] },
      { label: 'Trailer Axle 2', left: ['T2_OUTER', 'T2_INNER'],  right: ['T2R_INNER', 'T2R_OUTER'] },
    ],
  },
};

export const WHEEL_CONFIG_OPTIONS = Object.keys(WHEEL_CONFIGS);

// Derive flat position list from a wheel config key
export function getPositions(wheelConfig) {
  const cfg = WHEEL_CONFIGS[wheelConfig];
  if (!cfg) return [];
  return cfg.axles.flatMap(a => [...a.left, ...a.right]);
}

// Human-readable label for a position ID
const POSITION_LABELS = {
  FL: 'Front Left', FR: 'Front Right',
  FL1: 'Front Left Outer', FL2: 'Front Left Inner',
  FR1: 'Front Right Inner', FR2: 'Front Right Outer',
  RL: 'Rear Left', RR: 'Rear Right',
  RL1: 'Rear Left 1', RL2: 'Rear Left 2',
  RR1: 'Rear Right 1', RR2: 'Rear Right 2',
  L1_OUTER: 'L1 Outer', L1_INNER: 'L1 Inner',
  R1_INNER: 'R1 Inner', R1_OUTER: 'R1 Outer',
  L2_OUTER: 'L2 Outer', L2_INNER: 'L2 Inner',
  R2_INNER: 'R2 Inner', R2_OUTER: 'R2 Outer',
  L3_OUTER: 'L3 Outer', L3_INNER: 'L3 Inner',
  R3_INNER: 'R3 Inner', R3_OUTER: 'R3 Outer',
  T1_OUTER: 'T1 Outer', T1_INNER: 'T1 Inner',
  T1R_INNER: 'T1R Inner', T1R_OUTER: 'T1R Outer',
  T2_OUTER: 'T2 Outer', T2_INNER: 'T2 Inner',
  T2R_INNER: 'T2R Inner', T2R_OUTER: 'T2R Outer',
};

export function posLabel(id) {
  return POSITION_LABELS[id] || id;
}
