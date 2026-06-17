import { Router } from "express";
import { authenticate, authenticateCustomer, optionalCustomer } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { orderController } from "./order.controller.js";
import {
  orderCreateSchema,
  orderListSchema,
  orderIdSchema,
  orderStatusSchema,
  orderTrackSchema,
} from "./order.validation.js";

/** Storefront order routes — mounted at /api/orders */
const orderRouter = Router();

// Place an order (guest or logged-in)
orderRouter.post("/", optionalCustomer, validateRequest(orderCreateSchema), orderController.create);
// Razorpay returns here after checkout
orderRouter.post("/verify-payment", orderController.verifyPayment);
// Public order tracking by number + email
orderRouter.get("/track/:orderNumber", validateRequest(orderTrackSchema), orderController.track);
// Logged-in customer order history
orderRouter.get("/mine", authenticateCustomer, orderController.myOrders);
orderRouter.get("/mine/:id", authenticateCustomer, validateRequest(orderIdSchema), orderController.getMine);

/** Admin order management — mounted at /api/admin/orders */
const orderAdminRouter = Router();
orderAdminRouter.use(authenticate, authorizeRoles("admin", "manager", "staff"));
orderAdminRouter.get("/", validateRequest(orderListSchema), orderController.list);
orderAdminRouter.get("/:id", validateRequest(orderIdSchema), orderController.get);
orderAdminRouter.patch("/:id/status", validateRequest(orderStatusSchema), orderController.updateStatus);

export { orderRouter, orderAdminRouter };
