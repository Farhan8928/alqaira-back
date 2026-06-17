/**
 * @module CustomerModel
 * @description Storefront shoppers. Separate from staff Users. Stores a small
 * embedded address book; the chosen address is snapshotted onto each Order so
 * later edits don't rewrite history.
 */
import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Home" },
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    line1: { type: String, trim: true, required: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true, required: true },
    country: { type: String, trim: true, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: false },
);

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // bcrypt hash
    phone: { type: String, trim: true },
    addresses: { type: [AddressSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

CustomerSchema.index({ email: 1 }, { unique: true });

const CustomerModel = mongoose.model("Customer", CustomerSchema);

export { CustomerModel };
