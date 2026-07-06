import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Activity, Download, RefreshCw, Search, X, Eye,
  ChevronLeft, ChevronRight, Calendar, CheckCircle2,
  Clock, Truck, MapPin, Package, IndianRupee, Users,
  Settings, Shield, FileText, ChevronDown, AlertTriangle,
  Wrench, UserCheck, Building2, Lock,
  BarChart2, CreditCard, Droplets, ClipboardCheck,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_ICON = {
  'Vehicle Master':       Truck,
  'Trip Master':          MapPin,
  'Fuel Management':      Droplets,
  'Service & Maintenance':Wrench,
  'Tyres Management':     Settings,
  'Parts & Inventory':    Package,
  'Purchase Orders':      FileText,
  'Vendor Ledger':        Building2,
  'Operational Payments': CreditCard,
  'Income & Expense':     IndianRupee,
  'P&L Reports':          BarChart2,
  'Staff Management':     Users,
  'Company Profile':      Building2,
  'User Management':      UserCheck,
  'Roles & Permissions':  Shield,
  'Administration':       Settings,
  'Incidents':            AlertTriangle,
  'Vehicle Inspection':   ClipboardCheck,
  'Authentication':       Lock,
};

const ALL_MODULES = Object.keys(MODULE_ICON);

const ALL_ACTIONS = [
  'Created','Updated','Deleted','Approved','Rejected','Closed',
  'Exported','Login','Logout','Permission Changed','Uploaded',
  'Downloaded','Assigned','Settled','Completed','Password Reset',
  'Role Assigned',
];

const ACTION_STYLE = {
  'Created':           'bg-blue-50   text-blue-700   border-blue-200',
  'Updated':           'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Deleted':           'bg-red-50    text-red-700    border-red-200',
  'Approved':          'bg-green-50  text-green-700  border-green-200',
  'Rejected':          'bg-red-50    text-red-700    border-red-200',
  'Closed':            'bg-slate-100 text-slate-600  border-slate-200',
  'Exported':          'bg-purple-50 text-purple-700 border-purple-200',
  'Login':             'bg-cyan-50   text-cyan-700   border-cyan-200',
  'Logout':            'bg-slate-100 text-slate-500  border-slate-200',
  'Permission Changed':'bg-amber-50  text-amber-700  border-amber-200',
  'Uploaded':          'bg-teal-50   text-teal-700   border-teal-200',
  'Downloaded':        'bg-teal-50   text-teal-700   border-teal-200',
  'Assigned':          'bg-sky-50    text-sky-700    border-sky-200',
  'Settled':           'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Completed':         'bg-green-50  text-green-700  border-green-200',
  'Password Reset':    'bg-orange-50 text-orange-700 border-orange-200',
  'Role Assigned':     'bg-amber-50  text-amber-700  border-amber-200',
};

const STATUS_STYLE = {
  Success: 'bg-green-50 text-green-700 border-green-200',
  Warning: 'bg-amber-50 text-amber-700 border-amber-200',
  Failed:  'bg-red-50   text-red-700   border-red-200',
};

const CRITICAL_ACTIONS = ['Deleted','Approved','Rejected','Permission Changed','Role Assigned','Password Reset'];
const ALL_PLANTS = ['HQ','Plant 1','Plant 2','Plant 3'];

// ─── Mock Data Factory ────────────────────────────────────────────────────────

const BROWSERS  = ['Chrome 125','Firefox 126','Edge 125','Safari 17','Chrome 124'];
const OSS       = ['Windows 11','Windows 10','macOS Sonoma','Android 14','iOS 17'];
const LOCS      = ['Bengaluru, Karnataka','Mumbai, Maharashtra','Chennai, Tamil Nadu','Delhi, NCR','Hyderabad, Telangana'];

let _n = 0;
function L(dt, u, un, ur, m, a, rec, rid, st, ip, plant, ov, nv, rt) {
  const num = 18542 - _n++;
  return {
    id:`ACT-${String(num).padStart(5,'0')}`,
    dt, user:u, fullName:un, role:ur,
    module:m, action:a, record:rec, recordId:rid,
    status:st, ip, plant, oldValue:ov, newValue:nv, relatedType:rt,
    browser:BROWSERS[num%5], os:OSS[num%5],
    device:num%9===0?'Mobile':'Desktop',
    sessionId:`SES-${num.toString(36).toUpperCase().padStart(6,'0')}`,
    location:LOCS[num%5],
  };
}

