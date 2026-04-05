require("dotenv").config();

const express      = require("express");
const morgan       = require("morgan");
const helmet       = require("helmet");
const swaggerUi    = require("swagger-ui-express");
const swaggerSpec  = require("./config/swagger");

const routes                           = require("./routes");
const { notFound, globalErrorHandler } = require("./middlewares/error.middleware");
const { apiLimiter }                   = require("./middlewares/rateLimiter.middleware");

const app = express();

// ── Security headers (Helmet) ────────────────────────────────────────────────
// Sets X-Content-Type-Options, X-Frame-Options, HSTS, and 11 other headers.
// contentSecurityPolicy is relaxed so Swagger UI loads its inline scripts/styles.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", "'unsafe-inline'", "unpkg.com"],
        styleSrc:    ["'self'", "'unsafe-inline'", "unpkg.com"],
        imgSrc:      ["'self'", "data:", "unpkg.com"],
        connectSrc:  ["'self'"],
        workerSrc:   ["blob:"],
      },
    },
  })
);

// ── Core middleware ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Swagger UI — available at /api-docs ─────────────────────────────────────
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Finance Backend API",
    swaggerOptions: {
      persistAuthorization: true,   // token survives page refresh
      displayRequestDuration: true, // shows how long each request took
      defaultModelsExpandDepth: 1,
      docExpansion: "list",         // start with endpoints collapsed
    },
  })
);

// Raw OpenAPI JSON — useful for importing into Postman, Insomnia, etc.
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// ── Rate limiting ────────────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    success:     true,
    message:     "Finance Backend is running.",
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    docs:        "/api-docs",
  });
});

// ── API routes ───────────────────────────────────────────────────────────────
app.use("/api", routes);

// ── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
