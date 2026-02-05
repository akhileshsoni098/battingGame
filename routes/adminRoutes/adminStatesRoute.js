const express = require("express");
const {
  createGameStates,
  getAllGameStates,
  getGameStateById,
  updateGameStates,
  deleteGameStates,
} = require("../../controllers/adminControllers/adminGameStates");
const { adminAuthorization, adminAuthentication } = require("../../middlewares/adminAuth");

const router = express.Router();

// create Game states

router
  .route("/:gameId")
  .post(adminAuthentication, adminAuthorization, createGameStates);
// get List of Game states
router
  .route("/")
  .get(adminAuthentication, adminAuthorization, getAllGameStates);

// get Single of Game states
router
  .route("/:stateId")
  .get(adminAuthentication, adminAuthorization, getGameStateById);

// update Game states
router
  .route("/:stateId")
  .put(adminAuthentication, adminAuthorization, updateGameStates);

// delete Game states
router
  .route("/:stateId")
  .delete(adminAuthentication, adminAuthorization, deleteGameStates);

module.exports = router;
