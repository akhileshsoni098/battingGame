require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { registerUser } = require("./controllers/userControllers/userAuthCtrl");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Node Server Running 🚀");
});

// routes 

app.post("/register",registerUser)


module.exports = app;
