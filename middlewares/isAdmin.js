const isAdmin = (req, res, next) => {
  try {
    console.log(req);
    if (req.user && req.user.role !== "admin") {
      return res.status(404).json({
        status: "error",
        message: "Admins access is required",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "isadmin middleware error",
    });
  }
};

module.exports = isAdmin;
