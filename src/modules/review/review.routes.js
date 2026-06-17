import { Router } from "express";
import { authenticate, authenticateCustomer } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { reviewController } from "./review.controller.js";
import {
  reviewCreateSchema,
  reviewProductSchema,
  reviewListSchema,
  reviewIdSchema,
  reviewApproveSchema,
} from "./review.validation.js";

/** Storefront review routes — mounted at /api/reviews */
const reviewRouter = Router();
reviewRouter.get("/product/:productId", validateRequest(reviewProductSchema), reviewController.listForProduct);
reviewRouter.post(
  "/product/:productId",
  authenticateCustomer,
  validateRequest(reviewCreateSchema),
  reviewController.create,
);

/** Admin moderation — mounted at /api/admin/reviews */
const reviewAdminRouter = Router();
reviewAdminRouter.use(authenticate, authorizeRoles("admin", "manager"));
reviewAdminRouter.get("/", validateRequest(reviewListSchema), reviewController.list);
reviewAdminRouter.patch("/:id/approval", validateRequest(reviewApproveSchema), reviewController.setApproval);
reviewAdminRouter.delete("/:id", validateRequest(reviewIdSchema), reviewController.remove);

export { reviewRouter, reviewAdminRouter };
