function toReviewDto(doc) {
  const product = doc.product;
  return {
    id: String(doc._id),
    product:
      product && typeof product === "object" && product._id
        ? { id: String(product._id), name: product.name, slug: product.slug }
        : product
          ? String(product)
          : null,
    customer: doc.customer ? String(doc.customer) : null,
    customerName: doc.customerName,
    rating: doc.rating,
    title: doc.title,
    comment: doc.comment,
    isApproved: doc.isApproved,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export { toReviewDto };
