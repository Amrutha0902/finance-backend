const bcrypt    = require("bcryptjs");
const { getDb } = require("../config/database");
const { signToken } = require("../utils/jwt");

/**
 * Authenticates a user by email + password.
 * Returns a signed JWT and safe user profile on success.
 */
function login(email, password) {
  const db   = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    err.expose = true;
    throw err;
  }

  if (user.status !== "active") {
    const err = new Error("Account is inactive. Contact an administrator.");
    err.statusCode = 403;
    err.expose = true;
    throw err;
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    err.expose = true;
    throw err;
  }

  const token = signToken({ id: user.id, role: user.role });

  return {
    token,
    user: sanitizeUser(user),
  };
}

/**
 * Returns the profile of the currently authenticated user.
 */
function getProfile(userId) {
  const db   = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  return sanitizeUser(user);
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

module.exports = { login, getProfile };
