const express = require("express")
const { userAuthentication } = require("../../middlewares/userAuth")
const { getAllGamesUser } = require("../../controllers/userControllers/userGamesCtrl")

const router = express.Router()


router.route("/").get(userAuthentication,getAllGamesUser)


module.exports = router