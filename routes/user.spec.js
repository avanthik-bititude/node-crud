import { describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import router from "./user.js";
import { createNewUser } from "../controllers/services/user.js";
import { signup } from "../controllers/user.js";
import { validator } from "../middlewares/validator.js";
import { matchedData } from "express-validator";

// vi.mock("../middlewares/validator.js", () => ({
//   validator: vi.fn((req, res, next) => next()),
// }));

vi.mock("../controllers/services/user.js", () => ({
  createNewUser: vi.fn(() =>
    Promise.resolve({
      id: 1,
      username: "mockuser",
      email: "mock@example.com",
      password: "hashedPassword",
    })
  ),
}));

const app = express();
app.use(express.json());
app.use("/user", router);

describe("POST /register", () => {
  it.skip("should return error missing username", async () => {
    const response = await request(app).post("/user/register").send({
      username: "",
      email: "test@gmail.com",
      password: "test112",
    });
    expect(response.status).toBe(400);
    expect(response.body.error.errors[0].msg).toBe(
      "please fill username field"
    );
  });

  it("should register the user successfully", async () => {
    const req = {
      body: {
        username: "avanthik",
        email: "avanthik@gmail.com",
        password: "avanthik",
        role: "user",
      },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    vi.spyOn({ validator }, "validator").mockReturnValue((req, res, next) =>
      next()
    );
    vi.spyOn({ matchedData }, "matchedData").mockReturnValueOnce(req.body);

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "avanthik",
        email: "avanthik@gmail.com",
      })
    );
  });
});
