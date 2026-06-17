import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

router.get(
  "/overview",
  authenticate,
  authorizeRoles("admin", "manager", "staff"),
  dashboardController.overview,
);

export default router;
