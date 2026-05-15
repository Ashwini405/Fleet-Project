/**
 * axleLayouts.js — Single source of truth for all vehicle axle configurations.
 *
 * Structure per layout:
 *   label         — display name
 *   totalTyres    — total fitted tyre slots (excludes spare)
 *   axleCount     — number of physical axles
 *   layoutType    — drive notation (e.g. "6x4")
 *   color         — Tailwind badge classes for UI chips
 *   axles[]       — ordered front-to-rear axle rows, each containing:
 *       label     — human-readable axle name
 *       type      — "steer" | "drive" | "tag" | "trailer" | "rear"
 *       left[]    — position IDs on the left side (outer → inner)
 *       right[]   — position IDs on the right side (inner → outer)
 *
 * Position ID conventions:
 *   Single tyre per side  → FL / FR / RL / RR
 *   Dual tyre per side    → {side}{axleNum}_OUTER / {side}{axleNum}_INNER
 *   Trailer axles         → T{n}L_OUTER / T{n}L_INNER / T{n}R_INNER / T{n}R_OUTER
 */

export const axleLayouts = {

  // ── 4 Wheeler ──────────────────────────────────────────────────────────────
  // 1 steer axle (single) + 1 rear axle (single) = 4 tyres
  '4 Wheeler': {
    label: '4 Wheeler',
    totalTyres: 4,
    axleCount: 2,
    layoutType: '4x2',
    color: 'text-slate-600 bg-slate-50 ring-slate-200',
    axles: [
      { label: 'Front Axle', type: 'steer', left: ['FL'],  right: ['FR']  },
      { label: 'Rear Axle',  type: 'rear',  left: ['RL'],  right: ['RR']  },
    ],
  },

  // ── 6 Wheeler ──────────────────────────────────────────────────────────────
  // 1 steer axle (single) + 1 rear axle (dual) = 2 + 4 = 6 tyres
  '6 Wheeler': {
    label: '6 Wheeler',
    totalTyres: 6,
    axleCount: 2,
    layoutType: '6x2',
    color: 'text-blue-600 bg-blue-50 ring-blue-200',
    axles: [
      { label: 'Steer Axle', type: 'steer', left: ['FL'],              right: ['FR']              },
      { label: 'Rear Axle',  type: 'drive', left: ['L1_OUTER', 'L1_INNER'], right: ['R1_INNER', 'R1_OUTER'] },
    ],
  },

  // ── 8 Wheeler ──────────────────────────────────────────────────────────────
  // 1 steer axle (dual) + 1 rear axle (dual) = 4 + 4 = 8 tyres
  '8 Wheeler': {
    label: '8 Wheeler',
    totalTyres: 8,
    axleCount: 2,
    layoutType: '8x4',
    color: 'text-teal-600 bg-teal-50 ring-teal-200',
    axles: [
      { label: 'Steer Axle', type: 'steer', left: ['FL_OUTER', 'FL_INNER'], right: ['FR_INNER', 'FR_OUTER'] },
      { label: 'Rear Axle',  type: 'drive', left: ['L1_OUTER', 'L1_INNER'], right: ['R1_INNER', 'R1_OUTER'] },
    ],
  },

  // ── 10 Wheeler ─────────────────────────────────────────────────────────────
  // 1 steer axle (single) + 2 drive axles (dual each) = 2 + 4 + 4 = 10 tyres
  '10 Wheeler': {
    label: '10 Wheeler',
    totalTyres: 10,
    axleCount: 3,
    layoutType: '10x4',
    color: 'text-emerald-600 bg-emerald-50 ring-emerald-200',
    axles: [
      { label: 'Steer Axle',   type: 'steer', left: ['FL'],                   right: ['FR']                   },
      { label: 'Drive Axle 1', type: 'drive', left: ['L1_OUTER', 'L1_INNER'], right: ['R1_INNER', 'R1_OUTER'] },
      { label: 'Drive Axle 2', type: 'drive', left: ['L2_OUTER', 'L2_INNER'], right: ['R2_INNER', 'R2_OUTER'] },
    ],
  },

  // ── 12 Wheeler ─────────────────────────────────────────────────────────────
  // 2 steer axles (single each) + 2 drive axles (dual each) = 2 + 2 + 4 + 4 = 12 tyres
  '12 Wheeler': {
    label: '12 Wheeler',
    totalTyres: 12,
    axleCount: 4,
    layoutType: '12x4',
    color: 'text-violet-600 bg-violet-50 ring-violet-200',
    axles: [
      { label: 'Steer Axle 1', type: 'steer', left: ['FL'],                   right: ['FR']                   },
      { label: 'Steer Axle 2', type: 'steer', left: ['FL2'],                  right: ['FR2']                  },
      { label: 'Drive Axle 1', type: 'drive', left: ['L1_OUTER', 'L1_INNER'], right: ['R1_INNER', 'R1_OUTER'] },
      { label: 'Drive Axle 2', type: 'drive', left: ['L2_OUTER', 'L2_INNER'], right: ['R2_INNER', 'R2_OUTER'] },
    ],
  },

  // ── 14 Wheeler ─────────────────────────────────────────────────────────────
  // 1 steer (single) + 2 drive (dual) + 1 tag axle (dual) = 2 + 4 + 4 + 4 = 14 tyres
  '14 Wheeler': {
    label: '14 Wheeler',
    totalTyres: 14,
    axleCount: 4,
    layoutType: '14x4',
    color: 'text-amber-600 bg-amber-50 ring-amber-200',
    axles: [
      { label: 'Steer Axle',   type: 'steer', left: ['FL'],                   right: ['FR']                   },
      { label: 'Drive Axle 1', type: 'drive', left: ['L1_OUTER', 'L1_INNER'], right: ['R1_INNER', 'R1_OUTER'] },
      { label: 'Drive Axle 2', type: 'drive', left: ['L2_OUTER', 'L2_INNER'], right: ['R2_INNER', 'R2_OUTER'] },
      { label: 'Tag Axle',     type: 'tag',   left: ['L3_OUTER', 'L3_INNER'], right: ['R3_INNER', 'R3_OUTER'] },
    ],
  },

  // ── 18 Wheeler Trailer ─────────────────────────────────────────────────────
  // 1 steer (single) + 2 drive (dual) + 4 trailer axles (dual each)
  // = 2 + 4 + 4 + 4 + 4 = 18 tyres
  '18 Wheeler Trailer': {
    label: '18 Wheeler Trailer',
    totalTyres: 18,
    axleCount: 5,
    layoutType: 'Trailer Layout',
    color: 'text-orange-600 bg-orange-50 ring-orange-200',
    axles: [
      { label: 'Steer Axle',     type: 'steer',   left: ['FL'],                     right: ['FR']                     },
      { label: 'Drive Axle 1',   type: 'drive',   left: ['L1_OUTER', 'L1_INNER'],   right: ['R1_INNER', 'R1_OUTER']   },
      { label: 'Drive Axle 2',   type: 'drive',   left: ['L2_OUTER', 'L2_INNER'],   right: ['R2_INNER', 'R2_OUTER']   },
      { label: 'Trailer Axle 1', type: 'trailer', left: ['T1L_OUTER', 'T1L_INNER'], right: ['T1R_INNER', 'T1R_OUTER'] },
      { label: 'Trailer Axle 2', type: 'trailer', left: ['T2L_OUTER', 'T2L_INNER'], right: ['T2R_INNER', 'T2R_OUTER'] },
    ],
  },
};

