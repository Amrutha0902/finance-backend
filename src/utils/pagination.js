/**
 * Parses and validates pagination query params.
 * Defaults: page=1, limit=10, max limit=100
 */
function parsePagination(query) {
  let page  = parseInt(query.page,  10) || 1;
  let limit = parseInt(query.limit, 10) || 10;

  if (page  < 1)   page  = 1;
  if (limit < 1)   limit = 1;
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Builds pagination metadata for a response.
 */
function buildPaginationMeta(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

module.exports = { parsePagination, buildPaginationMeta };
