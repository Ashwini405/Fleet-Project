const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const util = require('util');
const db = require('../config/db');

const execAsync = util.promisify(exec);

// ── Configuration ──────────────────────────────────────────────────────────
const BACKUP_FOLDER = path.join(__dirname, '../backups');
const MYSQL_DUMP_PATH = process.env.MYSQL_DUMP_PATH || 'mysqldump';
const MYSQL_PATH = process.env.MYSQL_PATH || 'mysql';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'fleet_db';

// Ensure backup folder exists
if (!fs.existsSync(BACKUP_FOLDER)) {
    fs.mkdirSync(BACKUP_FOLDER, { recursive: true });
}

// ── Helper Functions ──────────────────────────────────────────────────────

function getCurrentDate() {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: String(now.getMonth() + 1).padStart(2, '0'),
        day: String(now.getDate()).padStart(2, '0'),
        hour: String(now.getHours()).padStart(2, '0'),
        minute: String(now.getMinutes()).padStart(2, '0'),
        second: String(now.getSeconds()).padStart(2, '0'),
        dateString: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
        timeString: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    };
}

async function generateBackupCode() {
    const [rows] = await db.query(
        `SELECT COUNT(*) as count FROM backup_restore`
    );
    const count = rows[0].count + 1;
    const now = getCurrentDate();
    return `BCK${now.year}${now.month}${now.day}${String(count).padStart(4, '0')}`;
}

function getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return {
        bytes,
        formatted: `${size.toFixed(2)} ${units[unitIndex]}`
    };
}

