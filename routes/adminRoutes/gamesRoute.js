const exoress = require("express"); 
const { adminAuthentication, adminAuthorization } = require("../../middlewares/adminAuth");
const { createGames, getAllGames, updateGame, deleteGame, getGameDetails } = require("../../controllers/adminControllers/adminGamesCtrl");
const router = exoress.Router();

// createGames

router.route("/").post(adminAuthentication,adminAuthorization,createGames);

// get List of Games
router.route("/").get(adminAuthentication,adminAuthorization,getAllGames);

// get Single of Games
router.route("/:gameId").get(adminAuthentication,adminAuthorization,getGameDetails);

// update Game
router.route("/:gameId").put(adminAuthentication,adminAuthorization,updateGame);

// delete Game
router.route("/:gameId").delete(adminAuthentication,adminAuthorization,deleteGame);



module.exports = router;