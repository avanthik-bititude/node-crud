import { describe, expect, it, vi } from "vitest";
import { isAdmin } from "./isAdmin.js";

describe("isAdmin middleware", () => {
  const next = vi.fn();

  it("should call next()", () => {
    const mockReq = {
      user: {
        username: "admin",
        email: "admin@gmail.com",
        password: "adminn",
        role: "admin",
      },
    };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    isAdmin(mockReq, mockRes, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return 404 error message when no adminFound", () => {
    const mockReq = {
      user: {
        username: "user",
        email: "user@gmail.com",
        password: "user",
        role: "user",
      },
    };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    isAdmin(mockReq, mockRes, next);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      message: "Admins access is required",
    });
  });
});
