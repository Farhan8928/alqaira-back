/**
 * @module CategoryModel
 * @description Storefront catalog taxonomy. Every category belongs to a top-level
 * `section` (men | women | kids). For ALQAIRA the men's section holds the jubba
 * & kurta styles (Saudi, Omani, Emirati, Moroccan/Kaftan, Designer, Straight-cut,
 * Pathani), women's holds Burkha, etc. Soft-deleted via isActive.
 */
import mongoose from "mongoose";

const SECTIONS = ["men", "women", "kids"];

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    section: { type: String, enum: SECTIONS, required: true, index: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

const CategoryModel = mongoose.model("Category", CategorySchema);

export { CategoryModel, SECTIONS };
