/**
 * @module categoryRepository
 * @description Raw DB access for the Category collection.
 */
import { CategoryModel } from "./category.model.js";
import { runPagedQuery, escapeRegex } from "../../utils/repositoryHelpers.js";

const categoryRepository = {
  findMany({ search, section, isActive, page, limit }) {
    const filter = {};
    if (section) filter.section = section;
    if (typeof isActive === "boolean") filter.isActive = isActive;
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ name: rx }, { slug: rx }];
    }
    return runPagedQuery({
      model: CategoryModel,
      filter,
      sort: { displayOrder: 1, name: 1 },
      page,
      limit,
    });
  },

  /** Lightweight list for storefront menus (no pagination). */
  findActive: (section) =>
    CategoryModel.find(section ? { isActive: true, section } : { isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean(),

  findFeatured: (limit = 6) =>
    CategoryModel.find({ isActive: true, isFeatured: true })
      .sort({ displayOrder: 1 })
      .limit(limit)
      .lean(),

  findById: (id) => CategoryModel.findById(id).lean(),
  findBySlug: (slug) => CategoryModel.findOne({ slug: slug.toLowerCase() }).lean(),
  existsBySlug: (slug) => CategoryModel.exists({ slug: slug.toLowerCase() }),

  create: (data) => CategoryModel.create(data),
  updateById: (id, patch) =>
    CategoryModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean(),
  deleteById: (id) => CategoryModel.findByIdAndDelete(id).lean(),
};

export { categoryRepository };
