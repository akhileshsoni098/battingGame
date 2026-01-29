const express = require("express");
const {
  registerAdmin,
  logInAdmin,
  adminProfile,
} = require("../../controllers/adminControllers/adminAuth");
const {
  adminAuthentication,
  adminAuthorization,
} = require("../../middlewares/adminAuth");

const router = express.Router();

router.route("/register").post(registerAdmin);

router.route("/login").post(logInAdmin);

router
  .route("/profile")
  .get(adminAuthentication, adminAuthorization, adminProfile);

module.exports = router;
