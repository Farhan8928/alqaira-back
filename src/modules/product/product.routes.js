import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { productController } from "./product.controller.js";
import {
  productListSchema,
  productCreateSchema,
  productUpdateSchema,
  productIdSchema,
  productSlugSchema,
} from "./product.validation.js";

const router = Router();

// ── Public storefront ───────────────────────────────────────────────────────
router.get("/", validateRequest(productListSchema), productController.list);
router.get("/featured", productController.featured);
router.get("/new-arrivals", productController.newArrivals);
router.get("/slug/:slug", validateRequest(productSlugSchema), productController.getBySlug);

// ── Admin management ──────────────────────────────────────────────────────────
router.get(
  "/admin/list",
  authenticate,
  authorizeRoles("admin", "manager"),
  validateRequest(productListSchema),
  productController.adminList,
);
router.get(
  "/admin/:id",
  authenticate,
  authorizeRoles("admin", "manager"),
  validateRequest(productIdSchema),
  productController.get,
);
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "manager"),
  validateRequest(productCreateSchema),
  productController.create,
);
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("admin", "manager"),
  validateRequest(productUpdateSchema),
  productController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  validateRequest(productIdSchema),
  productController.remove,
);

export default router;
