import { Database, CheckCircle2, Download, AlertTriangle, Upload } from "lucide-react";

export const DEFAULT_CONFIG = {
  autoBackup: true,
  frequency: "daily",
  backupTime: "02:30",
  retention: "30",
  storage: "cloud",
  compress: true,
  encrypt: true,
};

export const getTimelineIcon = (activity) => {
  switch (activity) {
    case "Backup Created":
      return Database;

    case "Backup Downloaded":
      return Download;

    case "Backup Restored":
      return Upload;

    case "Backup Failed":
      return AlertTriangle;

    case "Backup Verified":
      return CheckCircle2;

    default:
      return Database;
  }
};

export const formatBackup = (backup) => {
  return {
    id: backup.backup_code,

    date: new Date(backup.backup_date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),

    iso: backup.backup_date,

    time: backup.backup_time,

    type: backup.backup_type,

    size: backup.backup_size,

    createdBy: backup.created_by || "System",

    status: backup.status,

    location: backup.storage_location,
  };
};

export const formatTimeline = (log) => {
  const Icon = getTimelineIcon(log.activity_type);

  return {
    date: new Date(log.created_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),

    icon: Icon,

    label: log.activity_type,

    sub: log.description,

    status: log.status,
  };
};