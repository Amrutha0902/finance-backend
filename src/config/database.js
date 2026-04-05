const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

let db;

function getDb() {
  if (!db) {
    const isTest = process.env.NODE_ENV === "test";

    const DB_PATH = isTest
      ? "file:testdb?mode=memory&cache=shared"
      : (process.env.DB_PATH || "./finance.db");

    // console.log("🔥 Using DB:", DB_PATH);

    db = new Database(DB_PATH);

    // ⚠️ Only enable WAL for file-based DB (not memory)
    if (!isTest) {
      db.pragma("journal_mode = WAL");
    }

    db.pragma("foreign_keys = ON");
  }

  return db;
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

    console.log("✅ Default admin seeded");
  }
}

// 🔥 OPTIONAL: reset DB between tests (highly recommended)
function resetDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDb,
  initializeSchema,
  seedAdmin,
  resetDb
};