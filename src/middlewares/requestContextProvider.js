/**
 * Request-scoped context using AsyncLocalStorage.
 *
 * Attaches a unique request id (from the X-Request-Id / X-Correlation-Id
 * inbound header if present, otherwise newly generated) to every request,
 * stores it in an AsyncLocalStorage scope so any code on the call stack
 * can retrieve it (e.g. the pino logger mixin), echoes it back to the
 * client via the X-Request-Id response header, and exposes it on `req.id`
 * for `pino-http` to pick up automatically.
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export const requestContext = new AsyncLocalStorage();

export function requestContextProvider(req, res, next) {
  let reqId = req.headers["x-request-id"] || req.headers["x-correlation-id"];
  if (!reqId) reqId = randomUUID();

  res.setHeader("X-Request-Id", reqId);
  req.id = reqId;

  const store = new Map();
  store.set("reqId", reqId);

  requestContext.run(store, () => {
    next();
  });
}
