const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/user.controller");
const { authenticate }    = require("../middlewares/auth.middleware");
const { can }             = require("../middlewares/authorize.middleware");
const { validate }        = require("../middlewares/validate.middleware");
const { createUserSchema, updateUserSchema } = require("../validators/user.validator");

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    List all users (search, filter by role/status, paginated)
 * @access  Admin
 * @query   page, limit, search, role, status
 */
router.get("/", can("READ_USERS"), controller.listUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get a single user by ID
 * @access  Admin
 */
router.get("/:id", can("READ_USERS"), controller.getUserById);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Admin
 */
router.post("/", can("CREATE_USER"), validate(createUserSchema), controller.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user name, role, or status
 * @access  Admin
 */
router.put("/:id", can("UPDATE_USER"), validate(updateUserSchema), controller.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user (cannot delete self)
 * @access  Admin
 */
router.delete("/:id", can("DELETE_USER"), controller.deleteUser);

module.exports = router;
