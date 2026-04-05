const request = require("supertest");
const bcrypt  = require("bcryptjs");

const { setupTestDb, createTestUser } = require("./helpers");
const { getDb } = require("../src/config/database");
const app = require("../src/app");

beforeEach(() => {
  setupTestDb();
});

// ── POST /api/auth/register ──────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  it("creates a new viewer account and returns a token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Jane Test", email: "jane@test.com", password: "pass123" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe("viewer");
    expect(res.body.data.user.status).toBe("active");
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("returns 409 if email is already registered", async () => {
    const db = getDb();
    createTestUser(db, { email: "dup@test.com", password: bcrypt.hashSync("p", 10) });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Dup", email: "dup@test.com", password: "pass123" });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("returns 422 for missing name", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "x@test.com", password: "pass123" });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 422 for password shorter than 6 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "x@test.com", password: "123" });

    expect(res.statusCode).toBe(422);
  });

  it("registered user can immediately log in", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Auto", email: "auto@test.com", password: "pass123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "auto@test.com", password: "pass123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("returns 200 and a token for valid credentials", async () => {
    const db = getDb();
    createTestUser(db, { email: "login@test.com", password: bcrypt.hashSync("pass123", 10) });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@test.com", password: "pass123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("returns 401 for wrong password", async () => {
    const db = getDb();
    createTestUser(db, { email: "bad@test.com", password: bcrypt.hashSync("correct", 10) });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "bad@test.com", password: "wrong" });

    expect(res.statusCode).toBe(401);
  });

  it("returns 401 for non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "pass" });

    expect(res.statusCode).toBe(401);
  });

  it("returns 422 for missing email field", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "pass123" });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 403 for inactive user", async () => {
    const db = getDb();
    createTestUser(db, {
      email:    "inactive@test.com",
      password: bcrypt.hashSync("pass123", 10),
      status:   "inactive",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "inactive@test.com", password: "pass123" });

    expect(res.statusCode).toBe(403);
  });
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
describe("GET /api/auth/me", () => {
  it("returns profile for authenticated user", async () => {
    const db = getDb();
    createTestUser(db, { email: "me@test.com", password: bcrypt.hashSync("pass123", 10) });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "me@test.com", password: "pass123" });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe("me@test.com");
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("returns 401 with a malformed token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not.a.real.token");

    expect(res.statusCode).toBe(401);
  });
});
