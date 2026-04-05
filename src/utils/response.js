/**
 * Sends a structured success response.
 */
function success(res, data = {}, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Sends a structured error response.
 */
function error(res, message = "An error occurred", statusCode = 500, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Sends a paginated success response.
 */
function paginated(res, data, pagination, message = "Success") {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
}

module.exports = { success, error, paginated };
