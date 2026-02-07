const express = require("express");
const {
  createGameCalendar,
  getGameCalendars,
  getGameCalendarById,
  updateGameCalendar,
  deleteGameCalendar,
} = require("../../controllers/adminControllers/adminGameCalender");
const {
  adminAuthorization,
  adminAuthentication,
} = require("../../middlewares/adminAuth");

router = express.Router();

//================== create Game Calendar =============

router
  .route("/:gameId")
  .post(adminAuthentication, adminAuthorization, createGameCalendar);
//=================== get List of Game Calendar ========
router
  .route("/")
  .get(adminAuthentication, adminAuthorization, getGameCalendars);
//=============== get Single of Game Calendar ========
router
  .route("/:calendarId")
  .get(adminAuthentication, adminAuthorization, getGameCalendarById);

//================ update Game Calendar ==============
router
  .route("/:calendarId")
  .put(adminAuthentication, adminAuthorization, updateGameCalendar);

//=================== delete Game Calendar ================
router
  .route("/:calendarId")
  .delete(adminAuthentication, adminAuthorization, deleteGameCalendar);

module.exports = router;
