const Service = require('../models/serviceModel');
const db = require('../config/db');

// ======================================================
// SERVICE INTERVALS CONFIG (manufacturer recommendations)
// ======================================================
const SERVICE_INTERVALS = {
  'Oil Change':    { default: 40000, warning_km: 2000, critical_km: 500 },
  'Hub Greasing':  { default: 80000, warning_km: 3000, critical_km: 1000 },
  'General Check': { default: null,  warning_km: null, critical_km: null },
};


// ======================================================
// GET VEHICLE SERVICE STATUS (last service + next due)
// ======================================================
exports.getVehicleServiceStatus = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Get vehicle current odometer
    const [[vehicle]] = await db.query(
      `SELECT id, vehicle_no FROM vehicles WHERE id = ?`,
      [vehicleId]
    );

    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    // Use latest completed service odometer as current odometer
    const [[latestService]] = await db.query(
      `SELECT odometer FROM vehicle_services WHERE vehicle_id = ? AND status = 'Completed' ORDER BY odometer DESC LIMIT 1`,
      [vehicleId]
    );
    const currentOdo = Number(latestService?.odometer || 0);

    // Get last completed service for each type
    const serviceTypes = Object.keys(SERVICE_INTERVALS);
    const serviceStatus = {};

    for (const type of serviceTypes) {
      const [[last]] = await db.query(
        `SELECT id, service_date, odometer, interval_km, next_due, status
         FROM vehicle_services
         WHERE vehicle_id = ? AND service_type = ? AND status = 'Completed'
         ORDER BY odometer DESC LIMIT 1`,
        [vehicleId, type]
      );

      const interval = SERVICE_INTERVALS[type];
      const lastOdo = last ? Number(last.odometer || 0) : 0;
      const intervalKm = last?.interval_km || interval.default;
      const nextDue = intervalKm ? lastOdo + intervalKm : null;
      const kmRemaining = nextDue ? nextDue - currentOdo : null;

      let alertLevel = 'ok';
      if (kmRemaining !== null) {
        if (kmRemaining <= 0) alertLevel = 'overdue';
        else if (kmRemaining <= interval.critical_km) alertLevel = 'critical';
        else if (kmRemaining <= interval.warning_km) alertLevel = 'warning';
      }

      serviceStatus[type] = {
        service_type: type,
        last_service_date: last?.service_date || null,
        last_service_odo: lastOdo,
        interval_km: intervalKm,
        next_due_odo: nextDue,
        km_remaining: kmRemaining,
        alert_level: alertLevel,
        current_odo: currentOdo,
      };
    }

    res.json({
      success: true,
      data: {
        vehicle,
        current_odometer: currentOdo,
        service_status: serviceStatus,
      }
    });

  } catch (error) {
    console.error('GET VEHICLE SERVICE STATUS ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ======================================================
// GET ALL FLEET SERVICE ALERTS
// ======================================================
exports.getServiceAlerts = async (req, res) => {
  try {
    const [vehicles] = await db.query(
      `SELECT id, vehicle_no FROM vehicles ORDER BY vehicle_no ASC`
    );

    const alerts = [];

    for (const vehicle of vehicles) {
      const [[latestSvc]] = await db.query(
        `SELECT odometer FROM vehicle_services WHERE vehicle_id = ? AND status = 'Completed' ORDER BY odometer DESC LIMIT 1`,
        [vehicle.id]
      );
      const currentOdo = Number(latestSvc?.odometer || 0);

      for (const [type, interval] of Object.entries(SERVICE_INTERVALS)) {
        if (!interval.default) continue; // skip General Check

        const [[last]] = await db.query(
          `SELECT odometer, interval_km, next_due, service_date
           FROM vehicle_services
           WHERE vehicle_id = ? AND service_type = ? AND status = 'Completed'
           ORDER BY odometer DESC LIMIT 1`,
          [vehicle.id, type]
        );

        const lastOdo = last ? Number(last.odometer || 0) : 0;
        const intervalKm = last?.interval_km || interval.default;
        const nextDue = lastOdo + intervalKm;
        const kmRemaining = nextDue - currentOdo;

        let alertLevel = null;
        if (kmRemaining <= 0) alertLevel = 'overdue';
        else if (kmRemaining <= interval.critical_km) alertLevel = 'critical';
        else if (kmRemaining <= interval.warning_km) alertLevel = 'warning';

        if (alertLevel) {
          alerts.push({
            vehicle_id: vehicle.id,
            vehicle_no: vehicle.vehicle_no,
            make_brand: vehicle.make_brand,
            service_type: type,
            current_odo: currentOdo,
            last_service_odo: lastOdo,
            last_service_date: last?.service_date || null,
            interval_km: intervalKm,
            next_due_odo: nextDue,
            km_remaining: kmRemaining,
            alert_level: alertLevel,
          });
        }
      }
    }

    // Sort: overdue first, then critical, then warning
    const order = { overdue: 0, critical: 1, warning: 2 };
    alerts.sort((a, b) => order[a.alert_level] - order[b.alert_level] || a.km_remaining - b.km_remaining);

    res.json({ success: true, count: alerts.length, data: alerts });

  } catch (error) {
    console.error('GET SERVICE ALERTS ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ✅ CREATE SERVICE
exports.createService = async (req, res) => {
  try {
    const body = req.body;
    console.log('CREATE SERVICE body:', body);

    if (!body.vehicle_id) return res.status(400).json({ success: false, message: 'Vehicle required' });
    if (!body.service_type) return res.status(400).json({ success: false, message: 'Service type required' });

    // Auto-calculate interval and next_due
    const intervalCfg = SERVICE_INTERVALS[body.service_type];
    const intervalKm = Number(body.interval_km) || intervalCfg?.default || 0;
    const odometer = Number(body.odometer) || 0;
    const nextDue = intervalKm ? odometer + intervalKm : null;

    const serviceId = await Service.createService({
      vehicle_id:       body.vehicle_id,
      service_date:     body.service_date,
      odometer:         odometer || null,
      interval_km:      intervalKm || null,
      next_due:         nextDue || null,
      service_type:     body.service_type,
      mechanic:         body.garage_name || body.garage || body.mechanic || null,
      labour_cost:      Number(body.labour_cost) || 0,
      total_cost:       Number(body.total_cost) || 0,
      status:           body.status || 'Reported',
      work_description: body.work_description || null,
      completed_date:   body.status === 'Completed' ? (body.service_date || new Date().toISOString().split('T')[0]) : null,
    });

    if (body.parts) {
      const parsedParts = JSON.parse(body.parts);
      await Service.addParts(serviceId, parsedParts);
    }

    if (req.files) await Service.addFiles(serviceId, req.files);

    // Update vehicle last_odometer when service is completed
    res.status(201).json({ success: true, message: 'Service created successfully', serviceId });

  } catch (error) {
    console.error('SERVICE CREATE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ✅ GET ALL SERVICES
exports.getAllServices = async (req, res) => {
  try {
    const data = await Service.getAll();

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


// ✅ GET SERVICE BY ID
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Service.getById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // ✅ JUST RETURN DATA (already includes parts + files)
    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("GET SERVICE BY ID ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// ✅ GET BY VEHICLE
exports.getByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const data = await Service.getByVehicle(vehicleId);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

// ✅ UPDATE SERVICE
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const intervalCfg = SERVICE_INTERVALS[body.service_type];
    const intervalKm = Number(body.interval_km) || intervalCfg?.default || 0;
    const odometer = Number(body.odometer) || 0;
    const nextDue = intervalKm ? odometer + intervalKm : null;

    await Service.update(id, {
      vehicle_id:       body.vehicle_id,
      service_date:     body.service_date,
      odometer:         odometer || null,
      interval_km:      intervalKm || null,
      next_due:         nextDue || null,
      service_type:     body.service_type,
      mechanic:         body.garage_name || body.garage || body.mechanic || null,
      labour_cost:      Number(body.labour_cost) || 0,
      total_cost:       Number(body.total_cost) || 0,
      status:           body.status,
      work_description: body.work_description || null,
      completed_date:   body.status === 'Completed' ? (body.service_date || new Date().toISOString().split('T')[0]) : null,
    });

    if (body.parts) {
      await Service.deleteParts(id);
      await Service.addParts(id, JSON.parse(body.parts));
    }

    if (req.files?.length > 0) await Service.addFiles(id, req.files);

    // Update vehicle last_odometer when completed
    res.json({ success: true, message: 'Service updated successfully' });

  } catch (error) {
    console.error('UPDATE SERVICE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};