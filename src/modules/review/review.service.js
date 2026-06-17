/**
 * @module reviewService
 * @description Product reviews. After any write that changes approved reviews,
 * the product's denormalised rating/numReviews are recomputed.
 */
import { reviewRepository } from "./review.repository.js";
import { productRepository } from "../product/product.repository.js";
import { AppError } from "../../utils/AppError.js";

async function recompute(productId) {
  const { avg, count } = await reviewRepository.aggregateForProduct(productId);
  await productRepository.updateRating(productId, avg, count);
}

const reviewService = {
  listForProduct(productId) {
    return reviewRepository.findByProduct(productId);
  },

  list(query) {
    return reviewRepository.findMany(query);
  },

  async create(productId, customer, body) {
    const product = await productRepository.findById(productId);
    if (!product) throw new AppError("Product not found", 404);
    const existing = await reviewRepository.findOne(productId, customer.id);
    if (existing) throw new AppError("You've already reviewed this product", 409);
    const review = await reviewRepository.create({
      product: productId,
      customer: customer.id,
      customerName: customer.name,
      rating: body.rating,
      title: body.title,
      comment: body.comment,
      isApproved: true,
    });
    await recompute(productId);
    return review;
  },

  async setApproval(id, isApproved) {
    const review = await reviewRepository.updateById(id, { isApproved });
    if (!review) throw new AppError("Review not found", 404);
    await recompute(review.product);
    return review;
  },

  async remove(id) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new AppError("Review not found", 404);
    await reviewRepository.deleteById(id);
    await recompute(review.product);
    return { id };
  },
};

export { reviewService };
