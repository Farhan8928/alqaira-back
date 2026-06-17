import { reviewService } from "./review.service.js";
import { toReviewDto } from "./review.dto.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const listForProduct = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listForProduct(req.validated.params.productId);
  return sendSuccess(res, { data: reviews.map(toReviewDto) });
});

const create = asyncHandler(async (req, res) => {
  const review = await reviewService.create(
    req.validated.params.productId,
    req.customer,
    req.validated.body,
  );
  return sendSuccess(res, {
    statusCode: 201,
    message: "Thanks for your review",
    data: toReviewDto(review),
  });
});

const list = asyncHandler(async (req, res) => {
  const { items, ...meta } = await reviewService.list(req.validated.query);
  return sendSuccess(res, { data: items.map(toReviewDto), meta });
});

const setApproval = asyncHandler(async (req, res) => {
  const review = await reviewService.setApproval(
    req.validated.params.id,
    req.validated.body.isApproved,
  );
  return sendSuccess(res, { message: "Review updated", data: toReviewDto(review) });
});

const remove = asyncHandler(async (req, res) => {
  const result = await reviewService.remove(req.validated.params.id);
  return sendSuccess(res, { message: "Review deleted", data: result });
});

const reviewController = { listForProduct, create, list, setApproval, remove };

export { reviewController };
