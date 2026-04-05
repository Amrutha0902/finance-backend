const bcrypt         = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { getDb }      = require("../config/database");
const { signToken }  = require("../utils/jwt");

/**
 * Self-registration — creates a new user with the viewer role.
 * Returns a signed JWT + safe user profile immediately (no separate login needed).
 */
function register(name, email, password) {
  const db = getDb();

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    const err = new Error("Email is already registered.");
    err.statusCode = 409;
    err.expose = true;
    throw err;
  }

  const id     = uuidv4();
  const hashed = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, name, email, password, role, status)
    VALUES (?, ?, ?, ?, 'viewer', 'active')
  `).run(id, name, email, hashed);

  const user  = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  const token = signToken({ id: user.id, role: user.role });

  return { token, user: sanitizeUser(user) };
}

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

  return { token, user: sanitizeUser(user) };
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

module.exports = { register, login, getProfile };
