const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/user.controller");
const { authenticate }    = require("../middlewares/auth.middleware");
const { can }             = require("../middlewares/authorize.middleware");
const { validate }        = require("../middlewares/validate.middleware");
const { createUserSchema, updateUserSchema } = require("../validators/user.validator");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management — Admin only
 */

router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     description: Returns a paginated, searchable list of all users. **Admin only.**
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Items per page (max 100)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name or email
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [admin, analyst, viewer] }
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin role required
 */
router.get("/", can("READ_USERS"), controller.listUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden
 */
router.get("/:id", can("READ_USERS"), controller.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Admin creates a user with any role. For self-registration use `POST /api/auth/register`.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *           example:
 *             name: Jane Analyst
 *             email: jane@company.com
 *             password: securepass
 *             role: analyst
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       409:
 *         description: Email already exists
 *       422:
 *         description: Validation error
 */
router.post("/", can("CREATE_USER"), validate(createUserSchema), controller.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user's name, role, or status
 *     description: All fields are optional — send only what you want to change.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           example:
 *             role: viewer
 *             status: inactive
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation error
 */
router.put("/:id", can("UPDATE_USER"), validate(updateUserSchema), controller.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Permanently deletes a user. Admins cannot delete their own account.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */
router.delete("/:id", can("DELETE_USER"), controller.deleteUser);

module.exports = router;
