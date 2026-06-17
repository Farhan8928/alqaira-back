import mongoose from "mongoose";
import { ReviewModel } from "./review.model.js";
import { runPagedQuery } from "../../utils/repositoryHelpers.js";

const reviewRepository = {
  findByProduct: (productId) =>
    ReviewModel.find({ product: productId, isApproved: true }).sort({ createdAt: -1 }).lean(),

  findMany({ isApproved, page, limit }) {
    const filter = {};
    if (typeof isApproved === "boolean") filter.isApproved = isApproved;
    return runPagedQuery({
      model: ReviewModel,
      filter,
      sort: { createdAt: -1 },
      page,
      limit,
      populate: [{ path: "product", select: "name slug" }],
    });
  },

  findOne: (productId, customerId) => ReviewModel.findOne({ product: productId, customer: customerId }).lean(),
  findById: (id) => ReviewModel.findById(id).lean(),

  create: (data) => ReviewModel.create(data),
  updateById: (id, patch) => ReviewModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean(),
  deleteById: (id) => ReviewModel.findByIdAndDelete(id).lean(),

  /** Aggregate approved reviews for a product → { avg, count }. */
  async aggregateForProduct(productId) {
    const rows = await ReviewModel.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(String(productId)), isApproved: true } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const r = rows[0] || { avg: 0, count: 0 };
    return { avg: Math.round((r.avg || 0) * 10) / 10, count: r.count || 0 };
  },
};

export { reviewRepository };
