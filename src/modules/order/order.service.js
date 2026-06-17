/**
 * @module orderService
 * @description Checkout & fulfilment logic. Create reserves per-variant stock,
 * applies a coupon, computes shipping from store settings, and (for Razorpay)
 * creates a gateway order. If any line fails mid-way, already-reserved stock is
 * restored so we never half-charge inventory. Cancelling restocks everything.
 */
import { orderRepository } from "./order.repository.js";
import { productService } from "../product/product.service.js";
import { couponService } from "../coupon/coupon.service.js";
import { paymentService } from "../payment/payment.service.js";
import { settingsRepository } from "../settings/settings.repository.js";
import { AppError } from "../../utils/AppError.js";
import { startOfMonth } from "../../utils/dateHelpers.js";

function round2(n) {
  return Math.round((n || 0) * 100) / 100;
}

async function buildOrderNumber() {
  const seq = await settingsRepository.nextOrderSequence();
  const year = new Date().getFullYear();
  return `ALQ-${year}-${String(seq).padStart(5, "0")}`;
}

const orderService = {
  /**
   * Place an order. `customer` is the logged-in customer (or undefined for guest).
   */
  async create(body, customer) {
    const settings = (await settingsRepository.get()) || {};
    const { items, contact, shippingAddress, paymentMethod, couponCode, notes } = body;

    if (paymentMethod === "cod" && settings.codEnabled === false) {
      throw new AppError("Cash on Delivery is currently unavailable", 400);
    }
    if (paymentMethod === "razorpay" && settings.onlinePaymentEnabled === false) {
      throw new AppError("Online payment is currently unavailable", 400);
    }

    // 1. Reserve stock line by line; track what we took so we can roll back.
    const reserved = [];
    const lineItems = [];
    try {
      for (const item of items) {
        const { snapshot } = await productService.reserveStock({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        });
        reserved.push({ productId: item.productId, variantId: item.variantId, quantity: item.quantity });
        lineItems.push(snapshot);
      }
    } catch (err) {
      await Promise.all(reserved.map((r) => productService.restoreStock(r).catch(() => {})));
      throw err;
    }

    try {
      const subtotal = round2(lineItems.reduce((s, i) => s + i.lineTotal, 0));

      // 2. Coupon
      let discount = 0;
      let appliedCode;
      let couponDoc;
      if (couponCode && couponCode.trim()) {
        const result = await couponService.validate(couponCode, subtotal);
        discount = result.discount;
        appliedCode = result.coupon.code;
        couponDoc = result.coupon;
      }

      // 3. Shipping
      const netGoods = subtotal - discount;
      const threshold = settings.freeShippingThreshold ?? 0;
      const baseShip = settings.shippingFee ?? 0;
      const shippingFee = threshold && netGoods >= threshold ? 0 : baseShip;

      const total = round2(netGoods + shippingFee);

      // 4. Order number + base status
      const orderNumber = await buildOrderNumber();
      const isOnline = paymentMethod === "razorpay";
      const status = isOnline ? "pending" : "confirmed";

      // 5. Razorpay order (only for online payment)
      let razorpay;
      if (isOnline) {
        const rzpOrder = await paymentService.createOrder(total, orderNumber);
        razorpay = { orderId: rzpOrder.id };
      }

      const order = await orderRepository.create({
        orderNumber,
        customer: customer?.id,
        isGuest: !customer,
        contact,
        items: lineItems,
        shippingAddress,
        subtotal,
        discount,
        couponCode: appliedCode,
        shippingFee,
        total,
        paymentMethod,
        paymentStatus: "pending",
        razorpay,
        status,
        statusHistory: [{ status, note: isOnline ? "Awaiting payment" : "Order placed (COD)" }],
        notes,
      });

      if (couponDoc) await couponService.redeem(couponDoc._id);

      return {
        order,
        payment: isOnline
          ? { provider: "razorpay", key: paymentService.publicKey(), orderId: razorpay.orderId, amount: Math.round(total * 100), currency: "INR" }
          : null,
      };
    } catch (err) {
      // Something after reservation failed (coupon/gateway) — roll back stock.
      await Promise.all(reserved.map((r) => productService.restoreStock(r).catch(() => {})));
      throw err;
    }
  },

  /** Verify a Razorpay payment and confirm the order. */
  async verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const order = await orderRepository.findByRazorpayOrderId(razorpayOrderId);
    if (!order) throw new AppError("Order not found for this payment", 404);

    const valid = paymentService.verifySignature({
      razorpayOrderId,
      razorpayPaymentId,
      signature: razorpaySignature,
    });
    if (!valid) {
      order.paymentStatus = "failed";
      order.statusHistory.push({ status: order.status, note: "Payment signature verification failed" });
      await order.save();
      throw new AppError("Payment verification failed", 400);
    }

    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.razorpay.paymentId = razorpayPaymentId;
    order.razorpay.signature = razorpaySignature;
    order.statusHistory.push({ status: "confirmed", note: "Payment received" });
    await order.save();
    return order.toObject();
  },

  list(query) {
    return orderRepository.findMany(query);
  },

  async get(id, { customerId } = {}) {
    const order = await orderRepository.findById(id);
    if (!order) throw new AppError("Order not found", 404);
    if (customerId && String(order.customer?._id || order.customer) !== customerId) {
      throw new AppError("You don't have access to this order", 403, { code: "FORBIDDEN" });
    }
    return order;
  },

  myOrders(customerId) {
    return orderRepository.findByCustomer(customerId);
  },

  async track(orderNumber, email) {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order || (email && order.contact?.email !== email.toLowerCase())) {
      throw new AppError("Order not found", 404);
    }
    return order;
  },

  /** Admin: change status. Cancelling restocks every line. */
  async updateStatus(id, { status, note }) {
    const order = await orderRepository.docById(id);
    if (!order) throw new AppError("Order not found", 404);
    if (order.status === "cancelled") throw new AppError("Order is already cancelled", 400);

    if (status === "cancelled") {
      await Promise.all(
        order.items.map((i) =>
          i.product && i.variantId
            ? productService
                .restoreStock({ productId: i.product, variantId: i.variantId, quantity: i.quantity })
                .catch(() => {})
            : Promise.resolve(),
        ),
      );
      if (order.paymentStatus === "paid") order.paymentStatus = "refunded";
    }
    if (status === "delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }

    order.status = status;
    order.statusHistory.push({ status, note });
    await order.save();
    return order.toObject();
  },

  async dashboard() {
    const monthStart = startOfMonth();
    const since = new Date(Date.now() - 30 * 86400000);
    const [summaryRows, statusRows, topProducts, byDay, recent] = await Promise.all([
      orderRepository.revenueSummary(monthStart),
      orderRepository.statusBreakdown(),
      orderRepository.topProducts(5),
      orderRepository.revenueByDay(since),
      orderRepository.recent(8),
    ]);
    const s = summaryRows[0] || {};
    return {
      summary: {
        orders: s.orders || 0,
        revenue: round2(s.revenue || 0),
        thisMonthOrders: s.thisMonthOrders || 0,
        thisMonthRevenue: round2(s.thisMonthRevenue || 0),
      },
      statusBreakdown: statusRows.map((r) => ({ status: r._id, count: r.count })),
      topProducts: topProducts.map((p) => ({ ...p, revenue: round2(p.revenue) })),
      revenueByDay: byDay.map((d) => ({ ...d, revenue: round2(d.revenue) })),
      recentOrders: recent,
    };
  },
};

export { orderService };
