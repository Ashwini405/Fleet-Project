// ── CHANGE 1 & 4: Removed backupModel, only use backupService ──
const backupService = require("../services/backupService");

/* ===========================================================
   CREATE BACKUP
=========================================================== */

exports.createBackup = async (req, res) => {
    try {
        const {
            backupType,
            storageLocation,
            remarks,
            createdBy
        } = req.body;

        const result = await backupService.createBackup({
            backupType,
            storageLocation,
            remarks,
            createdBy
        });

        return res.status(201).json({
            success: true,
            message: "Backup created successfully.",
            data: result
        });
    } catch (error) {
        console.error("CREATE BACKUP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================================================
   RESTORE BACKUP
=========================================================== */

exports.restoreBackup = async (req, res) => {
    try {
        const { id } = req.params;
        const { restoredBy } = req.body;

        const result = await backupService.restoreBackup(
            id,
            restoredBy || "Admin"
        );

        return res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error("RESTORE BACKUP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================================================
   DOWNLOAD BACKUP
=========================================================== */

exports.downloadBackup = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await backupService.downloadBackup(id);

        return res.download(
            result.filePath,
            result.fileName
        );
    } catch (error) {
        console.error("DOWNLOAD BACKUP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================================================
   DELETE BACKUP
=========================================================== */

exports.deleteBackup = async (req, res) => {
    try {
        const { id } = req.params;
        const { deletedBy } = req.body;

        const result = await backupService.deleteBackup(
            id,
            deletedBy || "Admin"
        );

        return res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error("DELETE BACKUP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================================================
   VERIFY BACKUP
=========================================================== */

exports.verifyBackup = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await backupService.verifyBackup(id);

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("VERIFY BACKUP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================================================
   GET ALL BACKUPS
=========================================================== */

exports.getAllBackups = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, type } = req.query;
        const result = await backupService.getAllBackups({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            type
        });

        return res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error("GET BACKUPS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================================================
   GET BACKUP BY ID
=========================================================== */

exports.getBackupById = async (req, res) => {
    try {
        const { id } = req.params;
        const backup = await backupService.getBackupById(id);

        if (!backup) {
            return res.status(404).json({
                success: false,
                message: "Backup not found."
            });
        }

        return res.json({
            success: true,
            data: backup
        });
    } catch (error) {
        console.error("GET BACKUP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================================================
   DASHBOARD COUNTS
=========================================================== */

exports.getDashboardCounts = async (req, res) => {
    try {
        const counts = await backupService.getDashboardCounts();

        return res.json({
            success: true,
            data: counts
        });
    } catch (error) {
        console.error("DASHBOARD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================================================
   TIMELINE
=========================================================== */

// ── CHANGE 2: Fixed getTimeline to use backupService.getTimeline() ──
exports.getTimeline = async (req, res) => {
    try {
        const timeline = await backupService.getTimeline();

        return res.json({
            success: true,
            count: timeline.length,
            data: timeline
        });
    } catch (error) {
        console.error("TIMELINE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================================================
   GET SETTINGS
=========================================================== */

// ── CHANGE 3: Use backupService.getSettings() ──
exports.getSettings = async (req, res) => {
    try {
        const settings = await backupService.getSettings();

        return res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error("GET SETTINGS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================================================
   UPDATE SETTINGS
=========================================================== */

// ── CHANGE 3: Use backupService.saveSettings() ──
exports.updateSettings = async (req, res) => {
    try {
        const settings = await backupService.saveSettings(req.body);

        return res.json({
            success: true,
            message: "Backup settings updated successfully.",
            data: settings
        });
    } catch (error) {
        console.error("UPDATE SETTINGS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};