/**
 * authorize.js — Role-Based Access Control (RBAC) Middleware Factory
 *
 * MUST BE USED AFTER authenticate middleware (requires req.user to be set).
 *
 * USAGE EXAMPLES:
 *   router.post('/buildings', authenticate, authorize('owner'), addBuilding);
 *   router.get('/buildings', authenticate, authorize('owner', 'manager'), getBuildings);
 */

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before authorization.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of these roles: [${roles.join(", ")}]. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};