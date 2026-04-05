const { v4: uuidv4 } = require("uuid");
const { getDb }      = require("../config/database");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

/**
 * Lists financial records with filtering, search, sorting, and pagination.
 * Excludes soft-deleted records by default.
 */
function listRecords(query = {}) {
  const db = getDb();
  const { page, limit, offset } = parsePagination(query);

  const whereClauses = ["r.deleted_at IS NULL"];
  const params       = [];

  if (query.type) {
    whereClauses.push("r.type = ?");
    params.push(query.type);
  }

  if (query.category) {
    whereClauses.push("r.category LIKE ?");
    params.push(`%${query.category}%`);
  }

  if (query.startDate) {
    whereClauses.push("r.date >= ?");
    params.push(query.startDate);
  }

  if (query.endDate) {
    whereClauses.push("r.date <= ?");
    params.push(query.endDate);
  }

  // Full-text search across category and notes
  if (query.search) {
    whereClauses.push("(r.category LIKE ? OR r.notes LIKE ?)");
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  const where = "WHERE " + whereClauses.join(" AND ");

  // Sorting
  const SORTABLE  = { date: "r.date", amount: "r.amount", created_at: "r.created_at" };
  const sortBy    = SORTABLE[query.sortBy] || "r.date";
  const sortOrder = query.sortOrder === "asc" ? "ASC" : "DESC";
  const orderBy   = `ORDER BY ${sortBy} ${sortOrder}`;

  const total = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM financial_records r
      ${where}
    `)
    .get(...params).count;

  const records = db
    .prepare(`
      SELECT r.*, u.name as created_by_name
      FROM financial_records r
      LEFT JOIN users u ON r.created_by = u.id
      ${where}
      ${orderBy}
      LIMIT ? OFFSET ?
    `)
    .all(...params, limit, offset);

  return {
    data:       records,
    pagination: buildPaginationMeta(page, limit, total),
  };
}

/**
 * Gets a single record by ID (excludes soft-deleted).
 */
function getRecordById(id) {
  const db = getDb();
  const record = db
    .prepare(`
      SELECT r.*, u.name as created_by_name
      FROM financial_records r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.id = ? AND r.deleted_at IS NULL
    `)
    .get(id);

  if (!record) {
    const err = new Error("Financial record not found.");
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  return record;
}

/**
 * Creates a new financial record.
 */
function createRecord({ amount, type, category, date, notes }, userId) {
  const db = getDb();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO financial_records (id, amount, type, category, date, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, amount, type, category, date, notes || null, userId);

  return getRecordById(id);
}

/**
 * Updates an existing financial record.
 */
function updateRecord(id, updates) {
  const db = getDb();

  // Confirm exists first
  getRecordById(id);

  const fields = [];
  const params = [];

  if (updates.amount !== undefined) {
    fields.push("amount = ?");
    params.push(updates.amount);
  }
  if (updates.type !== undefined) {
    fields.push("type = ?");
    params.push(updates.type);
  }
  if (updates.category !== undefined) {
    fields.push("category = ?");
    params.push(updates.category);
  }
  if (updates.date !== undefined) {
    fields.push("date = ?");
    params.push(updates.date);
  }
  if (updates.notes !== undefined) {
    fields.push("notes = ?");
    params.push(updates.notes);
  }

  fields.push("updated_at = datetime('now')");
  params.push(id);

  db.prepare(`
    UPDATE financial_records SET ${fields.join(", ")}
    WHERE id = ? AND deleted_at IS NULL
  `).run(...params);

  return getRecordById(id);
}

/**
 * Soft-deletes a financial record (sets deleted_at timestamp).
 */
function deleteRecord(id) {
  const db = getDb();

  getRecordById(id); // Throws 404 if not found

  db.prepare(`
    UPDATE financial_records
    SET deleted_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `).run(id);
}

module.exports = { listRecords, getRecordById, createRecord, updateRecord, deleteRecord };
