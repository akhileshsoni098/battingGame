const jwt = require("jsonwebtoken");

exports.userAuthentication = async (req, res, next) => {
  try {
    const token = req.headers["x-auth-token"];

    if (!token) {
      return res
        .status(401)
        .json({ status: false, message: "Un-Authenticated User" });
    }

    jwt.verify(token, process.env.JWT_SECRET_USER, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ status: false, message: err.message });
      }

      let [userData] = await global.db.query(
        `SELECT id, fullName, mobileNumber, refferCode FROM users WHERE id = ${decoded._id}`,
      );

      userData = userData[0];

      req.user = {
        _id: userData.id,
        fullName: userData.fullName,
        mobileNumber: userData.mobileNumber,
        refferCode: userData.refferCode,
      };

      next();
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
