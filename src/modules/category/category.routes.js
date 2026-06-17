import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { categoryController } from "./category.controller.js";
import {
  categoryListSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryIdSchema,
  categorySlugSchema,
} from "./category.validation.js";

const router = Router();

// ── Public storefront ───────────────────────────────────────────────────────
router.get("/active", categoryController.active);
router.get("/featured", categoryController.featured);
router.get("/slug/:slug", validateRequest(categorySlugSchema), categoryController.getBySlug);

// ── Admin management ──────────────────────────────────────────────────────────
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "manager"),
  validateRequest(categoryListSchema),
  categoryController.list,
);
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "manager"),
  validateRequest(categoryCreateSchema),
  categoryController.create,
);
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("admin", "manager"),
  validateRequest(categoryUpdateSchema),
  categoryController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  validateRequest(categoryIdSchema),
  categoryController.remove,
);

export default router;
