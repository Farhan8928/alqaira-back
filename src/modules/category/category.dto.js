function toCategoryDto(doc) {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    section: doc.section,
    description: doc.description,
    image: doc.image,
    displayOrder: doc.displayOrder,
    isFeatured: doc.isFeatured,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export { toCategoryDto };
