require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Node Server Running 🚀");
});

// routes

const user = require("./routing/userRouting");
const admin = require("./routing/adminRouting");

app.use("/", user);

app.use("/", admin);

module.exports = app;
