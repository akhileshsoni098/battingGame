const express = require("express");

const {
  adminAuthentication,
  adminAuthorization,
} = require("../../middlewares/adminAuth");

const {
  createGameTiming,
  getGameTimings,
  getGameTimingById,
  deleteGameTiming,
  updateGameTiming,
} = require("../../controllers/adminControllers/adminGameTimingsCtrl");

const router = express.Router();

// create Game timing

router
  .route("/:gameId")
  .post(adminAuthentication, adminAuthorization, createGameTiming);

// get List of Game timing
router.route("/").get(adminAuthentication, adminAuthorization, getGameTimings);

// get Single of Game timing
router
  .route("/:timingId")
  .get(adminAuthentication, adminAuthorization, getGameTimingById);

// update Game timing
router
  .route("/:timingId")
  .put(adminAuthentication, adminAuthorization, updateGameTiming);

// delete Game timing
router
  .route("/:timingId")
  .delete(adminAuthentication, adminAuthorization, deleteGameTiming);

module.exports = router;
