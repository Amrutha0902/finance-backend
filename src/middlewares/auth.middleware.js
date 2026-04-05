const { verifyToken } = require("../utils/jwt");
const { getDb }       = require("../config/database");
const { error }       = require("../utils/response");

/**
 * Middleware: Verifies Bearer JWT token.
 * Attaches the full user object to req.user on success.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "Authentication required. Provide a Bearer token.", 401);
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return error(res, "Token has expired. Please log in again.", 401);
    }
    return error(res, "Invalid token.", 401);
  }

  // Fetch fresh user from DB (catches deactivated accounts mid-session)
  const db   = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id);

  if (!user) {
    return error(res, "User not found.", 401);
  }

  if (user.status !== "active") {
    return error(res, "Account is inactive. Contact an administrator.", 403);
  }

  req.user = user;
  next();
}

module.exports = { authenticate };
