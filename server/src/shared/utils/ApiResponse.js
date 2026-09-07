/**
 * shared/utils/ApiResponse.js — Standardized API Response Helper
 *
 * Ensures every API response follows the same structure:
 * { success, message, data, pagination? }
 *
 * Usage in controllers:
 *   return ApiResponse.success(res, 200, 'Buildings fetched', { buildings });
 *   return ApiResponse.error(res, 404, 'Building not found');
 *   return ApiResponse.paginated(res, data, total, page, limit);
 */

const ApiResponse = {
  /**
   * success — Send a successful response
   * @param {object} res - Express response object
   * @param {number} statusCode - HTTP status (200, 201, etc.)
   * @param {string} message - Human-readable success message
   * @param {object} data - Response payload
   */
  success(res, statusCode = 200, message = "Success", data = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  /**
   * error — Send an error response
   * @param {object} res - Express response object
   * @param {number} statusCode - HTTP error status (400, 403, 404, 500, etc.)
   * @param {string} message - Human-readable error message
   * @param {object} errors - Optional validation errors or extra details
   */
  error(res, statusCode = 500, message = "An error occurred", errors = null) {
    const payload = { success: false, message };
    if (errors) payload.errors = errors;
    return res.status(statusCode).json(payload);
  },

  /**
   * paginated — Send a paginated list response
   * @param {object} res - Express response
   * @param {Array} data - The page of results
   * @param {number} total - Total number of records (for frontend pagination)
   * @param {number} page - Current page number (1-based)
   * @param {number} limit - Items per page
   * @param {string} message - Optional message
   */
  paginated(res, data, total, page, limit, message = "Fetched successfully") {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  },
};

export default ApiResponse;