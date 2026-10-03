/**
 * features/owner/owner.controller.js — Owner Dashboard & Profile
 *
 * All endpoints here are scoped to the authenticated owner via req.scopedOwnerId.
 */

import {
  User,
  UserProfile,
  Building,
  Tenancy,
  OwnerProfile,
  Expense,
} from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import { Op, fn, col } from "sequelize";

// ─── GET DASHBOARD STATS ───────────────────────────────────────────────────────
export const getDashboard = asyncHandler(async (req, res) => {
  const ownerId = req.scopedOwnerId;

  const [
    totalBuildings,
    activeBuildings,
    totalManagers,
    activeManagers,
    totalEmployees,
    activeEmployees,
    totalTenants,
    activeTenants,
    totalTenancies,
    paidTenancies,
    unpaidTenancies,
    overdueTenancies,
  ] = await Promise.all([
    Building.count({ where: { ownerId } }),
    Building.count({ where: { ownerId, isActive: true } }),
    User.count({ where: { ownerId, role: "manager" } }),
    User.count({ where: { ownerId, role: "manager", status: "active" } }),
    User.count({ where: { ownerId, role: "employee" } }),
    User.count({ where: { ownerId, role: "employee", status: "active" } }),
    User.count({ where: { ownerId, role: "tenant" } }),
    User.count({ where: { ownerId, role: "tenant", status: "active" } }),
    Tenancy.count({ where: { ownerId, status: "active" } }),
    Tenancy.count({
      where: { ownerId, paymentStatus: "paid", status: "active" },
    }),
    Tenancy.count({
      where: { ownerId, paymentStatus: "unpaid", status: "active" },
    }),
    Tenancy.count({
      where: { ownerId, paymentStatus: "overdue", status: "active" },
    }),
  ]);

  const recentBuildings = await Building.findAll({
    where: { ownerId },
    order: [["createdAt", "DESC"]],
    limit: 5,
    attributes: [
      "id",
      "name",
      "address",
      "buildingType",
      "status",
      "units",
      "occupancy",
      "createdAt",
    ],
  });

  const recentStaff = await User.findAll({
    where: {
      ownerId,
      role: { [Op.in]: ["manager", "employee", "tenant"] },
    },
    order: [["createdAt", "DESC"]],
    limit: 5,
    attributes: ["id", "name", "email", "role", "status", "createdAt"],
    include: [
      {
        model: UserProfile,
        as: "profile",
        attributes: ["jobTitle", "buildingId"],
      },
    ],
  });

  const recentTenants = await User.findAll({
    where: { ownerId, role: "tenant" },
    order: [["createdAt", "DESC"]],
    limit: 5,
    attributes: ["id", "name", "email", "createdAt"],
    include: [
      {
        model: Tenancy,
        as: "tenancies",
        where: { ownerId },
        required: false,
        limit: 1,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Building,
            as: "building",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      },
    ],
  });

  // ── Revenue snapshot (current state, not a historical trend — see PROJECT_CONTEXT.md) ──
  const [expectedRevenue, collectedRevenue, overdueRevenue, totalUnits] =
    await Promise.all([
      Tenancy.sum("monthlyRent", { where: { ownerId, status: "active" } }),
      Tenancy.sum("monthlyRent", {
        where: { ownerId, status: "active", paymentStatus: "paid" },
      }),
      Tenancy.sum("monthlyRent", {
        where: { ownerId, status: "active", paymentStatus: "overdue" },
      }),
      Building.sum("units", { where: { ownerId } }),
    ]);

  const occupiedUnits = totalTenancies; // one active tenancy = one occupied unit
  const vacantUnits = Math.max((totalUnits || 0) - occupiedUnits, 0);
  const occupancyRate = totalUnits
    ? Math.round((occupiedUnits / totalUnits) * 100)
    : 0;

  return ApiResponse.success(res, 200, "Dashboard data fetched.", {
    stats: {
      buildings: { total: totalBuildings, active: activeBuildings },
      managers: { total: totalManagers, active: activeManagers },
      employees: { total: totalEmployees, active: activeEmployees },
      tenants: { total: totalTenants, active: activeTenants },
      tenancies: {
        total: totalTenancies,
        paid: paidTenancies,
        unpaid: unpaidTenancies,
        overdue: overdueTenancies,
      },
    },
    revenue: {
      expected: expectedRevenue || 0,
      collected: collectedRevenue || 0,
      overdue: overdueRevenue || 0,
    },
    occupancy: {
      totalUnits: totalUnits || 0,
      occupiedUnits,
      vacantUnits,
      occupancyRate,
    },
    recentBuildings,
    recentStaff,
    recentTenants,
  });
});

