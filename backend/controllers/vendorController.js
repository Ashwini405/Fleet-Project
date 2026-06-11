const Vendor = require("../models/vendorModel");

const vendorController = {

  // =====================================
  // GET ALL VENDORS
  // =====================================

  getAllVendors: async (req, res) => {
    try {

      const category = req.query.category;
      let vendors;

      if (category) {
        vendors = await Vendor.getVendorsByCategory(category);
      } else {
        vendors = await Vendor.getAllVendors();
      }

      res.status(200).json({
        success: true,
        count: vendors.length,
        data: vendors
      });

    } catch (error) {

      console.error("GET ALL VENDORS ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch vendors"
      });
    }
  },

  // =====================================
  // GET SINGLE VENDOR
  // =====================================

  getVendorById: async (req, res) => {
    try {

      const vendor =
        await Vendor.getVendorById(req.params.id);

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found"
        });
      }

      res.status(200).json({
        success: true,
        data: vendor
      });

    } catch (error) {

      console.error("GET VENDOR ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch vendor"
      });
    }
  },

  // =====================================
  // CREATE VENDOR
  // =====================================

  createVendor: async (req, res) => {
    try {

      console.log("\n=================================");
      console.log("CREATE VENDOR REQUEST");
      console.log(req.body);
      console.log("=================================\n");

      const result =
        await Vendor.createVendor(req.body);

      console.log("INSERT RESULT:");
      console.log(result);

      res.status(201).json({
        success: true,
        message: "Vendor created successfully",
        id: result.insertId
      });

    } catch (error) {

      console.error("CREATE VENDOR ERROR:", error);

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // =====================================
  // UPDATE VENDOR
  // =====================================

  updateVendor: async (req, res) => {
    try {

      const vendor =
        await Vendor.getVendorById(req.params.id);

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found"
        });
      }

      await Vendor.updateVendor(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Vendor updated successfully"
      });

    } catch (error) {

      console.error("UPDATE VENDOR ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update vendor"
      });
    }
  },

  // =====================================
  // DELETE VENDOR
  // =====================================

  deleteVendor: async (req, res) => {
    try {

      const vendor =
        await Vendor.getVendorById(req.params.id);

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found"
        });
      }

      await Vendor.deleteVendor(req.params.id);

      res.status(200).json({
        success: true,
        message: "Vendor deleted successfully"
      });

    } catch (error) {

      console.error("DELETE VENDOR ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete vendor"
      });
    }
  }

};

module.exports = vendorController;