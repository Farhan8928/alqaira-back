import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const HTTP_ERROR_CODES = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  500: "INTERNAL_SERVER_ERROR",
};

function errorHandler(err, _req, res, _next) {
  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: `Invalid value for field: ${err.path}` },
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({
      success: false,
      error: { code: "CONFLICT", message: `Duplicate value for ${field}` },
    });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Validation failed", details },
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    });
  }

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : "Internal server error";
  const code = isAppError && err.code ? err.code : HTTP_ERROR_CODES[statusCode] || "UNKNOWN_ERROR";

  if (statusCode >= 500) {
    logger.error({ err }, "Unhandled server error");
  } else if (env.NODE_ENV !== "production") {
    logger.debug({ err: err.message }, "Request error");
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(isAppError && err.details ? { details: err.details } : {}),
      ...(env.NODE_ENV !== "production" && !isAppError ? { stack: err.stack } : {}),
    },
  });
}

export { errorHandler };
