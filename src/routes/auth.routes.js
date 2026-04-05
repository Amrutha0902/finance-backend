const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/auth.controller");
const { authenticate }     = require("../middlewares/auth.middleware");
const { validate }         = require("../middlewares/validate.middleware");
const { authLimiter }      = require("../middlewares/rateLimiter.middleware");
const { loginSchema }      = require("../validators/user.validator");

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
router.post("/login", authLimiter, validate(loginSchema), controller.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user's profile
 * @access  Private
 */
router.get("/me", authenticate, controller.getProfile);

module.exports = router;
