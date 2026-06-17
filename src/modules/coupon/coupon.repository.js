import { CouponModel } from "./coupon.model.js";
import { runPagedQuery, escapeRegex } from "../../utils/repositoryHelpers.js";

const couponRepository = {
  findMany({ search, isActive, page, limit }) {
    const filter = {};
    if (typeof isActive === "boolean") filter.isActive = isActive;
    if (search && search.trim()) {
      filter.code = new RegExp(escapeRegex(search.trim().toUpperCase()), "i");
    }
    return runPagedQuery({ model: CouponModel, filter, sort: { createdAt: -1 }, page, limit });
  },

  findByCode: (code) => CouponModel.findOne({ code: code.trim().toUpperCase() }).lean(),
  existsByCode: (code) => CouponModel.exists({ code: code.trim().toUpperCase() }),
  findById: (id) => CouponModel.findById(id).lean(),

  create: (data) => CouponModel.create(data),
  updateById: (id, patch) => CouponModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean(),
  deleteById: (id) => CouponModel.findByIdAndDelete(id).lean(),

  incrementUsage: (id) => CouponModel.findByIdAndUpdate(id, { $inc: { usedCount: 1 } }).lean(),
};

export { couponRepository };
