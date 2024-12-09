import { body, header } from "express-validator";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { isAdmin } from "./isAdmin";
import jwt from "jsonwebtoken";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("isAdmin middleware", () => {
  it("should call next() when isAdmin confirmd", () => {
    const req = {
      header: vi.fn().mockReturnValue("Bearer fakeToken"),
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    vi.spyOn(jwt, "verify").mockReturnValue({
      id: 1,
      username: "admin",
      email: "admin@gmail.com",
      role: "admin",
    });
    isAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return 400 access denied error", () => {
    const req = {
      header: vi.fn().mockReturnValue("Bearer fakeToken"),
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.spyOn(jwt, "verify").mockReturnValue({
      id: 1,
      username: "user",
      email: "user@gmail.com",
      role: "user",
    });
    const next = vi.fn();
    isAdmin(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "access denied. admins only!",
    });
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
