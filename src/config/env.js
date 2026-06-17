import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5005),
  MONGODB_URI: required("MONGODB_URI"),
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "8h",
  JWT_CUSTOMER_EXPIRES_IN: process.env.JWT_CUSTOMER_EXPIRES_IN || "30d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
});

export { env };
