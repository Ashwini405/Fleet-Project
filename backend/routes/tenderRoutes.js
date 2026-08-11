const express = require("express");
const router = express.Router();
const tenderController = require("../controllers/tenderController");
const upload = require("../config/multer");
const { protect } = require("../middleware/permissionMiddleware");

router.get("/", ...protect("Tender Data", "view"), tenderController.getAllTenders);
router.get("/:id", ...protect("Tender Data", "view"), tenderController.getTenderById);
router.post("/", ...protect("Tender Data", "create"), upload.single("document"), tenderController.createTender);
router.put("/:id", ...protect("Tender Data", "edit"), upload.single("document"), tenderController.updateTender);
router.delete("/:id", ...protect("Tender Data", "delete"), tenderController.deleteTender);

module.exports = router;
