const { PERMISSIONS } = require("../config/constants");
const { error }        = require("../utils/response");

/**
 * Middleware factory: restricts route to specific roles.
 * Usage: authorize('admin', 'analyst')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, "Authentication required.", 401);
    }

    if (!roles.includes(req.user.role)) {
      return error(
        res,
        `Access denied. Required role(s): ${roles.join(", ")}.`,
        403
      );
    }

    next();
  };
}

/**
 * Middleware factory: restricts route to users with a named permission.
 * Usage: can('CREATE_RECORD')
 */
function can(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, "Authentication required.", 401);
    }

    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles) {
      return error(res, `Unknown permission: ${permission}.`, 500);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return error(
        res,
        `You do not have permission to perform this action.`,
        403
      );
    }

    next();
  };
}

module.exports = { authorize, can };
