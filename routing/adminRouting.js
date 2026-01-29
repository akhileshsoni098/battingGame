const express = require("express");
const admin = express();

const adminAuth = require("../routes/adminRoutes/adminAuth");

const gamesRoute = require("../routes/adminRoutes/gamesRoute");


admin.use("/admin", adminAuth);

admin.use("/admin/games", gamesRoute);

module.exports = admin;
