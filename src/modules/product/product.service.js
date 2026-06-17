/**
 * @module productService
 * @description Catalog business logic. Denormalises the category name onto the
 * product, enforces unique slugs, and exposes the stock primitives the order
 * flow uses to reserve and restore inventory.
 */
import { productRepository } from "./product.repository.js";
import { categoryRepository } from "../category/category.repository.js";
import { AppError } from "../../utils/AppError.js";

async function resolveCategory(categoryId) {
  const cat = await categoryRepository.findById(categoryId);
  if (!cat) throw new AppError("Selected category does not exist", 400);
  return cat;
}

const productService = {
  list(query) {
    return productRepository.findMany(query);
  },

  featured() {
    return productRepository.findFeatured();
  },

  newArrivals() {
    return productRepository.findNewArrivals();
  },

  async getBySlug(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product || !product.isActive) throw new AppError("Product not found", 404);
    const related = await productRepository.findRelated(product);
    return { product, related };
  },

  async get(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError("Product not found", 404);
    return product;
  },

  async create(body) {
    if (await productRepository.existsBySlug(body.slug)) {
      throw new AppError("A product with this slug already exists", 409);
    }
    const cat = await resolveCategory(body.category);
    return productRepository.create({
      ...body,
      categoryName: cat.name,
      section: body.section || cat.section,
    });
  },

  async update(id, body) {
    if (body.slug) {
      const existing = await productRepository.findBySlug(body.slug);
      if (existing && String(existing._id) !== id) {
        throw new AppError("A product with this slug already exists", 409);
      }
    }
    const patch = { ...body };
    if (body.category) {
      const cat = await resolveCategory(body.category);
      patch.categoryName = cat.name;
    }
    const product = await productRepository.updateById(id, patch);
    if (!product) throw new AppError("Product not found", 404);
    return product;
  },

  async remove(id) {
    const product = await productRepository.deleteById(id);
    if (!product) throw new AppError("Product not found", 404);
    return { id };
  },

  /**
   * Reserve stock for an order line. Throws if the variant is missing or short.
   * Returns the snapshot the order needs (name, image, price, size, etc.).
   */
  async reserveStock({ productId, variantId, quantity }) {
    const product = await productRepository.findById(productId);
    if (!product || !product.isActive)
      throw new AppError("A product in your cart is no longer available", 400);
    const variant = (product.variants || []).find((v) => String(v._id) === String(variantId));
    if (!variant) throw new AppError(`Selected size for "${product.name}" is unavailable`, 400);
    if (variant.stock < quantity) {
      throw new AppError(
        `Only ${variant.stock} left in size ${variant.size} for "${product.name}"`,
        409,
      );
    }
    const updated = await productRepository.adjustVariantStock(productId, variantId, -quantity);
    if (!updated) throw new AppError(`Insufficient stock for "${product.name}"`, 409);
    return {
      product,
      variant,
      snapshot: {
        product: product._id,
        productName: product.name,
        slug: product.slug,
        image: (product.images || [])[0] || null,
        size: variant.size,
        color: variant.color,
        variantId: String(variant._id),
        price: product.price,
        quantity,
        lineTotal: Math.round(product.price * quantity * 100) / 100,
      },
    };
  },

  restoreStock({ productId, variantId, quantity }) {
    return productRepository.adjustVariantStock(productId, variantId, quantity);
  },
};

export { productService };
