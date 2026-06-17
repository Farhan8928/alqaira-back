/**
 * @module bootstrap
 * @description Runs once on server startup to ensure the StoreSettings singleton
 * exists. If not found, creates it with ALQAIRA defaults and logs a warning to
 * prompt the admin to fill in real details via the admin Settings page.
 */
import { SettingsModel } from "../modules/settings/settings.model.js";
import { logger } from "./logger.js";

async function bootstrapSettings() {
  const existing = await SettingsModel.findOne();
  if (existing) return;

  await SettingsModel.create({
    storeName: "ALQAIRA",
    tagline: "Premium Kurta & Jubba",
    supportEmail: "info@alqaira.com",
    supportPhone: "+971 50 123 4567",
    whatsapp: "+971 50 123 4567",
    addressLine: "Dubai, United Arab Emirates",
    instagram: "https://instagram.com/alqaira.official",
    facebook: "",
    currency: "INR",
    freeShippingThreshold: 4999,
    shippingFee: 199,
    codEnabled: true,
    onlinePaymentEnabled: true,
    announcement: "Free shipping on orders above ₹4,999 · Premium craftsmanship, delivered.",
  });

  logger.warn(
    "StoreSettings created with ALQAIRA defaults — update contact details, shipping rates and payment options from the admin Settings page before going live.",
  );
}

export { bootstrapSettings };
