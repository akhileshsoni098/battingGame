const express = require("express");
const admin = express();

const adminAuth = require("../routes/adminRoutes/adminAuth");

const gamesRoute = require("../routes/adminRoutes/gamesRoute");

const game_timingsRoute = require("../routes/adminRoutes/gamesTimingRoute");

const adminStatesRoute = require("../routes/adminRoutes/adminStatesRoute");

const adminGameCalenderRoute = require("../routes/adminRoutes/gameCalenderRoute");

const adminGameResultRoute = require("../routes/adminRoutes/adminGameResultRoute");

//////////////////////////////////////////////

admin.use("/admin", adminAuth);

admin.use("/admin/games", gamesRoute);

admin.use("/admin/game-timings", game_timingsRoute);

admin.use("/admin/game-states", adminStatesRoute);

admin.use("/admin/game-calendars", adminGameCalenderRoute);

admin.use("/admin/game-results", adminGameResultRoute);

module.exports = admin;
