const express = require("express");
const {
  signup,
  signin,
  viewAll,
  fetchUser,
  updateUser,
  deleteUser,
} = require("../controllers/user");
const { body, param, header } = require("express-validator");
const authenticate = require("../middlewares/authentication");
const isAdmin = require("../middlewares/isAdmin");

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
  deleteUser
);

module.exports = router;
