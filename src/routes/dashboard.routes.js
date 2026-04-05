const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/dashboard.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { can }          = require("../middlewares/authorize.middleware");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytics and summary endpoints for the finance dashboard
 */

router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get financial summary
 *     description: >
 *       Returns total income, total expenses, net balance, and total record count
 *       across all non-deleted records. Available to **all roles**.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DashboardSummary'
 *       401:
 *         description: Unauthorized
 */
router.get("/summary", can("VIEW_DASHBOARD"), controller.getSummary);

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Get recent activity
 *     description: Returns the most recently created financial records. Available to **all roles**.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Number of records to return (max 50)
 *     responses:
 *       200:
 *         description: Recent records retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 */
router.get("/recent", can("VIEW_DASHBOARD"), controller.getRecentActivity);

/**
 * @swagger
 * /api/dashboard/categories:
 *   get:
 *     summary: Get category breakdown
 *     description: >
 *       Returns income and expense totals grouped by category.
 *       Available to **Admin and Analyst** only.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CategoryItem'
 *       403:
 *         description: Forbidden — Viewer role cannot access insights
 */
router.get("/categories", can("VIEW_INSIGHTS"), controller.getCategoryBreakdown);

/**
 * @swagger
 * /api/dashboard/trends/monthly:
 *   get:
 *     summary: Get monthly trends
 *     description: >
 *       Returns income and expense totals for all 12 months of a given year.
 *       Months with no data return zeroes — always returns a complete 12-item array.
 *       Available to **Admin and Analyst** only.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer, example: 2024 }
 *         description: Year to analyse (defaults to current year)
 *     responses:
 *       200:
 *         description: Monthly trends retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MonthlyTrendItem'
 *       403:
 *         description: Forbidden — Viewer role cannot access insights
 */
router.get("/trends/monthly", can("VIEW_INSIGHTS"), controller.getMonthlyTrends);

/**
 * @swagger
 * /api/dashboard/trends/weekly:
 *   get:
 *     summary: Get weekly trends
 *     description: >
 *       Returns income and expense totals grouped by week for the current month.
 *       Available to **Admin and Analyst** only.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly trends retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WeeklyTrendItem'
 *       403:
 *         description: Forbidden
 */
router.get("/trends/weekly", can("VIEW_INSIGHTS"), controller.getWeeklyTrends);

module.exports = router;
