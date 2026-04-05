const { error } = require("../utils/response");

/**
 * Middleware factory: validates req.body against a Zod schema.
 * Returns 422 with field-level errors on failure.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field:   e.path.join("."),
        message: e.message,
      }));
      return error(res, "Validation failed.", 422, errors);
    }

    req.body = result.data; // Use coerced/sanitised values
    next();
  };
}

/**
 * Middleware factory: validates req.query against a Zod schema.
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field:   e.path.join("."),
        message: e.message,
      }));
      return error(res, "Invalid query parameters.", 422, errors);
    }

    req.query = result.data;
    next();
  };
}

module.exports = { validate, validateQuery };
