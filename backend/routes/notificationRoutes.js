const express = require('express');
const router  = express.Router();
const {
  getAll, getUnreadCount, markRead, markAllRead, create, remove, syncExisting
} = require('../controllers/notificationController');

router.get('/',              getAll);
router.get('/unread-count',  getUnreadCount);
router.post('/',             create);
router.post('/sync',         syncExisting);   // one-time backfill
router.patch('/read-all',    markAllRead);
router.patch('/:id/read',    markRead);
router.delete('/:id',        remove);

module.exports = router;
