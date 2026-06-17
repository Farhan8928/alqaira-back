/**
 * @module customerService
 * @description Storefront account logic — registration, login, profile and the
 * embedded address book. Customer tokens are tagged `type: "customer"`.
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { customerRepository } from "./customer.repository.js";
import { toCustomerDto } from "./customer.dto.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

function signToken(customerId) {
  return jwt.sign({ sub: String(customerId), type: "customer" }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_CUSTOMER_EXPIRES_IN,
  });
}

const customerService = {
  async register({ name, email, password, phone }) {
    const existing = await customerRepository.findByEmail(email);
    if (existing) throw new AppError("An account with this email already exists", 409);
    const hash = await bcrypt.hash(password, 12);
    const customer = await customerRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      phone: phone?.trim(),
      isActive: true,
    });
    return { accessToken: signToken(customer._id), customer: toCustomerDto(customer) };
  },

  async login({ email, password }) {
    const customer = await customerRepository.findByEmail(email);
    if (!customer || !customer.isActive) {
      throw new AppError("Invalid email or password", 401, { code: "UNAUTHORIZED" });
    }
    const match = await bcrypt.compare(password, customer.password);
    if (!match) throw new AppError("Invalid email or password", 401, { code: "UNAUTHORIZED" });
    return { accessToken: signToken(customer._id), customer: toCustomerDto(customer) };
  },

  async getMe(customerId) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) throw new AppError("Account not found", 404);
    return toCustomerDto(customer);
  },

  async updateProfile(customerId, { name, phone, password, currentPassword }) {
    const patch = {};
    if (name !== undefined) patch.name = name.trim();
    if (phone !== undefined) patch.phone = phone?.trim();
    if (password) {
      const doc = await customerRepository.docById(customerId);
      if (!doc) throw new AppError("Account not found", 404);
      const ok = await bcrypt.compare(currentPassword || "", doc.password);
      if (!ok) throw new AppError("Current password is incorrect", 400);
      patch.password = await bcrypt.hash(password, 12);
    }
    const customer = await customerRepository.updateById(customerId, patch);
    return toCustomerDto(customer);
  },

  // ── Address book ───────────────────────────────────────────────────────
  async addAddress(customerId, body) {
    const doc = await customerRepository.docById(customerId);
    if (!doc) throw new AppError("Account not found", 404);
    if (body.isDefault || doc.addresses.length === 0) {
      doc.addresses.forEach((a) => (a.isDefault = false));
      body.isDefault = true;
    }
    doc.addresses.push(body);
    await doc.save();
    return toCustomerDto(doc);
  },

  async updateAddress(customerId, addressId, body) {
    const doc = await customerRepository.docById(customerId);
    if (!doc) throw new AppError("Account not found", 404);
    const addr = doc.addresses.id(addressId);
    if (!addr) throw new AppError("Address not found", 404);
    if (body.isDefault) doc.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(addr, body);
    await doc.save();
    return toCustomerDto(doc);
  },

  async removeAddress(customerId, addressId) {
    const doc = await customerRepository.docById(customerId);
    if (!doc) throw new AppError("Account not found", 404);
    const addr = doc.addresses.id(addressId);
    if (!addr) throw new AppError("Address not found", 404);
    const wasDefault = addr.isDefault;
    addr.deleteOne();
    if (wasDefault && doc.addresses.length) doc.addresses[0].isDefault = true;
    await doc.save();
    return toCustomerDto(doc);
  },

  // ── Admin ──────────────────────────────────────────────────────────────
  list(query) {
    return customerRepository.findMany(query);
  },

  async get(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new AppError("Customer not found", 404);
    return toCustomerDto(customer);
  },
};

export { customerService };
