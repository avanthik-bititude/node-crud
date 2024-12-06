import express from "express";
import { viewAllProducts, addProducts } from "../controllers/products.js";
import { authenticate } from "../middlewares/authentication.js";
import { header, body } from "express-validator";
import { validator } from "../middlewares/validator.js";

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

export default router;
