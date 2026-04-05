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

// All record routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/records
 * @desc    List records with filtering, search, sorting, and pagination
 * @access  Admin, Analyst, Viewer
 * @query   page, limit, type, category, startDate, endDate, search, sortBy, sortOrder
 */
router.get(
  "/",
  can("READ_RECORDS"),
  validateQuery(recordQuerySchema),
  controller.listRecords
);

/**
 * @route   GET /api/records/:id
 * @desc    Get a single financial record by ID
 * @access  Admin, Analyst, Viewer
 */
router.get("/:id", can("READ_RECORDS"), controller.getRecordById);

/**
 * @route   POST /api/records
 * @desc    Create a new financial record
 * @access  Admin only
 */
router.post(
  "/",
  can("CREATE_RECORD"),
  validate(createRecordSchema),
  controller.createRecord
);

/**
 * @route   PUT /api/records/:id
 * @desc    Update a financial record
 * @access  Admin only
 */
router.put(
  "/:id",
  can("UPDATE_RECORD"),
  validate(updateRecordSchema),
  controller.updateRecord
);

/**
 * @route   DELETE /api/records/:id
 * @desc    Soft-delete a financial record
 * @access  Admin only
 */
router.delete("/:id", can("DELETE_RECORD"), controller.deleteRecord);

module.exports = router;
