import { Database, CheckCircle2, Download, AlertTriangle, Upload } from 'lucide-react';

export const MOCK_BACKUPS = [
  { id:'BKP-20260702-003', date:'02-Jul-2026', iso:'2026-07-02', time:'02:30 AM', type:'Automatic', size:'1.84 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260702-002', date:'02-Jul-2026', iso:'2026-07-02', time:'10:22 AM', type:'Manual',    size:'1.84 GB', createdBy:'Ashwini Kumar', status:'Completed', location:'Cloud' },
  { id:'BKP-20260702-001', date:'02-Jul-2026', iso:'2026-07-02', time:'07:05 AM', type:'Automatic', size:'1.83 GB', createdBy:'System',        status:'Failed',    location:'Cloud' },
  { id:'BKP-20260701-002', date:'01-Jul-2026', iso:'2026-07-01', time:'02:30 AM', type:'Automatic', size:'1.82 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260701-001', date:'01-Jul-2026', iso:'2026-07-01', time:'06:48 PM', type:'Manual',    size:'1.82 GB', createdBy:'Rajesh Sharma', status:'Completed', location:'Local' },
  { id:'BKP-20260630-002', date:'30-Jun-2026', iso:'2026-06-30', time:'02:30 AM', type:'Automatic', size:'1.81 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260630-001', date:'30-Jun-2026', iso:'2026-06-30', time:'11:15 AM', type:'Manual',    size:'1.81 GB', createdBy:'Ashwini Kumar', status:'Completed', location:'Both'  },
  { id:'BKP-20260629-001', date:'29-Jun-2026', iso:'2026-06-29', time:'02:30 AM', type:'Automatic', size:'1.80 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260628-001', date:'28-Jun-2026', iso:'2026-06-28', time:'02:30 AM', type:'Automatic', size:'1.79 GB', createdBy:'System',        status:'Failed',    location:'Cloud' },
  { id:'BKP-20260627-002', date:'27-Jun-2026', iso:'2026-06-27', time:'02:30 AM', type:'Automatic', size:'1.78 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260627-001', date:'27-Jun-2026', iso:'2026-06-27', time:'09:00 AM', type:'Manual',    size:'1.78 GB', createdBy:'Priya Nair',   status:'Completed', location:'Cloud' },
  { id:'BKP-20260626-001', date:'26-Jun-2026', iso:'2026-06-26', time:'02:30 AM', type:'Automatic', size:'1.77 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260625-001', date:'25-Jun-2026', iso:'2026-06-25', time:'02:30 AM', type:'Automatic', size:'1.76 GB', createdBy:'System',        status:'Completed', location:'Both'  },
  { id:'BKP-20260624-001', date:'24-Jun-2026', iso:'2026-06-24', time:'02:30 AM', type:'Automatic', size:'1.76 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260623-001', date:'23-Jun-2026', iso:'2026-06-23', time:'02:30 AM', type:'Automatic', size:'1.75 GB', createdBy:'System',        status:'Failed',    location:'Cloud' },
  { id:'BKP-20260622-002', date:'22-Jun-2026', iso:'2026-06-22', time:'02:30 AM', type:'Automatic', size:'1.74 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260622-001', date:'22-Jun-2026', iso:'2026-06-22', time:'03:00 PM', type:'Manual',    size:'1.74 GB', createdBy:'Ashwini Kumar', status:'Completed', location:'Local' },
  { id:'BKP-20260620-001', date:'20-Jun-2026', iso:'2026-06-20', time:'02:30 AM', type:'Automatic', size:'1.73 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260615-001', date:'15-Jun-2026', iso:'2026-06-15', time:'02:30 AM', type:'Automatic', size:'1.71 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260610-002', date:'10-Jun-2026', iso:'2026-06-10', time:'02:30 AM', type:'Automatic', size:'1.70 GB', createdBy:'System',        status:'Completed', location:'Both'  },
  { id:'BKP-20260610-001', date:'10-Jun-2026', iso:'2026-06-10', time:'11:45 AM', type:'Manual',    size:'1.70 GB', createdBy:'Rajesh Sharma', status:'Completed', location:'Cloud' },
  { id:'BKP-20260601-001', date:'01-Jun-2026', iso:'2026-06-01', time:'02:30 AM', type:'Automatic', size:'1.68 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260520-001', date:'20-May-2026', iso:'2026-05-20', time:'02:30 AM', type:'Automatic', size:'1.65 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260501-001', date:'01-May-2026', iso:'2026-05-01', time:'02:30 AM', type:'Automatic', size:'1.62 GB', createdBy:'System',        status:'Completed', location:'Cloud' },
  { id:'BKP-20260415-001', date:'15-Apr-2026', iso:'2026-04-15', time:'02:30 AM', type:'Automatic', size:'1.58 GB', createdBy:'System',        status:'Completed', location:'Local' },
];

export const TIMELINE_ITEMS = [
  { date:'02 Jul', icon: Database,      label:'Manual Backup Created',   sub:'BKP-20260702-002 · Ashwini Kumar', status:'Completed' },
  { date:'02 Jul', icon: CheckCircle2,  label:'Auto Backup Completed',   sub:'BKP-20260702-003 · 02:30 AM',      status:'Completed' },
  { date:'01 Jul', icon: Download,      label:'Backup Downloaded',       sub:'BKP-20260701-001 · Rajesh Sharma', status:'Completed' },
  { date:'30 Jun', icon: CheckCircle2,  label:'Auto Backup Completed',   sub:'BKP-20260630-002 · 02:30 AM',      status:'Completed' },
  { date:'28 Jun', icon: AlertTriangle, label:'Auto Backup Failed',      sub:'BKP-20260628-001 · Retry needed',  status:'Failed'    },
  { date:'27 Jun', icon: Upload,        label:'Database Restored',       sub:'Restored from BKP-20260626-001',   status:'Completed' },
  { date:'22 Jun', icon: Database,      label:'Manual Backup Created',   sub:'BKP-20260622-001 · Pre-update',    status:'Completed' },
  { date:'10 Jun', icon: Database,      label:'Manual Backup Created',   sub:'BKP-20260610-001 · Monthly snap',  status:'Completed' },
];

export const DEFAULT_CONFIG = {
  autoBackup:  true,
  frequency:   'daily',
  backupTime:  '02:30',
  retention:   '30',
  storage:     'cloud',
  compress:    true,
  encrypt:     true,
};
