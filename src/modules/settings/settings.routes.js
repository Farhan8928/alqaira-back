import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { settingsController } from "./settings.controller.js";
import { settingsUpdateSchema } from "./settings.validation.js";

const router = Router();

// Public — storefront header/footer
router.get("/public", settingsController.getPublic);

// Admin
router.get("/", authenticate, authorizeRoles("admin", "manager"), settingsController.get);
router.patch(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validateRequest(settingsUpdateSchema),
  settingsController.update,
);

export default router;
