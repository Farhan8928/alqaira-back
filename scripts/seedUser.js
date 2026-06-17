/**
 * Seed script — creates the admin-panel staff accounts for ALQAIRA.
 *
 * Usage:
 *   node scripts/seedUser.js
 *
 * Override defaults via env, e.g.:
 *   ADMIN_EMAIL=admin@alqaira.com ADMIN_PASSWORD=Secret123 node scripts/seedUser.js
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { UserModel } from "../src/modules/user/user.model.js";

const USERS = [
  {
    name: process.env.ADMIN_NAME || "ALQAIRA Admin",
    email: (process.env.ADMIN_EMAIL || "admin@alqaira.com").toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "Admin@123",
    role: "admin",
  },
  {
    name: process.env.MANAGER_NAME || "Store Manager",
    email: (process.env.MANAGER_EMAIL || "manager@alqaira.com").toLowerCase(),
    password: process.env.MANAGER_PASSWORD || "Manager@123",
    role: "manager",
  },
  {
    name: process.env.STAFF_NAME || "Fulfilment Staff",
    email: (process.env.STAFF_EMAIL || "staff@alqaira.com").toLowerCase(),
    password: process.env.STAFF_PASSWORD || "Staff@123",
    role: "staff",
  },
];

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected.\n");

  for (const u of USERS) {
    const existing = await UserModel.findOne({ email: u.email });
    if (existing) {
      console.log(`[SKIP] ${u.role} already exists: ${u.email}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 12);
    await UserModel.create({
      name: u.name,
      email: u.email,
      password: passwordHash,
      role: u.role,
      isActive: true,
    });
    console.log(`[OK]   Created ${u.role}: ${u.email}  (password: ${u.password})`);
  }

  console.log("\nDone.");
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
