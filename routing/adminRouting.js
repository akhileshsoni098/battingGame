const express = require("express");
const admin = express();

const adminAuth = require("../routes/adminRoutes/adminAuth");

const gamesRoute = require("../routes/adminRoutes/gamesRoute");

const game_timingsRoute = require("../routes/adminRoutes/gamesTimingRoute");

admin.use("/admin", adminAuth);

admin.use("/admin/games", gamesRoute);

admin.use("/admin/game-timings", game_timingsRoute);

module.exports = admin;
