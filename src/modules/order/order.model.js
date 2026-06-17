/**
 * @module OrderModel
 * @description A placed order. Line items, address and pricing are SNAPSHOTTED
 * at checkout so later catalog/profile edits never rewrite order history.
 * Supports guest and logged-in checkout. Payment is COD or Razorpay.
 */
import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, required: true },
    slug: { type: String },
    image: { type: String },
    variantId: { type: String },
    size: { type: String },
    color: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const AddressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, trim: true, default: "India" },
  },
  { _id: false },
);

const StatusEventSchema = new mongoose.Schema(
  { status: String, note: String, at: { type: Date, default: Date.now } },
  { _id: false },
);

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },

    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true },
    isGuest: { type: Boolean, default: false },
    contact: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true, index: true },
      phone: { type: String, trim: true },
    },

    items: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: AddressSnapshotSchema, required: true },

    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, trim: true, uppercase: true },
    shippingFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    paymentMethod: { type: String, enum: ["cod", "razorpay"], required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending", index: true },
    razorpay: {
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
    },

    status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
    statusHistory: { type: [StatusEventSchema], default: [] },

    notes: { type: String, trim: true },
    placedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

const OrderModel = mongoose.model("Order", OrderSchema);

export { OrderModel, ORDER_STATUSES, PAYMENT_STATUSES };
