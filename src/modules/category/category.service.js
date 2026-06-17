/**
 * @module categoryService
 * @description Catalog taxonomy logic. Slugs are unique; deleting a category is
 * blocked while products still reference it (guard lives in product.service via
 * the controller flow — here we just hard-delete after the check upstream).
 */
import { categoryRepository } from "./category.repository.js";
import { productRepository } from "../product/product.repository.js";
import { AppError } from "../../utils/AppError.js";

const categoryService = {
  list(query) {
    return categoryRepository.findMany(query);
  },

  active(section) {
    return categoryRepository.findActive(section);
  },

  featured() {
    return categoryRepository.findFeatured();
  },

  async getBySlug(slug) {
    const cat = await categoryRepository.findBySlug(slug);
    if (!cat) throw new AppError("Category not found", 404);
    return cat;
  },

  async create(body) {
    if (await categoryRepository.existsBySlug(body.slug)) {
      throw new AppError("A category with this slug already exists", 409);
    }
    return categoryRepository.create(body);
  },

  async update(id, body) {
    if (body.slug) {
      const existing = await categoryRepository.findBySlug(body.slug);
      if (existing && String(existing._id) !== id) {
        throw new AppError("A category with this slug already exists", 409);
      }
    }
    const cat = await categoryRepository.updateById(id, body);
    if (!cat) throw new AppError("Category not found", 404);
    return cat;
  },

  async remove(id) {
    const productCount = await productRepository.countByCategory(id);
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete: ${productCount} product(s) still use this category. Reassign or remove them first.`,
        409,
      );
    }
    const cat = await categoryRepository.deleteById(id);
    if (!cat) throw new AppError("Category not found", 404);
    return { id };
  },
};

export { categoryService };
