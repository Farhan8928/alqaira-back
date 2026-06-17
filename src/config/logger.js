/**
 * Application logger (pino).
 *
 * - Pretty-printed colourised output in development.
 * - Plain JSON in production (one line per record), suitable for log
 *   aggregators like Datadog, CloudWatch, Loki.
 * - Every record gets the current request id automatically via the
 *   AsyncLocalStorage mixin, so logs across services and middlewares
 *   for the same request can be grouped without manual plumbing.
 */
import pino from "pino";
import { env } from "./env.js";
import { requestContext } from "../middlewares/requestContextProvider.js";

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss.l" } }
      : undefined,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  mixin() {
    const store = requestContext.getStore();
    const reqId = store?.get("reqId");
    return reqId ? { reqId } : {};
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export { logger };
