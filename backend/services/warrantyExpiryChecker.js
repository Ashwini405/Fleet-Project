const db = require('../config/db');
const { daysLeft, calcStatus, createWarrantyNotification, REMINDER_DAYS } = require('./notificationService');

/**
 * Core logic — runs the expiry check and status update.
 * Separated so it can also be called immediately on server start.
 */
async function runExpiryCheck() {
  console.log('[WarrantyChecker] Running expiry check...');
  try {
    const [warranties] = await db.query(
      `SELECT id, warranty_number, category, vehicle_no, end_date, warranty_status
       FROM warranties WHERE end_date IS NOT NULL`
    );

    let updated = 0;
    let notified = 0;

    for (const w of warranties) {
      const days      = daysLeft(w.end_date);
      const newStatus = calcStatus(days);

      // Auto-update status if it changed
      if (w.warranty_status !== newStatus) {
        await db.query(
          'UPDATE warranties SET warranty_status = ? WHERE id = ?',
          [newStatus, w.id]
        );
        updated++;
      }

      // Generate notification only at milestone thresholds (30, 15, 7, 0 days)
      const shouldNotify = days <= 0 || REMINDER_DAYS.includes(days);
      if (shouldNotify) {
        const id = await createWarrantyNotification(w, days);
        if (id) notified++;
      }
    }

    console.log(`[WarrantyChecker] Done — ${updated} status updates, ${notified} notifications created.`);
  } catch (err) {
    console.error('[WarrantyChecker] ERROR:', err.message);
  }
}

/**
 * Register a daily interval and run once on startup.
 * Checks every 24 hours — no external package needed.
 */
function startWarrantyExpiryChecker() {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(runExpiryCheck, TWENTY_FOUR_HOURS);
  console.log('[WarrantyChecker] Scheduled — every 24 hours');

  // Run immediately on server start to catch any missed updates
  runExpiryCheck();
}

module.exports = { startWarrantyExpiryChecker, runExpiryCheck };
