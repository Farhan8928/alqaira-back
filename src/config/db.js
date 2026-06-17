import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Connects to MongoDB with exponential-backoff retry.
 * Exits the process if max retries are exhausted.
 */
async function connectDb(maxRetries = 5) {
  mongoose.set("strictQuery", true);

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info("MongoDB connected");
      return;
    } catch (error) {
      attempt++;
      const delay = Math.min(1000 * 2 ** attempt, 10000);

      logger.warn(
        { attempt, delayMs: delay, err: error.message },
        "MongoDB connection failed, will retry",
      );

      if (attempt >= maxRetries) {
        logger.fatal("Max MongoDB retries reached. Exiting.");
        process.exit(1);
      }

      await wait(delay);
    }
  }
}

export { connectDb };
