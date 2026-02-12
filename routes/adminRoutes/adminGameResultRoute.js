const express = require("express");
const {
  createGameResult,
  getGameResults,
  getGameResultById,
  updateGameResult,
  deleteGameResult,
} = require("../../controllers/adminControllers/adminGameResult");
const { adminAuthentication, adminAuthorization } = require("../../middlewares/adminAuth");

const router = express.Router();

//================== create Game Result =============

router
  .route("/:gameId")
  .post(adminAuthentication, adminAuthorization, createGameResult);
//=================== get List of Game Result ========
router.route("/").get(adminAuthentication, adminAuthorization, getGameResults);
//=============== get Single of Game Result ========
router
  .route("/:resultId")
  .get(adminAuthentication, adminAuthorization, getGameResultById);

//================ update Game Result ==============
router
  .route("/:resultId")
  .put(adminAuthentication, adminAuthorization, updateGameResult);

//=================== delete Game Result ================
router
  .route("/:resultId")
  .delete(adminAuthentication, adminAuthorization, deleteGameResult);

module.exports = router;
