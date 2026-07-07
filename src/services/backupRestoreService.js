import api from "./api";

/*
|--------------------------------------------------------------------------
| Backup & Restore Service
|--------------------------------------------------------------------------
|
| Fleet Management System
|
*/

/* ===========================================================
   DASHBOARD
=========================================================== */

export const getDashboard = async () => {
    const response = await api.get("/backup-restore/dashboard");
    return response.data;
};

/* ===========================================================
   GET ALL BACKUPS
=========================================================== */

export const getBackups = async () => {
    const response = await api.get("/backup-restore");
    return response.data;
};

/* ===========================================================
   GET SINGLE BACKUP
=========================================================== */

export const getBackupById = async (id) => {
    const response = await api.get(`/backup-restore/${id}`);
    return response.data;
};

/* ===========================================================
   CREATE BACKUP
=========================================================== */

export const createBackup = async () => {
    const response = await api.post(
        "/backup-restore/create"
    );

    return response.data;
};

/* ===========================================================
   DELETE BACKUP
=========================================================== */

export const deleteBackup = async (id) => {
    const response = await api.delete(
        `/backup-restore/${id}`
    );

    return response.data;
};

/* ===========================================================
   DOWNLOAD BACKUP
=========================================================== */

export const downloadBackup = async (id) => {

    const response = await api.get(

        `/backup-restore/download/${id}`,

        {
            responseType: "blob",
        }

    );

    return response;
};

/* ===========================================================
   RESTORE BACKUP
=========================================================== */

export const restoreBackup = async (id) => {

    const response = await api.post(

        `/backup-restore/restore/${id}`

    );

    return response.data;
};

/* ===========================================================
   VERIFY BACKUP
=========================================================== */

export const verifyBackup = async (id) => {

    const response = await api.get(

        `/backup-restore/verify/${id}`

    );

    return response.data;
};

/* ===========================================================
   TIMELINE
=========================================================== */

export const getTimeline = async () => {

    const response = await api.get(

        "/backup-restore/timeline"

    );

    return response.data;
};

/* ===========================================================
   SETTINGS
=========================================================== */

export const getSettings = async () => {

    const response = await api.get(

        "/backup-restore/settings"

    );

    return response.data;
};

/* ===========================================================
   UPDATE SETTINGS
=========================================================== */

export const updateSettings = async (settings) => {

    const response = await api.put(

        "/backup-restore/settings",

        settings

    );

    return response.data;
};

// Backwards-compatible alias used by some components
export { updateSettings as saveSettings };