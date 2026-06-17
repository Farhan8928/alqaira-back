import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { couponController } from "./coupon.controller.js";
import {
  couponListSchema,
  couponCreateSchema,
  couponUpdateSchema,
  couponIdSchema,
  couponValidateSchema,
} from "./coupon.validation.js";

const router = Router();

// Public — apply a coupon at checkout
router.post("/validate", validateRequest(couponValidateSchema), couponController.validateCode);

// Admin management
router.use(authenticate, authorizeRoles("admin", "manager"));
router.get("/", validateRequest(couponListSchema), couponController.list);
router.post("/", validateRequest(couponCreateSchema), couponController.create);
router.patch("/:id", validateRequest(couponUpdateSchema), couponController.update);
router.delete("/:id", validateRequest(couponIdSchema), couponController.remove);

export default router;
