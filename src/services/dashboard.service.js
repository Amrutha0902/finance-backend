const { getDb } = require("../config/database");

/**
 * Returns top-level financial summary.
 */
function getSummary() {
  const db = getDb();

  const row = db
    .prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
        COUNT(*) AS total_records
      FROM financial_records
      WHERE deleted_at IS NULL
    `)
    .get();

  return {
    total_income:   row.total_income,
    total_expenses: row.total_expenses,
    net_balance:    row.total_income - row.total_expenses,
    total_records:  row.total_records,
  };
}

/**
 * Returns income and expense totals per category.
 */
function getCategoryBreakdown() {
  const db = getDb();

  const rows = db
    .prepare(`
      SELECT
        category,
        type,
        COALESCE(SUM(amount), 0) AS total,
        COUNT(*)                 AS count
      FROM financial_records
      WHERE deleted_at IS NULL
      GROUP BY category, type
      ORDER BY total DESC
    `)
    .all();

  // Group by category for a cleaner response
  const map = {};
  for (const row of rows) {
    if (!map[row.category]) {
      map[row.category] = { category: row.category, income: 0, expense: 0, total_transactions: 0 };
    }
    map[row.category][row.type] += row.total;
    map[row.category].total_transactions += row.count;
  }

  return Object.values(map).sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
}

/**
 * Returns monthly income/expense totals for the given year (default: current year).
 */
function getMonthlyTrends(year) {
  const db           = getDb();
  const targetYear   = year || new Date().getFullYear();

  const rows = db
    .prepare(`
      SELECT
        strftime('%m', date)                                               AS month,
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
      FROM financial_records
      WHERE deleted_at IS NULL
        AND strftime('%Y', date) = ?
      GROUP BY month
      ORDER BY month ASC
    `)
    .all(String(targetYear));

  // Fill in all 12 months even if no data
  const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  return MONTHS.map((name, i) => {
    const mm  = String(i + 1).padStart(2, "0");
    const row = rows.find((r) => r.month === mm);
    return {
      month:       name,
      month_num:   mm,
      income:   row ? row.income   : 0,
      expenses: row ? row.expenses : 0,
      net:      row ? row.income - row.expenses : 0,
    };
  });
}

/**
 * Returns weekly income/expense totals for the current month.
 */
function getWeeklyTrends() {
  const db    = getDb();
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const rows = db
    .prepare(`
      SELECT
        CAST((CAST(strftime('%d', date) AS INTEGER) - 1) / 7 + 1 AS TEXT) AS week,
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
      FROM financial_records
      WHERE deleted_at IS NULL
        AND strftime('%Y-%m', date) = ?
      GROUP BY week
      ORDER BY week ASC
    `)
    .all(`${year}-${month}`);

  return rows.map((r) => ({
    week:     `Week ${r.week}`,
    income:   r.income,
    expenses: r.expenses,
    net:      r.income - r.expenses,
  }));
}

/**
 * Returns the N most recent financial records.
 */
function getRecentActivity(limit = 10) {
  const db = getDb();

  return db
    .prepare(`
      SELECT r.*, u.name as created_by_name
      FROM financial_records r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.deleted_at IS NULL
      ORDER BY r.created_at DESC
      LIMIT ?
    `)
    .all(Math.min(limit, 50));
}

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
};
