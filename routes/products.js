const express = require("express");
const { viewAllProducts, addProducts } = require("../controllers/products");
const authenticate = require("../middlewares/authentication");
const { header, body } = require("express-validator");
const validator = require("../middlewares/validator");

const router = express.Router();

router.get(
  "/viewAll",
  [
    header("Authorization")
      .exists()
      .withMessage("autherization needed")
      .isString(),
  ],
  authenticate,
  validator,
  viewAllProducts
);

router.post(
  "/addProduct",
  [
    header("Authorization")
      .exists()
      .withMessage("autherization needed")
      .isString(),
    body("name").trim().escape().notEmpty().withMessage("not valid name"),
    body("description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("not valid description"),
  ],

  authenticate,
  validator,
  addProducts
);

module.exports = router;
