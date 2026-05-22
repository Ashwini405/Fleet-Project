const express = require('express');
const router  = express.Router();
const { getAll, getUnreadCount, markRead, markAllRead } = require('../controllers/warrantyNotificationController');

router.get('/',             getAll);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all',   markAllRead);
router.patch('/:id/read',   markRead);

module.exports = router;
