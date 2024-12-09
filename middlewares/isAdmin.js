import jwt from "jsonwebtoken";
export const isAdmin = (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWTKEY);
    req.user = decoded;
    if (req.user && req.user.role === "admin") {
      return next();
    } else {
      return res.status(400).json({
        status: "error",
        message: "access denied. admins only!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "isAdmin middleware error",
      error: error.message,
    });
  }
};
