/**
 * @module couponService
 * @description Coupon CRUD plus the validation routine shared by the public
 * "apply coupon" endpoint and the order-create flow. Returns the computed
 * discount so the same rules apply in both places.
 */
import { couponRepository } from "./coupon.repository.js";
import { AppError } from "../../utils/AppError.js";

function round2(n) {
  return Math.round((n || 0) * 100) / 100;
}

const couponService = {
  list(query) {
    return couponRepository.findMany(query);
  },

  async create(body) {
    if (await couponRepository.existsByCode(body.code)) {
      throw new AppError("A coupon with this code already exists", 409);
    }
    return couponRepository.create(body);
  },

  async update(id, body) {
    if (body.code) {
      const existing = await couponRepository.findByCode(body.code);
      if (existing && String(existing._id) !== id) {
        throw new AppError("A coupon with this code already exists", 409);
      }
    }
    const coupon = await couponRepository.updateById(id, body);
    if (!coupon) throw new AppError("Coupon not found", 404);
    return coupon;
  },

  async remove(id) {
    const coupon = await couponRepository.deleteById(id);
    if (!coupon) throw new AppError("Coupon not found", 404);
    return { id };
  },

  /**
   * Validate a code against a subtotal. Returns { coupon, discount }.
   * Throws an AppError with a customer-friendly message on any failure.
   */
  async validate(code, subtotal) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon || !coupon.isActive) throw new AppError("Invalid coupon code", 404);

    const now = new Date();
    if (coupon.startsAt && now < new Date(coupon.startsAt)) {
      throw new AppError("This coupon is not active yet", 400);
    }
    if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
      throw new AppError("This coupon has expired", 400);
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError("This coupon has reached its usage limit", 400);
    }
    if (subtotal < (coupon.minOrderValue || 0)) {
      throw new AppError(`Add ₹${(coupon.minOrderValue - subtotal).toFixed(0)} more to use this coupon`, 400);
    }

    let discount =
      coupon.type === "percent" ? (subtotal * coupon.value) / 100 : Math.min(coupon.value, subtotal);
    if (coupon.type === "percent" && coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = round2(Math.min(discount, subtotal));

    return { coupon, discount };
  },

  redeem(id) {
    return couponRepository.incrementUsage(id);
  },
};

export { couponService };