// ── Dropdown options ──────────────────────────────────────────────────────────
export const WHEEL_CONFIG_OPTIONS = Object.keys(axleLayouts);

// ── Flat position list derived from layout ────────────────────────────────────
export function getPositions(wheelConfig) {
  const layout = axleLayouts[wheelConfig];
  if (!layout) return [];
  return layout.axles.flatMap(axle => [...axle.left, ...axle.right]);
}

// ── Human-readable label for any position ID ─────────────────────────────────
const POSITION_LABELS = {
  // Steer — single
  FL: 'Front Left',        FR: 'Front Right',
  FL2: 'Front Left 2',     FR2: 'Front Right 2',
  // Steer — dual (8 Wheeler)
  FL_OUTER: 'Front Left Outer',  FL_INNER: 'Front Left Inner',
  FR_INNER: 'Front Right Inner', FR_OUTER: 'Front Right Outer',
  // Rear — single
  RL: 'Rear Left',         RR: 'Rear Right',
  // Rear — dual (6 Wheeler)
  L1_OUTER: 'Axle 1 Left Outer',  L1_INNER: 'Axle 1 Left Inner',
  R1_INNER: 'Axle 1 Right Inner', R1_OUTER: 'Axle 1 Right Outer',
  // Drive axle 2
  L2_OUTER: 'Axle 2 Left Outer',  L2_INNER: 'Axle 2 Left Inner',
  R2_INNER: 'Axle 2 Right Inner', R2_OUTER: 'Axle 2 Right Outer',
  // Tag axle (14W)
  L3_OUTER: 'Axle 3 Left Outer',  L3_INNER: 'Axle 3 Left Inner',
  R3_INNER: 'Axle 3 Right Inner', R3_OUTER: 'Axle 3 Right Outer',
  // Trailer axles (18W)
  T1L_OUTER: 'Trailer 1 Left Outer',  T1L_INNER: 'Trailer 1 Left Inner',
  T1R_INNER: 'Trailer 1 Right Inner', T1R_OUTER: 'Trailer 1 Right Outer',
  T2L_OUTER: 'Trailer 2 Left Outer',  T2L_INNER: 'Trailer 2 Left Inner',
  T2R_INNER: 'Trailer 2 Right Inner', T2R_OUTER: 'Trailer 2 Right Outer',
};

export function posLabel(posId) {
  return POSITION_LABELS[posId] || posId;
}

// ── Axle type badge styles ────────────────────────────────────────────────────
export const AXLE_TYPE_STYLES = {
  steer:   'bg-sky-50 text-sky-700 border-sky-200',
  drive:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  tag:     'bg-amber-50 text-amber-700 border-amber-200',
  trailer: 'bg-orange-50 text-orange-700 border-orange-200',
  rear:    'bg-slate-50 text-slate-700 border-slate-200',
};
