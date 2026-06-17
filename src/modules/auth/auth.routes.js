import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { authController } from "./auth.controller.js";
import {
  authRegisterSchema,
  authLoginSchema,
  authMeSchema,
  authCreateUserSchema,
  authUpdateUserSchema,
  authListUsersSchema,
} from "./auth.validation.js";

const router = Router();

// Public
router.post("/register", validateRequest(authRegisterSchema), authController.register);
router.post("/login", validateRequest(authLoginSchema), authController.login);

// Protected
router.get("/me", authenticate, validateRequest(authMeSchema), authController.getMe);

// Admin-only staff management
router.get(
  "/users",
  authenticate,
  authorizeRoles("admin"),
  validateRequest(authListUsersSchema),
  authController.listUsers,
);
router.post(
  "/users",
  authenticate,
  authorizeRoles("admin"),
  validateRequest(authCreateUserSchema),
  authController.createUser,
);
router.patch(
  "/users/:id",
  authenticate,
  authorizeRoles("admin"),
  validateRequest(authUpdateUserSchema),
  authController.updateUser,
);

export default router;
