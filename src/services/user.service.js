const bcrypt    = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/database");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

/**
 * Lists all users with optional search and pagination.
 */
function listUsers(query = {}) {
  const db = getDb();
  const { page, limit, offset } = parsePagination(query);

  const search = query.search ? `%${query.search}%` : null;
  const role   = query.role   || null;
  const status = query.status || null;

  let whereClauses = [];
  let params       = [];

  if (search) {
    whereClauses.push("(name LIKE ? OR email LIKE ?)");
    params.push(search, search);
  }
  if (role) {
    whereClauses.push("role = ?");
    params.push(role);
  }
  if (status) {
    whereClauses.push("status = ?");
    params.push(status);
  }

  const where = whereClauses.length > 0
    ? "WHERE " + whereClauses.join(" AND ")
    : "";

  const total = db
    .prepare(`SELECT COUNT(*) as count FROM users ${where}`)
    .get(...params).count;

  const users = db
    .prepare(`SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  return {
    data:       users.map(sanitizeUser),
    pagination: buildPaginationMeta(page, limit, total),
  };
}

/**
 * Gets a single user by ID.
 */
function getUserById(id) {
  const db   = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  return sanitizeUser(user);
}

/**
 * Creates a new user (admin only).
 */
function createUser({ name, email, password, role }) {
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
    VALUES (?, ?, ?, ?, ?, 'active')
  `).run(id, name, email, hashed, role);

  return getUserById(id);
}

/**
 * Updates a user's name, role, or status.
 */
function updateUser(id, updates) {
  const db   = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  const fields = [];
  const params = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    params.push(updates.name);
  }
  if (updates.role !== undefined) {
    fields.push("role = ?");
    params.push(updates.role);
  }
  if (updates.status !== undefined) {
    fields.push("status = ?");
    params.push(updates.status);
  }

  fields.push("updated_at = datetime('now')");
  params.push(id);

  db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...params);

  return getUserById(id);
}

/**
 * Deletes a user by ID. Prevents self-deletion.
 */
function deleteUser(id, requestingUserId) {
  const db = getDb();

  if (id === requestingUserId) {
    const err = new Error("You cannot delete your own account.");
    err.statusCode = 400;
    err.expose = true;
    throw err;
  }

  const user = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(id);
}

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };
