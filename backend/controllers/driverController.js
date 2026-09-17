const Driver = require('../models/driverModel');

// ================= CREATE DRIVER =================
exports.createDriver = async (req, res) => {
  try {
    const { full_name, mobile, license_no, id_card_number } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Driver full name is required."
      });
    }

    if (!mobile || !mobile.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required."
      });
    }

    // Check for duplicate driver records
    const dup = await Driver.checkDuplicate({
      mobile,
      license_no,
      id_card_number
    });

    if (dup.isDuplicate) {
      if (dup.field === 'mobile') {
        return res.status(400).json({
          success: false,
          message: `A driver with mobile number "${dup.value}" is already registered (${dup.driver.full_name}, ID: ${dup.driver.id}).`
        });
      }
      if (dup.field === 'license_no') {
        return res.status(400).json({
          success: false,
          message: `A driver with license number "${dup.value}" is already registered (${dup.driver.full_name}, ID: ${dup.driver.id}).`
        });
      }
      if (dup.field === 'id_card_number') {
        return res.status(400).json({
          success: false,
          message: `A driver with ID Card / Aadhaar "${dup.value}" is already registered (${dup.driver.full_name}, ID: ${dup.driver.id}).`
        });
      }
    }

    const data = {
      ...req.body,
      profile_photo:
        req.files?.profile_photo?.[0]?.filename || null,
      id_proof:
        req.files?.id_proof?.[0]?.filename || null,
      bank_document:
        req.files?.bank_document?.[0]?.filename || null,
    };

    await Driver.create(data);

    res.status(201).json({
      success: true,
      message: "Driver created successfully"
    });

  } catch (err) {
    console.error("Create Driver Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create driver"
    });
  }
};

// ================= UPDATE DRIVER =================
exports.updateDriver = async (req, res) => {
  try {
    const driverId = req.params.id;
    const { full_name, mobile, license_no, id_card_number } = req.body;

    if (full_name !== undefined && !full_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Driver full name cannot be empty."
      });
    }

    if (mobile !== undefined && !mobile.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mobile number cannot be empty."
      });
    }

    // Check for duplicate driver records excluding current driver
    const dup = await Driver.checkDuplicate({
      mobile,
      license_no,
      id_card_number,
      excludeId: driverId
    });

    if (dup.isDuplicate) {
      if (dup.field === 'mobile') {
        return res.status(400).json({
          success: false,
          message: `Another driver already has mobile number "${dup.value}" (${dup.driver.full_name}, ID: ${dup.driver.id}).`
        });
      }
      if (dup.field === 'license_no') {
        return res.status(400).json({
          success: false,
          message: `Another driver already has license number "${dup.value}" (${dup.driver.full_name}, ID: ${dup.driver.id}).`
        });
      }
      if (dup.field === 'id_card_number') {
        return res.status(400).json({
          success: false,
          message: `Another driver already has ID Card / Aadhaar "${dup.value}" (${dup.driver.full_name}, ID: ${dup.driver.id}).`
        });
      }
    }

    const data = {
      ...req.body,
      profile_photo:
        req.files?.profile_photo?.[0]?.filename || null,
      id_proof:
        req.files?.id_proof?.[0]?.filename || null,
      bank_document:
        req.files?.bank_document?.[0]?.filename || null,
    };

    await Driver.update(driverId, data);

    res.json({
      success: true,
      message: "Driver updated successfully"
    });

  } catch (err) {
    console.error("Update Driver Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to update driver"
    });
  }
};

// ================= GET ALL DRIVERS =================
exports.getDrivers = async (req, res) => {

  try {

    const data =
      await Driver.getAll();

    res.json({
      success: true,
      data
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });
  }
};

// ================= DRIVER PROFILE =================
exports.getDriverProfile = async (
  req,
  res
) => {

  try {

    const data =
      await Driver.getProfile(
        req.params.id
      );

    res.json({
      success: true,
      data
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= DELETE DRIVER =================
exports.deleteDriver = async (
  req,
  res
) => {

  try {

    await Driver.delete(
      req.params.id
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });
  }
};