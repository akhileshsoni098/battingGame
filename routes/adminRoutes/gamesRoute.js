const exoress = require("express"); 
const { adminAuthentication, adminAuthorization } = require("../../middlewares/adminAuth");
const { createGames, getAllGames } = require("../../controllers/adminControllers/adminGamesCtrl");
const router = exoress.Router();

router.route("/").post(adminAuthentication,adminAuthorization,createGames);
router.route("/").get(adminAuthentication,adminAuthorization,getAllGames);


module.exports = router;