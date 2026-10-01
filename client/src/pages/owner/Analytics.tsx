/**
 * pages/owner/Analytics.tsx — Portfolio Analytics
 *
 * Real derived data only — no fabricated history. There's no payments-ledger
 * or snapshot table yet, so this shows current-state composition rather than
 * trends over time. See PROJECT_CONTEXT.md pending list for the audit-log
 * table that would make real trend charts possible later.
 */

import { useEffect, useState } from "react";
import { BarChart3, Building2, RefreshCw } from "lucide-react";
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
import { AnalyticsData } from "../../types";
import { cn } from "../../lib/utils";

const TYPE_COLORS: Record<string, string> = {
  residential: "#0ea5e9",
  commercial: "#8b5cf6",
  industrial: "#64748b",
  "mixed-use": "#14b8a6",
  educational: "#eab308",
  healthcare: "#f43f5e",
};
const STATUS_COLORS: Record<string, string> = {
  operational: "#10b981",
  occupied: "#0ea5e9",
  completed: "#8b5cf6",
  planning: "#94a3b8",
  "under-construction": "#f59e0b",
  renovating: "#f97316",
};

function BreakdownBars({
  data,
  colors,
  labelFormat,
}: {
  data: { label: string; count: number }[];
  colors: Record<string, string>;
  labelFormat?: (s: string) => string;
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">No buildings yet</p>
    );
  }
  return (
    <div className="space-y-3.5">
      {data.map((d) => {
        const pct = Math.round((d.count / total) * 100);
        const color = colors[d.label] || "#94a3b8";
        return (
          <div key={d.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300 capitalize">
                {labelFormat ? labelFormat(d.label) : d.label}
              </span>
              <span className="text-gray-400 text-xs">
                {d.count} ({pct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/owner/analytics")
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!data || data.buildings.length === 0) {
    return (
      <div className="text-center py-16 px-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <BarChart3 className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
        <h3
          style={{ fontFamily: "var(--font-display)" }}
          className="text-lg font-bold text-gray-900 dark:text-white"
        >
          No data to analyze yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Analytics populate once you have buildings in your portfolio.
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
          Analytics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Portfolio composition, as of today
        </p>
      </div>

      {/* Breakdown bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3
            style={{ fontFamily: "var(--font-display)" }}
            className="font-bold text-gray-900 dark:text-white mb-5"
          >
            Buildings by Type
          </h3>
          <BreakdownBars
            data={data.buildingsByType.map((d) => ({
              label: d.type,
              count: d.count,
            }))}
            colors={TYPE_COLORS}
          />
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3
            style={{ fontFamily: "var(--font-display)" }}
            className="font-bold text-gray-900 dark:text-white mb-5"
          >
            Buildings by Status
          </h3>
          <BreakdownBars
            data={data.buildingsByStatus.map((d) => ({
              label: d.status,
              count: d.count,
            }))}
            colors={STATUS_COLORS}
            labelFormat={(s) => s.replace("-", " ")}
          />
        </div>
      </div>

      {/* Occupancy by building */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3
          style={{ fontFamily: "var(--font-display)" }}
          className="font-bold text-gray-900 dark:text-white mb-1"
        >
          Occupancy by Building
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
          Occupied vs. vacant units, per building
        </p>
        <ResponsiveContainer
          width="100%"
          height={Math.max(220, data.buildings.length * 44)}
        >
          <BarChart
            data={data.buildings}
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
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="occupied"
              stackId="units"
              name="Occupied"
              fill="#0ea5e9"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="vacant"
              stackId="units"
              name="Vacant"
              fill="#e2e8f0"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-building staff table */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 pb-4">
          <h3
            style={{ fontFamily: "var(--font-display)" }}
            className="font-bold text-gray-900 dark:text-white"
          >
            Staff Coverage by Building
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100 dark:border-gray-800 text-left text-xs text-gray-400 dark:text-gray-500">
                <th className="font-medium px-6 py-2.5">Building</th>
                <th className="font-medium px-6 py-2.5">Occupancy</th>
                <th className="font-medium px-6 py-2.5">Manager</th>
                <th className="font-medium px-6 py-2.5">Employees</th>
              </tr>
            </thead>
            <tbody>
              {data.buildings.map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {b.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${b.occupancyRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {b.occupancyRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        b.hasManager
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
                      )}
                    >
                      {b.hasManager ? "Assigned" : "Unassigned"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                    {b.employees}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
