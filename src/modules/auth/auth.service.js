/**
 * @module authService
 * @description Business logic for ADMIN-PANEL (staff) authentication and
 * staff-account management. Storefront shoppers are handled by customer.service.
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { toUserDto } from "./auth.dto.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

function signToken(userId) {
  return jwt.sign({ sub: String(userId), type: "staff" }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

const authService = {
  /** Register the first-ever admin. Throws 403 if any staff user already exists. */
  async register({ name, email, password }) {
    const count = await authRepository.countAll();
    if (count > 0) {
      throw new AppError(
        "Admin account already exists. Additional staff are created from the admin panel.",
        403,
        { code: "FORBIDDEN" },
      );
    }
    const hash = await bcrypt.hash(password, 12);
    const user = await authRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      role: "admin",
      isActive: true,
    });
    const accessToken = signToken(user._id);
    return { accessToken, user: toUserDto(user) };
  },

  /** Validate credentials and return token + user. */
  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new AppError("Invalid email or password", 401, { code: "UNAUTHORIZED" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new AppError("Invalid email or password", 401, { code: "UNAUTHORIZED" });
    }
    const accessToken = signToken(user._id);
    return { accessToken, user: toUserDto(user) };
  },

  /** Fetch fresh user from DB (not just token payload). */
  async getMe(userId) {
    const user = await authRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return toUserDto(user);
  },

  /** Admin creates a staff account with an explicit role. */
  async createUser({ name, email, password, role, phone }) {
    const existing = await authRepository.findByEmail(email);
    if (existing) throw new AppError("A user with this email already exists", 409);
    const hash = await bcrypt.hash(password, 12);
    const user = await authRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      role,
      phone: phone?.trim(),
      isActive: true,
    });
    return toUserDto(user);
  },

  /** List all staff users (admin management). */
  async listUsers() {
    const users = await authRepository.findAll();
    return users.map(toUserDto);
  },

  /** Toggle isActive / reset name, role, phone, or password. */
  async updateUser(id, { name, isActive, password, role, phone }) {
    const patch = {};
    if (name !== undefined) patch.name = name.trim();
    if (typeof isActive === "boolean") patch.isActive = isActive;
    if (role !== undefined) patch.role = role;
    if (phone !== undefined) patch.phone = phone?.trim();
    if (password) patch.password = await bcrypt.hash(password, 12);
    const user = await authRepository.updateById(id, patch);
    if (!user) throw new AppError("User not found", 404);
    return toUserDto(user);
  },
};

export { authService };
