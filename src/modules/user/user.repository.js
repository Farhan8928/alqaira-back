/**
 * @module userRepository
 * @description Raw DB access for the User collection.
 * Used by authService and the authenticate middleware.
 */
import { UserModel } from "./user.model.js";

const userRepository = {
  findById: (id) => UserModel.findById(id).select("-password").lean(),

  findByEmail: (email) => UserModel.findOne({ email: email.trim().toLowerCase() }).lean(),

  countAll: () => UserModel.countDocuments(),

  create: (data) => UserModel.create(data),

  findAll: () => UserModel.find().select("-password").sort({ createdAt: 1 }).lean(),

  findByRole: (role) => UserModel.find({ role, isActive: true }).select("-password").lean(),

  updateById: (id, patch) =>
    UserModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).select("-password").lean(),
};

export { userRepository };
