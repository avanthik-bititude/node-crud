const express = require("express");
const {
  signup,
  signin,
  viewAll,
  fetchUser,
  updateUser,
  deleteUser,
} = require("../controllers/user");

const router = express.Router();

//signup route
router.post("/register", signup);

//signin route
router.post("/login", signin);

//Get all users
router.get("/", viewAll);

//view user
router.get("/:id", fetchUser);

//update user
router.put("/:id", updateUser);

//delete user route
router.delete("/:id", deleteUser);

module.exports = router;
