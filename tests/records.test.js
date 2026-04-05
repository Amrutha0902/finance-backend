const request = require("supertest");
const bcrypt  = require("bcryptjs");

const { setupTestDb, createTestUser, createTestRecord } = require("./helpers");
const { getDb } = require("../src/config/database");
const app = require("../src/app");

let adminToken, viewerToken, analystToken;
let adminUser, viewerUser;

beforeEach(async () => {
  setupTestDb();
  const db = getDb();

  adminUser  = createTestUser(db, { email: "admin@test.com",   password: bcrypt.hashSync("pass", 10), role: "admin"   });
  viewerUser = createTestUser(db, { email: "viewer@test.com",  password: bcrypt.hashSync("pass", 10), role: "viewer"  });
  createTestUser(db,             { email: "analyst@test.com", password: bcrypt.hashSync("pass", 10), role: "analyst" });

  const [a, v, an] = await Promise.all([
    request(app).post("/api/auth/login").send({ email: "admin@test.com",   password: "pass" }),
    request(app).post("/api/auth/login").send({ email: "viewer@test.com",  password: "pass" }),
    request(app).post("/api/auth/login").send({ email: "analyst@test.com", password: "pass" }),
  ]);

  adminToken   = a.body.data.token;
  viewerToken  = v.body.data.token;
  analystToken = an.body.data.token;
});

describe("GET /api/records", () => {
  it("admin can list records", async () => {
    const db = getDb();
    createTestRecord(db, adminUser.id);

    const res = await request(app)
      .get("/api/records")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });

  it("viewer can list records", async () => {
    const res = await request(app)
      .get("/api/records")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/records");
    expect(res.statusCode).toBe(401);
  });

  it("supports filtering by type", async () => {
    const db = getDb();
    createTestRecord(db, adminUser.id, { type: "income",  category: "Salary"  });
    createTestRecord(db, adminUser.id, { type: "expense", category: "Rent"    });

    const res = await request(app)
      .get("/api/records?type=income")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((r) => r.type === "income")).toBe(true);
  });

  it("supports search by category", async () => {
    const db = getDb();
    createTestRecord(db, adminUser.id, { category: "UniqueCategory" });

    const res = await request(app)
      .get("/api/records?search=UniqueCategory")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe("POST /api/records", () => {
  const validRecord = {
    amount:   5000,
    type:     "income",
    category: "Freelance",
    date:     "2024-03-01",
    notes:    "Project payment",
  };

  it("admin can create a record", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(validRecord);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.amount).toBe(5000);
  });

  it("viewer cannot create a record (403)", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send(validRecord);

    expect(res.statusCode).toBe(403);
  });

  it("analyst cannot create a record (403)", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${analystToken}`)
      .send(validRecord);

    expect(res.statusCode).toBe(403);
  });

  it("returns 422 for negative amount", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...validRecord, amount: -100 });

    expect(res.statusCode).toBe(422);
  });

  it("returns 422 for invalid date format", async () => {
    const res = await request(app)
      .post("/api/records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...validRecord, date: "01-03-2024" });

    expect(res.statusCode).toBe(422);
  });
});

describe("PUT /api/records/:id", () => {
  it("admin can update a record", async () => {
    const db     = getDb();
    const record = createTestRecord(db, adminUser.id);

    const res = await request(app)
      .put(`/api/records/${record.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: 9999, notes: "Updated note" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.amount).toBe(9999);
  });

  it("returns 404 for non-existent record", async () => {
    const res = await request(app)
      .put("/api/records/nonexistent-id")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ amount: 100 });

    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /api/records/:id", () => {
  it("admin can soft-delete a record", async () => {
    const db     = getDb();
    const record = createTestRecord(db, adminUser.id);

    const delRes = await request(app)
      .delete(`/api/records/${record.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(delRes.statusCode).toBe(200);

    // Record should no longer appear in list
    const getRes = await request(app)
      .get(`/api/records/${record.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getRes.statusCode).toBe(404);
  });

  it("viewer cannot delete a record (403)", async () => {
    const db     = getDb();
    const record = createTestRecord(db, adminUser.id);

    const res = await request(app)
      .delete(`/api/records/${record.id}`)
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(403);
  });
});