// ─── GET ANALYTICS (portfolio composition — no fabricated history) ────────────
export const getAnalytics = asyncHandler(async (req, res) => {
  const ownerId = req.scopedOwnerId;

  const [typeRows, statusRows, buildings] = await Promise.all([
    Building.findAll({
      where: { ownerId },
      attributes: ["buildingType", [fn("COUNT", col("id")), "count"]],
      group: ["buildingType"],
      raw: true,
    }),
    Building.findAll({
      where: { ownerId },
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      raw: true,
    }),
    Building.findAll({
      where: { ownerId },
      attributes: ["id", "name", "units", "managerId"],
      order: [["name", "ASC"]],
    }),
  ]);

  const buildingsByType = typeRows.map((r) => ({
    type: r.buildingType,
    count: parseInt(r.count),
  }));
  const buildingsByStatus = statusRows.map((r) => ({
    status: r.status,
    count: parseInt(r.count),
  }));

  // Per-building breakdown — small N per owner, so a query per building is fine here
  const buildingBreakdown = await Promise.all(
    buildings.map(async (b) => {
      const [occupied, employeeCount] = await Promise.all([
        Tenancy.count({
          where: { buildingId: b.id, ownerId, status: "active" },
        }),
        User.count({
          where: { ownerId, role: "employee" },
          include: [
            {
              model: UserProfile,
              as: "profile",
              where: { buildingId: b.id },
              required: true,
            },
          ],
        }),
      ]);
      const units = b.units || 0;
      return {
        id: b.id,
        name: b.name,
        units,
        occupied,
        vacant: Math.max(units - occupied, 0),
        occupancyRate: units ? Math.round((occupied / units) * 100) : 0,
        hasManager: !!b.managerId,
        employees: employeeCount,
      };
    }),
  );

  return ApiResponse.success(res, 200, "Analytics fetched.", {
    buildingsByType,
    buildingsByStatus,
    buildings: buildingBreakdown,
  });
});

// ─── GET OWNER PROFILE ────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
    include: [{ model: OwnerProfile, as: "ownerProfile" }],
  });

  return ApiResponse.success(res, 200, "Profile fetched.", { user });
});

// ─── UPDATE OWNER PROFILE ─────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, businessName, businessAddress, phone, taxId } = req.body;

  const user = await User.findByPk(req.user.id);
  if (name) user.name = name;
  await user.save();

  const [profile] = await OwnerProfile.upsert({
    userId: user.id,
    businessName: businessName ?? undefined,
    businessAddress: businessAddress ?? undefined,
    phone: phone ?? undefined,
    taxId: taxId ?? undefined,
  });

  user.password = undefined;
  return ApiResponse.success(res, 200, "Profile updated successfully.", {
    user,
    profile,
  });
});

// ─── GET FINANCIAL (current-state revenue + outstanding balances) ─────────────
export const getFinancial = asyncHandler(async (req, res) => {
  const ownerId = req.scopedOwnerId;

  const buildings = await Building.findAll({
    where: { ownerId },
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });

  const revenueByBuilding = await Promise.all(
    buildings.map(async (b) => {
      const [expected, collected] = await Promise.all([
        Tenancy.sum("monthlyRent", {
          where: { buildingId: b.id, ownerId, status: "active" },
        }),
        Tenancy.sum("monthlyRent", {
          where: {
            buildingId: b.id,
            ownerId,
            status: "active",
            paymentStatus: "paid",
          },
        }),
      ]);
      return {
        id: b.id,
        name: b.name,
        expected: expected || 0,
        collected: collected || 0,
        outstanding: (expected || 0) - (collected || 0),
      };
    }),
  );

  const outstandingTenancies = await Tenancy.findAll({
    where: {
      ownerId,
      status: "active",
      paymentStatus: { [Op.in]: ["unpaid", "overdue", "partial"] },
    },
    include: [
      { model: User, as: "tenant", attributes: ["id", "name", "email"] },
      { model: Building, as: "building", attributes: ["id", "name"] },
    ],
  });

  // Overdue first, then partial, then unpaid — sorted in JS to avoid a raw-SQL CASE expression
  const statusPriority = { overdue: 0, partial: 1, unpaid: 2 };
  const outstanding = outstandingTenancies
    .sort(
      (a, b) =>
        (statusPriority[a.paymentStatus] ?? 9) -
        (statusPriority[b.paymentStatus] ?? 9),
    )
    .map((t) => ({
      tenancyId: t.id,
      tenantId: t.tenantId,
      tenantName: t.tenant?.name,
      tenantEmail: t.tenant?.email,
      buildingName: t.building?.name,
      unitNumber: t.unitNumber,
      monthlyRent: t.monthlyRent,
      paymentStatus: t.paymentStatus,
      leaseStart: t.leaseStart,
    }));

  const expensesByBuilding = await Promise.all(
    buildings.map(async (b) => {
      const total = await Expense.sum("amount", {
        where: { buildingId: b.id, ownerId },
      });
      return { id: b.id, total: total || 0 };
    }),
  );

  // Merge expenses into the revenue-by-building array so the frontend gets one combined row per building
  const financialsByBuilding = revenueByBuilding.map((rb) => {
    const exp = expensesByBuilding.find((e) => e.id === rb.id)?.total || 0;
    return { ...rb, expenses: exp, netProfit: rb.collected - exp };
  });

  const totalExpenses = expensesByBuilding.reduce((sum, e) => sum + e.total, 0);

  const totals = revenueByBuilding.reduce(
    (acc, b) => ({
      expected: acc.expected + b.expected,
      collected: acc.collected + b.collected,
      outstanding: acc.outstanding + b.outstanding,
    }),
    { expected: 0, collected: 0, outstanding: 0 },
  );
  totals.expenses = totalExpenses;
  totals.netProfit = totals.collected - totalExpenses;

  return ApiResponse.success(res, 200, "Financial data fetched.", {
    revenueByBuilding: financialsByBuilding,
    outstanding,
    totals,
  });
});
