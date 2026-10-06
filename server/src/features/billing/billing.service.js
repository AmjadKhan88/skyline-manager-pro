/**
 * features/billing/billing.service.js — Core rent-roll logic
 *
 * Two operations, both idempotent (safe to run multiple times a day without
 * creating duplicates or double-charging late fees):
 *   1. generateMissingCharges — creates this month's RentCharge for every
 *      active tenancy that doesn't have one yet (unique index on
 *      (tenancyId, periodMonth) is the real safety net here).
 *   2. applyLateFees — finds charges past their grace period that are still
 *      unpaid, and stamps on the configured late fee exactly once.
 */

import { Op } from "sequelize";
import { Tenancy, RentCharge } from "../../models/index.js";

const firstOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const generateMissingCharges = async () => {
  const period = firstOfMonth();
  const periodStr = period.toISOString().split("T")[0];

  const activeTenancies = await Tenancy.findAll({
    where: { status: "active" },
  });
  let created = 0;

  for (const t of activeTenancies) {
    const exists = await RentCharge.findOne({
      where: { tenancyId: t.id, periodMonth: periodStr },
    });
    if (exists) continue;

    const dueDay = Math.min(t.billingDueDay || 1, 28);
    const dueDate = new Date(period.getFullYear(), period.getMonth(), dueDay);

    await RentCharge.create({
      ownerId: t.ownerId,
      buildingId: t.buildingId,
      tenancyId: t.id,
      periodMonth: periodStr,
      dueDate: dueDate.toISOString().split("T")[0],
      baseAmount: t.monthlyRent,
      status: "pending",
    });
    created++;
  }

  return created;
};

export const applyLateFees = async () => {
  const today = new Date();
  const candidates = await RentCharge.findAll({
    where: { status: { [Op.in]: ["pending", "partial"] } },
    include: [{ model: Tenancy, as: "tenancy" }],
  });

  let updated = 0;
  for (const charge of candidates) {
    const grace = charge.tenancy.gracePeriodDays ?? 5;
    const cutoff = new Date(charge.dueDate);
    cutoff.setDate(cutoff.getDate() + grace);
    if (today <= cutoff) continue; // still within grace period

    const alreadyFeed = Number(charge.appliedLateFee) > 0;
    if (!alreadyFeed && charge.tenancy.lateFeeType !== "none") {
      const fee =
        charge.tenancy.lateFeeType === "percent"
          ? (Number(charge.baseAmount) * Number(charge.tenancy.lateFeeValue)) /
            100
          : Number(charge.tenancy.lateFeeValue);
      charge.appliedLateFee = fee;
    }

    charge.status = "overdue";
    await charge.save();
    updated++;
  }

  return updated;
};

/**
 * recomputeChargeStatus — call after any payment is applied to a charge.
 * Also syncs Tenancy.paymentStatus to match, so existing pages (Dashboard,
 * Tenants.tsx, Financial.tsx) that read the old single-field status keep
 * working unchanged.
 */
export const recomputeChargeStatus = async (chargeId) => {
  const charge = await RentCharge.findByPk(chargeId, {
    include: [{ model: Tenancy, as: "tenancy" }],
  });
  if (!charge) return;

  const totalDue = Number(charge.baseAmount) + Number(charge.appliedLateFee);
  if (Number(charge.amountPaid) >= totalDue) {
    charge.status = "paid";
    charge.paidAt = charge.paidAt || new Date();
  } else if (Number(charge.amountPaid) > 0) {
    charge.status = "partial";
  } else if (charge.status !== "waived") {
    const cutoff = new Date(charge.dueDate);
    cutoff.setDate(cutoff.getDate() + (charge.tenancy.gracePeriodDays ?? 5));
    charge.status = new Date() > cutoff ? "overdue" : "pending";
  }
  await charge.save();

  // Sync the legacy single-field status on Tenancy for backward compatibility
  const statusMap = {
    paid: "paid",
    partial: "partial",
    overdue: "overdue",
    pending: "unpaid",
    waived: "paid",
  };
  charge.tenancy.paymentStatus = statusMap[charge.status] || "unpaid";
  await charge.tenancy.save();
};