async function generateChecksum(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', data => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

// ── PART 1 & 2: Create Backup ────────────────────────────────────────────

// ── CHANGE 1: Changed default backupType from 'Full' to 'Manual' ──
async function createBackup({
    backupType = 'Manual',
    storageLocation = 'Local',
    createdBy = 'Admin',
    remarks = null
} = {}) {
    const now = getCurrentDate();
    const backupCode = await generateBackupCode();
    const fileName = `${backupCode}_${now.hour}${now.minute}${now.second}.sql`;
    const backupPath = path.join(BACKUP_FOLDER, fileName);

    const command =
        `"${MYSQL_DUMP_PATH}" ` +
        `--host=${DB_HOST} ` +
        `--port=${DB_PORT} ` +
        `--user=${DB_USER} ` +
        `--password=${DB_PASSWORD} ` +
        `${DB_NAME} > "${backupPath}"`;

    try {
        await execAsync(command);

        if (!fs.existsSync(backupPath)) {
            throw new Error("Backup file was not created.");
        }

        const fileSize = getFileSize(backupPath);
        const checksum = await generateChecksum(backupPath);

        const [result] = await db.query(
            `
            INSERT INTO backup_restore
            (
                backup_code,
                backup_name,
                backup_type,
                backup_date,
                backup_time,
                backup_size,
                backup_format,
                storage_location,
                backup_path,
                checksum,
                status,
                created_by,
                remarks
            )
            VALUES
            (
                ?, ?, ?, CURDATE(), CURTIME(),
                ?, 'SQL', ?, ?, ?, 'Completed',
                ?, ?
            )
            `,
            [
                backupCode,
                fileName,
                backupType,
                fileSize.formatted,
                storageLocation,
                backupPath,
                checksum,
                createdBy,
                remarks
            ]
        );

        await db.query(
            `
            INSERT INTO backup_restore_logs
            (
                backup_id,
                activity_type,
                description,
                performed_by,
                status
            )
            VALUES
            (
                ?,
                'Backup Created',
                ?,
                ?,
                'Completed'
            )
            `,
            [
                result.insertId,
                `Backup ${backupCode} created successfully.`,
                createdBy
            ]
        );

        return {
            success: true,
            backupId: result.insertId,
            backupCode,
            backupName: fileName,
            backupPath,
            backupSize: fileSize.formatted,
            checksum,
            message: "Database backup created successfully."
        };

    } catch (error) {
        console.error("BACKUP ERROR:", error);

        if (fs.existsSync(backupPath)) {
            fs.unlinkSync(backupPath);
        }

        throw error;
    }
}

// ── PART 3: Restore Backup ───────────────────────────────────────────────
async function restoreBackup(backupCode, restoredBy = "Admin") {

    // Find backup using backup_code
    const [rows] = await db.query(
        `
        SELECT *
        FROM backup_restore
        WHERE backup_code = ?
        `,
        [backupCode]
    );

    if (!rows.length) {
        throw new Error("Backup not found.");
    }

    const backup = rows[0];
    const backupPrimaryId = backup.id;

    // Check backup file exists
    if (!fs.existsSync(backup.backup_path)) {
        throw new Error("Backup file does not exist.");
    }

    // Build mysql restore command
    const command =
        `"${MYSQL_PATH}" ` +
        `--host=${DB_HOST} ` +
        `--port=${DB_PORT} ` +
        `--user=${DB_USER} ` +
        `--password=${DB_PASSWORD} ` +
        `${DB_NAME} < "${backup.backup_path}"`;

    try {

        // Execute restore
        await execAsync(command);

        // Update backup status
        await db.query(
            `
            UPDATE backup_restore
            SET
                status = 'Restored',
                updated_at = NOW()
            WHERE backup_code = ?
            `,
            [backupCode]
        );

        // Insert restore log
        await db.query(
            `
            INSERT INTO backup_restore_logs
            (
                backup_id,
                activity_type,
                description,
                performed_by,
                status
            )
            VALUES
            (
                ?,
                'Backup Restored',
                ?,
                ?,
                'Completed'
            )
            `,
            [
                backupPrimaryId,
                `Backup ${backup.backup_code} restored successfully.`,
                restoredBy
            ]
        );

        return {
            success: true,
            message: "Database restored successfully."
        };

    } catch (error) {

        // Insert failed log
        await db.query(
            `
            INSERT INTO backup_restore_logs
            (
                backup_id,
                activity_type,
                description,
                performed_by,
                status
            )
            VALUES
            (
                ?,
                'Backup Failed',
                ?,
                ?,
                'Failed'
            )
            `,
            [
                backupPrimaryId,
                error.message,
                restoredBy
            ]
        );

        throw error;
    }
}

// ── PART 4: Download, Delete, Verify ─────────────────────────────────────

async function downloadBackup(backupCode, downloadedBy = "Admin") {

    const [rows] = await db.query(
        `
        SELECT *
        FROM backup_restore
        WHERE backup_code = ?
        `,
        [backupCode]
    );

    if (!rows.length) {
        throw new Error("Backup not found.");
    }

    const backup = rows[0];

    if (!fs.existsSync(backup.backup_path)) {
        throw new Error("Backup file not found.");
    }

    await db.query(
        `
        INSERT INTO backup_restore_logs
        (
            backup_id,
            activity_type,
            description,
            performed_by,
            status
        )
        VALUES
        (
            ?,
            'Backup Downloaded',
            ?,
            ?,
            'Completed'
        )
        `,
        [
            backup.id,
            `Backup ${backup.backup_code} downloaded.`,
            downloadedBy
        ]
    );

    return {
        success: true,
        filePath: backup.backup_path,
        fileName: backup.backup_name
    };

}
async function deleteBackup(backupId, deletedBy = "Admin") {
    const [rows] = await db.query(
        `
        SELECT *
        FROM backup_restore
        WHERE id=?
        `,
        [backupId]
    );

    if (!rows.length) {
        throw new Error("Backup not found.");
    }

    const backup = rows[0];

    if (fs.existsSync(backup.backup_path)) {
        fs.unlinkSync(backup.backup_path);
    }

    await db.query(
        `
        INSERT INTO backup_restore_logs
        (
            backup_id,
            activity_type,
            description,
            performed_by,
            status
        )
        VALUES
        (
            ?,
            'Backup Deleted',
            ?,
            ?,
            'Completed'
        )
        `,
        [
            backupId,
            `Backup ${backup.backup_code} deleted.`,
            deletedBy
        ]
    );

    await db.query(
        `
        DELETE
        FROM backup_restore
        WHERE id=?
        `,
        [backupId]
    );

    return {
        success: true,
        message: "Backup deleted successfully."
    };
}

async function verifyBackup(backupId) {
    const [rows] = await db.query(
        `
        SELECT *
        FROM backup_restore
        WHERE id=?
        `,
        [backupId]
    );

    if (!rows.length) {
        return {
            success: false,
            verified: false,
            message: "Backup not found."
        };
    }

    const backup = rows[0];
    const exists = fs.existsSync(backup.backup_path);
    let checksumValid = false;

    if (exists) {
        try {
            const currentChecksum = await generateChecksum(backup.backup_path);
            checksumValid = currentChecksum === backup.checksum;
        } catch (error) {
            checksumValid = false;
        }
    }

    return {
        success: true,
        verified: exists && checksumValid,
        fileExists: exists,
        checksumValid: checksumValid,
        backup
    };
}

// ── PART 5: Get Backups, Dashboard, Timeline ─────────────────────────────

async function getAllBackups({ page = 1, limit = 20, status = null, type = null } = {}) {
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM backup_restore WHERE 1=1`;
    const params = [];

    if (status) {
        query += ` AND status = ?`;
        params.push(status);
    }

    if (type) {
        query += ` AND backup_type = ?`;
        params.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM backup_restore`
    );

    return {
        data: rows,
        pagination: {
            total: countResult[0].total,
            page,
            limit,
            totalPages: Math.ceil(countResult[0].total / limit)
        }
    };
}

