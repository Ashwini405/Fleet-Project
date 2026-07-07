const db = require("../config/db");

/* ===========================================================
   BACKUP HISTORY
=========================================================== */

async function getAllBackups() {
    const [rows] = await db.query(`
        SELECT *
        FROM backup_restore
        ORDER BY id DESC
    `);

    return rows;
}

/* ===========================================================
   BACKUP BY ID
=========================================================== */

async function getBackupById(id) {
    const [rows] = await db.query(`
        SELECT *
        FROM backup_restore
        WHERE id = ?
    `, [id]);

    return rows[0];
}

/* ===========================================================
   DASHBOARD COUNTS
=========================================================== */

async function getDashboardCounts() {

    const [[total]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM backup_restore
    `);

    const [[completed]] = await db.query(`
        SELECT COUNT(*) AS completed
        FROM backup_restore
        WHERE status='Completed'
    `);

    const [[failed]] = await db.query(`
        SELECT COUNT(*) AS failed
        FROM backup_restore
        WHERE status='Failed'
    `);

    const [[restored]] = await db.query(`
        SELECT COUNT(*) AS restored
        FROM backup_restore
        WHERE status='Restored'
    `);

    return {
        total: total.total,
        completed: completed.completed,
        failed: failed.failed,
        restored: restored.restored
    };
}

/* ===========================================================
   TIMELINE
=========================================================== */

async function getTimeline() {

    const [rows] = await db.query(`
        SELECT
            l.*,
            b.backup_code,
            b.backup_name
        FROM backup_restore_logs l
        LEFT JOIN backup_restore b
            ON l.backup_id = b.id
        ORDER BY l.created_at DESC
    `);

    return rows;
}

/* ===========================================================
   SETTINGS
=========================================================== */

async function getSettings() {

    const [rows] = await db.query(`
        SELECT *
        FROM backup_restore_settings
        LIMIT 1
    `);

    return rows[0];
}

/* ===========================================================
   UPDATE SETTINGS
=========================================================== */

async function updateSettings(data) {

    const {

        auto_backup,

        frequency,

        backup_time,

        retention_days,

        storage,

        compression,

        encryption,

        backup_folder,

        database_name,

        updated_by

    } = data;

    await db.query(
        `
        UPDATE backup_restore_settings
        SET

            auto_backup=?,

            frequency=?,

            backup_time=?,

            retention_days=?,

            storage=?,

            compression=?,

            encryption=?,

            backup_folder=?,

            database_name=?,

            updated_by=?

        WHERE id=1
        `,
        [

            auto_backup,

            frequency,

            backup_time,

            retention_days,

            storage,

            compression,

            encryption,

            backup_folder,

            database_name,

            updated_by

        ]
    );

    return getSettings();
}

/* ===========================================================
   MODULE EXPORTS
=========================================================== */

module.exports = {

    getAllBackups,

    getBackupById,

    getDashboardCounts,

    getTimeline,

    getSettings,

    updateSettings

};