const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM fastag_notifications ORDER BY created_at DESC LIMIT 50`
    );
    const [[{ unread }]] = await db.query(
      `SELECT COUNT(*) AS unread FROM fastag_notifications WHERE is_read = 0`
    );
    res.json({ success: true, data: rows, unread_count: unread });
  } catch (err) {
    console.error('GET FASTAG NOTIFICATIONS ERROR:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) AS count FROM fastag_notifications WHERE is_read = 0`
    );
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const markRead = async (req, res) => {
  try {
    await db.query(
      `UPDATE fastag_notifications SET is_read = 1 WHERE id = ?`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const markAllRead = async (req, res) => {
  try {
    await db.query(`UPDATE fastag_notifications SET is_read = 1`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getAll, getUnreadCount, markRead, markAllRead };