async function getBackupById(backupId) {
    const [rows] = await db.query(
        `
        SELECT *
        FROM backup_restore
        WHERE id=?
        `,
        [backupId]
    );

    if (!rows.length) {
        return null;
    }

    const [logs] = await db.query(
        `
        SELECT *
        FROM backup_restore_logs
        WHERE backup_id=?
        ORDER BY created_at DESC
        `,
        [backupId]
    );

    return {
        ...rows[0],
        logs
    };
}

async function getBackupTimeline(backupId) {
    const [rows] = await db.query(
        `
        SELECT *
        FROM backup_restore_logs
        WHERE backup_id=?
        ORDER BY created_at ASC
        `,
        [backupId]
    );

    return rows;
}

// ── CHANGE 3: Added getTimeline() function ──
async function getTimeline() {
    const [rows] = await db.query(`
        SELECT *
        FROM backup_restore_logs
        ORDER BY created_at DESC
        LIMIT 100
    `);

    return rows;
}

async function getDashboardCounts() {
    const [total] = await db.query(
        `SELECT COUNT(*) as total FROM backup_restore`
    );

    const [completed] = await db.query(
        `SELECT COUNT(*) as completed FROM backup_restore WHERE status = 'Completed'`
    );

    const [restored] = await db.query(
        `SELECT COUNT(*) as restored FROM backup_restore WHERE status = 'Restored'`
    );

    const [failed] = await db.query(
        `SELECT COUNT(*) as failed FROM backup_restore WHERE status = 'Failed'`
    );

    const [today] = await db.query(
        `SELECT COUNT(*) as today FROM backup_restore WHERE DATE(created_at) = CURDATE()`
    );

    // ── CHANGE 2: Removed totalSize SUM query ──

    return {
        total: total[0].total,
        completed: completed[0].completed,
        restored: restored[0].restored,
        failed: failed[0].failed,
        today: today[0].today
    };
}

// ── CHANGE 4: Added getSettings() and saveSettings() ──
async function getSettings() {
    const [rows] = await db.query(`
        SELECT *
        FROM backup_restore_settings
        LIMIT 1
    `);

    return rows[0] || null;
}

async function saveSettings(settings) {
    const {
        autoBackup,
        frequency,
        backupTime,
        retention,
        storage,
        compress,
        encrypt
    } = settings;

    await db.query(
        `
        UPDATE backup_restore_settings
        SET
            auto_backup = ?,
            frequency = ?,
            backup_time = ?,
            retention_days = ?,
            storage = ?,
            compression = ?,
            encryption = ?,
            updated_at = NOW()
        WHERE id = 1
        `,
        [
            autoBackup,
            frequency,
            backupTime,
            retention,
            storage,
            compress,
            encrypt
        ]
    );

    return {
        success: true,
        message: "Backup settings updated successfully."
    };
}

// ── Module Exports ────────────────────────────────────────────────────────

// ── CHANGE 5: Updated module.exports ──
module.exports = {
    // Create
    createBackup,

    // Restore
    restoreBackup,

    // Download
    downloadBackup,

    // Delete
    deleteBackup,

    // Verify
    verifyBackup,

    // Get
    getAllBackups,
    getBackupById,
    getBackupTimeline,
    getTimeline,
    getDashboardCounts,
    getSettings,
    saveSettings,

    // Helpers (exposed for testing)
    generateBackupCode,
    getFileSize,
    generateChecksum,
    getCurrentDate
};