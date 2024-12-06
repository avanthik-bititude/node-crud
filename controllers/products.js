import ProductsModel from "../models/Products.js";
import { matchedData } from "express-validator";

export const viewAllProducts = async (req, res) => {
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

export const addProducts = async (req, res) => {
  try {
    const { name, description } = matchedData(req);
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
