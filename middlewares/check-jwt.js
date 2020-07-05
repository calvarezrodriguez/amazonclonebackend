const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = function (req, res, next) {
  // Verificar la existencia del token
  let token = req.headers["authorization"];

  if (token) {
    jwt.verify(token, config.secret, function (err, decoded) {
      if (err) {
        res.json({
          success: false,
          message: "Failed to authenticate token",
        });
      } else {
        // Desencripta token
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(403).json({
      success: false,
      message: "Token not provided",
    });
  }
};