const MOCK_LOGS = [
  // ── Today 2026-07-02 ──────────────────────────────────────────────────────
  L('2026-07-02 16:48','ashwini.admin','Ashwini Kumar','Administrator','User Management','Created','User: srini.maint – Srini Kumar','USR-048','Success','192.168.1.10','HQ',null,'New ERP login created, Role: Maintenance Manager','user'),
  L('2026-07-02 16:32','suresh.ops','Suresh Reddy','Operations Manager','Trip Master','Closed','TRP-0892 – Bengaluru → Hyderabad','TRP-0892','Success','192.168.1.22','Plant 1','Status: Active, Distance: 570 km','Status: Completed, Odometer: 84,320 km','trip'),
  L('2026-07-02 16:15','priya.finance','Priya Nair','Finance Manager','Operational Payments','Approved','Settlement STL-0187 – Suresh Reddy','STL-0187','Success','192.168.1.31','HQ','Status: Pending','Status: Approved, Paid: ₹14,500','payment'),
  L('2026-07-02 15:58','kiran.maint','Kiran Mehta','Maintenance Manager','Service & Maintenance','Completed','SVC-0234 – VEH-012 – Engine Overhaul','SVC-0234','Success','192.168.1.45','Plant 2','Status: In Progress','Status: Completed, Cost: ₹28,000','maintenance'),
  L('2026-07-02 15:43','anita.ops','Anita Bose','Operations Manager','Fuel Management','Created','FUE-0445 – VEH-008 – 120 L Diesel','FUE-0445','Success','192.168.1.23','Plant 1',null,'Fuel: 120 L @ ₹94.50/L, Total: ₹11,340','fuel'),
  L('2026-07-02 15:29','ashwini.admin','Ashwini Kumar','Administrator','Roles & Permissions','Permission Changed','Role: Finance Manager – Reports Module','ROLE-02','Success','192.168.1.10','HQ','Export: Disabled','Export: Enabled','role'),
  L('2026-07-02 15:11','vikram.finance','Vikram Patel','Finance Manager','Income & Expense','Created','EXP-0312 – Toll Charges ₹1,200','EXP-0312','Success','192.168.1.33','HQ',null,'Expense: ₹1,200 – Toll, Category: Operational','expense'),
  L('2026-07-02 14:55','srini.maint','Srini Kumar','Maintenance Manager','Tyres Management','Updated','TYR-0089 – VEH-015 – Rear Axle Right','TYR-0089','Success','192.168.1.47','Plant 3','KM Reading: 42,000','KM Reading: 48,500, Retreaded: Yes','tyre'),
  L('2026-07-02 14:38','suresh.ops','Suresh Reddy','Operations Manager','Vehicle Master','Updated','VEH-003 – TN-01-CD-5678 – Fitness Renewed','VEH-003','Success','192.168.1.22','Plant 1','Fitness Expiry: 2026-06-30','Fitness Expiry: 2027-06-30','vehicle'),
  L('2026-07-02 14:20','nalini.hr','Nalini Rao','HR Manager','Staff Management','Updated','EMP-042 – Ravi Kumar – License Renewal','EMP-042','Success','192.168.1.55','HQ','DL Expiry: 2026-07-15','DL Expiry: 2028-07-14','employee'),
  L('2026-07-02 14:05','priya.finance','Priya Nair','Finance Manager','Purchase Orders','Approved','PO-0145 – Tata Motors Parts – ₹45,000','PO-0145','Success','192.168.1.31','HQ','Status: Draft','Status: Approved, Vendor: Tata Motors Ltd','po'),
  L('2026-07-02 13:48','kiran.maint','Kiran Mehta','Maintenance Manager','Parts & Inventory','Created','INV-PART-0334 – Air Filter × 10','INV-PART-0334','Success','192.168.1.45','Plant 2',null,'Stock Added: 10 × Air Filter (Tata), Cost: ₹4,500','part'),
  L('2026-07-02 13:32','system','System','System','Authentication','Login','ashwini.admin – 192.168.1.10','SES-ADASH','Success','192.168.1.10','HQ',null,'Login: Success, Browser: Chrome 125, OS: Windows 11','auth'),
  L('2026-07-02 13:15','anita.ops','Anita Bose','Operations Manager','Trip Master','Created','TRP-0893 – VEH-007 – Chennai → Coimbatore','TRP-0893','Success','192.168.1.23','Plant 1',null,'Trip Created, Driver: Rajesh D, Distance: 490 km','trip'),
  L('2026-07-02 12:58','ashwini.admin','Ashwini Kumar','Administrator','Company Profile','Updated','GST Number Updated','COMP-001','Warning','192.168.1.10','HQ','GST: 29AABCF1234D1Z4','GST: 29AABCF1234D1Z5','company'),
  L('2026-07-02 12:40','vikram.finance','Vikram Patel','Finance Manager','Vendor Ledger','Created','VEND-0056 – Ashok Auto Parts – Chennai','VEND-0056','Success','192.168.1.33','HQ',null,'New Vendor: Ashok Auto Parts, City: Chennai, GST: 33XXXX','vendor'),
  L('2026-07-02 12:22','srini.maint','Srini Kumar','Maintenance Manager','Vehicle Inspection','Created','INSP-0078 – VEH-010 – Pre-Trip Check','INSP-0078','Success','192.168.1.47','Plant 3',null,'Inspection: Pass, Fuel: OK, Tyres: OK, Brakes: OK','inspection'),
  L('2026-07-02 12:05','priya.finance','Priya Nair','Finance Manager','Operational Payments','Rejected','STL-0186 – Invalid Toll Receipt','STL-0186','Warning','192.168.1.31','HQ','Status: Pending','Status: Rejected, Reason: Invalid receipt attached','payment'),
  L('2026-07-02 11:48','suresh.ops','Suresh Reddy','Operations Manager','Fuel Management','Updated','FUE-0440 – Quantity Corrected','FUE-0440','Success','192.168.1.22','Plant 1','Quantity: 85 L','Quantity: 95 L, Reason: Meter correction','fuel'),
  L('2026-07-02 11:30','nalini.hr','Nalini Rao','HR Manager','Staff Management','Created','EMP-049 – Mohan Lal – Driver','EMP-049','Success','192.168.1.55','HQ',null,'New Driver: Mohan Lal, DL: MH01-20180045, Joining: 2026-07-02','employee'),
  L('2026-07-02 10:55','ashwini.admin','Ashwini Kumar','Administrator','User Management','Deleted','User: arun.fin – Account Deactivated','USR-039','Warning','192.168.1.10','HQ','Status: Active','Status: Deleted, Reason: Employee resigned','user'),
  L('2026-07-02 10:38','kiran.maint','Kiran Mehta','Maintenance Manager','Incidents','Created','INC-0034 – VEH-005 – Tyre Burst NH-44','INC-0034','Success','192.168.1.45','Plant 2',null,'Incident: Tyre Burst, Location: NH-44 KM 245, Severity: Medium','incident'),
  L('2026-07-02 10:20','system','System','System','Authentication','Login','priya.finance – 192.168.1.31','SES-PRIYA','Success','192.168.1.31','HQ',null,'Login: Success, 2FA: Verified','auth'),
  L('2026-07-02 09:45','ashwini.admin','Ashwini Kumar','Administrator','Administration','Updated','System Settings – Date Format Changed','SYS-001','Success','192.168.1.10','HQ','Date Format: MM/DD/YYYY','Date Format: DD-MMM-YYYY','admin'),

  // ── Yesterday 2026-07-01 ──────────────────────────────────────────────────
  L('2026-07-01 17:55','vikram.finance','Vikram Patel','Finance Manager','P&L Reports','Exported','P&L Report – Jun 2026 – All Plants','RPT-0089','Success','192.168.1.33','HQ',null,'Exported: PDF, Period: June 2026, Generated by: Vikram Patel','report'),
  L('2026-07-01 17:30','suresh.ops','Suresh Reddy','Operations Manager','Trip Master','Updated','TRP-0888 – Delay Updated – Traffic Jam','TRP-0888','Success','192.168.1.22','Plant 1','ETA: 17:00','ETA: 19:30, Reason: Traffic on NH-48','trip'),
  L('2026-07-01 16:48','priya.finance','Priya Nair','Finance Manager','Income & Expense','Approved','INC-0234 – Freight Revenue ₹1,25,000','INC-0234','Success','192.168.1.31','HQ','Status: Draft','Status: Approved, Amount: ₹1,25,000','expense'),
  L('2026-07-01 16:20','kiran.maint','Kiran Mehta','Maintenance Manager','Service & Maintenance','Created','SVC-0235 – VEH-001 – Brake Pad Replace','SVC-0235','Success','192.168.1.45','Plant 2',null,'Service: Brake Pads Front & Rear, Estimate: ₹4,500','maintenance'),
  L('2026-07-01 15:58','ashwini.admin','Ashwini Kumar','Administrator','Roles & Permissions','Role Assigned','User: suresh.ops – Operations Manager Role','USR-022','Success','192.168.1.10','HQ','Previous Role: Viewer','New Role: Operations Manager','role'),
  L('2026-07-01 15:33','anita.ops','Anita Bose','Operations Manager','Vehicle Master','Created','VEH-019 – MH-04-EF-9012 – Tata Prima 4028','VEH-019','Success','192.168.1.23','Plant 1',null,'New Vehicle: Tata Prima 4028, Year: 2024, Plant: Plant 1','vehicle'),
  L('2026-07-01 15:10','srini.maint','Srini Kumar','Maintenance Manager','Tyres Management','Created','TYR-0090 – VEH-019 – 6 New Tyres Fitted','TYR-0090','Success','192.168.1.47','Plant 3',null,'6 × Bridgestone 10.00R20, Brand: Bridgestone, Cost: ₹48,000','tyre'),
  L('2026-07-01 14:45','priya.finance','Priya Nair','Finance Manager','Purchase Orders','Created','PO-0146 – Fuel Drums ₹12,500','PO-0146','Success','192.168.1.31','HQ',null,'PO: Fuel Drums × 5, Vendor: HP Petroleum, Amount: ₹12,500','po'),
  L('2026-07-01 14:22','nalini.hr','Nalini Rao','HR Manager','Staff Management','Updated','EMP-015 – Salary Revised','EMP-015','Success','192.168.1.55','HQ','Salary: ₹28,000','Salary: ₹31,000, Effective: 2026-07-01','employee'),
  L('2026-07-01 13:58','vikram.finance','Vikram Patel','Finance Manager','Vendor Ledger','Updated','VEND-0023 – Payment Terms Updated','VEND-0023','Success','192.168.1.33','HQ','Payment Terms: 30 days','Payment Terms: 45 days','vendor'),
  L('2026-07-01 13:35','system','System','System','Authentication','Login','kiran.maint – 192.168.1.45','SES-KIRAN','Success','192.168.1.45','Plant 2',null,'Login: Success, Session Started','auth'),
  L('2026-07-01 13:12','anita.ops','Anita Bose','Operations Manager','Fuel Management','Approved','FUE-0440 – Approved after correction','FUE-0440','Success','192.168.1.23','Plant 1','Status: Pending','Status: Approved','fuel'),
  L('2026-07-01 12:50','kiran.maint','Kiran Mehta','Maintenance Manager','Parts & Inventory','Updated','INV-PART-0320 – Stock Count Corrected','INV-PART-0320','Warning','192.168.1.45','Plant 2','Stock: 25 units','Stock: 22 units, Reason: Damaged items removed','part'),
  L('2026-07-01 12:28','ashwini.admin','Ashwini Kumar','Administrator','Company Profile','Updated','Financial Year Updated to 2026-27','COMP-001','Success','192.168.1.10','HQ','Financial Year: 2025-26','Financial Year: 2026-27','company'),
  L('2026-07-01 12:05','suresh.ops','Suresh Reddy','Operations Manager','Trip Master','Assigned','TRP-0889 – Driver Assigned – Prakash T','TRP-0889','Success','192.168.1.22','Plant 1','Driver: Unassigned','Driver: Prakash T (EMP-023)','trip'),
  L('2026-07-01 11:42','priya.finance','Priya Nair','Finance Manager','Operational Payments','Created','STL-0188 – Driver: Prakash T – ₹8,200','STL-0188','Success','192.168.1.31','HQ',null,'Settlement: ₹8,200 for Trip TRP-0875, Driver: Prakash T','payment'),
  L('2026-07-01 11:20','system','System','System','Authentication','Login','nalini.hr – 103.21.45.88','SES-NALINI','Failed','103.21.45.88','HQ',null,'Login: Failed, Reason: Incorrect password (Attempt 1/3)','auth'),
  L('2026-07-01 11:05','nalini.hr','Nalini Rao','HR Manager','Authentication','Login','nalini.hr – 103.21.45.88','SES-NALIN2','Success','103.21.45.88','HQ',null,'Login: Success on Attempt 2','auth'),
  L('2026-07-01 10:40','srini.maint','Srini Kumar','Maintenance Manager','Incidents','Updated','INC-0033 – Status Changed to Resolved','INC-0033','Success','192.168.1.47','Plant 3','Status: Open','Status: Resolved, Repaired by: Plant 3 Workshop','incident'),
  L('2026-07-01 10:15','ashwini.admin','Ashwini Kumar','Administrator','User Management','Updated','User: vikram.finance – Plant Access Updated','USR-033','Success','192.168.1.10','HQ','Plant Access: Plant 1','Plant Access: HQ, Plant 1, Plant 2','user'),
  L('2026-07-01 09:52','vikram.finance','Vikram Patel','Finance Manager','Income & Expense','Created','EXP-0313 – Driver TA ₹3,500','EXP-0313','Success','192.168.1.33','HQ',null,'Expense: ₹3,500, Category: Travel Allowance, Driver: Mohan B','expense'),

  // ── 2026-06-30 ────────────────────────────────────────────────────────────
  L('2026-06-30 18:10','priya.finance','Priya Nair','Finance Manager','Operational Payments','Approved','STL-0185 – 8 Settlements Batch Approved','STL-0185','Success','192.168.1.31','HQ','Status: Pending (8 items)','Status: Approved, Total: ₹98,400','payment'),
  L('2026-06-30 17:45','suresh.ops','Suresh Reddy','Operations Manager','Trip Master','Closed','TRP-0885 – Mumbai → Pune Completed','TRP-0885','Success','192.168.1.22','Plant 1','Status: Active','Status: Completed, KM: 148','trip'),
  L('2026-06-30 17:22','kiran.maint','Kiran Mehta','Maintenance Manager','Service & Maintenance','Approved','SVC-0230 – Engine Service ₹22,000','SVC-0230','Success','192.168.1.45','Plant 2','Status: Pending Approval','Status: Approved, Amount: ₹22,000','maintenance'),
  L('2026-06-30 16:55','ashwini.admin','Ashwini Kumar','Administrator','P&L Reports','Exported','Monthly P&L – June 2026','RPT-0088','Success','192.168.1.10','HQ',null,'Report Exported: Excel, Date: 30-Jun-2026','report'),
  L('2026-06-30 16:30','anita.ops','Anita Bose','Operations Manager','Vehicle Master','Updated','VEH-007 – Insurance Renewed','VEH-007','Success','192.168.1.23','Plant 1','Insurance Expiry: 2026-06-30','Insurance Expiry: 2027-06-29','vehicle'),
  L('2026-06-30 16:08','srini.maint','Srini Kumar','Maintenance Manager','Tyres Management','Updated','TYR-0082 – Pressure Check Done','TYR-0082','Warning','192.168.1.47','Plant 3','Pressure: 90 PSI','Pressure: 100 PSI, Note: Slow leak detected','tyre'),
  L('2026-06-30 15:45','nalini.hr','Nalini Rao','HR Manager','Staff Management','Created','EMP-048 – Suresh M – Helper','EMP-048','Success','192.168.1.55','HQ',null,'New Staff: Suresh M, Role: Helper, Joined: 2026-06-30','employee'),
  L('2026-06-30 15:20','vikram.finance','Vikram Patel','Finance Manager','Vendor Ledger','Created','Payment ₹45,000 to Tata Motors Ltd','VEND-PAY-0045','Success','192.168.1.33','HQ',null,'Payment Recorded: ₹45,000, Ref: TML/JUN/2026/4521','vendor'),
  L('2026-06-30 14:55','priya.finance','Priya Nair','Finance Manager','Purchase Orders','Updated','PO-0142 – Quantity Revised','PO-0142','Success','192.168.1.31','HQ','Qty: 50 units','Qty: 65 units, Revised by Finance Head','po'),
  L('2026-06-30 14:30','suresh.ops','Suresh Reddy','Operations Manager','Fuel Management','Created','FUE-0444 – VEH-011 – 95 L Diesel','FUE-0444','Success','192.168.1.22','Plant 1',null,'Fuel: 95 L @ ₹94.80/L, Pump: HPCL Nelamangala','fuel'),
  L('2026-06-30 14:05','ashwini.admin','Ashwini Kumar','Administrator','Roles & Permissions','Updated','Role: Operations Manager – Fuel Approve','ROLE-03','Success','192.168.1.10','HQ','Approve Fuel: Disabled','Approve Fuel: Enabled','role'),

  // ── 2026-06-29 ────────────────────────────────────────────────────────────
  L('2026-06-29 17:40','kiran.maint','Kiran Mehta','Maintenance Manager','Parts & Inventory','Created','INV-PART-0335 – Brake Pads × 20 Sets','INV-PART-0335','Success','192.168.1.45','Plant 2',null,'Stock In: 20 × Brake Pad Set, Vendor: Minda Corp, ₹18,000','part'),
  L('2026-06-29 17:15','priya.finance','Priya Nair','Finance Manager','Income & Expense','Created','INC-0235 – Container Freight ₹88,000','INC-0235','Success','192.168.1.31','HQ',null,'Revenue: ₹88,000, Client: Mahindra Logistics, Trip: TRP-0882','expense'),
  L('2026-06-29 16:52','anita.ops','Anita Bose','Operations Manager','Trip Master','Created','TRP-0891 – VEH-013 – Delhi → Agra','TRP-0891','Success','192.168.1.23','Plant 1',null,'Trip: Delhi to Agra, 200 km, Goods: FMCG','trip'),
  L('2026-06-29 16:28','srini.maint','Srini Kumar','Maintenance Manager','Vehicle Inspection','Created','INSP-0077 – VEH-013 – Pre-Departure','INSP-0077','Success','192.168.1.47','Plant 3',null,'Pre-trip inspection passed, All systems OK','inspection'),
  L('2026-06-29 16:05','vikram.finance','Vikram Patel','Finance Manager','Operational Payments','Approved','STL-0183 – Driver: Anand K – ₹11,200','STL-0183','Success','192.168.1.33','HQ','Status: Pending','Status: Approved, Ref: STL/JUN/2026/183','payment'),
  L('2026-06-29 15:42','nalini.hr','Nalini Rao','HR Manager','Staff Management','Deleted','EMP-031 – Suresh P – Resigned','EMP-031','Warning','192.168.1.55','HQ','Status: Active','Status: Terminated, Last Date: 2026-06-28','employee'),
  L('2026-06-29 15:20','ashwini.admin','Ashwini Kumar','Administrator','User Management','Created','User: mohan.ops – Operations ERP Access','USR-049','Success','192.168.1.10','HQ',null,'New ERP User: mohan.ops, Role: Operations Manager','user'),
  L('2026-06-29 14:58','kiran.maint','Kiran Mehta','Maintenance Manager','Incidents','Created','INC-0035 – VEH-004 – Windshield Crack','INC-0035','Success','192.168.1.45','Plant 2',null,'Incident: Windshield cracked, Location: Plant 2 Gate, Minor','incident'),
  L('2026-06-29 14:35','suresh.ops','Suresh Reddy','Operations Manager','Vehicle Master','Uploaded','VEH-005 – RC Book Uploaded','VEH-005','Success','192.168.1.22','Plant 1',null,'Document: RC Book, File: VEH005_RC_2026.pdf','vehicle'),
  L('2026-06-29 14:12','priya.finance','Priya Nair','Finance Manager','Purchase Orders','Approved','PO-0144 – Tyre Purchase ₹72,000','PO-0144','Success','192.168.1.31','HQ','Status: Submitted','Status: Approved, Vendor: MRF Tyres Ltd','po'),
  L('2026-06-29 13:50','system','System','System','Authentication','Login','ashwini.admin – 192.168.1.10','SES-AD001','Success','192.168.1.10','HQ',null,'Login: Success, Session: 8h 42m','auth'),

  // ── 2026-06-28 ────────────────────────────────────────────────────────────
  L('2026-06-28 17:30','vikram.finance','Vikram Patel','Finance Manager','Vendor Ledger','Updated','VEND-0045 – Credit Limit Updated','VEND-0045','Success','192.168.1.33','HQ','Credit Limit: ₹2,00,000','Credit Limit: ₹3,50,000','vendor'),
  L('2026-06-28 17:05','anita.ops','Anita Bose','Operations Manager','Fuel Management','Approved','FUE-0438 – VEH-009 – Batch Approved','FUE-0438','Success','192.168.1.23','Plant 1','Status: Pending','Status: Approved, 3 entries','fuel'),
  L('2026-06-28 16:40','kiran.maint','Kiran Mehta','Maintenance Manager','Service & Maintenance','Created','SVC-0236 – VEH-016 – Clutch Replace','SVC-0236','Success','192.168.1.45','Plant 2',null,'Service: Clutch Assembly, Estimate: ₹15,000','maintenance'),
  L('2026-06-28 16:15','priya.finance','Priya Nair','Finance Manager','P&L Reports','Exported','Weekly Report – W26 2026','RPT-0087','Success','192.168.1.31','HQ',null,'Report: Weekly P&L, Period: 22-28 Jun 2026','report'),
  L('2026-06-28 15:52','suresh.ops','Suresh Reddy','Operations Manager','Trip Master','Updated','TRP-0887 – Route Changed','TRP-0887','Success','192.168.1.22','Plant 1','Route: Bengaluru–Chennai (NH-44)','Route: Bengaluru–Chennai (NH-48 via Hosur)','trip'),
  L('2026-06-28 15:28','srini.maint','Srini Kumar','Maintenance Manager','Parts & Inventory','Deleted','INV-PART-0298 – Damaged Stock Written Off','INV-PART-0298','Warning','192.168.1.47','Plant 3','Stock: 8 units','Stock: 0, Written off – Water damage','part'),
  L('2026-06-28 15:05','ashwini.admin','Ashwini Kumar','Administrator','Administration','Updated','Report Header Text Updated','SYS-002','Success','192.168.1.10','HQ','Header: Old format','Header: Fleet Logistics Pvt Ltd | GST: 29AABCF1234D1Z5','admin'),
  L('2026-06-28 14:42','nalini.hr','Nalini Rao','HR Manager','Staff Management','Updated','EMP-022 – Medical Certificate Uploaded','EMP-022','Success','192.168.1.55','HQ',null,'Document: Medical Fitness, Valid: 2027-06-27','employee'),

  // ── 2026-06-27 ────────────────────────────────────────────────────────────
  L('2026-06-27 16:55','priya.finance','Priya Nair','Finance Manager','Operational Payments','Created','STL-0184 – Batch 12 Settlements','STL-0184','Success','192.168.1.31','HQ',null,'12 driver settlements generated, Total: ₹1,35,600','payment'),
  L('2026-06-27 16:30','kiran.maint','Kiran Mehta','Maintenance Manager','Tyres Management','Created','TYR-0091 – Retreading – 4 Tyres VEH-006','TYR-0091','Success','192.168.1.45','Plant 2',null,'4 tyres sent for retreading, Vendor: Apollo Retread','tyre'),
  L('2026-06-27 16:05','anita.ops','Anita Bose','Operations Manager','Vehicle Master','Updated','VEH-011 – PUC Renewed','VEH-011','Success','192.168.1.23','Plant 1','PUC Expiry: 2026-06-27','PUC Expiry: 2026-12-26','vehicle'),
  L('2026-06-27 15:40','suresh.ops','Suresh Reddy','Operations Manager','Fuel Management','Created','FUE-0443 – VEH-003 – 110 L Diesel','FUE-0443','Success','192.168.1.22','Plant 1',null,'Fuel: 110 L @ ₹94.60/L, Station: BPCL Tumkur Road','fuel'),
  L('2026-06-27 15:15','ashwini.admin','Ashwini Kumar','Administrator','User Management','Password Reset','User: priya.finance – Admin Initiated','USR-031','Success','192.168.1.10','HQ',null,'Password reset initiated by Administrator','user'),
  L('2026-06-27 14:50','vikram.finance','Vikram Patel','Finance Manager','Income & Expense','Approved','INC-0232 – Freight Income ₹2,15,000','INC-0232','Success','192.168.1.33','HQ','Status: Draft','Status: Approved, Total: ₹2,15,000 June batch','expense'),
  L('2026-06-27 14:25','srini.maint','Srini Kumar','Maintenance Manager','Service & Maintenance','Completed','SVC-0228 – VEH-014 – Gearbox Overhaul','SVC-0228','Success','192.168.1.47','Plant 3','Status: In Progress','Status: Completed, Final Cost: ₹35,000','maintenance'),
  L('2026-06-27 14:00','nalini.hr','Nalini Rao','HR Manager','Staff Management','Uploaded','EMP-018 – Aadhar Card Uploaded','EMP-018','Success','192.168.1.55','HQ',null,'Document: Aadhar Card, Verified: Yes','employee'),
  L('2026-06-27 13:35','priya.finance','Priya Nair','Finance Manager','Vendor Ledger','Updated','VEND-0034 – Reconciliation Done','VEND-0034','Success','192.168.1.31','HQ','Balance: ₹82,000 CR','Balance: ₹45,000 CR, Payments applied','vendor'),
  L('2026-06-27 13:10','system','System','System','Authentication','Logout','suresh.ops – Session Ended','SES-SUR01','Success','192.168.1.22','Plant 1',null,'Logout: Normal, Session Duration: 6h 15m','auth'),

  // ── 2026-06-26 ────────────────────────────────────────────────────────────
  L('2026-06-26 17:22','kiran.maint','Kiran Mehta','Maintenance Manager','Parts & Inventory','Created','INV-PART-0336 – Oil Filter × 15','INV-PART-0336','Success','192.168.1.45','Plant 2',null,'Stock In: 15 × Oil Filter, Vendor: Bosch India, ₹4,500','part'),
  L('2026-06-26 16:58','anita.ops','Anita Bose','Operations Manager','Trip Master','Closed','TRP-0882 – Mumbai → Delhi Completed','TRP-0882','Success','192.168.1.23','Plant 1','Status: Active','Status: Completed, KM: 1,420','trip'),
  L('2026-06-26 16:35','priya.finance','Priya Nair','Finance Manager','Purchase Orders','Created','PO-0147 – Diesel Purchase ₹2,25,000','PO-0147','Success','192.168.1.31','HQ',null,'PO: 2500 L Diesel, Vendor: HP Petroleum, ₹2,25,000','po'),
  L('2026-06-26 16:12','ashwini.admin','Ashwini Kumar','Administrator','Roles & Permissions','Created','New Role: Depot Manager','ROLE-07','Success','192.168.1.10','HQ',null,'Custom Role Created: Depot Manager, 28 permissions enabled','role'),
  L('2026-06-26 15:48','suresh.ops','Suresh Reddy','Operations Manager','Vehicle Inspection','Created','INSP-0076 – VEH-008 – Post-Service Check','INSP-0076','Success','192.168.1.22','Plant 1',null,'Post-service inspection: All systems normal','inspection'),
  L('2026-06-26 15:25','vikram.finance','Vikram Patel','Finance Manager','Operational Payments','Settled','STL-0181 – Driver: Ravi K – ₹9,800','STL-0181','Success','192.168.1.33','HQ','Status: Approved','Status: Settled, Bank Transfer: ₹9,800','payment'),
  L('2026-06-26 15:02','srini.maint','Srini Kumar','Maintenance Manager','Tyres Management','Updated','TYR-0085 – Rotated VEH-017','TYR-0085','Success','192.168.1.47','Plant 3','Position: Front-Left','Position: Rear-Right (Rotated)','tyre'),
  L('2026-06-26 14:38','nalini.hr','Nalini Rao','HR Manager','Staff Management','Updated','EMP-034 – Emergency Contact Updated','EMP-034','Success','192.168.1.55','HQ','Emergency: 9876543210','Emergency: 9988776655 (Wife – Suma)','employee'),
  L('2026-06-26 14:15','kiran.maint','Kiran Mehta','Maintenance Manager','Incidents','Updated','INC-0032 – Insurance Claim Filed','INC-0032','Success','192.168.1.45','Plant 2','Claim Status: Pending','Claim Status: Filed, Claim No: NAT/2026/4521','incident'),
  L('2026-06-26 13:52','system','System','System','Authentication','Login','vikram.finance – 49.36.211.44','SES-VIK01','Failed','49.36.211.44','HQ',null,'Login: Failed – IP not whitelisted (External Access)','auth'),

  // ── 2026-06-25 ────────────────────────────────────────────────────────────
  L('2026-06-25 17:10','priya.finance','Priya Nair','Finance Manager','Income & Expense','Created','EXP-0314 – Road Tax Renewal ₹18,500','EXP-0314','Success','192.168.1.31','HQ',null,'Expense: ₹18,500, Road Tax – VEH-001, KA Registration','expense'),
  L('2026-06-25 16:45','anita.ops','Anita Bose','Operations Manager','Vehicle Master','Created','VEH-020 – GJ-01-ZZ-4321 – Eicher 10.90','VEH-020','Success','192.168.1.23','Plant 1',null,'New: Eicher 10.90, 2025 model, Plant 1 allocation','vehicle'),
  L('2026-06-25 16:22','suresh.ops','Suresh Reddy','Operations Manager','Trip Master','Created','TRP-0894 – VEH-020 – Rajkot → Vadodara','TRP-0894','Success','192.168.1.22','Plant 1',null,'New vehicle first trip, Distance: 220 km','trip'),
  L('2026-06-25 15:58','kiran.maint','Kiran Mehta','Maintenance Manager','Service & Maintenance','Updated','SVC-0235 – Parts Ordered','SVC-0235','Success','192.168.1.45','Plant 2','Status: Created','Status: Parts Ordered, ETA: 2026-06-27','maintenance'),
  L('2026-06-25 15:35','ashwini.admin','Ashwini Kumar','Administrator','Company Profile','Uploaded','GST Certificate Uploaded','COMP-001','Success','192.168.1.10','HQ',null,'Document: GST Certificate 2026-27, Valid: Mar 2027','company'),
  L('2026-06-25 15:12','vikram.finance','Vikram Patel','Finance Manager','Vendor Ledger','Created','VEND-0057 – MRF Tyres Ltd – Chennai','VEND-0057','Success','192.168.1.33','HQ',null,'New Vendor: MRF Tyres, GST: 33XXXXX, Credit: ₹5L','vendor'),
  L('2026-06-25 14:50','srini.maint','Srini Kumar','Maintenance Manager','Parts & Inventory','Updated','INV-PART-0315 – Reorder Alert Resolved','INV-PART-0315','Success','192.168.1.47','Plant 3','Stock: 2 units (Below Reorder)','Stock: 12 units, PO Received: PO-0141','part'),
  L('2026-06-25 14:27','nalini.hr','Nalini Rao','HR Manager','Staff Management','Created','EMP-050 – Ramesh V – Driver','EMP-050','Success','192.168.1.55','HQ',null,'New Driver: Ramesh V, DL: KA01-20220033, Joining: 25-Jun-2026','employee'),
  L('2026-06-25 14:05','priya.finance','Priya Nair','Finance Manager','P&L Reports','Exported','Plant-wise P&L – Q1 2026-27','RPT-0090','Success','192.168.1.31','HQ',null,'Report: Plant-wise P&L, Q1 FY 2026-27, Format: Excel','report'),

  // ── 2026-06-20 ────────────────────────────────────────────────────────────
  L('2026-06-20 16:30','ashwini.admin','Ashwini Kumar','Administrator','User Management','Created','User: pooja.maint – Maintenance Access','USR-050','Success','192.168.1.10','HQ',null,'ERP Login: pooja.maint, Role: Maintenance Manager, Plant 2','user'),
  L('2026-06-20 15:58','priya.finance','Priya Nair','Finance Manager','Operational Payments','Approved','STL-0175 – 15 Settlements – ₹1,78,000','STL-0175','Success','192.168.1.31','HQ','Status: Pending (15)','Status: All Approved, Total: ₹1,78,000','payment'),
  L('2026-06-20 15:35','kiran.maint','Kiran Mehta','Maintenance Manager','Tyres Management','Deleted','TYR-0071 – Scrapped Tyres Written Off','TYR-0071','Warning','192.168.1.45','Plant 2','Status: Scrap','Deleted from system – Insurance claim closed','tyre'),
  L('2026-06-20 15:12','suresh.ops','Suresh Reddy','Operations Manager','Fuel Management','Created','FUE-0442 – Bulk Fill 3 Vehicles','FUE-0442','Success','192.168.1.22','Plant 1',null,'Bulk Fuel Entry: VEH-001, 003, 007, Total: 345 L','fuel'),
  L('2026-06-20 14:50','anita.ops','Anita Bose','Operations Manager','Vehicle Master','Updated','VEH-002 – Odometer Reading Updated','VEH-002','Success','192.168.1.23','Plant 1','Odometer: 1,45,890 km','Odometer: 1,52,340 km (after trip TRP-0878)','vehicle'),
  L('2026-06-20 14:28','vikram.finance','Vikram Patel','Finance Manager','Income & Expense','Deleted','EXP-0308 – Duplicate Entry Removed','EXP-0308','Warning','192.168.1.33','HQ','Amount: ₹4,200','Deleted – Duplicate of EXP-0305','expense'),
  L('2026-06-20 14:05','srini.maint','Srini Kumar','Maintenance Manager','Vehicle Inspection','Created','INSP-0075 – Batch Inspection 5 Vehicles','INSP-0075','Success','192.168.1.47','Plant 3',null,'5 vehicle inspection: VEH-013 to 017, All passed','inspection'),
  L('2026-06-20 13:42','nalini.hr','Nalini Rao','HR Manager','Staff Management','Updated','EMP-007 – Bank Account Updated','EMP-007','Success','192.168.1.55','HQ','Account: XXXX4521','Account: XXXX8834, Bank: SBI Bengaluru','employee'),

  // ── 2026-06-15 ────────────────────────────────────────────────────────────
  L('2026-06-15 17:00','ashwini.admin','Ashwini Kumar','Administrator','Roles & Permissions','Permission Changed','Role: Viewer – Admin module hidden','ROLE-06','Success','192.168.1.10','HQ','Admin Module: View Enabled','Admin Module: View Disabled (Security Policy)','role'),
  L('2026-06-15 16:38','priya.finance','Priya Nair','Finance Manager','Purchase Orders','Rejected','PO-0140 – Rejected – Over Budget','PO-0140','Warning','192.168.1.31','HQ','Status: Submitted, Amount: ₹1,85,000','Status: Rejected, Reason: Exceeds monthly cap ₹1,50,000','po'),
  L('2026-06-15 16:15','kiran.maint','Kiran Mehta','Maintenance Manager','Service & Maintenance','Created','SVC-0233 – VEH-009 – Turbo Repair','SVC-0233','Success','192.168.1.45','Plant 2',null,'Service: Turbocharger repair, Estimate: ₹12,000','maintenance'),
  L('2026-06-15 15:52','suresh.ops','Suresh Reddy','Operations Manager','Trip Master','Created','TRP-0886 – VEH-001 – Bengaluru → Goa','TRP-0886','Success','192.168.1.22','Plant 1',null,'Trip: Bengaluru to Goa, 590 km, Cargo: 12 MT','trip'),
  L('2026-06-15 15:30','anita.ops','Anita Bose','Operations Manager','Fuel Management','Updated','FUE-0435 – Wrong Rate Corrected','FUE-0435','Warning','192.168.1.23','Plant 1','Rate: ₹96.00/L','Rate: ₹94.50/L, Correction approved by Anita Bose','fuel'),
  L('2026-06-15 15:08','vikram.finance','Vikram Patel','Finance Manager','Operational Payments','Created','STL-0180 – June W2 Batch 10 Drivers','STL-0180','Success','192.168.1.33','HQ',null,'10 driver settlements, Period: June 08-14, Total: ₹1,12,000','payment'),
  L('2026-06-15 14:45','srini.maint','Srini Kumar','Maintenance Manager','Parts & Inventory','Created','INV-PART-0337 – Clutch Kit × 5','INV-PART-0337','Success','192.168.1.47','Plant 3',null,'Stock In: 5 × Clutch Kit (Tata), Vendor: TVS Auto, ₹22,500','part'),
  L('2026-06-15 14:22','system','System','System','Authentication','Login','priya.finance – 117.196.45.200','SES-PRI02','Failed','117.196.45.200','HQ',null,'Login: Failed – Incorrect password, Account locked 5 min','auth'),

  // ── 2026-06-10 ────────────────────────────────────────────────────────────
  L('2026-06-10 17:15','ashwini.admin','Ashwini Kumar','Administrator','User Management','Updated','User: suresh.ops – Password Policy Enforced','USR-022','Success','192.168.1.10','HQ','Password Policy: Basic','Password Policy: Strong (8 char, special, number)','user'),
  L('2026-06-10 16:50','nalini.hr','Nalini Rao','HR Manager','Staff Management','Deleted','EMP-025 – Suresh M – Contract Expired','EMP-025','Warning','192.168.1.55','HQ','Status: Active','Status: Terminated, Contract End: 2026-06-09','employee'),
  L('2026-06-10 16:28','priya.finance','Priya Nair','Finance Manager','Income & Expense','Approved','INC-0228 – May Revenue Reconciled ₹8,45,000','INC-0228','Success','192.168.1.31','HQ','Status: Draft','Status: Approved, FY 2026-27 Q1 entry finalized','expense'),
  L('2026-06-10 16:05','kiran.maint','Kiran Mehta','Maintenance Manager','Tyres Management','Deleted','TYR-0068 – Scrap Tyres Disposed','TYR-0068','Warning','192.168.1.45','Plant 2','Condition: Scrap','Removed from system – Proper disposal certificate issued','tyre'),
  L('2026-06-10 15:42','suresh.ops','Suresh Reddy','Operations Manager','Vehicle Master','Updated','VEH-015 – FC Certificate Renewed','VEH-015','Success','192.168.1.22','Plant 1','FC Expiry: 2026-05-31','FC Expiry: 2028-05-30','vehicle'),
  L('2026-06-10 15:20','vikram.finance','Vikram Patel','Finance Manager','Vendor Ledger','Updated','VEND-0012 – Address Updated','VEND-0012','Success','192.168.1.33','HQ','Address: Old Bengaluru address','Address: New Chennai branch address','vendor'),
  L('2026-06-10 14:58','anita.ops','Anita Bose','Operations Manager','Trip Master','Closed','TRP-0876 – Batch Close 5 Trips','TRP-0876','Success','192.168.1.23','Plant 1','5 trips Active','5 trips Completed, Total KM: 3,450','trip'),
  L('2026-06-10 14:35','srini.maint','Srini Kumar','Maintenance Manager','Incidents','Created','INC-0031 – VEH-012 – Minor Accident','INC-0031','Warning','192.168.1.47','Plant 3',null,'Incident: Minor collision at Plant gate, No injuries, Damage: ₹8,000','incident'),
  L('2026-06-10 14:12','ashwini.admin','Ashwini Kumar','Administrator','Administration','Updated','Backup Completed – System Backup','SYS-003','Success','192.168.1.10','HQ',null,'System backup completed, Size: 2.4 GB, Location: Cloud','admin'),

  // ── 2026-06-05 ────────────────────────────────────────────────────────────
  L('2026-06-05 17:30','priya.finance','Priya Nair','Finance Manager','Purchase Orders','Approved','PO-0138 – Engine Oil 200L ₹28,000','PO-0138','Success','192.168.1.31','HQ','Status: Draft','Status: Approved, Vendor: Castrol India Ltd','po'),
  L('2026-06-05 17:05','kiran.maint','Kiran Mehta','Maintenance Manager','Service & Maintenance','Approved','SVC-0229 – Budget Approved ₹18,500','SVC-0229','Success','192.168.1.45','Plant 2','Budget: Pending','Budget Approved: ₹18,500, Work Order issued','maintenance'),
  L('2026-06-05 16:40','ashwini.admin','Ashwini Kumar','Administrator','Roles & Permissions','Updated','Role: Finance Manager – Delete Disabled','ROLE-02','Success','192.168.1.10','HQ','Delete Records: Enabled','Delete Records: Disabled (Audit Policy)','role'),
  L('2026-06-05 16:15','suresh.ops','Suresh Reddy','Operations Manager','Fuel Management','Approved','FUE-0430 – June Fuel Batch Approved','FUE-0430','Success','192.168.1.22','Plant 1','Status: Pending (18 entries)','Status: All Approved, Total: 2,150 L','fuel'),
  L('2026-06-05 15:52','nalini.hr','Nalini Rao','HR Manager','Staff Management','Created','EMP-047 – Ganesh R – Mechanic','EMP-047','Success','192.168.1.55','HQ',null,'New Staff: Ganesh R, Role: Mechanic, Plant 3','employee'),
  L('2026-06-05 15:30','anita.ops','Anita Bose','Operations Manager','Vehicle Master','Deleted','VEH-000 – Test Vehicle Removed','VEH-000','Warning','192.168.1.23','Plant 1','Status: Inactive','Deleted – Test vehicle, never operational','vehicle'),
  L('2026-06-05 15:08','vikram.finance','Vikram Patel','Finance Manager','Income & Expense','Created','EXP-0310 – Tyre Repair ₹2,500','EXP-0310','Success','192.168.1.33','HQ',null,'Expense: ₹2,500 – Tyre puncture repair VEH-007, Plant 1','expense'),
  L('2026-06-05 14:45','srini.maint','Srini Kumar','Maintenance Manager','Parts & Inventory','Updated','INV-PART-0300 – Minimum Stock Alert Set','INV-PART-0300','Success','192.168.1.47','Plant 3','Min Stock: 5','Min Stock: 8 (Updated per workshop requirement)','part'),

  // ── 2026-05-30 ────────────────────────────────────────────────────────────
  L('2026-05-30 17:45','ashwini.admin','Ashwini Kumar','Administrator','Company Profile','Updated','Invoice Prefix Changed to INV','COMP-001','Success','192.168.1.10','HQ','Invoice Prefix: FINV','Invoice Prefix: INV','company'),
  L('2026-05-30 17:20','priya.finance','Priya Nair','Finance Manager','Vendor Ledger','Updated','VEND-0034 – Payment Overdue Flagged','VEND-0034','Warning','192.168.1.31','HQ','Overdue: No','Overdue: Yes, Amount: ₹82,000, Days: 45','vendor'),
  L('2026-05-30 16:55','kiran.maint','Kiran Mehta','Maintenance Manager','Service & Maintenance','Created','SVC-0232 – VEH-005 – Annual Service','SVC-0232','Success','192.168.1.45','Plant 2',null,'Annual service scheduled, VEH-005, Estimate: ₹8,500','maintenance'),
  L('2026-05-30 16:30','suresh.ops','Suresh Reddy','Operations Manager','Trip Master','Created','TRP-0881 – VEH-006 – Pune → Nashik','TRP-0881','Success','192.168.1.22','Plant 1',null,'Trip: Pune to Nashik, 210 km, Steel Coils 18 MT','trip'),
  L('2026-05-30 16:08','nalini.hr','Nalini Rao','HR Manager','Staff Management','Updated','EMP-012 – Transfer – Plant 2 to Plant 3','EMP-012','Success','192.168.1.55','HQ','Plant: Plant 2','Plant: Plant 3, Effective: 2026-06-01','employee'),
  L('2026-05-30 15:45','anita.ops','Anita Bose','Operations Manager','Fuel Management','Created','FUE-0438 – VEH-006 – 80 L Diesel','FUE-0438','Success','192.168.1.23','Plant 1',null,'Fuel: 80 L @ ₹94.20/L, Total: ₹7,536','fuel'),
  L('2026-05-30 15:22','vikram.finance','Vikram Patel','Finance Manager','Purchase Orders','Created','PO-0143 – Battery × 4 ₹22,000','PO-0143','Success','192.168.1.33','HQ',null,'PO: 4 × Exide 12V 150Ah batteries, Vendor: Exide India','po'),
  L('2026-05-30 15:00','srini.maint','Srini Kumar','Maintenance Manager','Tyres Management','Updated','TYR-0080 – KM Limit Warning Acknowledged','TYR-0080','Warning','192.168.1.47','Plant 3','Alert: KM Limit 80,000 reached','Acknowledged, Scheduled for replacement in 5,000 km','tyre'),
  L('2026-05-30 14:38','ashwini.admin','Ashwini Kumar','Administrator','User Management','Updated','User: nalini.hr – 2FA Enabled','USR-015','Success','192.168.1.10','HQ','2FA: Disabled','2FA: Enabled (OTP via SMS)','user'),
  L('2026-05-30 14:15','system','System','System','Authentication','Login','srini.maint – 192.168.1.47','SES-SRN01','Success','192.168.1.47','Plant 3',null,'Login: Success, New Session','auth'),
];

