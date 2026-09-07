/**
 * authorize.js — Role-Based Access Control (RBAC) Middleware Factory
 *
 * This middleware factory takes one or more allowed roles and returns
 * an Express middleware that enforces role-based access on a route.
 *
 * MUST BE USED AFTER authenticate middleware (requires req.user to be set).
 *
 * USAGE EXAMPLES:
 *   // Only owners can access this route
 *   router.post('/buildings', authenticate, authorize('owner'), addBuilding);
 *
 *   // Both owners and managers can view buildings
 *   router.get('/buildings', authenticate, authorize('owner', 'manager'), getBuildings);
 *
 *   // Any authenticated user can access (e.g. profile endpoint)
 *   router.get('/me', authenticate, authorize('owner','manager','employee','tenant'), getMe);
 *
 * HOW IT WORKS:
 * 1. Receives ...roles as spread arguments (e.g. 'owner', 'manager')
 * 2. Returns a middleware function
 * 3. That middleware checks req.user.role against the allowed roles array
 * 4. If the role is in the list → next()
 * 5. If not → 403 Forbidden
 *
 * This replaces ALL the inline role checks scattered across controllers like:
 *   if (req.auth.role !== 'owner') return res.status(403)...
 */

export const authorize = (...roles) => {
  return (req, res, next) => {
    // authenticate must run first — this middleware depends on req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before authorization.",
      });
    }

    // Check if the user's role is in the list of allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of these roles: [${roles.join(", ")}]. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};
