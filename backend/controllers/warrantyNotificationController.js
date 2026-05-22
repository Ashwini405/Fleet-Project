const db = require('../config/db');

// GET all warranty notifications (latest 50)
const getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM warranty_notifications ORDER BY created_at DESC LIMIT 50`
    );
    const [[{ unread }]] = await db.query(
      `SELECT COUNT(*) AS unread FROM warranty_notifications WHERE is_read = 0`
    );
    res.json({ success: true, data: rows, unread_count: unread });
  } catch (err) {
    console.error('GET WARRANTY NOTIFICATIONS ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET unread count only
const getUnreadCount = async (req, res) => {
  try {
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) AS count FROM warranty_notifications WHERE is_read = 0`
    );
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PATCH mark single notification as read
const markRead = async (req, res) => {
  try {
    await db.query(
      `UPDATE warranty_notifications SET is_read = 1 WHERE id = ?`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PATCH mark all as read
const markAllRead = async (req, res) => {
  try {
    await db.query(`UPDATE warranty_notifications SET is_read = 1`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getAll, getUnreadCount, markRead, markAllRead };
