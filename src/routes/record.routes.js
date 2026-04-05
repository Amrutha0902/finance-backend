const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/record.controller");
const { authenticate }  = require("../middlewares/auth.middleware");
const { can }           = require("../middlewares/authorize.middleware");
const { validate, validateQuery } = require("../middlewares/validate.middleware");
const {
  createRecordSchema,
  updateRecordSchema,
  recordQuerySchema,
} = require("../validators/record.validator");

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial records — CRUD, filtering, search, and pagination
 */

router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List financial records
 *     description: >
 *       Returns a paginated list of active (non-deleted) financial records.
 *       Supports filtering, search, sorting, and date range queries.
 *       Available to **all roles**.
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Max 100
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *         description: Filter by transaction type
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Partial match on category name
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Free-text search in category and notes
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Filter records from this date (YYYY-MM-DD inclusive)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Filter records up to this date (YYYY-MM-DD inclusive)
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [date, amount, created_at], default: date }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Paginated list of records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Invalid query parameters
 */
router.get(
  "/",
  can("READ_RECORDS"),
  validateQuery(recordQuerySchema),
  controller.listRecords
);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a single financial record
 *     description: Returns a single record by UUID. Returns 404 if soft-deleted.
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Record UUID
 *     responses:
 *       200:
 *         description: Record retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Record not found or has been deleted
 */
router.get("/:id", can("READ_RECORDS"), controller.getRecordById);

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a financial record
 *     description: Creates a new income or expense record. **Admin only.**
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRecordRequest'
 *           examples:
 *             income:
 *               summary: Income record
 *               value:
 *                 amount: 5000
 *                 type: income
 *                 category: Salary
 *                 date: "2024-03-01"
 *                 notes: March salary payment
 *             expense:
 *               summary: Expense record
 *               value:
 *                 amount: 1200
 *                 type: expense
 *                 category: Rent
 *                 date: "2024-03-05"
 *                 notes: Monthly rent
 *     responses:
 *       201:
 *         description: Record created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Forbidden — Admin only
 *       422:
 *         description: Validation error
 */
router.post(
  "/",
  can("CREATE_RECORD"),
  validate(createRecordSchema),
  controller.createRecord
);

/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: Update a financial record
 *     description: Partial update — only include fields you want to change. **Admin only.**
 *     tags: [Records]
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
 *             $ref: '#/components/schemas/UpdateRecordRequest'
 *           example:
 *             amount: 5500
 *             category: Salary - Adjusted
 *             notes: Updated after correction
 *     responses:
 *       200:
 *         description: Record updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       422:
 *         description: Validation error
 */
router.put(
  "/:id",
  can("UPDATE_RECORD"),
  validate(updateRecordSchema),
  controller.updateRecord
);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft-delete a financial record
 *     description: >
 *       Marks the record as deleted (`deleted_at` is set). The record is excluded
 *       from all queries but preserved in the database for audit purposes. **Admin only.**
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Record deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 */
router.delete("/:id", can("DELETE_RECORD"), controller.deleteRecord);

module.exports = router;
