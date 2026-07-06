const companyProfileModel = require("../models/companyProfileModel");

// =====================================================
// Create Company Profile
// =====================================================
const createCompanyProfile = async (req, res) => {
  try {

    const body = req.body;

    const files = req.files || {};

    body.company_logo =
      files.company_logo?.[0]?.filename || null;

    body.favicon_logo =
      files.favicon_logo?.[0]?.filename || null;

    body.company_signature =
      files.company_signature?.[0]?.filename || null;

    body.gst_certificate =
      files.gst_certificate?.[0]?.filename || null;

    body.pan_card =
      files.pan_card?.[0]?.filename || null;

    body.registration_certificate =
      files.registration_certificate?.[0]?.filename || null;

    body.trade_license =
      files.trade_license?.[0]?.filename || null;

    body.insurance_certificate =
      files.insurance_certificate?.[0]?.filename || null;

    const result =
      await companyProfileModel.createCompanyProfile(body);

    res.status(201).json({
      success: true,
      message: "Company Profile Created Successfully",
      id: result.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// =====================================================
// Get Company Profile
// =====================================================
const getCompanyProfile = async (req, res) => {

  try {

    const profile =
      await companyProfileModel.getCompanyProfile();

    if (!profile) {

      return res.status(404).json({

        success: false,

        message: "Company Profile Not Found"

      });

    }

    res.json({

      success: true,

      data: profile

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

// =====================================================
// Get Company Profile By ID
// =====================================================
const getCompanyProfileById = async (req, res) => {

  try {

    const profile =
      await companyProfileModel.getCompanyProfileById(
        req.params.id
      );

    if (!profile) {

      return res.status(404).json({

        success: false,

        message: "Company Profile Not Found"

      });

    }

    res.json({

      success: true,

      data: profile

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

// =====================================================
// Update Company Profile
// =====================================================
const updateCompanyProfile = async (req, res) => {

  try {

    const body = req.body;

    const existing =
      await companyProfileModel.getCompanyProfileById(
        req.params.id
      );

    if (!existing) {

      return res.status(404).json({

        success: false,

        message: "Company Profile Not Found"

      });

    }

    const files = req.files || {};

    body.company_logo =
      files.company_logo?.[0]?.filename ||
      existing.company_logo;

    body.favicon_logo =
      files.favicon_logo?.[0]?.filename ||
      existing.favicon_logo;

    body.company_signature =
      files.company_signature?.[0]?.filename ||
      existing.company_signature;

    body.gst_certificate =
      files.gst_certificate?.[0]?.filename ||
      existing.gst_certificate;

    body.pan_card =
      files.pan_card?.[0]?.filename ||
      existing.pan_card;

    body.registration_certificate =
      files.registration_certificate?.[0]?.filename ||
      existing.registration_certificate;

    body.trade_license =
      files.trade_license?.[0]?.filename ||
      existing.trade_license;

    body.insurance_certificate =
      files.insurance_certificate?.[0]?.filename ||
      existing.insurance_certificate;

    await companyProfileModel.updateCompanyProfile(
      req.params.id,
      body
    );

    res.json({

      success: true,

      message: "Company Profile Updated Successfully"

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

// =====================================================
// Delete Company Profile
// =====================================================
const deleteCompanyProfile = async (req, res) => {

  try {

    const profile =
      await companyProfileModel.getCompanyProfileById(
        req.params.id
      );

    if (!profile) {

    return res.status(200).json({

        success: true,

        data: null

    });

}

    await companyProfileModel.deleteCompanyProfile(
      req.params.id
    );

    res.json({

      success: true,

      message: "Company Profile Deleted Successfully"

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

module.exports = {

  createCompanyProfile,

  getCompanyProfile,

  getCompanyProfileById,

  updateCompanyProfile,

  deleteCompanyProfile

};