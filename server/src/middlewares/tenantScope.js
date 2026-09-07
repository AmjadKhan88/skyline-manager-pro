/**
 * tenantScope.js — Multi-SaaS Data Isolation Middleware
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  THIS IS THE MOST CRITICAL MIDDLEWARE FOR MULTI-SaaS SECURITY   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * PURPOSE:
 * Inject req.scopedOwnerId into every authenticated request so that
 * controllers always query data belonging to the correct SaaS tenant (owner).
 * This makes it IMPOSSIBLE for data from Owner A to appear in Owner B's responses.
 *
 * HOW IT WORKS:
 *
 * Case 1 — The requester IS an owner:
 *   req.user.role === 'owner'
 *   → req.scopedOwnerId = req.user.id
 *   (They query their own data using their own user ID as the owner key)
 *
 * Case 2 — The requester is STAFF (manager/employee/tenant):
 *   req.user.role === 'manager' | 'employee' | 'tenant'
 *   → req.scopedOwnerId = req.user.ownerId
 *   (They query their owner's data using the ownerId stored on their user record)
 *
 * EXAMPLE FLOW:
 *   Manager A1 (ownerId = "UUID-AAA") calls GET /api/v1/buildings
 *   → tenantScope sets req.scopedOwnerId = "UUID-AAA"
 *   → building.controller: Building.findAll({ where: { ownerId: "UUID-AAA" } })
 *   → Only Owner A's buildings returned. Owner B's buildings NEVER returned.
 *
 * USAGE:
 *   All protected routes use this middleware AFTER authenticate:
 *   router.get('/buildings', authenticate, tenantScope, authorize('owner','manager'), handler)
 *
 *   Controllers then use:
 *   const buildings = await Building.findAll({ where: { ownerId: req.scopedOwnerId } });
 *
 * MUST BE USED AFTER: authenticate (requires req.user)
 * MUST BE USED BEFORE: authorize (authorize doesn't need scopedOwnerId, but order matters for clarity)
 */

export const tenantScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required before scoping tenant data.",
    });
  }

  if (req.user.role === "owner") {
    // Owner is the root of their own SaaS tenant space
    req.scopedOwnerId = req.user.id;
  } else if (req.user.ownerId) {
    // Staff member — inherit their owner's ID for scoping all queries
    req.scopedOwnerId = req.user.ownerId;
  } else {
    // Should never happen: non-owner without an ownerId is a corrupted record
    return res.status(403).json({
      success: false,
      message: "Account configuration error: missing owner association. Please contact support.",
    });
  }

  next();
};
