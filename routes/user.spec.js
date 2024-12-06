import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import router from "./user.js";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as utils from "../util/hashFunction.js";

beforeEach(() => {
  vi.clearAllMocks();
});

const app = express();
app.use(express.json());
app.use("/user", router);

describe("POST /register", () => {
  it("POST /register - Missing Fields - Returns 400 Validation Error", async () => {
    const response = await request(app).post("/user/register").send({
      username: "",
      email: "test@gmail.com",
      password: "test112",
      role: "user",
    });
    expect(response.status).toBe(400);
    expect(response.body.error.errors[0].msg).toBe(
      "please fill username field"
    );
  });

  it("POST /register - Duplicate Email - Returns 400 User Already Exists", async () => {
    vi.spyOn(UserModel, "findOne").mockImplementation((query) => {
      if (query.where.email === "user@gmail.com") {
        return Promise.resolve({
          username: "avanthik",
          email: "avanthik@gmail.com",
          password: "avanthik",
        });
      } else {
        return Promise.resolve(null);
      }
    });
    const response = await request(app).post("/user/register").send({
      username: "user",
      email: "user@gmail.com",
      password: "avanthik",
      role: "user",
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("user already exist");
  });

  it("POST /register - Password Hashing Fails - Returns 400 Missing Hashed Password", async () => {
    vi.spyOn(UserModel, "findOne").mockImplementation((query) => {
      if (query.where.email === "user@gmail.com") {
        return Promise.resolve({
          username: "avanthik",
          email: "avanthik@gmail.com",
          password: "avanthik",
        });
      } else {
        return Promise.resolve(null);
      }
    });
    vi.spyOn(utils, "hashFunction").mockImplementation((password) => {
      return null;
    });

    const response = await request(app).post("/user/register").send({
      username: "user100",
      email: "guser4@gmail.com",
      password: "user100",
      role: "user",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("missing hashed password");
  });

  it("POST /register - Database Error - Returns 400 Signup Failed", async () => {
    vi.spyOn(UserModel, "findOne").mockImplementation((query) => {
      if (query.where.email === "user@gmail.com") {
        return Promise.resolve({
          username: "avanthik",
          email: "avanthik@gmail.com",
          password: "avanthik",
        });
      } else {
        return Promise.resolve(null);
      }
    });
    vi.spyOn(utils, "hashFunction").mockImplementation((password) => {
      return "hashedSecured" + password;
    });

    vi.spyOn(UserModel, "create").mockImplementation((data) => {
      return false;
    });

    const response = await request(app).post("/user/register").send({
      username: "avanthik",
      email: "guser7@gmail.com",
      password: "avanthik",
      role: "user",
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("user signup failed");
  });

  it("POST /register - Valid Input - Returns 201 Signup Successful", async () => {
    vi.spyOn(UserModel, "findOne").mockImplementation((query) => {
      if (query.where.email === "user@gmail.com") {
        return Promise.resolve({
          username: "avanthik",
          email: "avanthik@gmail.com",
          password: "avanthik",
        });
      } else {
        return Promise.resolve(null);
      }
    });
    vi.spyOn(utils, "hashFunction").mockImplementation((password) => {
      return "hashedSecured" + password;
    });

    vi.spyOn(UserModel, "create").mockImplementation((data) => {
      return true;
    });

    const response = await request(app).post("/user/register").send({
      username: "avanthik",
      email: "guser7@gmail.com",
      password: "avanthik",
      role: "user",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("user signup successfull");
  });
});

describe("POST /signin", () => {
  it("POST /signin - Nonexistent User - Returns 400 User Not Found", async () => {
    vi.spyOn(UserModel, "findOne").mockImplementation((query) => {
      if (query.where.email === "notexisitinguser@gmail.com") {
        return Promise.resolve({
          id: 1,
          email: "test@gmail.com",
          username: "test",
          password: "test",
        });
      }
      return Promise.resolve(null);
    });

    const response = await request(app).post("/user/login").send({
      email: "user@gmail.com",
      password: "user11",
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("no user found");
  });

  it("POST /signin - Incorrect Password - Returns 400 Invalid Credentials", async () => {
    vi.spyOn(UserModel, "findOne").mockImplementation((query) => {
      if (query.where.email === "avanthik@gmail.com") {
        return Promise.resolve({
          id: 1,
          email: "test@gmail.com",
          username: "test",
          password: "test",
        });
      }
      return Promise.resolve(null);
    });

    vi.spyOn(bcrypt, "compare").mockResolvedValue(false);

    const response = await request(app).post("/user/login").send({
      email: "avanthik@gmail.com",
      password: "wrongPassword",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("invalid email or password");
  });

  it("POST /signin - Token Generation Fails - Returns 401 Unauthorized User", async () => {
    vi.spyOn(UserModel, "findOne").mockImplementation((query) => {
      if (query.where.email === "avanthik@gmail.com") {
        return Promise.resolve({
          id: 1,
          email: "test@gmail.com",
          username: "test",
          password: "test",
        });
      }
      return Promise.resolve(null);
    });

    vi.spyOn(bcrypt, "compare").mockResolvedValue(true);
    vi.spyOn(jwt, "sign").mockImplementation(
      (payload, secretKey, expires, callback) => {
        callback("error", null);
      }
    );

    const response = await request(app).post("/user/login").send({
      email: "avanthik@gmail.com",
      password: "avanthik",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("unautherized user");
  });

  it("POST /signin - Valid Credentials - Returns 200 Signin Successful with Token", async () => {
    vi.spyOn(UserModel, "findOne").mockImplementation((query) => {
      if (query.where.email === "avanthik@gmail.com") {
        return Promise.resolve({
          id: 1,
          email: "test@gmail.com",
          username: "test",
          password: "test",
        });
      }
      return Promise.resolve(null);
    });

    vi.spyOn(bcrypt, "compare").mockResolvedValue(true);
    vi.spyOn(jwt, "sign").mockImplementation(
      (payload, secretKey, expires, callback) => {
        callback(null, "token");
      }
    );

    const response = await request(app).post("/user/login").send({
      email: "avanthik@gmail.com",
      password: "avanthik",
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("signin successfull");
    expect(response.body.token).toBe("token");
  });
});

describe("GET /", () => {
  it("GET / - No user found - Returns 400 No user found ", async () => {
    const options = { expiresIn: "1d" };

    const token = jwt.sign(
      { id: 1, email: "admin100@gmail.com", role: "admin" },
      "NODE_CRUD",
      options
    );

    vi.spyOn(UserModel, "findAll").mockResolvedValue([]);
    const response = await request(app)
      .get("/user/")
      .set("Authorization", `Bearer ${token}`);

    console.log(response.body);
  });
});
