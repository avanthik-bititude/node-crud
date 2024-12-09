import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import router from "./user.js";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as utils from "../util/hashFunction.js";
import dotenv from "dotenv";
dotenv.config();

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

  it("POST /register - Server error - Return 500 internal server error", async () => {
    vi.spyOn(UserModel, "findOne").mockRejectedValue(
      new Error("somthing error")
    );

    const response = await request(app).post("/user/register").send({
      username: "avanthik",
      email: "guser7@gmail.com",
      password: "avanthik",
      role: "user",
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("internal server error");
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
    const mockJwtSign = vi
      .spyOn(jwt, "sign")
      .mockImplementation((payload, secretKey, expires, callback) => {
        callback("error", null);
      });

    const response = await request(app).post("/user/login").send({
      email: "avanthik@gmail.com",
      password: "avanthik",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("unautherized user");
    mockJwtSign.mockRestore();
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
    const mockJwtSign = vi
      .spyOn(jwt, "sign")
      .mockImplementation((payload, secretKey, expires, callback) => {
        callback(null, "token");
      });

    const response = await request(app).post("/user/login").send({
      email: "avanthik@gmail.com",
      password: "avanthik",
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("signin successfull");
    expect(response.body.token).toBe("token");
    mockJwtSign.mockRestore();
  });

  it("POST /register - Server error - Return 500 internal server error", async () => {
    vi.spyOn(UserModel, "findOne").mockRejectedValue(
      new Error("somthing error")
    );

    const response = await request(app).post("/user/login").send({
      email: "guser7@gmail.com",
      password: "avanthik",
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("internal server error");
  });
});

describe("GET /", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const adminSignin = () => {
    const admin = {
      id: 94,
      email: "appu@gmail.com",
      role: "admin",
      iat: 1733716149,
      exp: 1733802549,
    };

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      "NODE_CRUD",
      { expiresIn: "1d" }
    );

    return token;
  };

  it("GET / - No user found - Returns 400 No user found ", async () => {
    const user = {
      id: 94,
      email: "appu@gmail.com",
      role: "admin",
      iat: 1733716149,
      exp: 1733802549,
    };

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      "NODE_CRUD",
      { expiresIn: "1d" }
    );

    vi.spyOn(UserModel, "findAll").mockResolvedValue([]);
    const response = await request(app)
      .get("/user/")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("no users found");
  });

  it("GET / - successfully fetched - Returns 200 successfully fetched", async () => {
    vi.spyOn(UserModel, "findAll").mockResolvedValue([
      { username: "user1", email: "user1@gmail.com" },
      { username: "user2", email: "user2@gmail.com" },
      { username: "user3", email: "user3@gmail.com" },
    ]);

    const token = adminSignin();

    const response = await request(app)
      .get("/user/")
      .set("Authorization", `Bearer ${token}`);

    expect(response.body.message).toBe("successfully fetched");
    expect(response.status).toBe(200);
  });

  it("POST /register - Server error - Return 500 internal server error", async () => {
    vi.spyOn(UserModel, "findAll").mockRejectedValue(
      new Error("somthing error")
    );

    const token = adminSignin();
    const response = await request(app)
      .get("/user/")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("internal server error");
  });
});

describe("GET /:id", () => {
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
  it("GET /:id - No user found - Return 400 no user found", async () => {
    vi.spyOn(UserModel, "findByPk").mockResolvedValue([]);
    const token = userSignin();

    const response = await request(app)
      .get(`/user/1`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("no user found");
  });

  it("GET /:id - Data fetched - Return 200 data fetched successfully", async () => {
    vi.spyOn(UserModel, "findByPk").mockResolvedValue([
      {
        id: 1,
        username: "user1",
        email: "user1@gmail.com",
        role: "user",
      },
    ]);
    const token = userSignin();
    const response = await request(app)
      .get(`/user/1`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("data fetched successfully");
  });

  it("POST /register - Server error - Return 500 internal server error", async () => {
    vi.spyOn(UserModel, "findByPk").mockRejectedValue(
      new Error("somthing error")
    );

    const token = userSignin();
    const response = await request(app)
      .get("/user/1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("internal server error");
  });
});

describe("PUT /:id", () => {
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
  it("PUT /:id - No user found - Return 400 no user found", async () => {
    vi.spyOn(utils, "hashFunction").mockImplementation((password) => {
      return "hashedSecured" + password;
    });

    vi.spyOn(UserModel, "findByPk").mockResolvedValue([]);
    const token = userSignin();

    const response = await request(app)
      .put("/user/1")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("no user found");
  });

  it("PUT /:id - Success - Return 200 data fetched successfully", async () => {
    vi.spyOn(utils, "hashFunction").mockImplementation((password) => {
      return "hashedSecured" + password;
    });

    const mockUser = {
      id: 1,
      username: "user1",
      email: "user1@gmail.com",
      password: "user11",
      role: "user",
      update: vi.fn().mockResolvedValue([
        1,
        [
          {
            id: 1,
            username: "updatedUsername",
            email: "updatedEmail@gmail.com",
            password: "hashedSecuredupdatedPassword",
          },
        ],
      ]),
    };

    vi.spyOn(UserModel, "findByPk").mockResolvedValue(mockUser);

    const token = userSignin();
    const response = await request(app)
      .put("/user/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "updatedUsername", email: "updatedEmail@gmail.com" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("data updated successfully");
  });

  it("POST /register - Server error - Return 500 internal server error", async () => {
    vi.spyOn(UserModel, "findByPk").mockRejectedValue(
      new Error("somthing error")
    );

    const token = userSignin();
    const response = await request(app)
      .put("/user/1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("internal server error");
  });
});

describe("DELETE /:id", () => {
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
  it("DELETE /:id - Nonexistent user - Return 400 no item found", async () => {
    vi.spyOn(UserModel, "destroy").mockResolvedValue(0);
    const token = userSignin();
    const response = await request(app)
      .delete("/user/5")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("no item found");
  });

  it("DELETE /:id - Success - Return 200 successfully deleted", async () => {
    const token = userSignin();
    vi.spyOn(UserModel, "destroy").mockResolvedValue(1);

    const response = await request(app)
      .delete("/user/5")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("successfully deleted");
  });
  it("POST /register - Server error - Return 500 internal server error", async () => {
    vi.spyOn(UserModel, "destroy").mockRejectedValue(
      new Error("somthing error")
    );

    const token = userSignin();
    const response = await request(app)
      .delete("/user/1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("internal server error");
  });
});
