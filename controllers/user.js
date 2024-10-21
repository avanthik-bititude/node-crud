const UserModel = require("../models/UserModel");
const hashFunction = require("../util/hashFunction");
const bcyrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//user signup controller
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "missing input",
      });
    }
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
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "missing input",
      });
    }
    const dbUser = await UserModel.findOne({ where: { email } });
    if (!dbUser) {
      return res.status(404).json({
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
        { id: dbUser.id, email: dbUser.email },
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
  try {
    const users = await UserModel.findAll({
      attributes: { exclude: ["password"] },
    });
    if (!users) {
      return res.status(404).json({
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
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "id missing",
      });
    }
    const dbUser = await UserModel.findByPk(id, {
      attributes: {
        exclude: ["password"],
      },
    });
    if (!dbUser) {
      return res.status(404).json({
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
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "id missing",
      });
    }
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

module.exports = { signup, signin, viewAll, fetchUser, updateUser };
