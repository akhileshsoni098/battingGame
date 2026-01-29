const express = require("express");

const user = express()

const userAuth = require("../routes/userRoutes/userAuthRoute")

user.use("/user", userAuth)

module.exports = user 