/**
 * @module SettingsModel
 * @description Store-wide configuration singleton — contact details, shipping
 * rules, payment toggles and the running order-number sequence. Created once on
 * startup by config/bootstrap.js and edited from the admin Settings page.
 */
import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, trim: true, default: "ALQAIRA" },
    tagline: { type: String, trim: true },
    logo: { type: String, trim: true },
    supportEmail: { type: String, trim: true },
    supportPhone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    addressLine: { type: String, trim: true },
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },

    currency: { type: String, trim: true, default: "INR" },
    freeShippingThreshold: { type: Number, default: 4999, min: 0 },
    shippingFee: { type: Number, default: 199, min: 0 },

    codEnabled: { type: Boolean, default: true },
    onlinePaymentEnabled: { type: Boolean, default: true },

    announcement: { type: String, trim: true },

    // Running order number sequence — incremented atomically per order.
    orderSequence: { type: Number, default: 1000 },
  },
  { timestamps: true },
);

const SettingsModel = mongoose.model("Settings", SettingsSchema);

export { SettingsModel };
