function toCouponDto(doc) {
  return {
    id: String(doc._id),
    code: doc.code,
    description: doc.description,
    type: doc.type,
    value: doc.value,
    minOrderValue: doc.minOrderValue,
    maxDiscount: doc.maxDiscount,
    usageLimit: doc.usageLimit,
    usedCount: doc.usedCount,
    startsAt: doc.startsAt,
    expiresAt: doc.expiresAt,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export { toCouponDto };
