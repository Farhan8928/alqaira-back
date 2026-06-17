/**
 * @module CouponModel
 * @description Discount codes applied at checkout. `percent` coupons can be
 * capped with maxDiscount; `flat` coupons subtract a fixed amount. usageLimit
 * (null = unlimited) is enforced against usedCount.
 */
import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["percent", "flat"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 }, // cap for percent coupons
    usageLimit: { type: Number, min: 0 }, // null/undefined = unlimited
    usedCount: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

const CouponModel = mongoose.model("Coupon", CouponSchema);

export { CouponModel };
