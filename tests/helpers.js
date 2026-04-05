const Database = require("better-sqlite3");
const bcrypt   = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// Point all DB calls to an in-memory database during tests
process.env.DB_PATH      = ":memory:";
process.env.JWT_SECRET   = "test_secret";
process.env.NODE_ENV     = "test";

// Must be required AFTER env vars are set
const { initializeSchema, resetDb } = require("../src/config/database");

function setupTestDb() {
  resetDb();
  initializeSchema();
}


function createTestUser(db, overrides = {}) {
  const id = uuidv4();
  const defaults = {
    id,
    name:     "Test User",
    email:    `user_${id}@test.com`,
    password: bcrypt.hashSync("password123", 10),
    role:     "viewer",
    status:   "active",
  };
  const user = { ...defaults, ...overrides };

  db.prepare(`
    INSERT INTO users (id, name, email, password, role, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(user.id, user.name, user.email, user.password, user.role, user.status);

  return user;
}

function createTestRecord(db, userId, overrides = {}) {
  const id = uuidv4();
  const defaults = {
    id,
    amount:     1000,
    type:       "income",
    category:   "Salary",
    date:       "2024-01-15",
    notes:      "Test record",
    created_by: userId,
  };
  const record = { ...defaults, ...overrides };

  db.prepare(`
    INSERT INTO financial_records (id, amount, type, category, date, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(record.id, record.amount, record.type, record.category, record.date, record.notes, record.created_by);

  return record;
}

module.exports = { setupTestDb, createTestUser, createTestRecord };
