/**
 * tenantScope.js — Multi-SaaS Data Isolation Middleware
 *
 * Injects req.scopedOwnerId into every authenticated request so that
 * controllers always query data belonging to the correct SaaS tenant (owner).
 *
 * Case 1 — requester IS an owner: req.scopedOwnerId = req.user.id
 * Case 2 — requester is STAFF (manager/employee/tenant): req.scopedOwnerId = req.user.ownerId
 *
 * MUST BE USED AFTER: authenticate (requires req.user)
 */

export const tenantScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required before scoping tenant data.",
    });
  }

  if (req.user.role === "owner") {
    req.scopedOwnerId = req.user.id;
  } else if (req.user.ownerId) {
    req.scopedOwnerId = req.user.ownerId;
  } else {
    return res.status(403).json({
      success: false,
      message: "Account configuration error: missing owner association. Please contact support.",
    });
  }

  next();
};