const db = require('../config/db');

// Milestone days that trigger a notification
const REMINDER_DAYS = [30, 15, 7, 0];

/**
 * Calculate days remaining until end_date (negative = already expired).
 */
function daysLeft(endDate) {
  const end   = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
}

/**
 * Derive the correct warranty_status string from days remaining.
 */
function calcStatus(days) {
  if (days <= 0)  return 'Expired';
  if (days <= 30) return 'Expiring Soon';
  return 'Active';
}

/**
 * Build a human-readable notification message.
 */
function buildMessage(warranty, days) {
  const label   = warranty.category || 'Item';
  const vehicle = warranty.vehicle_no || 'Unknown Vehicle';
  if (days <= 0)  return `${label} warranty for vehicle ${vehicle} has expired.`;
  if (days === 1) return `${label} warranty for vehicle ${vehicle} expires tomorrow.`;
  return `${label} warranty for vehicle ${vehicle} expires in ${days} day${days !== 1 ? 's' : ''}.`;
}

/**
 * Determine severity based on days remaining.
 */
function calcSeverity(days) {
  if (days <= 0)  return 'Critical';
  if (days <= 7)  return 'High';
  if (days <= 15) return 'Medium';
  return 'Low';
}

/**
 * Insert a warranty notification only if one for the same
 * warranty_id + milestone_days doesn't already exist today.
 */
async function createWarrantyNotification(warranty, days) {
  const milestone = REMINDER_DAYS.find(m => days <= m && days > (m === 30 ? 30 : m - 1));
  // Normalise: bucket into nearest milestone
  const bucket = days <= 0 ? 0 : days <= 7 ? 7 : days <= 15 ? 15 : 30;

  // Duplicate check: same warranty + same bucket + created today
  const [existing] = await db.query(
    `SELECT id FROM warranty_notifications
     WHERE warranty_id = ? AND milestone_days = ? AND DATE(created_at) = CURDATE()`,
    [warranty.id, bucket]
  );
  if (existing.length > 0) return null; // already sent today

  const severity = calcSeverity(days);
  const message  = buildMessage(warranty, days);
  const title    = days <= 0
    ? `Warranty Expired — ${warranty.vehicle_no || warranty.category}`
    : `Warranty Expiring Soon — ${warranty.vehicle_no || warranty.category}`;

  const [result] = await db.query(
    `INSERT INTO warranty_notifications
     (warranty_id, warranty_number, vehicle_no, category, title, message, severity, milestone_days)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [warranty.id, warranty.warranty_number, warranty.vehicle_no,
     warranty.category, title, message, severity, bucket]
  );
  return result.insertId;
}

module.exports = { daysLeft, calcStatus, calcSeverity, buildMessage, createWarrantyNotification, REMINDER_DAYS };
