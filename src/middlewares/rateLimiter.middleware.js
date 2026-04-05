const rateLimit = require("express-rate-limit");

const isTest = process.env.NODE_ENV === "test";

// ✅ No-op middleware for tests
const bypassLimiter = (req, res, next) => next();

/**
 * General API rate limiter — 100 requests per 15 minutes.
 */
const apiLimiter = isTest
  ? bypassLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests. Please try again later.",
      },
    });

/**
 * Stricter limiter for auth endpoints — 10 requests per 15 minutes.
 */
const authLimiter = isTest
  ? bypassLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many login attempts. Please try again later.",
      },
    });

module.exports = { apiLimiter, authLimiter };