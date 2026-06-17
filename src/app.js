import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { sendSuccess } from "./utils/response.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { requestContextProvider } from "./middlewares/requestContextProvider.js";
import routes from "./routes/index.js";

const app = express();

const corsOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : env.NODE_ENV === "production"
    ? []
    : true;

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Request context first, so every downstream log gets the reqId via the
// pino mixin in config/logger.js.
app.use(requestContextProvider);

app.use(
  pinoHttp({
    logger,
    autoLogging: true,
    genReqId: (req) => req.id,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
);

app.get("/health", (_req, res) =>
  sendSuccess(res, {
    data: { status: "ok", service: "ALQAIRA E-commerce API" },
  }),
);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
