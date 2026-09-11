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

const truckPLRoutes = require("./routes/truckPLRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const truckInventoryRoutes = require("./routes/truckInventoryRoutes");
const vehicleInventoryRoutes = require("./routes/vehicleInventoryRoutes");
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
const pendingPurchaseOrderRoutes = require("./routes/pendingPurchaseOrderRoutes");


// Auto-create pending_purchase_orders table
db.query(`
  CREATE TABLE IF NOT EXISTS pending_purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    item_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    serial_number VARCHAR(255),
    ordered_quantity INT NOT NULL,
    received_quantity INT DEFAULT 0,
    pending_quantity INT NOT NULL,
    status ENUM('Pending','Partially Received','Completed') DEFAULT 'Pending',
    receive_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log('pending_purchase_orders table ready');
  // Fix any inventory_parts that landed in Others due to missing category mapping
  return db.query(`
    UPDATE inventory_parts ip
    JOIN pending_purchase_orders ppo
      ON LOWER(ip.part_name) = LOWER(ppo.item_name)
    SET ip.category = ppo.category
    WHERE (ip.category = 'Others' OR ip.category IS NULL OR ip.category = '')
      AND ppo.category IS NOT NULL
      AND ppo.category != ''
  `);
}).then(() => console.log('inventory_parts category sync done'))
  .catch(e => console.error('pending_purchase_orders table error:', e.message));

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

app.use("/api/truck-pl", truckPLRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/truck-inventory", truckInventoryRoutes);
app.use("/api/vehicle-inventory", vehicleInventoryRoutes);

// Auto-create vehicle_inventory tables
db.query(`
  CREATE TABLE IF NOT EXISTS vehicle_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL,
    inventory_item_id INT DEFAULT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Spare',
    quantity INT NOT NULL DEFAULT 1,
    assigned_date DATE DEFAULT NULL,
    condition_status VARCHAR(50) DEFAULT 'Good',
    source VARCHAR(30) DEFAULT 'manual',
    issue_history_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vehicle_number (vehicle_number),
    INDEX idx_item (inventory_item_id)
  )
`).then(() => db.query(`
  CREATE TABLE IF NOT EXISTS vehicle_inventory_returns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_inventory_id INT DEFAULT NULL,
    inventory_item_id INT DEFAULT NULL,
    part_name VARCHAR(255) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    returned_quantity INT NOT NULL,
    return_date DATE NOT NULL,
    reason VARCHAR(255) DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vehicle (vehicle_number)
  )
`)).then(() => db.query(`
  CREATE TABLE IF NOT EXISTS vehicle_inventory_replacements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL,
    old_part VARCHAR(255) NOT NULL,
    new_part VARCHAR(255) NOT NULL,
    old_inventory_item_id INT DEFAULT NULL,
    new_inventory_item_id INT DEFAULT NULL,
    quantity INT NOT NULL DEFAULT 1,
    replace_date DATE NOT NULL,
    reason VARCHAR(255) DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vehicle (vehicle_number)
  )
`)).then(() => db.query(`
  CREATE TABLE IF NOT EXISTS vehicle_inventory_condition_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_inventory_id INT NOT NULL,
    old_condition VARCHAR(50) NOT NULL,
    new_condition VARCHAR(50) NOT NULL,
    remarks TEXT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vi (vehicle_inventory_id)
  )
`)).then(() => console.log('vehicle_inventory tables ready'))
  .catch(e => console.error('vehicle_inventory tables error:', e.message));
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

app.use("/api/purchase-orders", pendingPurchaseOrderRoutes);

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
