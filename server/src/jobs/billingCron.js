/**
 * jobs/billingCron.js — Daily rent-roll maintenance
 *
 * Runs once a day: generates this month's charge for any active tenancy
 * that doesn't have one yet, then applies late fees to anything now past
 * its grace period. Both operations are idempotent — safe if the server
 * restarts mid-day or this runs more than once.
 */

import cron from "node-cron";
import {
  generateMissingCharges,
  applyLateFees,
} from "../features/billing/billing.service.js";

export const startBillingCron = () => {
  // Runs every day at 02:00 server time — low-traffic hours
  cron.schedule("0 2 * * *", async () => {
    try {
      const created = await generateMissingCharges();
      const feesApplied = await applyLateFees();
      console.log(
        `[billing-cron] ${created} charge(s) created, ${feesApplied} late fee(s) applied`,
      );
    } catch (err) {
      console.error("[billing-cron] failed:", err.message);
    }
  });

  console.log("✅ Billing cron scheduled (daily 02:00)");
};
