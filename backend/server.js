require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const vehicleRoutes = require('./routes/vehicleRoutes');
const stationRoutes = require('./routes/stationRoutes');
const supervisorRoutes = require('./routes/supervisorRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const repairRoutes = require('./routes/repairRoutes');
const garageRoutes = require('./routes/garageRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const incidentsRoutes = require('./routes/incidentsRoutes');
const warrantyRoutes = require('./routes/warrantiesRoutes');
const warrantyClaimRoutes =
require('./routes/warrantyClaimRoutes');
const inspectionPlanRoutes = require('./routes/inspectionPlanRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const tyreRoutes = require('./routes/tyreRoutes');
const oldTyreRoutes = require('./routes/oldTyreRoutes');
const batteryRoutes = require('./routes/batteryRoutes');
const inspectionDefectRoutes = require('./routes/inspectionDefectRoutes');
const notificationRoutes          = require('./routes/notificationRoutes');
const warrantyNotificationRoutes  = require('./routes/warrantyNotificationRoutes');
const dashboardRoutes             = require('./routes/dashboardRoutes');
const { startWarrantyExpiryChecker } = require('./services/warrantyExpiryChecker');
const incomeRoutes =
require('./routes/incomeRoutes');
const expenseRoutes =
require("./routes/expenseRoutes");
const app = express();
const vendorTransactionRoutes =
require("./routes/vendorTransactionRoutes");
const vendorRoutes =
require("./routes/vendorRoutes");
const vendorPaymentRoutes =
require("./routes/vendorPaymentRoutes");

const showroomRoutes =
require("./routes/showroomRoutes");

const showroomLedgerRoutes =
require("./routes/showroomLedgerRoutes");

const partsVendorRoutes =
require("./routes/partsVendorRoutes");


const tyreVendorRoutes =
require("./routes/tyreVendorRoutes");


const oilVendorRoutes =
require("./routes/oilVendorRoutes");
const labourVendorRoutes =
require("./routes/labourVendorRoutes");

const fuelVendorRoutes =
require("./routes/fuelVendorRoutes");

const partsVendorLedgerRoutes =
require(
"./routes/partsVendorLedgerRoutes"
);
const tyreRetreadingRoutes =
require("./routes/tyreRetreadingRoutes");

const tyreScrapRoutes = require('./routes/tyreScrapRoutes');

const tyreLedgerRoutes = require("./routes/tyreLedgerRoutes");

const oilLedgerRoutes =
require("./routes/oilLedgerRoutes");
const labourLedgerRoutes =
require("./routes/labourLedgerRoutes");
const fuelLedgerRoutes =
require("./routes/fuelLedgerRoutes");

const rtaExpenseRoutes =
require("./routes/rtaExpenseRoutes");
const rtaVendorRoutes =
require("./routes/rtaVendorRoutes");
const db = require('./config/db');

const rtaPaymentRoutes =
require("./routes/rtaPaymentRoutes");
const driverSettlementRoutes =
require("./routes/driverSettlementRoutes");
const staffSalaryRoutes = require("./routes/staffSalaryRoutes");


const truckPLRoutes = require("./routes/truckPLRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const truckInventoryRoutes = require("./routes/truckInventoryRoutes");
const fastagRoutes = require("./routes/fastagRoutes");
const fastagNotificationRoutes = require("./routes/fastagNotificationRoutes");
const tenderRoutes = require("./routes/tenderRoutes");
const companyProfileRoutes =
require("./routes/companyProfileRoutes");
const userManagementRoutes = require("./routes/userManagementRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const roleRoutes = require("./routes/roleRoutes");
const backupRestoreRoutes = require("./routes/backupRestoreRoutes");
const authRoutes = require("./routes/authRoutes");

// Truck assignments must support the same dynamic categories as warehouse inventory.
db.query(`
  ALTER TABLE truck_inventory
  MODIFY COLUMN category VARCHAR(150) NOT NULL DEFAULT 'Others'
`).then(() => console.log('truck_inventory category schema ready'))
  .catch(e => {
    if (e.code !== 'ER_NO_SUCH_TABLE') {
      console.error('truck_inventory schema update error:', e.message);
    }
  });

// Auto-create tyre_notifications table
db.query(`
  CREATE TABLE IF NOT EXISTS tyre_notifications (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    notification_id VARCHAR(60)  NOT NULL UNIQUE,
    vehicle_number  VARCHAR(50),
    tyre_id         VARCHAR(60),
    axle_position   VARCHAR(30),
    incident_type   VARCHAR(60)  NOT NULL,
    severity        ENUM('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
    priority        ENUM('Low','Normal','High','Urgent')   NOT NULL DEFAULT 'Normal',
    message         TEXT         NOT NULL,
    status          ENUM('Unread','Read') NOT NULL DEFAULT 'Unread',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => console.log('tyre_notifications table ready'))
  .catch(e => console.error('tyre_notifications table error:', e.message));

// Keep monthly FASTag fuel postings available for installations that predate the migration.
db.query(`
  CREATE TABLE IF NOT EXISTS fastag_monthly_postings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fastag_account_id INT NOT NULL,
    month DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_fastag_month (fastag_account_id, month),
    CONSTRAINT fk_monthly_posting_account FOREIGN KEY (fastag_account_id)
      REFERENCES fastag_accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_monthly_posting_transaction FOREIGN KEY (transaction_id)
      REFERENCES fastag_transactions(id) ON DELETE CASCADE
  )
`).then(() => console.log('fastag_monthly_postings table ready'))
  .catch(e => console.error('fastag_monthly_postings table error:', e.message));

// Auto-create warranty_notifications table
db.query(`
  CREATE TABLE IF NOT EXISTS warranty_notifications (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    warranty_id      INT          NOT NULL,
    warranty_number  VARCHAR(60),
    vehicle_no       VARCHAR(50),
    category         VARCHAR(60),
    title            VARCHAR(255) NOT NULL,
    message          TEXT         NOT NULL,
    severity         ENUM('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
    milestone_days   INT          NOT NULL DEFAULT 0,
    is_read          BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log('warranty_notifications table ready');
  // Start cron AFTER table is confirmed ready
  startWarrantyExpiryChecker();
}).catch(e => console.error('warranty_notifications table error:', e.message));

// Ensure employees and supervisors table columns exist
const ensureStaffColumns = async () => {
  try {
    const employeeCols = [
      "ALTER TABLE employees ADD COLUMN id_card_number VARCHAR(100) DEFAULT NULL",
      "ALTER TABLE employees ADD COLUMN address TEXT DEFAULT NULL",
      "ALTER TABLE employees ADD COLUMN station_id INT DEFAULT NULL",
      "ALTER TABLE employees ADD COLUMN wallet_balance DECIMAL(12,2) DEFAULT 0.00",
      "ALTER TABLE employees ADD COLUMN bank_name VARCHAR(150) DEFAULT NULL",
      "ALTER TABLE employees ADD COLUMN account_number VARCHAR(100) DEFAULT NULL",
      "ALTER TABLE employees ADD COLUMN ifsc_code VARCHAR(50) DEFAULT NULL",
      "ALTER TABLE employees ADD COLUMN notes TEXT DEFAULT NULL",
      "ALTER TABLE employees ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE employees ADD COLUMN id_document VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE employees ADD COLUMN bank_document VARCHAR(255) DEFAULT NULL",
    ];

    for (const q of employeeCols) {
      try {
        await db.query(q);
      } catch (err) {
        if (err.code !== 'ER_DUP_FIELDNAME') {
          // ignore already existing columns
        }
      }
    }

    const supervisorCols = [
      "ALTER TABLE supervisors ADD COLUMN supervisor_code VARCHAR(30) DEFAULT NULL",
      "ALTER TABLE supervisors ADD COLUMN email VARCHAR(150) DEFAULT NULL",
      "ALTER TABLE supervisors ADD COLUMN wallet_balance DECIMAL(12,2) DEFAULT 0.00",
      "ALTER TABLE supervisors ADD COLUMN notes TEXT DEFAULT NULL",
      "ALTER TABLE supervisors ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE supervisors ADD COLUMN id_document VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE supervisors ADD COLUMN bank_document VARCHAR(255) DEFAULT NULL",
    ];

    for (const q of supervisorCols) {
      try {
        await db.query(q);
      } catch (err) {
        if (err.code !== 'ER_DUP_FIELDNAME') {
          // ignore already existing columns
        }
      }
    }

    console.log('Employees and Supervisors schema check completed successfully.');
  } catch (err) {
    console.error('Staff schema migration error:', err.message);
  }
};
ensureStaffColumns();

// Auto-sync existing paid Driver Settlements and Staff Salaries to expense_entries
const syncPayrollToExpenseLedger = async () => {
  try {
    // 1. Sync Paid Driver Settlements
    const [paidSettlements] = await db.query("SELECT * FROM driver_settlements WHERE status = 'Paid'");
    for (const s of paidSettlements) {
      const expNum = s.settlement_no || `STL-${String(s.id).padStart(4, '0')}`;
      const [existing] = await db.query(
        "SELECT id FROM expense_entries WHERE expense_number = ? OR (vendor_payee = ? AND salary_month = ? AND expense_category = 'Driver Settlement')",
        [expNum, s.driver_name, s.statement_month]
      );
      if (existing.length === 0) {
        await db.query(`
          INSERT INTO expense_entries (
            expense_number,
            expense_category,
            expense_title,
            vehicle_id,
            vehicle_number,
            driver_id,
            driver_name,
            station_name,
            expense_date,
            amount,
            payment_method,
            payment_status,
            vendor_payee,
            description,
            salary_month,
            salary_type,
            salary_payment_mode,
            entry_status,
            created_by
          ) VALUES (?, 'Driver Settlement', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', ?, ?, ?, 'Driver', ?, 'Approved', 'Driver Payroll')
        `, [
          expNum,
          `Driver Settlement for ${s.driver_name || 'Driver'} (${s.statement_month || ''})`,
          s.vehicle_id || null,
          s.vehicle_no || null,
          s.driver_id || null,
          s.driver_name || null,
          s.plant_name || 'Main Plant',
          s.payment_date || s.approved_date || s.created_at,
          s.net_payable,
          s.payment_method || 'Bank Transfer',
          s.driver_name || 'Driver',
          `Settlement #${s.settlement_no || s.id}, Vehicle: ${s.vehicle_no}, Month: ${s.statement_month}.`,
          s.statement_month,
          s.payment_method || 'Bank Transfer'
        ]);
      }
    }

    // 2. Sync Paid Staff Salaries
    try {
      const [paidStaff] = await db.query("SELECT * FROM staff_salaries WHERE status = 'Paid'");
      for (const st of paidStaff) {
        const expNum = st.salary_slip_no || `SAL-${String(st.id).padStart(4, '0')}`;
        const [existing] = await db.query(
          "SELECT id FROM expense_entries WHERE expense_number = ? OR (vendor_payee = ? AND salary_month = ? AND expense_category = 'Staff Salary')",
          [expNum, st.staff_name, st.salary_month]
        );
        if (existing.length === 0) {
          await db.query(`
            INSERT INTO expense_entries (
              expense_number,
              expense_category,
              expense_title,
              station_name,
              expense_date,
              amount,
              payment_method,
              payment_status,
              vendor_payee,
              description,
              salary_month,
              salary_type,
              salary_payment_mode,
              entry_status,
              created_by
            ) VALUES (?, 'Staff Salary', ?, ?, ?, ?, ?, 'Paid', ?, ?, ?, ?, ?, 'Approved', 'Staff Payroll')
          `, [
            expNum,
            `Salary for ${st.staff_name || 'Staff'} (${st.staff_type || 'Employee'} - ${st.salary_month || ''})`,
            st.plant_name || st.department_or_station || 'Main Station',
            st.payment_date || st.created_at || new Date(),
            st.net_payable,
            st.payment_mode || 'Bank Transfer',
            st.staff_name || 'Staff Member',
            `Slip: ${expNum}, Mode: ${st.payment_mode || 'Bank Transfer'}, Ref: ${st.payment_reference || 'N/A'}`,
            st.salary_month,
            st.staff_type || 'Employee',
            st.payment_mode || 'Bank Transfer'
          ]);
        }
      }
    } catch (staffErr) {
      // staff_salaries table check
    }

    console.log('Payroll sync to expense_entries completed.');
  } catch (err) {
    console.error('Payroll ledger sync error:', err.message);
  }
};
syncPayrollToExpenseLedger();


// 🔥 MIDDLEWARE
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ IMPORTANT for form-data


// 🔥 STATIC FILE SERVING (FOR DOCUMENTS)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));


// 🔥 API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/supervisors', supervisorRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/repair', repairRoutes);
app.use('/api/garages', garageRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/warranties', warrantyRoutes);
app.use(
  '/api/warranty-claims',
  warrantyClaimRoutes
);
app.use(

  '/api/inspection-plans',

  inspectionPlanRoutes

);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/inspection-defects', inspectionDefectRoutes);
app.use(
  '/api/tyres',
  tyreRoutes
);
app.use(
  '/api/old-tyres',
  oldTyreRoutes
);
app.use('/api/batteries', batteryRoutes);
app.use('/api/notifications',         notificationRoutes);
app.use('/api/warranty-notifications', warrantyNotificationRoutes);
app.use('/api/dashboard',             dashboardRoutes);
app.use(
  '/api/income',
  incomeRoutes
);


app.use(
  "/api/expenses",
  expenseRoutes
);

app.use(
  "/api/vendors",
  vendorRoutes
);

app.use(
  "/api/vendors",
  vendorTransactionRoutes
);

app.use(
  "/api/vendors",
  vendorPaymentRoutes
);

app.use(
  "/api/showrooms",
  showroomRoutes
);

app.use(
  "/api/showroom-ledger",
  showroomLedgerRoutes
);

app.use(
  "/api/parts-vendors",
  partsVendorRoutes
);

app.use(
  "/api/tyre-vendors",
  tyreVendorRoutes
);

app.use(
  "/api/oil-vendors",
  oilVendorRoutes
);
app.use(
  "/api/labour-vendors",
  labourVendorRoutes
);
app.use(
  "/api/fuel-vendors",
  fuelVendorRoutes
);

app.use(
"/api/parts-vendors",
partsVendorLedgerRoutes
);


app.use(
  "/api/tyre-retreading",
  tyreRetreadingRoutes
);

app.use(
  '/api/tyre-scrap',
  tyreScrapRoutes
);

app.use("/api/tyre-ledger", tyreLedgerRoutes);
app.use(
  "/api/oil-ledger",
  oilLedgerRoutes
);
app.use(
  "/api/labour-ledger",
  labourLedgerRoutes
);

app.use(
  "/api/fuel-ledger",
  fuelLedgerRoutes
);

app.use(
  "/api/rta-vendors",
  rtaVendorRoutes
);
app.use(
  "/api/rta-expenses",
  rtaExpenseRoutes
);

app.use(
  "/api/rta-payments",
  rtaPaymentRoutes
);
app.use(
  "/api/driver-settlements",
  driverSettlementRoutes
);
app.use(
  "/api/staff-salaries",
  staffSalaryRoutes
);


app.use("/api/truck-pl", truckPLRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/truck-inventory", truckInventoryRoutes);
app.use("/api/fastag", fastagRoutes);
app.use("/api/fastag-notifications", fastagNotificationRoutes);
app.use("/api/tenders", tenderRoutes);

app.use(
    "/api/company-profile",
    companyProfileRoutes
);

app.use("/api/users", userManagementRoutes);
app.use(
    "/api/employees",
    employeeRoutes
);
app.use("/api/roles", roleRoutes);

app.use(
    "/api/backup-restore",
    backupRestoreRoutes
);

// 🔥 TEST ROUTE
app.get('/', (req, res) => {
  res.send('Fleet Management Backend is running...');
});


// 🔥 ERROR HANDLER (GOOD PRACTICE)
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});


// 🔥 START SERVER
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
