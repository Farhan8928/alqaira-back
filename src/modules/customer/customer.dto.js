function toAddressDto(a) {
  return {
    id: String(a._id),
    label: a.label,
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    country: a.country,
    isDefault: a.isDefault,
  };
}

function toCustomerDto(doc) {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    addresses: (doc.addresses || []).map(toAddressDto),
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export { toCustomerDto, toAddressDto };
