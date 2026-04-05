const request = require("supertest");
const bcrypt  = require("bcryptjs");

const { setupTestDb, createTestUser, createTestRecord } = require("./helpers");
const { getDb } = require("../src/config/database");
const app = require("../src/app");

let adminToken, viewerToken, analystToken, adminUser;

beforeEach(async () => {
  setupTestDb();
  const db = getDb();

  adminUser = createTestUser(db, { email: "admin@dash.com",   password: bcrypt.hashSync("pass", 10), role: "admin"   });
  createTestUser(db,             { email: "viewer@dash.com",  password: bcrypt.hashSync("pass", 10), role: "viewer"  });
  createTestUser(db,             { email: "analyst@dash.com", password: bcrypt.hashSync("pass", 10), role: "analyst" });

  // Seed some records
  createTestRecord(db, adminUser.id, { type: "income",  amount: 5000, category: "Salary"  });
  createTestRecord(db, adminUser.id, { type: "expense", amount: 1200, category: "Rent"    });
  createTestRecord(db, adminUser.id, { type: "income",  amount: 800,  category: "Freelance" });

  const [a, v, an] = await Promise.all([
    request(app).post("/api/auth/login").send({ email: "admin@dash.com",   password: "pass" }),
    request(app).post("/api/auth/login").send({ email: "viewer@dash.com",  password: "pass" }),
    request(app).post("/api/auth/login").send({ email: "analyst@dash.com", password: "pass" }),
  ]);

  adminToken   = a.body.data.token;
  viewerToken  = v.body.data.token;
  analystToken = an.body.data.token;
});

describe("GET /api/dashboard/summary", () => {
  it("admin gets correct summary", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.total_income).toBe(5800);
    expect(res.body.data.total_expenses).toBe(1200);
    expect(res.body.data.net_balance).toBe(4600);
  });

  it("viewer can access summary", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
  });
});

describe("GET /api/dashboard/categories", () => {
  it("analyst can access category breakdown", async () => {
    const res = await request(app)
      .get("/api/dashboard/categories")
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it("viewer cannot access category breakdown (403)", async () => {
    const res = await request(app)
      .get("/api/dashboard/categories")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(403);
  });
});

describe("GET /api/dashboard/trends/monthly", () => {
  it("admin gets 12 months of data", async () => {
    const res = await request(app)
      .get("/api/dashboard/trends/monthly")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(12);
  });

  it("viewer cannot access monthly trends (403)", async () => {
    const res = await request(app)
      .get("/api/dashboard/trends/monthly")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(403);
  });
});

describe("GET /api/dashboard/recent", () => {
  it("returns recent activity for all roles", async () => {
    const res = await request(app)
      .get("/api/dashboard/recent")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
