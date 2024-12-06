export const isAdmin = (req, res, next) => {
  try {
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
      message: "isAdmin middleware error",
    });
  }
};
