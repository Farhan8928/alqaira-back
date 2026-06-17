import { customerService } from "./customer.service.js";
import { toCustomerDto } from "./customer.dto.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const register = asyncHandler(async (req, res) => {
  const result = await customerService.register(req.validated.body);
  return sendSuccess(res, { statusCode: 201, message: "Welcome to ALQAIRA", data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await customerService.login(req.validated.body);
  return sendSuccess(res, { message: "Signed in", data: result });
});

const getMe = asyncHandler(async (req, res) => {
  const customer = await customerService.getMe(req.customer.id);
  return sendSuccess(res, { data: customer });
});

const updateProfile = asyncHandler(async (req, res) => {
  const customer = await customerService.updateProfile(req.customer.id, req.validated.body);
  return sendSuccess(res, { message: "Profile updated", data: customer });
});

const addAddress = asyncHandler(async (req, res) => {
  const customer = await customerService.addAddress(req.customer.id, req.validated.body);
  return sendSuccess(res, { statusCode: 201, message: "Address added", data: customer });
});

const updateAddress = asyncHandler(async (req, res) => {
  const customer = await customerService.updateAddress(
    req.customer.id,
    req.validated.params.id,
    req.validated.body,
  );
  return sendSuccess(res, { message: "Address updated", data: customer });
});

const removeAddress = asyncHandler(async (req, res) => {
  const customer = await customerService.removeAddress(req.customer.id, req.validated.params.id);
  return sendSuccess(res, { message: "Address removed", data: customer });
});

// Admin
const list = asyncHandler(async (req, res) => {
  const { items, ...meta } = await customerService.list(req.validated.query);
  return sendSuccess(res, { data: items.map(toCustomerDto), meta });
});

const get = asyncHandler(async (req, res) => {
  const customer = await customerService.get(req.validated.params.id);
  return sendSuccess(res, { data: customer });
});

const customerController = {
  register,
  login,
  getMe,
  updateProfile,
  addAddress,
  updateAddress,
  removeAddress,
  list,
  get,
};

export { customerController };
