import { couponService } from "./coupon.service.js";
import { toCouponDto } from "./coupon.dto.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const list = asyncHandler(async (req, res) => {
  const { items, ...meta } = await couponService.list(req.validated.query);
  return sendSuccess(res, { data: items.map(toCouponDto), meta });
});

const create = asyncHandler(async (req, res) => {
  const coupon = await couponService.create(req.validated.body);
  return sendSuccess(res, { statusCode: 201, message: "Coupon created", data: toCouponDto(coupon) });
});

const update = asyncHandler(async (req, res) => {
  const coupon = await couponService.update(req.validated.params.id, req.validated.body);
  return sendSuccess(res, { message: "Coupon updated", data: toCouponDto(coupon) });
});

const remove = asyncHandler(async (req, res) => {
  const result = await couponService.remove(req.validated.params.id);
  return sendSuccess(res, { message: "Coupon deleted", data: result });
});

const validateCode = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.validated.body;
  const { coupon, discount } = await couponService.validate(code, subtotal);
  return sendSuccess(res, {
    message: "Coupon applied",
    data: { code: coupon.code, type: coupon.type, value: coupon.value, discount },
  });
});

const couponController = { list, create, update, remove, validateCode };

export { couponController };
