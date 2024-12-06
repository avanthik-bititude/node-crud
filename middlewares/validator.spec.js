import { describe, expect, it, vi } from "vitest";
import { validator } from "./validator.js";
import { body } from "express-validator";

describe("validator middleware", () => {
  it("should call next() ", () => {
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    validator(req, res, next);
    expect(next).toBeCalled();
  });

  it("should return 400 validation error", async () => {
    const validationMiddleware = [
      body("username")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("ivalid username"),
      body("email").isEmail().withMessage("Invalid email format"),
      body("password")
        .isLength({ min: 6 })
        .withMessage("Password is too short"),
    ];

    const req = {
      body: {
        username: "avanthik ",
        email: "invalid-email",
        password: "short",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await validationMiddleware[0](req, res, () => {});
    await validationMiddleware[1](req, res, () => {});
    await validationMiddleware[2](req, res, () => {});
    const next = vi.fn();
    validator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "validation errors",
      error: expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            location: "body",
            msg: "Invalid email format",
            path: "email",
            type: "field",
            value: "invalid-email",
          }),
          expect.objectContaining({
            location: "body",
            msg: "Password is too short",
            path: "password",
            type: "field",
            value: "short",
          }),
        ]),
        formatter: expect.any(Function),
      }),
    });
  });
});
