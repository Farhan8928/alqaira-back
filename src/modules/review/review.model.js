/**
 * @module ReviewModel
 * @description Customer product reviews. One review per customer per product.
 * Creating/deleting a review recomputes the product's denormalised rating.
 */
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerName: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, trim: true },
    isApproved: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

ReviewSchema.index({ product: 1, customer: 1 }, { unique: true });

const ReviewModel = mongoose.model("Review", ReviewSchema);

export { ReviewModel };
