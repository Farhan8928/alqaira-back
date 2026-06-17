/**
 * @module ProductModel
 * @description A sellable garment. Stock is tracked per size variant (kurtas &
 * jubbas sell by size). `price` is the selling price; `compareAtPrice` is the
 * struck-through MRP. `rating`/`numReviews` are denormalised from the Review
 * collection so listing pages don't need a join.
 */
import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true }, // e.g. S, M, L, XL, 40, 42
    color: { type: String, trim: true },
    sku: { type: String, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: true },
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    description: { type: String, trim: true },
    shortDescription: { type: String, trim: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    categoryName: { type: String, trim: true },
    section: { type: String, enum: ["men", "women", "kids"], required: true, index: true },

    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },

    images: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },

    fabric: { type: String, trim: true },
    color: { type: String, trim: true },
    careInstructions: { type: String, trim: true },
    tags: { type: [String], default: [] },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

ProductSchema.index({ name: "text", description: "text", tags: "text" });

/** Convenience virtual: total stock across all variants. */
ProductSchema.virtual("totalStock").get(function () {
  return (this.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
});

ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

const ProductModel = mongoose.model("Product", ProductSchema);

export { ProductModel };
