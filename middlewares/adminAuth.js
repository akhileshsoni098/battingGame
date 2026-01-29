const jwt = require("jsonwebtoken");

// admin authentication

exports.adminAuthentication = async (req, res, next) => {
  try {
    const token = req.headers["x-auth-token"];

    if (!token) {
      return res
        .status(401)
        .json({ status: false, message: "Un-Authenticated User" });
    }

    jwt.verify(token, process.env.JWT_SECRET_ADMIN, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ status: false, message: err.message });
      }

      let [adminData] = await global.db.query(
        `SELECT id, email, role FROM admin WHERE id = ${decoded._id}`,
      );

      adminData = adminData[0];

      if (!adminData) {
        return res
          .status(404)
          .json({ status: false, message: "admin not found" });
      }

      req.admin = {
        _id: adminData.id,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
      };

      next();
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// admin authorization
exports.adminAuthorization = async (req, res, next) => {
  try {
    const adminId = req.admin._id;

    const [check] = await global.db.query(
      "SELECT id, role FROM admin where id=?",
      [adminId],
    );

    if (
      adminId.toString() !== check[0].id.toString() ||
      check[0].role !== "admin"
    ) {
      return res
        .status(403)
        .json({ status: false, message: "Un-Authorized Accesss" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
