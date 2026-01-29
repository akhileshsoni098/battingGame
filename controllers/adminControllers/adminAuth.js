const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

// REGISTER Admin

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ status: false, message: "Full Name is required" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Email is required" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ status: false, message: "Password is required" });
    }


    //
 
    const [check] = await global.db.query(
     "SELECT email FROM admin WHERE email = ?",
  [email]
    );

    if (check.length > 0) {
      return res.status(400).json({
        status: false,
        message: "email is already registerd ",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await global.db.query(
      `INSERT INTO admin (name, email, password)
       VALUES (?, ?, ?)`,
      [name, email, hashedPassword],
    );

    if (!result.affectedRows) {
      return res
        .status(400)
        .json({ status: false, message: "Failed to register Admin" });
    }

    const token = jwt.sign(
      { _id: result.insertId },
      process.env.JWT_SECRET_ADMIN,
    );

    res.status(201).json({
      status: true,
      token: token,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// LOGIN Admin

exports.logInAdmin = async (req, res) => {
  try {
    const data = req.body;
    const { email, password } = data;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: false, message: "email or password are missing" });
    }

    let [Admin] = await global.db.query(
        "SELECT id, email , password FROM admin WHERE email = ?",[email]
        );

    if (Admin.length == 0) {
      return res
        .status(404)
        .json({ status: false, message: "Admin with this number not found" });
    }

    Admin = Admin[0];

    const decrypt = await bcrypt.compare(password, Admin.password);
    console.log(decrypt);
    if (!decrypt) {
      return res
        .status(400)
        .json({ status: false, message: "Email or Password is Incorrect" });
    }

    const token = jwt.sign({ _id: Admin.id }, process.env.JWT_SECRET_ADMIN);
    return res
      .status(200)
      .json({ status: true, message: "logged in success", token: token });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// Admin PROFILE

exports.adminProfile = async (req, res) => {
  try {
    const admin = req.admin;

    return res.status(200).json({
      status: true,
      message: "Admin profile fetched successfully",
      data: admin,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
