/** Public-safe settings (used by the storefront header/footer). */
function toPublicSettingsDto(doc) {
  if (!doc) return null;
  return {
    storeName: doc.storeName,
    tagline: doc.tagline,
    logo: doc.logo,
    supportEmail: doc.supportEmail,
    supportPhone: doc.supportPhone,
    whatsapp: doc.whatsapp,
    addressLine: doc.addressLine,
    instagram: doc.instagram,
    facebook: doc.facebook,
    currency: doc.currency,
    freeShippingThreshold: doc.freeShippingThreshold,
    shippingFee: doc.shippingFee,
    codEnabled: doc.codEnabled,
    onlinePaymentEnabled: doc.onlinePaymentEnabled,
    announcement: doc.announcement,
    sizeCharts: doc.sizeCharts || {},
  };
}

/** Full settings (admin). */
function toSettingsDto(doc) {
  if (!doc) return null;
  return {
    ...toPublicSettingsDto(doc),
    id: String(doc._id),
    orderSequence: doc.orderSequence,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export { toPublicSettingsDto, toSettingsDto };
