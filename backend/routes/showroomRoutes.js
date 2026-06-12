const express = require("express");

const router = express.Router();

const {
  getAllShowrooms,
  getShowroomById,
  createShowroom,
  updateShowroom
} = require(
  "../controllers/showroomController"
);

// GET ALL
router.get(
  "/",
  getAllShowrooms
);

// GET SINGLE
router.get(
  "/:id",
  getShowroomById
);

// UPDATE
router.put(
  "/:id",
  updateShowroom
);

// CREATE
router.post(
  "/",
  createShowroom
);

module.exports = router;