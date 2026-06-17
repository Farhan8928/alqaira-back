/**
 * @module UserModel
 * @description Admin-panel staff accounts (NOT storefront customers — those
 * live in the Customer collection). Passwords are bcrypt hashes.
 * Roles:
 *   admin    → owner / super-admin (full access, manage staff & settings)
 *   manager  → catalog & orders manager (products, orders, coupons, reviews)
 *   staff    → order fulfilment (view orders, update status)
 */
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // bcrypt hash
    role: {
      type: String,
      enum: ["admin", "manager", "staff"],
      default: "staff",
      index: true,
    },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });

const UserModel = mongoose.model("User", UserSchema);

export { UserModel };
