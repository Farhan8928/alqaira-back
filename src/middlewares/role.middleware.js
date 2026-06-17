import { AppError } from "../utils/AppError.js";

/**
 * Role-based access guard. Must be used after authenticate middleware.
 * Roles: "admin" | "manager" | "sales" | "inventory"
 * Usage: authorizeRoles("admin") or authorizeRoles("admin", "manager")
 */
function authorizeRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError("Unauthorized", 401));
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Access restricted to: ${roles.join(", ")}`, 403, {
          code: "FORBIDDEN",
        }),
      );
    }
    next();
  };
}

export { authorizeRoles };
