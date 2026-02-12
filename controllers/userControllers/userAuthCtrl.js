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
      "SELECT id FROM users WHERE mobileNumber = ?",
      [mobileNumber],
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

    // wallet create automatically
    const userId = result.insertId;

    const [userWallet] = await global.db.query(
      `INSERT INTO user_wallets (userId, depositBalance, bonusBalance, winningBalance)
       VALUES (?,0,0,0)`,
      [userId],
    );

    console.log("userWallet", userWallet);

    // logIn with id   userId = result.insertId

    const token = jwt.sign(
      { _id: result.insertId },
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
    const data = req.body;
    const { mobileNumber, password } = data;

    if (!mobileNumber || !password) {
      return res
        .status(400)
        .json({ status: false, message: "email or password are missing" });
    }

    let [user] = await global.db.query(`
        SELECT id, password FROM users WHERE mobileNumber = ${mobileNumber}
        `);

    if (user.length == 0) {
      return res
        .status(404)
        .json({ status: false, message: "user with this number not found" });
    }

    user = user[0];

    const decrypt = await bcrypt.compare(password, user.password);
    console.log(decrypt);
    if (!decrypt) {
      return res
        .status(400)
        .json({ status: false, message: "Email or Password is Incorrect" });
    }

    const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET_USER);
    return res
      .status(200)
      .json({ status: true, message: "logged in success", token: token });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// USER PROFILE

exports.userProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      status: true,
      message: "user profile fetched successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
