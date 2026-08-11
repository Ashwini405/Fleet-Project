const express = require("express");
const router = express.Router();
const truckInventoryController = require("../controllers/truckInventoryController");
const { protect } = require("../middleware/permissionMiddleware");

router.get("/vehicle/:vehicleId", ...protect("Vehicle Master", "view"), truckInventoryController.getByVehicle);
router.post("/", ...protect("Vehicle Master", "create"), truckInventoryController.createItem);
router.put("/:id", ...protect("Vehicle Master", "edit"), truckInventoryController.updateItem);
router.delete("/:id", ...protect("Vehicle Master", "delete"), truckInventoryController.deleteItem);

module.exports = router;
