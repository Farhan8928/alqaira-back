/**
 * @module productRepository
 * @description Raw DB access for the Product collection, including the
 * storefront filter/sort matrix and atomic per-variant stock adjustment.
 */
import { ProductModel } from "./product.model.js";
import { runPagedQuery, escapeRegex } from "../../utils/repositoryHelpers.js";

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  popular: { numReviews: -1, rating: -1 },
  rating: { rating: -1 },
};

function buildFilter({ search, section, category, minPrice, maxPrice, isFeatured, isNewArrival, isActive, tag }) {
  const filter = {};
  if (section) filter.section = section;
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (typeof isActive === "boolean") filter.isActive = isActive;
  if (typeof isFeatured === "boolean") filter.isFeatured = isFeatured;
  if (typeof isNewArrival === "boolean") filter.isNewArrival = isNewArrival;
  if (minPrice != null || maxPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = minPrice;
    if (maxPrice != null) filter.price.$lte = maxPrice;
  }
  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ name: rx }, { description: rx }, { tags: rx }, { categoryName: rx }];
  }
  return filter;
}

const productRepository = {
  findMany(query) {
    const filter = buildFilter(query);
    const sort = SORTS[query.sort] || SORTS.newest;
    return runPagedQuery({ model: ProductModel, filter, sort, page: query.page, limit: query.limit });
  },

  findFeatured: (limit = 8) =>
    ProductModel.find({ isActive: true, isFeatured: true }).sort({ createdAt: -1 }).limit(limit).lean(),

  findNewArrivals: (limit = 8) =>
    ProductModel.find({ isActive: true, isNewArrival: true }).sort({ createdAt: -1 }).limit(limit).lean(),

  findRelated: (product, limit = 4) =>
    ProductModel.find({
      isActive: true,
      category: product.category,
      _id: { $ne: product._id },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),

  findById: (id) => ProductModel.findById(id).lean(),
  findBySlug: (slug) => ProductModel.findOne({ slug: slug.toLowerCase() }).lean(),
  existsBySlug: (slug) => ProductModel.exists({ slug: slug.toLowerCase() }),

  countByCategory: (categoryId) => ProductModel.countDocuments({ category: categoryId }),

  create: (data) => ProductModel.create(data),
  updateById: (id, patch) => ProductModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean(),
  deleteById: (id) => ProductModel.findByIdAndDelete(id).lean(),

  /**
   * Atomically change the stock of one variant. `delta` is negative to consume,
   * positive to restore. Guarded so stock never goes below zero on consume.
   */
  adjustVariantStock(productId, variantId, delta) {
    // On consume (delta < 0) require enough stock via $elemMatch; on restore just match the id.
    const variantMatch =
      delta < 0 ? { $elemMatch: { _id: variantId, stock: { $gte: -delta } } } : { $elemMatch: { _id: variantId } };
    return ProductModel.findOneAndUpdate(
      { _id: productId, variants: variantMatch },
      { $inc: { "variants.$.stock": delta } },
      { new: true },
    ).lean();
  },

  updateRating: (id, rating, numReviews) =>
    ProductModel.findByIdAndUpdate(id, { $set: { rating, numReviews } }, { new: true }).lean(),

  countAll: (filter = {}) => ProductModel.countDocuments(filter),

  /** Products whose total stock across variants is at or below `threshold`. */
  lowStock(threshold = 5, limit = 10) {
    return ProductModel.aggregate([
      { $match: { isActive: true } },
      { $addFields: { totalStock: { $sum: "$variants.stock" } } },
      { $match: { totalStock: { $lte: threshold } } },
      { $sort: { totalStock: 1 } },
      { $limit: limit },
      { $project: { name: 1, slug: 1, totalStock: 1, categoryName: 1, image: { $arrayElemAt: ["$images", 0] } } },
    ]);
  },
};

export { productRepository };
