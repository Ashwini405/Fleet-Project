const Vendor = require("../models/vendorModel");

const vendorController = {

  // GET ALL
  getAllVendors: async (req, res) => {

    try {

      const category = req.query.category;
      let vendors;

      if (category) {
        vendors = await Vendor.getVendorsByCategory(category);
      } else {
        vendors = await Vendor.getAllVendors();
      }

      res.json({ success: true, data: vendors });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch vendors"
      });
    }
  },

  // GET BY ID
  getVendorById: async (req, res) => {

    try {

      const vendor =
        await Vendor.getVendorById(req.params.id);

      res.json({
        success: true,
        data: vendor
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch vendor"
      });
    }
  },

  // CREATE
  createVendor: async (req, res) => {

    try {

      const result =
        await Vendor.createVendor(req.body);

      res.status(201).json({
        success: true,
        message: "Vendor created successfully",
        id: result.insertId
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to create vendor"
      });
    }
  },

  // UPDATE
  updateVendor: async (req, res) => {

    try {

      await Vendor.updateVendor(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        message: "Vendor updated successfully"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to update vendor"
      });
    }
  },

  // DELETE
  deleteVendor: async (req, res) => {

    try {

      await Vendor.deleteVendor(req.params.id);

      res.json({
        success: true,
        message: "Vendor deleted successfully"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to delete vendor"
      });
    }
  }

};

module.exports = vendorController;