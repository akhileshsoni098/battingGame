const express = require("express");

const user = express()

const userAuth = require("../routes/userRoutes/userAuthRoute")
const userGamesRoute= require("../routes/userRoutes/userGamesRoute")

user.use("/user", userAuth)
user.use("/user/games",userGamesRoute)
module.exports = user 