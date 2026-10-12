const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/supervisorWalletController');
const upload = require('../config/multer');
const { protect } = require('../middleware/permissionMiddleware');

router.get('/', ...protect('Supervisor Wallet', 'view'), ctrl.getWallets);
router.get('/:id/statement', ...protect('Supervisor Wallet', 'view'), ctrl.getStatement);
router.post('/:id/add-money', ...protect('Supervisor Wallet', 'create'), ctrl.addMoney);
router.post('/:id/expense', ...protect('Supervisor Wallet', 'create'), upload.single('bill'), ctrl.recordExpense);
router.post('/:id/adjust', ...protect('Supervisor Wallet', 'edit'), ctrl.adjust);

module.exports = router;
