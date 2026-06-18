const express =
require("express");

const router =
express.Router();

const {
  createRetreading,
  getRetreading
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

module.exports =
router;