const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/auth.controller");
const { authenticate }  = require("../middlewares/auth.middleware");
const { validate }      = require("../middlewares/validate.middleware");
const { authLimiter }   = require("../middlewares/rateLimiter.middleware");
const { loginSchema, registerSchema } = require("../validators/user.validator");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication — register, login, and profile
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new account (public)
 *     description: >
 *       Creates a new user account with the **viewer** role by default.
 *       Admins can create accounts with any role via `POST /api/users`.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             name: Jane Viewer
 *             email: jane@example.com
 *             password: secure123
 *     responses:
 *       201:
 *         description: Account created successfully — returns token + user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", authLimiter, validate(registerSchema), controller.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     description: >
 *       Authenticates the user and returns a signed JWT valid for 24 hours.
 *       Use the token as `Bearer <token>` in the Authorization header.
 *       **Default admin credentials — admin@finance.com / admin123**
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             admin:
 *               summary: Default seeded admin
 *               value:
 *                 email: admin@finance.com
 *                 password: admin123
 *             custom:
 *               summary: Registered user
 *               value:
 *                 email: jane@example.com
 *                 password: secure123
 *     responses:
 *       200:
 *         description: Login successful — copy the token and click Authorize (top right)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Account is inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", authLimiter, validate(loginSchema), controller.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the profile of the currently authenticated user.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/me", authenticate, controller.getProfile);

module.exports = router;
