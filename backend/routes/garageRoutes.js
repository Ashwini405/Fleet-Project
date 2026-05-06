const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET ALL GARAGES
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM garages');

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error("GARAGE ERROR:", error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;