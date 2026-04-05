const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter — 100 requests per 15 minutes.
 * Bypassed in test environment to avoid 429 errors.
 */
const apiLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === "test") return next();
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })(req, res, next);
};

/**
 * Stricter limiter for auth endpoints — 10 requests per 15 minutes.
 * Bypassed in test environment to avoid 429 errors.
 */
const authLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === "test") return next();
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many login attempts. Please try again later.",
    },
  })(req, res, next);
};

module.exports = { apiLimiter, authLimiter };
