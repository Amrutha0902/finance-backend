const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");

const DB_PATH = process.env.DB_PATH || "./finance.db";

let db;

function getDb() {
  if (!db) {
    // Check if we should use memory (for tests) or a real file path
    const finalPath = DB_PATH === ":memory:" ? ":memory:" : path.resolve(DB_PATH);
    
    db = new Database(finalPath);
    
    // WAL mode is for persistent files, skipped for :memory:
    if (DB_PATH !== ":memory:") {
      db.pragma("journal_mode = WAL");
    }
    db.pragma("foreign_keys = ON");
  }
  return db;
}

/**
 * Resets the database connection.
 * Essential for test isolation in Jest.
 */
function resetDb() {
  if (db) {
    db.close();
    db = null;
  }
}

function initializeSchema() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      password    TEXT NOT NULL,
      role        TEXT NOT NULL CHECK(role IN ('admin', 'analyst', 'viewer')),
      status      TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS financial_records (
      id          TEXT PRIMARY KEY,
      amount      REAL NOT NULL CHECK(amount > 0),
      type        TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      category    TEXT NOT NULL,
      date        TEXT NOT NULL,
      notes       TEXT,
      deleted_at  TEXT DEFAULT NULL,
      created_by  TEXT NOT NULL REFERENCES users(id),
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_records_type     ON financial_records(type);
    CREATE INDEX IF NOT EXISTS idx_records_category ON financial_records(category);
    CREATE INDEX IF NOT EXISTS idx_records_date     ON financial_records(date);
    CREATE INDEX IF NOT EXISTS idx_records_deleted  ON financial_records(deleted_at);
  `);
}

function seedAdmin() {
  const db = getDb();

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get("admin@finance.com");

  if (!existing) {
    const { v4: uuidv4 } = require("uuid");
    const hashed = bcrypt.hashSync("admin123", 10);

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), "Super Admin", "admin@finance.com", hashed, "admin", "active");

    console.log("✅ Default admin seeded: admin@finance.com / admin123");
  }
}

module.exports = { getDb, resetDb, initializeSchema, seedAdmin };
