import { AppError } from "../utils/AppError.js";

/** Catch-all for unmatched routes — forwards a 404 to the error handler. */
function notFoundHandler(req, _res, next) {
  next(
    new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, { code: "NOT_FOUND" }),
  );
}

export { notFoundHandler };
