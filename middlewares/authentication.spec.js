import { describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import authenticate from "./authentication";

describe("authentication middleware", () => {
  it("should call next()", () => {
    const mockReq = {
      headers: {
        authorization: "Bearer THisismytoken",
      },
    };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const decoded = {
      username: "testname",
      email: "test@gmail.com",
      password: "testpassword",
    };

    vi.spyOn(jwt, "verify").mockImplementation(
      (token, secretValue, callback) => {
        callback(null, decoded);
      }
    );
    const next = vi.fn();
    authenticate(mockReq, mockRes, next);
    expect(mockReq.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });

  it("should 401 error and unautherized user", () => {
    const mockReq = {
      headers: {
        authorization: "Bearer THisismytoken",
      },
    };

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const error = "authentication error";
    vi.spyOn(jwt, "verify").mockImplementation((token, secretKey, callback) => {
      callback(error, null);
    });
    const next = vi.fn();
    authenticate(mockReq, mockRes, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      message: "unautherized user",
    });
  });
});
