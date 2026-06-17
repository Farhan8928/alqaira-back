import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import { accountRouter, customerAdminRouter } from "../modules/customer/customer.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import { orderRouter, orderAdminRouter } from "../modules/order/order.routes.js";
import { reviewRouter, reviewAdminRouter } from "../modules/review/review.routes.js";
import couponRoutes from "../modules/coupon/coupon.routes.js";
import paymentRoutes from "../modules/payment/payment.routes.js";
import settingsRoutes from "../modules/settings/settings.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";

const routes = Router();

// ── Admin-panel auth & staff management ──────────────────────────────────────
routes.use("/auth", authRoutes);

// ── Storefront customer accounts ─────────────────────────────────────────────
routes.use("/account", accountRouter);

// ── Catalog (public reads + admin writes share these routers) ────────────────
routes.use("/categories", categoryRoutes);
routes.use("/products", productRoutes);
routes.use("/coupons", couponRoutes);

// ── Storefront orders, reviews, payments, settings ───────────────────────────
routes.use("/orders", orderRouter);
routes.use("/reviews", reviewRouter);
routes.use("/payments", paymentRoutes);
routes.use("/settings", settingsRoutes);

// ── Admin-only management surfaces ───────────────────────────────────────────
routes.use("/admin/dashboard", dashboardRoutes);
routes.use("/admin/orders", orderAdminRouter);
routes.use("/admin/customers", customerAdminRouter);
routes.use("/admin/reviews", reviewAdminRouter);

export default routes;
