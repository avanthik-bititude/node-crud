const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    jwt.verify(token, process.env.JWTKEY, (error, decoded) => {
      if (error) {
        return res.status(401).json({
          status: "error",
          message: "unautherized user",
        });
      } else {
        req.user = decoded;
        next();
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "authentication middleware error",
    });
  }
};

module.exports = authenticate;
