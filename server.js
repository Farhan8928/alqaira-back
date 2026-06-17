import http from "http";
import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";
import { connectDb } from "./src/config/db.js";
import { bootstrapSettings } from "./src/config/bootstrap.js";

async function bootstrap() {
  await connectDb();
  await bootstrapSettings();

  const server = http.createServer(app);
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "ALQAIRA E-commerce API listening");
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
