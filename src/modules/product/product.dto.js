function toVariantDto(v) {
  return {
    id: String(v._id),
    size: v.size,
    color: v.color,
    sku: v.sku,
    stock: v.stock,
  };
}

function toProductDto(doc) {
  const variants = (doc.variants || []).map(toVariantDto);
  const totalStock = variants.reduce((s, v) => s + (v.stock || 0), 0);
  const discountPct =
    doc.compareAtPrice && doc.compareAtPrice > doc.price
      ? Math.round(((doc.compareAtPrice - doc.price) / doc.compareAtPrice) * 100)
      : 0;
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    shortDescription: doc.shortDescription,
    category: doc.category ? String(doc.category._id || doc.category) : null,
    categoryName: doc.categoryName,
    section: doc.section,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice,
    discountPct,
    images: doc.images || [],
    variants,
    totalStock,
    inStock: totalStock > 0,
    fabric: doc.fabric,
    color: doc.color,
    careInstructions: doc.careInstructions,
    tags: doc.tags || [],
    rating: doc.rating || 0,
    numReviews: doc.numReviews || 0,
    isFeatured: doc.isFeatured,
    isNewArrival: doc.isNewArrival,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/** Compact shape for cards / order line snapshots. */
function toProductCardDto(doc) {
  const full = toProductDto(doc);
  return {
    id: full.id,
    name: full.name,
    slug: full.slug,
    section: full.section,
    categoryName: full.categoryName,
    price: full.price,
    compareAtPrice: full.compareAtPrice,
    discountPct: full.discountPct,
    image: full.images[0] || null,
    rating: full.rating,
    numReviews: full.numReviews,
    inStock: full.inStock,
    isNewArrival: full.isNewArrival,
    isFeatured: full.isFeatured,
  };
}

export { toProductDto, toProductCardDto, toVariantDto };
