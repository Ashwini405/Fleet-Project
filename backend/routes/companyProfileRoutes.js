const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const companyProfileController = require("../controllers/companyProfileController");

// ======================================================
// Multer Storage
// ======================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});

// ======================================================
// File Filter
// ======================================================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [

        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",

        "application/pdf"

    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(

            new Error(
                "Only JPG, PNG, WEBP and PDF files are allowed."
            ),
            false

        );

    }

};

// ======================================================
// Upload Middleware
// ======================================================

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 10 * 1024 * 1024

    }

});

// ======================================================
// Upload Fields
// ======================================================

const uploadFields = upload.fields([

    {
        name: "company_logo",
        maxCount: 1
    },

    {
        name: "favicon_logo",
        maxCount: 1
    },

    {
        name: "company_signature",
        maxCount: 1
    },

    {
        name: "gst_certificate",
        maxCount: 1
    },

    {
        name: "pan_card",
        maxCount: 1
    },

    {
        name: "registration_certificate",
        maxCount: 1
    },

    {
        name: "trade_license",
        maxCount: 1
    },

    {
        name: "insurance_certificate",
        maxCount: 1
    }

]);

// ======================================================
// Routes
// ======================================================

// Create
router.post(

    "/",

    uploadFields,

    companyProfileController.createCompanyProfile

);

// Get Single Company Profile

router.get(

    "/",

    companyProfileController.getCompanyProfile

);

// Get By Id

router.get(

    "/:id",

    companyProfileController.getCompanyProfileById

);

// Update

router.put(

    "/:id",

    uploadFields,

    companyProfileController.updateCompanyProfile

);

// Delete

router.delete(

    "/:id",

    companyProfileController.deleteCompanyProfile

);

module.exports = router;