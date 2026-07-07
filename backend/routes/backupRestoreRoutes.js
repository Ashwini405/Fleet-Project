const express = require("express");

const router = express.Router();

const backupRestoreController = require("../controllers/backupRestoreController");

/* ===========================================================
   CREATE BACKUP
=========================================================== */

router.post(
    "/create",
    backupRestoreController.createBackup
);

/* ===========================================================
   GET ALL BACKUPS
=========================================================== */

router.get(
    "/",
    backupRestoreController.getAllBackups
);

/* ===========================================================
   DASHBOARD
=========================================================== */

router.get(
    "/dashboard",
    backupRestoreController.getDashboardCounts
);

/* ===========================================================
   TIMELINE
=========================================================== */

router.get(
    "/timeline",
    backupRestoreController.getTimeline
);

/* ===========================================================
   SETTINGS
=========================================================== */

router.get(
    "/settings",
    backupRestoreController.getSettings
);

router.put(
    "/settings",
    backupRestoreController.updateSettings
);

/* ===========================================================
   DOWNLOAD BACKUP
=========================================================== */

router.get(
    "/download/:id",
    backupRestoreController.downloadBackup
);

/* ===========================================================
   VERIFY BACKUP
=========================================================== */

router.get(
    "/verify/:id",
    backupRestoreController.verifyBackup
);

/* ===========================================================
   RESTORE BACKUP
=========================================================== */

router.post(
    "/restore/:id",
    backupRestoreController.restoreBackup
);

/* ===========================================================
   GET SINGLE BACKUP
=========================================================== */

// ── MOVED HERE: To prevent "download" and "verify" being treated as :id ──
router.get(
    "/:id",
    backupRestoreController.getBackupById
);

/* ===========================================================
   DELETE BACKUP
=========================================================== */

router.delete(
    "/:id",
    backupRestoreController.deleteBackup
);

module.exports = router;