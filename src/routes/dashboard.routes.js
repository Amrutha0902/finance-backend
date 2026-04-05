const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/dashboard.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { can }          = require("../middlewares/authorize.middleware");

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/dashboard/summary
 * @desc    Total income, expenses, net balance, record count
 * @access  Admin, Analyst, Viewer
 */
router.get("/summary", can("VIEW_DASHBOARD"), controller.getSummary);

/**
 * @route   GET /api/dashboard/recent
 * @desc    Most recent N financial records
 * @access  Admin, Analyst, Viewer
 * @query   limit (default: 10, max: 50)
 */
router.get("/recent", can("VIEW_DASHBOARD"), controller.getRecentActivity);

/**
 * @route   GET /api/dashboard/categories
 * @desc    Income and expense totals grouped by category
 * @access  Admin, Analyst
 */
router.get("/categories", can("VIEW_INSIGHTS"), controller.getCategoryBreakdown);

/**
 * @route   GET /api/dashboard/trends/monthly
 * @desc    Monthly income/expense breakdown for a given year
 * @access  Admin, Analyst
 * @query   year (default: current year)
 */
router.get("/trends/monthly", can("VIEW_INSIGHTS"), controller.getMonthlyTrends);

/**
 * @route   GET /api/dashboard/trends/weekly
 * @desc    Weekly income/expense breakdown for current month
 * @access  Admin, Analyst
 */
router.get("/trends/weekly", can("VIEW_INSIGHTS"), controller.getWeeklyTrends);

module.exports = router;
