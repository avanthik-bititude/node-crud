const { validationResult } = require("express-validator");

const validator = (req, res, next) => {
  const errors = validationResult(req);
  console.error("validator Middleware: ", errors);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "validation errors",
      error: errors,
    });
  }
  next();
};

module.exports = validator;
