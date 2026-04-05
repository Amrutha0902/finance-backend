const dashboardService = require("../services/dashboard.service");
const { success } = require("../utils/response");

function getSummary(req, res, next) {
  try {
    const data = dashboardService.getSummary();
    return success(res, data, "Dashboard summary retrieved.");
  } catch (err) {
    next(err);
  }
}

function getCategoryBreakdown(req, res, next) {
  try {
    const data = dashboardService.getCategoryBreakdown();
    return success(res, data, "Category breakdown retrieved.");
  } catch (err) {
    next(err);
  }
}

function getMonthlyTrends(req, res, next) {
  try {
    const year = req.query.year ? parseInt(req.query.year, 10) : null;
    const data = dashboardService.getMonthlyTrends(year);
    return success(res, data, "Monthly trends retrieved.");
  } catch (err) {
    next(err);
  }
}

function getWeeklyTrends(req, res, next) {
  try {
    const data = dashboardService.getWeeklyTrends();
    return success(res, data, "Weekly trends retrieved.");
  } catch (err) {
    next(err);
  }
}

function getRecentActivity(req, res, next) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const data  = dashboardService.getRecentActivity(limit);
    return success(res, data, "Recent activity retrieved.");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
};
