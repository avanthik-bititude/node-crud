import UserModel from "../models/UserModel.js";
import { hashFunction } from "../util/hashFunction.js";
import bcyrpt from "bcryptjs";
import jwt from "jsonwebtoken";
import { matchedData } from "express-validator";
// import { createNewUser } from "../services/user.js";

//user signup controller
export const signup = async (req, res) => {
  try {
    const { username, email, password, role } = matchedData(req);
    const existingUser = await UserModel.findOne({ where: { email } });

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
    console.log(error.message);
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      error: error.message,
    });
  }
};

//user signin controller
export const signin = async (req, res) => {
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
export const viewAll = async (req, res) => {
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
export const fetchUser = async (req, res) => {
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
export const updateUser = async (req, res) => {
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
export const deleteUser = async (req, res) => {
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