// ─── Small UI components ──────────────────────────────────────────────────────

function KpiCard({ label, sub, value, icon: Icon, color, onClick, active }) {
  const c = {
    indigo:'bg-indigo-50 text-indigo-600',
    blue:  'bg-blue-50   text-blue-600',
    green: 'bg-green-50  text-green-600',
    red:   'bg-red-50    text-red-600',
    amber: 'bg-amber-50  text-amber-600',
    slate: 'bg-slate-100 text-slate-500',
  };
  const ring = {
    indigo:'border-indigo-400 ring-2 ring-indigo-200',
    blue:  'border-blue-400   ring-2 ring-blue-200',
    green: 'border-green-400  ring-2 ring-green-200',
    red:   'border-red-400    ring-2 ring-red-200',
    amber: 'border-amber-400  ring-2 ring-amber-200',
    slate: 'border-slate-400  ring-2 ring-slate-200',
  };
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-3 transition-all duration-150 ${
        active
          ? `${ring[color]} shadow-md`
          : 'border-slate-200 hover:shadow-md hover:border-slate-300 cursor-pointer'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-slate-800 leading-tight">{value}</p>
        <p className="text-[11px] font-black text-slate-600 mt-0.5 leading-tight">{label}</p>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-tight">{sub}</p>
      </div>
    </button>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Success;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${s}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status==='Success'?'bg-green-500':status==='Warning'?'bg-amber-500':'bg-red-500'
      }`} />
      {status}
    </span>
  );
}

function ActionBadge({ action }) {
  const s = ACTION_STYLE[action] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${s}`}>
      {action}
    </span>
  );
}

