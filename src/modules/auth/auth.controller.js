/**
 * @module authController
 * @description HTTP layer for admin-panel auth. Extracts from req.validated
 * (set by validateRequest middleware), delegates to authService.
 */
import { authService } from "./auth.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.validated.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Admin account created successfully",
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body);
  return sendSuccess(res, { message: "Login successful", data: result });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return sendSuccess(res, { data: user });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await authService.createUser(req.validated.body);
  return sendSuccess(res, { statusCode: 201, message: "User account created", data: user });
});

const listUsers = asyncHandler(async (_req, res) => {
  const users = await authService.listUsers();
  return sendSuccess(res, { data: users });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const user = await authService.updateUser(id, req.validated.body);
  return sendSuccess(res, { message: "User updated", data: user });
});

const authController = { register, login, getMe, createUser, listUsers, updateUser };

export { authController };
