/**
 * @module paymentService
 * @description Razorpay integration. Lazily constructs the SDK client so the
 * server still boots with placeholder keys (COD-only mode). Creates Razorpay
 * orders and verifies the payment signature returned by Razorpay Checkout.
 *
 * Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env to enable online payments.
 * Get keys from https://dashboard.razorpay.com/app/keys
 */
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

let client = null;

function isConfigured() {
  return (
    Boolean(env.RAZORPAY_KEY_ID) &&
    Boolean(env.RAZORPAY_KEY_SECRET) &&
    !env.RAZORPAY_KEY_ID.includes("xxxx")
  );
}

function getClient() {
  if (!isConfigured()) {
    throw new AppError(
      "Online payments are not configured. Add Razorpay keys to .env or use Cash on Delivery.",
      503,
      { code: "PAYMENT_NOT_CONFIGURED" },
    );
  }
  if (!client) {
    client = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
  }
  return client;
}

const paymentService = {
  isConfigured,
  publicKey: () => env.RAZORPAY_KEY_ID,

  /** Create a Razorpay order. `amount` is in rupees; Razorpay expects paise. */
  async createOrder(amount, receipt) {
    const rzp = getClient();
    return rzp.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      payment_capture: 1,
    });
  },

  /** Verify the HMAC signature Razorpay Checkout returns. */
  verifySignature({ razorpayOrderId, razorpayPaymentId, signature }) {
    if (!isConfigured()) return false;
    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signature || "");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  },
};

export { paymentService };
