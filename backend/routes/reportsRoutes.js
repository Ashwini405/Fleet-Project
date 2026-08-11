const express = require("express");

const router = express.Router();

const reportsController = require("../controllers/reportsController");
const { protect } = require("../middleware/permissionMiddleware");

router.get("/summary", ...protect("Reports", "view"), reportsController.getReportsSummary);

module.exports = router;
