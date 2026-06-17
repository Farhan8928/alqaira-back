import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { authenticateCustomer } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { customerController } from "./customer.controller.js";
import {
  customerRegisterSchema,
  customerLoginSchema,
  customerMeSchema,
  customerUpdateSchema,
  addressCreateSchema,
  addressUpdateSchema,
  addressDeleteSchema,
  customerListSchema,
  customerGetSchema,
} from "./customer.validation.js";

/** Storefront account routes — mounted at /api/account */
const accountRouter = Router();

accountRouter.post(
  "/register",
  validateRequest(customerRegisterSchema),
  customerController.register,
);
accountRouter.post("/login", validateRequest(customerLoginSchema), customerController.login);

accountRouter.use(authenticateCustomer);
accountRouter.get("/me", validateRequest(customerMeSchema), customerController.getMe);
accountRouter.patch("/me", validateRequest(customerUpdateSchema), customerController.updateProfile);
accountRouter.post(
  "/addresses",
  validateRequest(addressCreateSchema),
  customerController.addAddress,
);
accountRouter.patch(
  "/addresses/:id",
  validateRequest(addressUpdateSchema),
  customerController.updateAddress,
);
accountRouter.delete(
  "/addresses/:id",
  validateRequest(addressDeleteSchema),
  customerController.removeAddress,
);

/** Admin customer management — mounted at /api/admin/customers */
const customerAdminRouter = Router();
customerAdminRouter.use(authenticate, authorizeRoles("admin", "manager"));
customerAdminRouter.get("/", validateRequest(customerListSchema), customerController.list);
customerAdminRouter.get("/:id", validateRequest(customerGetSchema), customerController.get);

export { accountRouter, customerAdminRouter };
