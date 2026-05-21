require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

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
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Auto-create tyre_notifications table if not exists
require('./config/db').query(`
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


// 🔥 MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ IMPORTANT for form-data


// 🔥 STATIC FILE SERVING (FOR DOCUMENTS)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 🔥 API ROUTES
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
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
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
