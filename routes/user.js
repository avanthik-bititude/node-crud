import express from "express";
import {
  signup,
  signin,
  viewAll,
  fetchUser,
  updateUser,
  deleteUser,
} from "../controllers/user.js";
import { body, param, header } from "express-validator";
import { authenticate } from "../middlewares/authentication.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { validator } from "../middlewares/validator.js";

const router = express.Router();

//signup route
router.post(
  "/register",
  [
    body("username")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("please fill username field"),
    body("email", "please enter a valid email")
      .trim()
      .escape()
      .notEmpty()
      .normalizeEmail()
      .isEmail()
      .custom((value, { req }) => {
        if (value === "test@gmail.com") {
          throw new Error("This email can not be useful");
        }
        return true;
      }),
    body("password")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 6, max: 12 })
      .withMessage("password should be atleast 6 char and maximum 12 char"),
    body("role").optional().trim().escape(),
  ],
  validator,
  signup
);

//signin route
router.post(
  "/login",
  [
    body("email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .withMessage("not valid email"),
    body("password")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("not valid password"),
  ],
  validator,
  signin
);

//Get all users
router.get(
  "/",
  header("Authorization")
    .exists()
    .withMessage("Authorization needed")
    .isString(),
  authenticate,
  isAdmin,
  validator,
  viewAll
);

//view user
router.get(
  "/:id",
  header("Authorization")
    .exists()
    .withMessage("Authorization needed")
    .isString(),
  param("id").notEmpty().isInt().withMessage("id must be int").toInt(),
  authenticate,
  validator,
  fetchUser
);

//update user
router.put(
  "/:id",
  header("Authorization")
    .exists()
    .withMessage("Authorization needed")
    .isString(),
  param("id").notEmpty().isInt().withMessage("id must be int").toInt(),
  authenticate,
  validator,
  updateUser
);

//delete user route
router.delete(
  "/:id",
  header("Authorization")
    .exists()
    .withMessage("Authorization needed")
    .isString(),
  param("id").notEmpty().isInt().withMessage("id must be int").toInt(),
  authenticate,
  validator,
  deleteUser
);

export default router;
