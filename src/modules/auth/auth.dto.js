/**
 * Strips internal fields (password, __v) from a user document
 * and normalises _id → id for consistent API responses.
 */
function toUserDto(doc) {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    phone: doc.phone,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export { toUserDto };
