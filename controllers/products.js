const express = require("express");
const ProductsModel = require("../models/Products");
const { validationResult, matchedData } = require("express-validator");

const viewAllProducts = async (req, res) => {
  try {
    const products = await ProductsModel.findAll();
    if (Array.isArray(products) && products.length > 0) {
      return res.status(200).json({
        status: "success",
        data: products,
      });
    }
    return res.status(204).json({
      status: "success",
      message: "no data found",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      error: error.message,
    });
  }
};

const addProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "validation error",
        error: errors,
      });
    }
    const { name, description } = req.body;
    console.log(name, description);
    if ((!name, !description)) {
      return res.status(404).json({
        status: "error",
      });
    }
    await ProductsModel.create({
      name,
      description,
    });
    return res.status(200).json({
      status: "success",
      message: "successfully added new product",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      error: error.message,
    });
  }
};

module.exports = { addProducts, viewAllProducts };
