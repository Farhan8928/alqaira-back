/**
 * @module authRepository
 * @description Thin wrapper around userRepository scoped to auth operations.
 * Keeps auth-specific query patterns out of the service.
 */
import { userRepository } from "../user/user.repository.js";

const authRepository = {
  findByEmail: (email) => userRepository.findByEmail(email),
  findById: (id) => userRepository.findById(id),
  countAll: () => userRepository.countAll(),
  create: (data) => userRepository.create(data),
  findAll: () => userRepository.findAll(),
  updateById: (id, patch) => userRepository.updateById(id, patch),
};

export { authRepository };
