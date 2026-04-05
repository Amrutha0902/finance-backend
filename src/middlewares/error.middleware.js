const { error } = require("../utils/response");

/**
 * 404 handler — catches requests to undefined routes.
 */
function notFound(req, res) {
  return error(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
}

/**
 * Global error handler — catches any error passed via next(err).
 */
// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.stack || err.message}`);

  // SQLite constraint errors
  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return error(res, "A record with this value already exists.", 409);
  }

  if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
    return error(res, "Referenced resource does not exist.", 400);
  }

  const statusCode = err.statusCode || 500;
  const message    = err.expose ? err.message : "Internal server error.";

  return error(res, message, statusCode);
}

module.exports = { notFound, globalErrorHandler };
