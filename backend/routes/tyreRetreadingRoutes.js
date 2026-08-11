const express =
require("express");

const router =
express.Router();

const {
  createRetreading,
  getRetreading,
  updateRetreading
} =
require("../controllers/tyreRetreadingController");

router.post(
  "/",
  createRetreading
);

router.get(
  "/",
  getRetreading
);

router.put(
  "/:id",
  updateRetreading
);

module.exports =
router;