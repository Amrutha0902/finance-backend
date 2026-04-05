const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// ✅ Force test environment BEFORE anything
process.env.JWT_SECRET = "test_secret";
process.env.NODE_ENV = "test";

// ❌ Do NOT use ":memory:" directly anymore
// Shared memory is handled in database.js

// ✅ Import AFTER env setup
const {
  getDb,
  initializeSchema,
  resetDb,
} = require("../src/config/database");

function setupTestDb() {
  // 🔥 1. Reset DB connection completely
  resetDb();

  const db = getDb();

  // 🔥 2. Clean previous state (critical)
  db.exec(`
    DROP TABLE IF EXISTS financial_records;
    DROP TABLE IF EXISTS users;
  `);

  // 🔥 3. Recreate schema
  initializeSchema();

  return db;
}

function createTestUser(db, overrides = {}) {
  const id = uuidv4();

  const defaults = {
    id,
    name: "Test User",
    email: `user_${id}@test.com`, // ✅ always unique
    password: bcrypt.hashSync("password123", 10),
    role: "viewer",
    status: "active",
  };

  const user = { ...defaults, ...overrides };

  db.prepare(`
    INSERT INTO users (id, name, email, password, role, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    user.id,
    user.name,
    user.email,
    user.password,
    user.role,
    user.status
  );

  return user;
}

function createTestRecord(db, userId, overrides = {}) {
  const id = uuidv4();

  const defaults = {
    id,
    amount: 1000,
    type: "income",
    category: "Salary",
    date: "2024-01-15",
    notes: "Test record",
    created_by: userId,
  };

  const record = { ...defaults, ...overrides };

  db.prepare(`
    INSERT INTO financial_records 
    (id, amount, type, category, date, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.amount,
    record.type,
    record.category,
    record.date,
    record.notes,
    record.created_by
  );

  return record;
}

module.exports = {
  setupTestDb,
  createTestUser,
  createTestRecord,
};