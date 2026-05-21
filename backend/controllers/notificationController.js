const db = require('../config/db');

// ── severity → priority map ───────────────────────────────────────────────────
const PRIORITY_MAP = { Low: 'Low', Medium: 'Normal', High: 'High', Critical: 'Urgent' };

// ── incident type → severity map ─────────────────────────────────────────────
const INCIDENT_SEVERITY = {
  'Low Tyre Pressure': 'Medium',
  'Tyre Burst':        'Critical',
  'Sidewall Damage':   'High',
  'Uneven Wear':       'Low',
  'Puncture':          'High',
  'Overheating':       'Critical',
};

// ── build human-readable message ─────────────────────────────────────────────
function buildMessage(incidentType, vehicleNumber, axlePosition, severity) {
  const pos = axlePosition ? `${axlePosition} ` : '';
  const truck = vehicleNumber || 'Unknown Vehicle';
  if (severity === 'Critical') return `Critical: ${incidentType} detected on ${pos}tyre — Truck ${truck}`;
  if (severity === 'High')     return `Alert: ${pos}${incidentType} on Truck ${truck}`;
  return `${pos}${incidentType} reported on Truck ${truck}`;
}

// ── GET all notifications (with optional filters) ────────────────────────────
const getAll = async (req, res) => {
  try {
    const { severity, vehicle, status, limit = 50 } = req.query;
    let sql = 'SELECT * FROM tyre_notifications WHERE 1=1';
    const params = [];
    if (severity) { sql += ' AND severity = ?';        params.push(severity); }
    if (vehicle)  { sql += ' AND vehicle_number = ?';  params.push(vehicle);  }
    if (status)   { sql += ' AND status = ?';          params.push(status);   }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));
    const [rows] = await db.query(sql, params);
    const [[{ unread }]] = await db.query(
      "SELECT COUNT(*) AS unread FROM tyre_notifications WHERE status = 'Unread'"
    );
    res.json({ success: true, data: rows, unread_count: unread });
  } catch (err) {
    console.error('GET NOTIFICATIONS ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ── GET unread count only ─────────────────────────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) AS count FROM tyre_notifications WHERE status = 'Unread'"
    );
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ── MARK single notification as read ─────────────────────────────────────────
const markRead = async (req, res) => {
  try {
    await db.query(
      "UPDATE tyre_notifications SET status = 'Read' WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ── MARK ALL as read ──────────────────────────────────────────────────────────
const markAllRead = async (req, res) => {
  try {
    await db.query("UPDATE tyre_notifications SET status = 'Read'");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ── CREATE notification manually ─────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const n = await createNotification(req.body);
    res.status(201).json({ success: true, data: n });
  } catch (err) {
    console.error('CREATE NOTIFICATION ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ── DELETE notification ───────────────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    await db.query('DELETE FROM tyre_notifications WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ── INTERNAL helper — called from incident/tyre service controllers ───────────
async function createNotification({ vehicle_number, tyre_id, axle_position, incident_type, severity, message }) {
  const sev      = severity || INCIDENT_SEVERITY[incident_type] || 'Medium';
  const priority = PRIORITY_MAP[sev] || 'Normal';
  const msg      = message || buildMessage(incident_type, vehicle_number, axle_position, sev);
  const notifId  = `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  await db.query(
    `INSERT INTO tyre_notifications
     (notification_id, vehicle_number, tyre_id, axle_position, incident_type, severity, priority, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Unread')`,
    [notifId, vehicle_number || null, tyre_id || null, axle_position || null,
     incident_type, sev, priority, msg]
  );
  return { notification_id: notifId, severity: sev, priority, message: msg };
}

// ── SYNC existing tyre incidents that have no notification yet ───────────────
const syncExisting = async (req, res) => {
  try {
    const TYRE_TYPES = [
      'Tyre Burst','Puncture','Low Tyre Pressure',
      'Sidewall Damage','Uneven Wear','Overheating','Tyre Issue'
    ];

    const placeholders = TYRE_TYPES.map(() => '?').join(',');
    const [incidents] = await db.query(
      `SELECT * FROM incidents WHERE incident_type IN (${placeholders}) ORDER BY created_at ASC`,
      TYRE_TYPES
    );

    // Get already-synced incident_numbers to avoid duplicates
    const [existing] = await db.query(
      `SELECT tyre_id FROM tyre_notifications WHERE tyre_id IS NOT NULL`
    );
    const syncedIds = new Set(existing.map(e => e.tyre_id));

    let created = 0;
    for (const inc of incidents) {
      // Use incident_number as tyre_id to track which incidents were synced
      if (syncedIds.has(inc.incident_number)) continue;

      const sev = inc.severity || INCIDENT_SEVERITY[inc.incident_type] || 'Medium';
      await createNotification({
        vehicle_number: inc.vehicle_no,
        tyre_id:        inc.incident_number,   // store incident ref
        axle_position:  inc.tyre_position || null,
        incident_type:  inc.incident_type,
        severity:       sev,
      });
      created++;
    }

    res.json({ success: true, synced: created, message: `${created} notification(s) created` });
  } catch (err) {
    console.error('SYNC ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getUnreadCount, markRead, markAllRead, create, remove, createNotification, syncExisting };
