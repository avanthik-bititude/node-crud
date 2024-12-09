import { describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import express, { response } from "express";
import products from "./products.js";
import request from "supertest";
import dotenv from "dotenv";
import ProductsModel from "../models/Products.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use("/products", products);

const userSignin = () => {
  const user = {
    id: 94,
    email: "user1@gmail.com",
    role: "user",
    iat: 1733716149,
    exp: 1733802549,
  };
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    "NODE_CRUD",
    { expiresIn: "1d" }
  );
  return token;
};

describe("GET /viewAll", () => {
  it("GET /viewAll - No products - Return 404 no data found", async () => {
    vi.spyOn(ProductsModel, "findAll").mockResolvedValue([]);
    const token = userSignin();
    const response = await request(app)
      .get("/products/viewAll")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No products found");
  });

  it("GET /viewAll - Success - Return 200 with data", async () => {
    const mockData = [
      {
        id: 1,
        name: "product 1",
        description: "prd",
      },
      {
        id: 2,
        name: "product 2",
        description: "prd",
      },
    ];
    vi.spyOn(ProductsModel, "findAll").mockResolvedValue(mockData);
    const token = userSignin();
    const response = await request(app)
      .get("/products/viewAll")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toEqual(mockData);
  });

  it("GET /viewAll - Server error - Return 500 internal server error", async () => {
    vi.spyOn(ProductsModel, "findAll").mockRejectedValue(
      new Error("somthing new error")
    );
    const token = userSignin();
    const response = await request(app)
      .get("/products/viewAll")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(500);
    expect(response.body.message).toBe("internal server error");
  });
});

describe("POST /addProduct", () => {
  it("POST /addProduct - Success - Return 200 successfully added new product", async () => {
    vi.spyOn(ProductsModel, "create").mockResolvedValue({
      product: "product 1",
      description: "prd",
    });
    const token = userSignin();
    const response = await request(app)
      .post("/products/addProduct")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "product 1",
        description: "prd",
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("successfully added new product");
  });

  it("POST /addProduct - Internal server error - Return 500 Internal server error", async () => {
    const token = userSignin();
    vi.spyOn(ProductsModel, "create").mockRejectedValue(
      new Error("somthing new error")
    );
    const response = await request(app)
      .post("/products/addProduct")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "product 1",
        description: "prd",
      });
    expect(response.status).toBe(500);
    expect(response.body.message).toBe("internal server error");
  });
});
