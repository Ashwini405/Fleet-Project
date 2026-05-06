const Service = require('../models/serviceModel');


// ✅ CREATE SERVICE
exports.createService = async (req, res) => {
  try {
    const {
      vehicle_id,
      service_date,
      odometer,
      interval_km,
      next_due,
      service_type,
      mechanic,
      labour_cost,
      total_cost,
      status,
      work_description,
      completed_date,
      parts
    } = req.body;

    // 🔥 VALIDATION
    if (!vehicle_id) {
      return res.status(400).json({ success: false, message: "Vehicle required" });
    }

    if (!service_type) {
      return res.status(400).json({ success: false, message: "Service type required" });
    }

    // ✅ CREATE MAIN SERVICE
    const serviceId = await Service.createService({
      vehicle_id,
      service_date,
      odometer,
      interval_km,
      next_due,
      service_type,
      mechanic,
      labour_cost,
      total_cost,
      status,
      work_description,
      completed_date
    });

    // ✅ ADD PARTS
    if (parts) {
      const parsedParts = JSON.parse(parts);
      await Service.addParts(serviceId, parsedParts);
    }

    // ✅ ADD FILES
    if (req.files) {
      await Service.addFiles(serviceId, req.files);
    }

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      serviceId
    });

  } catch (error) {
    console.error("SERVICE CREATE ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
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
    const {
      vehicle_id,
      service_date,
      odometer,
      service_type,
      labour_cost,
      total_cost,
      status,
      work_description,
      completed_date,
      parts
    } = req.body;

    // Update main service fields
    await Service.update(id, {
      vehicle_id,
      service_date,
      odometer,
      service_type,
      labour_cost,
      total_cost,
      status,
      work_description,
      completed_date
    });

    // Update parts if provided
    if (parts) {
      await Service.deleteParts(id);
      const parsedParts = JSON.parse(parts);
      await Service.addParts(id, parsedParts);
    }

    // Add new files if provided
    if (req.files && req.files.length > 0) {
      await Service.addFiles(id, req.files);
    }

    res.json({
      success: true,
      message: 'Service updated successfully'
    });

  } catch (error) {
    console.error('UPDATE SERVICE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};