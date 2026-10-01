/**
 * pages/owner/Financial.tsx — Financial Overview
 *
 * Real current-state revenue snapshot (no payments-ledger exists yet, so this
 * isn't a historical trend — see PROJECT_CONTEXT.md). Includes a working
 * "Mark Paid" action on the outstanding-balances list, reusing the same
 * endpoint Tenants.tsx uses for its payment-status toggle.
 */

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { FinancialData } from "../../types";
import { cn, getErrorMessage } from "../../lib/utils";

function SummaryCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          `bg-${accent}-50 dark:bg-${accent}-500/10`,
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5",
            `text-${accent}-600 dark:text-${accent}-400`,
          )}
        />
      </div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <p
        style={{ fontFamily: "var(--font-display)" }}
        className="text-2xl font-bold text-gray-900 dark:text-white mt-1"
      >
        ${value.toLocaleString()}
      </p>
    </div>
  );
}
// Tailwind v4 scanner needs these literal strings somewhere in source:
// bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400
// bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
// bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400

export default function Financial() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api
      .get("/owner/financial")
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Failed to load financial data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkPaid = async (tenancyId: string, tenantId: string) => {
    setPayingId(tenancyId);
    try {
      await api.patch(`/tenants/${tenantId}/payment`, {
        tenancyId,
        paymentStatus: "paid",
      });
      toast.success("Marked as paid");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!data || data.revenueByBuilding.length === 0) {
    return (
      <div className="text-center py-16 px-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <DollarSign className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
        <h3
          style={{ fontFamily: "var(--font-display)" }}
          className="text-lg font-bold text-gray-900 dark:text-white"
        >
          No financial data yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          This fills in once you have buildings with active tenants.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Financial Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Current month, across all active leases
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Expected Revenue"
          value={data.totals.expected}
          icon={DollarSign}
          accent="sky"
        />
        <SummaryCard
          title="Collected"
          value={data.totals.collected}
          icon={CheckCircle2}
          accent="emerald"
        />
        <SummaryCard
          title="Outstanding"
          value={data.totals.outstanding}
          icon={AlertCircle}
          accent="red"
        />
      </div>

      {/* Revenue by building */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3
          style={{ fontFamily: "var(--font-display)" }}
          className="font-bold text-gray-900 dark:text-white mb-1"
        >
          Revenue by Building
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
          Expected vs. collected, per building
        </p>
        <ResponsiveContainer
          width="100%"
          height={Math.max(220, data.revenueByBuilding.length * 48)}
        >
          <BarChart
            data={data.revenueByBuilding}
            layout="vertical"
            margin={{ left: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              className="text-gray-100 dark:text-gray-800"
              stroke="currentColor"
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "currentColor" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v / 1000}k`}
              className="text-gray-400"
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 12, fill: "currentColor" }}
              axisLine={false}
              tickLine={false}
              className="text-gray-400"
            />
            <Tooltip
              formatter={(v: number) => `$${v.toLocaleString()}`}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="expected"
              name="Expected"
              fill="#94a3b8"
              radius={[0, 4, 4, 0]}
              barSize={14}
            />
            <Bar
              dataKey="collected"
              name="Collected"
              fill="#10b981"
              radius={[0, 4, 4, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Outstanding balances */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 pb-4">
          <h3
            style={{ fontFamily: "var(--font-display)" }}
            className="font-bold text-gray-900 dark:text-white"
          >
            Outstanding Balances
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {data.outstanding.length} tenant
            {data.outstanding.length !== 1 ? "s" : ""} with unpaid rent
          </p>
        </div>
        {data.outstanding.length === 0 ? (
          <p className="text-sm text-gray-400 py-10 text-center">
            Everyone's paid up 🎉
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100 dark:border-gray-800 text-left text-xs text-gray-400 dark:text-gray-500">
                  <th className="font-medium px-6 py-2.5">Tenant</th>
                  <th className="font-medium px-6 py-2.5">Unit</th>
                  <th className="font-medium px-6 py-2.5">Amount</th>
                  <th className="font-medium px-6 py-2.5">Status</th>
                  <th className="font-medium px-6 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.outstanding.map((o) => (
                  <tr
                    key={o.tenancyId}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {o.tenantName}
                      </p>
                      <p className="text-xs text-gray-400">{o.tenantEmail}</p>
                    </td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                      {o.buildingName} · {o.unitNumber}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200">
                      ${Number(o.monthlyRent).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium uppercase",
                          o.paymentStatus === "overdue"
                            ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                            : o.paymentStatus === "partial"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
                        )}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleMarkPaid(o.tenancyId, o.tenantId)}
                        disabled={payingId === o.tenancyId}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 disabled:opacity-50"
                      >
                        {payingId === o.tenancyId ? "Saving..." : "Mark Paid"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
