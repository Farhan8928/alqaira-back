import { Router } from "express";
import { paymentController } from "./payment.controller.js";

const router = Router();

// Public — checkout reads which payment methods are available
router.get("/config", paymentController.config);

export default router;