function ModuleTag({ module }) {
  const Icon = MODULE_ICON[module] || Settings;
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{module}</span>
    </div>
  );
}

function UserAvatar({ name, small }) {
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2);
  const COLORS = ['bg-indigo-100 text-indigo-700','bg-purple-100 text-purple-700','bg-green-100 text-green-700','bg-orange-100 text-orange-700','bg-cyan-100 text-cyan-700'];
  const color  = COLORS[name.charCodeAt(0)%5];
  const sz     = small ? 'w-6 h-6 text-[9px]' : 'w-7 h-7 text-[10px]';
  return (
    <div className={`${sz} rounded-full flex items-center justify-center shrink-0 font-black ${color}`}>
      {initials}
    </div>
  );
}

// ─── Export Dropdown ──────────────────────────────────────────────────────────

function ExportMenu({ onExport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v=>!v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
      >
        <Download className="w-3.5 h-3.5" /> Export Logs
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-40 bg-white rounded-xl border border-slate-200 shadow-xl z-20 overflow-hidden py-1">
          {['Export as CSV','Export as Excel','Export as PDF'].map(opt => (
            <button key={opt} onClick={() => { onExport(opt); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Log Detail Drawer ────────────────────────────────────────────────────────

const DETAIL_TABS = ['Activity','Record Changes'];

function LogDetailDrawer({ log, open, onClose }) {
  const [tab, setTab] = useState('Activity');
  useEffect(() => { if (open) setTab('Activity'); }, [open, log?.id]);

  if (!open || !log) return null;

  const Icon = MODULE_ICON[log.module] || Settings;


  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-slate-800 truncate">{log.id}</p>
                <StatusBadge status={log.status} />
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{log.dt} · {log.module}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 shrink-0 px-5 overflow-x-auto">
          {DETAIL_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-1 py-3 mr-5 text-xs font-bold transition-colors whitespace-nowrap ${
                tab===t ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px' : 'text-slate-500 hover:text-slate-800'
              }`}>{t}</button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Activity Tab ── */}
          {tab === 'Activity' && (
            <>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-white border-b border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activity Information</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label:'Activity ID', value: log.id },
                    { label:'Date',        value: log.dt.split(' ')[0] },
                    { label:'Time',        value: log.dt.split(' ')[1] },
                    { label:'User',        value: log.fullName, sub: log.user },
                    { label:'Role',        value: log.role },
                    { label:'Module',      value: log.module },
                    { label:'Action',      value: log.action, isAction: true },
                    { label:'Record',      value: log.record },
                    { label:'Plant',       value: log.plant },
                    { label:'Status',      value: log.status, isStatus: true },
                  ].map(row => (
                    <div key={row.label} className="flex items-start justify-between px-4 py-2.5 gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mt-0.5">{row.label}</span>
                      <div className="text-right">
                        {row.isStatus  ? <StatusBadge status={row.value} />
                        : row.isAction ? <ActionBadge action={row.value} />
                        : (
                          <>
                            <span className="text-xs font-bold text-slate-800 leading-snug block">{row.value}</span>
                            {row.sub && <span className="text-[10px] text-slate-400 font-mono">{row.sub}</span>}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}

          {/* ── Record Changes Tab ── */}
          {tab === 'Record Changes' && (
            <>
              <div>
                <p className="text-sm font-black text-slate-800 mb-3">Record Information</p>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {[
                      { label:'Record Type',    value: log.module },
                      { label:'Record ID',      value: log.recordId },
                      { label:'Affected Entity',value: log.record },
                      { label:'Action Taken',   value: log.action, isAction: true },
                    ].map(row => (
                      <div key={row.label} className="flex items-start justify-between px-4 py-2.5 gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mt-0.5">{row.label}</span>
                        {row.isAction
                          ? <ActionBadge action={row.value} />
                          : <span className="text-xs font-bold text-slate-800 text-right">{row.value}</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Diff view */}
              {(log.oldValue || log.newValue) ? (
                <div>
                  <p className="text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">Change Diff</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-red-200 bg-red-50 overflow-hidden">
                      <div className="px-3 py-2 bg-red-100 border-b border-red-200">
                        <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Before</p>
                      </div>
                      <div className="px-3 py-3">
                        <p className="text-xs font-mono text-red-800 leading-relaxed">
                          {log.oldValue || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-green-200 bg-green-50 overflow-hidden">
                      <div className="px-3 py-2 bg-green-100 border-b border-green-200">
                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">After</p>
                      </div>
                      <div className="px-3 py-3">
                        <p className="text-xs font-mono text-green-800 leading-relaxed">
                          {log.newValue || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-medium text-slate-500">No field-level changes recorded for this action.</p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTS = [10, 25, 50, 100];

export default function AuditLogs() {
  const [search,       setSearch]       = useState('');
  const [filterModule, setFilterModule] = useState('All');
  const [filterAction, setFilterAction] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterUser,   setFilterUser]   = useState('All');
  const [filterPlant,  setFilterPlant]  = useState('All');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(25);
  const [detailLog,    setDetailLog]    = useState(null);
  const [toast,        setToast]        = useState({ show:false, msg:'' });
  const [refreshed,    setRefreshed]    = useState(false);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [activeKpi,    setActiveKpi]    = useState(null);

  const showToast = msg => { setToast({ show:true, msg }); setTimeout(()=>setToast({ show:false, msg:''}), 2500); };

  // Unique values for filters
  const allUsers = useMemo(() => {
    const m = new Map();
    MOCK_LOGS.forEach(l => { if (!m.has(l.user)) m.set(l.user, l.fullName); });
    return Array.from(m.entries()).map(([u,n]) => ({ user:u, name:n }));
  }, []);

  // KPIs
  const today = '2026-07-02';
  const todayLogs     = MOCK_LOGS.filter(l => l.dt.startsWith(today));
  const activeUsers   = new Set(todayLogs.map(l=>l.user)).size;
  const criticalToday = MOCK_LOGS.filter(l => CRITICAL_ACTIONS.includes(l.action)).length;
  const failedTotal   = MOCK_LOGS.filter(l => l.status==='Failed').length;

  // Filter
  const filtered = useMemo(() => {
    return MOCK_LOGS.filter(l => {
      const q = search.trim().toLowerCase();
      if (q && !l.user.includes(q) && !l.fullName.toLowerCase().includes(q)
             && !l.id.toLowerCase().includes(q) && !l.record.toLowerCase().includes(q)) return false;
      if (filterModule !== 'All' && l.module !== filterModule) return false;
      if (filterAction !== 'All' && l.action !== filterAction) return false;
      if (filterStatus !== 'All' && l.status !== filterStatus) return false;
      if (filterUser   !== 'All' && l.user !== filterUser)     return false;
      if (filterPlant  !== 'All' && l.plant !== filterPlant)   return false;
      if (dateFrom && l.dt.split(' ')[0] < dateFrom) return false;
      if (dateTo   && l.dt.split(' ')[0] > dateTo)   return false;
      if (criticalOnly && !CRITICAL_ACTIONS.includes(l.action)) return false;
      return true;
    });
  }, [search, filterModule, filterAction, filterStatus, filterUser, filterPlant, dateFrom, dateTo, criticalOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page-1)*pageSize, page*pageSize);

  const resetFilters = () => {
    setSearch(''); setFilterModule('All'); setFilterAction('All');
    setFilterStatus('All'); setFilterUser('All'); setFilterPlant('All');
    setDateFrom(''); setDateTo(''); setCriticalOnly(false); setActiveKpi(null); setPage(1);
  };

  const hasFilter = search || filterModule!=='All' || filterAction!=='All' ||
    filterStatus!=='All' || filterUser!=='All' || filterPlant!=='All' || dateFrom || dateTo || criticalOnly;

  const handleKpi = (key, applyFn) => {
    if (activeKpi === key) { resetFilters(); return; }
    resetFilters();
    setActiveKpi(key);
    applyFn();
  };

  const handleExport = type => {
    showToast(`${type} — ${filtered.length} records`);
  };

  const handleRefresh = () => {
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 800);
    showToast('Audit logs refreshed.');
  };

  return (
    <div className="w-full max-w-400 mx-auto pb-12 space-y-5">

      {/* Toast */}
      <div className={`fixed top-6 right-6 z-60 flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-2xl px-4 py-3.5 transition-all duration-300 ${
        toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}>
        <div className="w-7 h-7 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <p className="text-sm font-black text-slate-800">{toast.msg}</p>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Audit Logs</h1>
            <p className="text-xs text-slate-400 font-medium">Track and review all user activities across the Fleet ERP.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshed ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <ExportMenu onExport={handleExport} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Activities"   sub="Click to clear filters"    value="18,542"           icon={Activity}      color="indigo" active={activeKpi===null && !hasFilter}
          onClick={() => resetFilters()} />
        <KpiCard label="Today's Activities" sub="Click to filter today"     value={todayLogs.length} icon={Clock}         color="blue"   active={activeKpi==='today'}
          onClick={() => handleKpi('today', () => { setDateFrom(today); setDateTo(today); setPage(1); })} />
        <KpiCard label="Active Users"       sub="Click to view today's logs" value={activeUsers}     icon={Users}         color="green"  active={activeKpi==='users'}
          onClick={() => handleKpi('users', () => { setDateFrom(today); setDateTo(today); setPage(1); })} />
        <KpiCard label="Critical Actions"   sub="Click to filter critical"  value={criticalToday}    icon={AlertTriangle} color="red"    active={activeKpi==='critical'}
          onClick={() => handleKpi('critical', () => { setCriticalOnly(true); setPage(1); })} />
        <KpiCard label="Failed Activities"  sub="Click to filter failed"    value={failedTotal}      icon={Shield}        color="amber"  active={activeKpi==='failed'}
          onClick={() => handleKpi('failed', () => { setFilterStatus('Failed'); setPage(1); })} />
        <KpiCard label="Last Activity"      sub="Click to view latest log"   value="2 mins ago"      icon={CheckCircle2}  color="slate"  active={false}
          onClick={() => setDetailLog(MOCK_LOGS[0])} />
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        {/* Row 1: Search + Dates */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search user, employee name, record ID, activity ID…"
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="date" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setPage(1);}}
                className="input pl-8 w-40 text-xs" placeholder="From" />
            </div>
            <span className="text-slate-400 text-xs font-bold">to</span>
            <input type="date" value={dateTo} onChange={e=>{setDateTo(e.target.value);setPage(1);}}
              className="input w-40 text-xs" placeholder="To" />
          </div>
        </div>

        {/* Row 2: Dropdowns */}
        <div className="flex flex-wrap gap-2">
          <select value={filterUser} onChange={e=>{setFilterUser(e.target.value);setPage(1);}} className="input w-44 bg-white cursor-pointer text-xs">
            <option value="All">All Users</option>
            {allUsers.map(u => <option key={u.user} value={u.user}>{u.name}</option>)}
          </select>
          <select value={filterModule} onChange={e=>{setFilterModule(e.target.value);setPage(1);}} className="input w-52 bg-white cursor-pointer text-xs">
            <option value="All">All Modules</option>
            {ALL_MODULES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filterAction} onChange={e=>{setFilterAction(e.target.value);setPage(1);}} className="input w-44 bg-white cursor-pointer text-xs">
            <option value="All">All Actions</option>
            {ALL_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(1);}} className="input w-36 bg-white cursor-pointer text-xs">
            <option value="All">All Status</option>
            <option>Success</option><option>Warning</option><option>Failed</option>
          </select>
          <select value={filterPlant} onChange={e=>{setFilterPlant(e.target.value);setPage(1);}} className="input w-36 bg-white cursor-pointer text-xs">
            <option value="All">All Plants</option>
            {ALL_PLANTS.map(p => <option key={p}>{p}</option>)}
          </select>
          {hasFilter && (
            <button onClick={resetFilters} className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
              Audit Logs ({filtered.length.toLocaleString()})
            </p>
            {hasFilter && (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Filtered
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Per page:</span>
            <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}} className="text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-2 py-1 bg-white cursor-pointer">
              {PAGE_SIZE_OPTS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Table body */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Activity ID','Date & Time','User','Role','Module','Action','Status','IP Address',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-400">No audit logs found</p>
                        <p className="text-xs text-slate-300 mt-1">Try changing the filters or search query</p>
                      </div>
                      {hasFilter && (
                        <button onClick={resetFilters} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors mt-1">
                          <X className="w-3.5 h-3.5" /> Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paginated.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors cursor-default">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{log.id}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs font-bold text-slate-700">{log.dt.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{log.dt.split(' ')[1]}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={log.fullName} small />
                      <div>
                        <p className="text-xs font-bold text-slate-800 whitespace-nowrap">{log.fullName}</p>
                        <p className="text-[10px] font-mono text-slate-400">{log.user}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{log.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ModuleTag module={log.module} />
                  </td>
                  <td className="px-4 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">{log.ip}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetailLog(log)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[11px] text-slate-500 font-medium">
              Showing <span className="font-black text-slate-700">{Math.min((page-1)*pageSize+1, filtered.length)}</span>–<span className="font-black text-slate-700">{Math.min(page*pageSize, filtered.length)}</span> of <span className="font-black text-slate-700">{filtered.length.toLocaleString()}</span> results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p=>Math.max(1,p-1))}
                disabled={page===1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page-2, totalPages-4));
                const p = start + i;
                return p <= totalPages ? (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors border ${
                      p===page ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}>{p}</button>
                ) : null;
              })}
              <button
                onClick={() => setPage(p=>Math.min(totalPages,p+1))}
                disabled={page===totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Drawer */}
      <LogDetailDrawer
        log={detailLog}
        open={!!detailLog}
        onClose={() => setDetailLog(null)}
      />
    </div>
  );
}
