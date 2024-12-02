const express = require("express");
const { viewAllProducts, addProducts } = require("../controllers/products");
const authenticate = require("../middlewares/authentication");
const { header, body } = require("express-validator");

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
  viewAllProducts
);

router.post(
  "/addProduct",
  [
    header("Authorization")
      .exists()
      .withMessage("autherization needed")
      .isString(),
  ],

  authenticate,
  addProducts
);

module.exports = router;
