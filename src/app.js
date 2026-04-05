require("dotenv").config();

const express  = require("express");
const morgan   = require("morgan");

const routes                            = require("./routes");
const { notFound, globalErrorHandler }  = require("./middlewares/error.middleware");
const { apiLimiter }                    = require("./middlewares/rateLimiter.middleware");

const app = express();

// ── Core middleware ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Rate limiting ───────────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Finance Backend is running.",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ── API routes ──────────────────────────────────────────────────────────────
app.use("/api", routes);

// ── Error handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
