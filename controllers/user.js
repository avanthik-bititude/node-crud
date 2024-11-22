const UserModel = require("../models/UserModel");
const hashFunction = require("../util/hashFunction");
const bcyrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult, matchedData } = require("express-validator");

//user signup controller
const signup = async (req, res) => {
  const errors = validationResult(req);
  console.error(errors);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "validation errors",
      error: errors,
    });
  }
  try {
    const { username, email, password, role } = matchedData(req);
    const existingUser = await UserModel.findOne({ where: { email } });
    console.log(existingUser);
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "user already exist",
      });
    }
    const hashedPassword = await hashFunction(password);
    if (!hashedPassword) {
      return res.status(400).json({
        status: "error",
        message: "missing hashed password",
      });
    }
    const newUser = await UserModel.create({
      username,
      email,
      role,
      password: hashedPassword,
    });
    if (!newUser) {
      return res.status(400).json({
        status: "error",
        message: "user signup failed",
      });
    }
    return res.status(201).json({
      status: "success",
      message: "user signup successfull",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      error: error.message,
    });
  }
};

//user signin controller
const signin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "validation error",
      error: errors,
    });
  }
  try {
    const { email, password } = matchedData(req);
    const dbUser = await UserModel.findOne({ where: { email } });
    if (!dbUser) {
      return res.status(400).json({
        status: "error",
        message: "no user found",
      });
    }
    const isMatch = await bcyrpt.compare(password, dbUser.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "error",
        message: "invalid email or password",
      });
    } else {
      jwt.sign(
        { id: dbUser.id, email: dbUser.email, role: dbUser.role },
        process.env.JWTKEY,
        { expiresIn: "1d" },
        (err, token) => {
          if (err) {
            return res.status(401).json({
              status: "error",
              message: "unautherized user",
            });
          }
          return res.status(200).json({
            status: "success",
            message: "signin successfull",
            token,
          });
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      error: error.message,
    });
  }
};

//view all users
const viewAll = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "validation error",
      error: errors,
    });
  }
  try {
    const users = await UserModel.findAll({
      attributes: { exclude: ["password"] },
    });
    if (!users) {
      return res.status(400).json({
        status: "error",
        message: "no users found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "successfully fetched",
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      error: error.message,
    });
  }
};

//view user
const fetchUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "validation error",
      error: errors,
    });
  }
  try {
    const { id } = matchedData(req);
    console.log(id);
    const dbUser = await UserModel.findByPk(id, {
      attributes: {
        exclude: ["password"],
      },
    });
    if (!dbUser) {
      return res.status(400).json({
        status: "error",
        message: "no user found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "data fetched successfully",
      data: dbUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      error: error.message,
    });
  }
};

//update user
const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "validation error",
      error: errors,
    });
  }
  try {
    const { id } = matchedData(req);
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = await hashFunction(password);
    const dbUser = await UserModel.findByPk(id);
    if (!dbUser) {
      return res.status(400).json({
        status: "error",
        message: "no user found",
      });
    }
    const updatedUser = await dbUser.update({
      username: username || dbUser.username,
      email: email || dbUser.email,
      password: hashedPassword || dbUser.password,
    });

    return res.status(200).json({
      status: "success",
      message: "data updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      error: error.message,
    });
  }
};

//delete user
const deleteUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "validation error",
      error: errors,
    });
  }
  try {
    const { id } = matchedData(req);
    const isDeleted = await UserModel.destroy({ where: { id: id } });
    if (isDeleted === 0) {
      return res.status(400).json({
        status: "error",
        message: "no item found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "successfully deleted",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: "error",
      message: "internal server error",
    });
  }
};

module.exports = { signup, signin, viewAll, fetchUser, updateUser, deleteUser };
