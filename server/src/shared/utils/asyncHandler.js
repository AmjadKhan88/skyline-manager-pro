/**
 * shared/utils/asyncHandler.js — Controller Error Wrapper
 *
 * Eliminates the try/catch boilerplate from every controller function.
 * Catches any thrown error and forwards it to Express's error handler
 * (errorHandler.js) via next(error).
 *
 * BEFORE asyncHandler (verbose):
 *   export const getBuildings = async (req, res) => {
 *     try {
 *       const data = await Building.findAll(...);
 *       res.json(data);
 *     } catch (error) {
 *       res.status(500).json({ error: error.message });
 *     }
 *   };
 *
 * AFTER asyncHandler (clean):
 *   export const getBuildings = asyncHandler(async (req, res) => {
 *     const data = await Building.findAll(...);
 *     res.json(data);
 *   });
 *
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware with automatic error forwarding
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;