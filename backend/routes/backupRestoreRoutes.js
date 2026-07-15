const express = require("express");

const router = express.Router();

const backupRestoreController = require("../controllers/backupRestoreController");
const { protect } = require("../middleware/permissionMiddleware");

/* ===========================================================
   CREATE BACKUP
=========================================================== */

router.post(
    "/create",
    ...protect("Backup & Restore", "create"),
    backupRestoreController.createBackup
);

/* ===========================================================
   GET ALL BACKUPS
=========================================================== */

router.get(
    "/",
    ...protect("Backup & Restore", "view"),
    backupRestoreController.getAllBackups
);

/* ===========================================================
   DASHBOARD
=========================================================== */

router.get(
    "/dashboard",
    ...protect("Backup & Restore", "view"),
    backupRestoreController.getDashboardCounts
);

/* ===========================================================
   TIMELINE
=========================================================== */

router.get(
    "/timeline",
    ...protect("Backup & Restore", "view"),
    backupRestoreController.getTimeline
);

/* ===========================================================
   SETTINGS
=========================================================== */

router.get(
    "/settings",
    ...protect("Backup & Restore", "view"),
    backupRestoreController.getSettings
);

router.put(
    "/settings",
    ...protect("Backup & Restore", "edit"),
    backupRestoreController.updateSettings
);

/* ===========================================================
   DOWNLOAD BACKUP
=========================================================== */

router.get(
    "/download/:id",
    ...protect("Backup & Restore", "export"),
    backupRestoreController.downloadBackup
);

/* ===========================================================
   VERIFY BACKUP
=========================================================== */

router.get(
    "/verify/:id",
    ...protect("Backup & Restore", "view"),
    backupRestoreController.verifyBackup
);

/* ===========================================================
   RESTORE BACKUP
=========================================================== */

router.post(
    "/restore/:id",
    ...protect("Backup & Restore", "edit"),
    backupRestoreController.restoreBackup
);

/* ===========================================================
   GET SINGLE BACKUP
=========================================================== */

// ── MOVED HERE: To prevent "download" and "verify" being treated as :id ──
router.get(
    "/:id",
    ...protect("Backup & Restore", "view"),
    backupRestoreController.getBackupById
);

/* ===========================================================
   DELETE BACKUP
=========================================================== */

router.delete(
    "/:id",
    ...protect("Backup & Restore", "delete"),
    backupRestoreController.deleteBackup
);

module.exports = router;