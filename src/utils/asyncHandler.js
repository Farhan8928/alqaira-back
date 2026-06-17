/**
 * Wraps an async Express handler and forwards any rejected promise to next().
 * Eliminates try/catch boilerplate in every controller function.
 * @param {Function} fn - async (req, res, next) => void
 * @returns {Function}
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export { asyncHandler };
