const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  jwt.verify(token, process.env.JWTKEY, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        status: "error",
        message: "unautherized user",
      });
    } else {
      req = decoded;
      next();
    }
  });
};

module.exports = authenticate;
