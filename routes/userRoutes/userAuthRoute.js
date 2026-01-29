const express = require("express");
const { userAuthentication } = require("../../middlewares/userAuth");
const { userProfile, logIn, registerUser } = require("../../controllers/userControllers/userAuthCtrl");

const router = express.Router();


router.route("/register").post(registerUser);

router.route("/logIn").post(logIn);

router.route("/profile").get(userAuthentication, userProfile);


module.exports = router;
