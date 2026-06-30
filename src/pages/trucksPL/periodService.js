// ── Period Presets ─────────────────────────────────────────────────────────────
export const PERIOD_PRESETS = [
  { key: 'last30',    label: 'Last 30 Days'   },
  { key: 'thisMonth', label: 'This Month'     },
  { key: 'lastMonth', label: 'Last Month'     },
  { key: 'thisQtr',   label: 'This Quarter'   },
  { key: 'lastQtr',   label: 'Last Quarter'   },
  { key: 'thisYear',  label: 'This Year'      },
  { key: 'custom',    label: 'Custom Range'   },
];

// Returns { startDate: Date, endDate: Date } for a given preset key
export function resolvePeriod(key, customStart = null, customEnd = null) {
  const now   = new Date(2026, 5, 30); // anchor: 30-Jun-2026
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (key) {
    case 'last30': {
      const s = new Date(today); s.setDate(s.getDate() - 29);
      return { startDate: s, endDate: today };
    }
    case 'thisMonth':
      return {
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate:   new Date(today.getFullYear(), today.getMonth() + 1, 0),
      };
    case 'lastMonth':
      return {
        startDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        endDate:   new Date(today.getFullYear(), today.getMonth(), 0),
      };
    case 'thisQtr': {
      const qStart = Math.floor(today.getMonth() / 3) * 3;
      return {
        startDate: new Date(today.getFullYear(), qStart,     1),
        endDate:   new Date(today.getFullYear(), qStart + 3, 0),
      };
    }
    case 'lastQtr': {
      const qStart = Math.floor(today.getMonth() / 3) * 3 - 3;
      return {
        startDate: new Date(today.getFullYear(), qStart,     1),
        endDate:   new Date(today.getFullYear(), qStart + 3, 0),
      };
    }
    case 'thisYear':
      return {
        startDate: new Date(today.getFullYear(), 0,  1),
        endDate:   new Date(today.getFullYear(), 11, 31),
      };
    case 'custom':
      return {
        startDate: customStart ? new Date(customStart) : new Date(today.getFullYear(), today.getMonth(), 1),
        endDate:   customEnd   ? new Date(customEnd)   : today,
      };
    default:
      return { startDate: new Date(today.getFullYear(), today.getMonth(), 1), endDate: today };
  }
}

// How many days in a period
export function periodDays(startDate, endDate) {
  return Math.max(1, Math.round((endDate - startDate) / 86400000) + 1);
}

// Human-readable date label  "01 Jun 2026"
export function fmtDate(d) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Returns a display string for the period strip
export function periodDisplay(key, startDate, endDate) {
  const label = PERIOD_PRESETS.find(p => p.key === key)?.label || 'Custom Range';
  const range = `${fmtDate(startDate)} → ${fmtDate(endDate)}`;
  return { label, range };
}
