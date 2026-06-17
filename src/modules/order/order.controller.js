import { orderService } from "./order.service.js";
import { toOrderDto } from "./order.dto.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// ── Storefront ─────────────────────────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const { order, payment } = await orderService.create(req.validated.body, req.customer);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Order placed",
    data: { order: toOrderDto(order), payment },
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const order = await orderService.verifyPayment(req.body);
  return sendSuccess(res, { message: "Payment verified", data: toOrderDto(order) });
});

const myOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.myOrders(req.customer.id);
  return sendSuccess(res, { data: orders.map(toOrderDto) });
});

const getMine = asyncHandler(async (req, res) => {
  const order = await orderService.get(req.validated.params.id, { customerId: req.customer.id });
  return sendSuccess(res, { data: toOrderDto(order) });
});

const track = asyncHandler(async (req, res) => {
  const order = await orderService.track(req.validated.params.orderNumber, req.query.email);
  return sendSuccess(res, { data: toOrderDto(order) });
});

// ── Admin ───────────────────────────────────────────────────────────────────
const list = asyncHandler(async (req, res) => {
  const { items, ...meta } = await orderService.list(req.validated.query);
  return sendSuccess(res, { data: items.map(toOrderDto), meta });
});

const get = asyncHandler(async (req, res) => {
  const order = await orderService.get(req.validated.params.id);
  return sendSuccess(res, { data: toOrderDto(order) });
});

const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.validated.params.id, req.validated.body);
  return sendSuccess(res, { message: "Order updated", data: toOrderDto(order) });
});

const orderController = {
  create,
  verifyPayment,
  myOrders,
  getMine,
  track,
  list,
  get,
  updateStatus,
};

export { orderController };
