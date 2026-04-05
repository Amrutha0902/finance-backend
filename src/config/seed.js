/**
 * Seed Script
 * Creates 3 ready-to-use accounts (admin, analyst, viewer)
 * and 20 sample financial records for testing.
 *
 * Run with: npm run seed
 */

require("dotenv").config();

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { initializeSchema, getDb } = require("./database");

// ── Initialise schema first ──────────────────────────────────────────────────
initializeSchema();
const db = getDb();

// ── Seed Users ───────────────────────────────────────────────────────────────
const users = [
  { name: "Super Admin",    email: "admin@finance.com",    password: "admin123",    role: "admin"   },
  { name: "Alice Analyst",  email: "analyst@finance.com",  password: "analyst123",  role: "analyst" },
  { name: "Victor Viewer",  email: "viewer@finance.com",   password: "viewer123",   role: "viewer"  },
];

const seededUsers = [];

for (const u of users) {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(u.email);
  if (existing) {
    console.log(`⚠️  User already exists: ${u.email}`);
    seededUsers.push({ id: existing.id, role: u.role });
    continue;
  }

  const id     = uuidv4();
  const hashed = bcrypt.hashSync(u.password, 10);

  db.prepare(`
    INSERT INTO users (id, name, email, password, role, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `).run(id, u.name, u.email, hashed, u.role);

  seededUsers.push({ id, role: u.role });
  console.log(`✅ Created ${u.role}: ${u.email} / ${u.password}`);
}

// ── Seed Financial Records ───────────────────────────────────────────────────
const adminId = seededUsers.find((u) => u.role === "admin")?.id;

if (!adminId) {
  console.error("❌ Admin user not found. Cannot seed records.");
  process.exit(1);
}

const sampleRecords = [
  { amount: 5000,  type: "income",  category: "Salary",      date: "2024-01-05", notes: "January salary" },
  { amount: 1200,  type: "expense", category: "Rent",        date: "2024-01-07", notes: "Monthly rent" },
  { amount: 300,   type: "expense", category: "Groceries",   date: "2024-01-10", notes: "Weekly grocery run" },
  { amount: 150,   type: "expense", category: "Utilities",   date: "2024-01-15", notes: "Electricity bill" },
  { amount: 500,   type: "income",  category: "Freelance",   date: "2024-01-20", notes: "Web design project" },
  { amount: 5000,  type: "income",  category: "Salary",      date: "2024-02-05", notes: "February salary" },
  { amount: 1200,  type: "expense", category: "Rent",        date: "2024-02-07", notes: "Monthly rent" },
  { amount: 80,    type: "expense", category: "Internet",    date: "2024-02-10", notes: "Broadband bill" },
  { amount: 250,   type: "expense", category: "Groceries",   date: "2024-02-14", notes: "Grocery shopping" },
  { amount: 1000,  type: "income",  category: "Freelance",   date: "2024-02-22", notes: "Logo design project" },
  { amount: 5000,  type: "income",  category: "Salary",      date: "2024-03-05", notes: "March salary" },
  { amount: 1200,  type: "expense", category: "Rent",        date: "2024-03-07", notes: "Monthly rent" },
  { amount: 400,   type: "expense", category: "Shopping",    date: "2024-03-12", notes: "Clothing purchase" },
  { amount: 90,    type: "expense", category: "Utilities",   date: "2024-03-18", notes: "Water bill" },
  { amount: 750,   type: "income",  category: "Freelance",   date: "2024-03-25", notes: "Mobile app mockup" },
  { amount: 5000,  type: "income",  category: "Salary",      date: "2024-04-05", notes: "April salary" },
  { amount: 1200,  type: "expense", category: "Rent",        date: "2024-04-07", notes: "Monthly rent" },
  { amount: 200,   type: "expense", category: "Dining",      date: "2024-04-13", notes: "Restaurant meals" },
  { amount: 60,    type: "expense", category: "Internet",    date: "2024-04-15", notes: "Broadband bill" },
  { amount: 2000,  type: "income",  category: "Freelance",   date: "2024-04-28", notes: "E-commerce project" },
];

let recordsCreated = 0;
for (const r of sampleRecords) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO financial_records (id, amount, type, category, date, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, r.amount, r.type, r.category, r.date, r.notes, adminId);
  recordsCreated++;
}

console.log(`\n✅ Seeded ${recordsCreated} sample financial records.\n`);
console.log("─────────────────────────────────────────────");
console.log("📋 Test Credentials:");
console.log("   Admin   → admin@finance.com    / admin123");
console.log("   Analyst → analyst@finance.com  / analyst123");
console.log("   Viewer  → viewer@finance.com   / viewer123");
console.log("─────────────────────────────────────────────");
console.log(`📖 API Docs → http://localhost:${process.env.PORT || 3000}/api-docs`);
