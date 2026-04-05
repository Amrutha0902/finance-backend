const ROLES = {
  ADMIN: "admin",
  ANALYST: "analyst",
  VIEWER: "viewer",
};

// Permissions per role
const PERMISSIONS = {
  // User management
  CREATE_USER:   [ROLES.ADMIN],
  READ_USERS:    [ROLES.ADMIN],
  UPDATE_USER:   [ROLES.ADMIN],
  DELETE_USER:   [ROLES.ADMIN],

  // Financial records
  CREATE_RECORD: [ROLES.ADMIN],
  READ_RECORDS:  [ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER],
  UPDATE_RECORD: [ROLES.ADMIN],
  DELETE_RECORD: [ROLES.ADMIN],

  // Dashboard & analytics
  VIEW_DASHBOARD: [ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER],
  VIEW_INSIGHTS:  [ROLES.ADMIN, ROLES.ANALYST],
};

const STATUS = {
  ACTIVE:   "active",
  INACTIVE: "inactive",
};

const RECORD_TYPES = {
  INCOME:  "income",
  EXPENSE: "expense",
};

module.exports = { ROLES, PERMISSIONS, STATUS, RECORD_TYPES };
