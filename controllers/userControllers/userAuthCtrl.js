const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

// REGISTER USER

exports.registerUser = async (req, res) => {
  try {
    const { fullName, mobileNumber, password, refferCode } = req.body;

    if (!fullName) {
      return res
        .status(400)
        .json({ status: false, message: "Full Name is required" });
    }

    if (!mobileNumber) {
      return res
        .status(400)
        .json({ status: false, message: "Mobile Number is required" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ status: false, message: "Password is required" });
    }

    //

    const [check] = await global.db.query(
      `SELECT mobileNumber FROM users WHERE mobileNumber = ${mobileNumber}`,
    );

    if (check.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Mobile Number is already registerd ",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await global.db.query(
      `INSERT INTO users (fullName, mobileNumber, password, refferCode)
       VALUES (?, ?, ?, ?)`,
      [fullName, mobileNumber, hashedPassword, refferCode],
    );

    if (!result.affectedRows) {
      return res
        .status(500)
        .json({ status: false, message: "Failed to register user" });
    }

    // logIn with id   userId = result.insertId

    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET_USER,
    );

    res.status(201).json({
      status: true,
      token: token,
      //   userId: result,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// LOGIN USER

exports.logIn = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};



