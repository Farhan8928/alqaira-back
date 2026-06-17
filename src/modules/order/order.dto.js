function toOrderItemDto(i) {
  return {
    product: i.product ? String(i.product) : null,
    productName: i.productName,
    slug: i.slug,
    image: i.image,
    variantId: i.variantId,
    size: i.size,
    color: i.color,
    price: i.price,
    quantity: i.quantity,
    lineTotal: i.lineTotal,
  };
}

function customerRef(c) {
  if (!c) return null;
  if (typeof c === "object" && c._id) return { id: String(c._id), name: c.name, email: c.email };
  return { id: String(c) };
}

function toOrderDto(doc) {
  return {
    id: String(doc._id),
    orderNumber: doc.orderNumber,
    customer: customerRef(doc.customer),
    isGuest: doc.isGuest,
    contact: doc.contact,
    items: (doc.items || []).map(toOrderItemDto),
    shippingAddress: doc.shippingAddress,
    subtotal: doc.subtotal,
    discount: doc.discount,
    couponCode: doc.couponCode,
    shippingFee: doc.shippingFee,
    total: doc.total,
    paymentMethod: doc.paymentMethod,
    paymentStatus: doc.paymentStatus,
    razorpay: doc.razorpay ? { orderId: doc.razorpay.orderId } : undefined,
    status: doc.status,
    statusHistory: doc.statusHistory,
    notes: doc.notes,
    placedAt: doc.placedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export { toOrderDto, toOrderItemDto };
