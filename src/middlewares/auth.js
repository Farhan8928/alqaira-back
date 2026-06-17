/**
 * @module authMiddleware
 * @description JWT authentication. Two principal types share one secret but are
 * tagged in the token payload:
 *   - staff    → admin-panel users (roles: admin | manager | staff)
 *   - customer → storefront shoppers
 *
 * Use `authenticate` to guard admin/staff routes, `authenticateCustomer` to
 * guard logged-in storefront routes, and `optionalCustomer` for endpoints that
 * work for both guests and logged-in customers (e.g. checkout).
 */
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { userRepository } from "../modules/user/user.repository.js";
import { customerRepository } from "../modules/customer/customer.repository.js";

function extractToken(req) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

async function authenticate(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next(new AppError("No token provided", 401, { code: "UNAUTHORIZED" }));

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.type === "customer") {
      return next(new AppError("Staff access required", 403, { code: "FORBIDDEN" }));
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) return next(new AppError("User not found", 401, { code: "UNAUTHORIZED" }));
    if (!user.isActive) return next(new AppError("Account is disabled", 403, { code: "FORBIDDEN" }));

    req.user = { id: String(user._id), role: user.role, email: user.email, name: user.name };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired, please login again", 401, { code: "TOKEN_EXPIRED" }));
    }
    next(new AppError("Invalid token", 401, { code: "UNAUTHORIZED" }));
  }
}

async function authenticateCustomer(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next(new AppError("Please sign in to continue", 401, { code: "UNAUTHORIZED" }));

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.type !== "customer") {
      return next(new AppError("Customer access required", 403, { code: "FORBIDDEN" }));
    }

    const customer = await customerRepository.findById(payload.sub);
    if (!customer) return next(new AppError("Account not found", 401, { code: "UNAUTHORIZED" }));
    if (!customer.isActive) {
      return next(new AppError("Account is disabled", 403, { code: "FORBIDDEN" }));
    }

    req.customer = { id: String(customer._id), email: customer.email, name: customer.name };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Session expired, please sign in again", 401, { code: "TOKEN_EXPIRED" }));
    }
    next(new AppError("Invalid token", 401, { code: "UNAUTHORIZED" }));
  }
}

/** Attaches req.customer if a valid customer token is present; never blocks. */
async function optionalCustomer(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.type !== "customer") return next();
    const customer = await customerRepository.findById(payload.sub);
    if (customer && customer.isActive) {
      req.customer = { id: String(customer._id), email: customer.email, name: customer.name };
    }
  } catch {
    // Ignore — treat as guest.
  }
  next();
}

export { authenticate, authenticateCustomer, optionalCustomer };
