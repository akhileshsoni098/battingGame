const exoress = require("express");
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

const router = exoress.Router();

// createGames

router
  .route("/:gameId")
  .post(adminAuthentication, adminAuthorization, createGameTiming);

// get List of Games
router.route("/").get(adminAuthentication, adminAuthorization, getGameTimings);

// get Single of Games
router
  .route("/:timingId")
  .get(adminAuthentication, adminAuthorization, getGameTimingById);

// update Game
router
  .route("/:timingId")
  .put(adminAuthentication, adminAuthorization, updateGameTiming);

// delete Game
router
  .route("/:timingId")
  .delete(adminAuthentication, adminAuthorization, deleteGameTiming);

module.exports = router;
