import { useEffect, useState } from "react";
import {
  Receipt,
  RefreshCw,
  PlayCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { RentCharge } from "../../types/index";
import {
  CHARGE_STATUS_STYLES,
  CHARGE_STATUS_LABELS,
} from "../../lib/billingStyles";
import { cn, getErrorMessage } from "../../lib/utils";

export default function OwnerRentRoll() {
  const [charges, setCharges] = useState<RentCharge[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [waiveTarget, setWaiveTarget] = useState<RentCharge | null>(null);
  const [waiveNotes, setWaiveNotes] = useState("");
  const LIMIT = 20;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (filterStatus) params.status = filterStatus;
      const res = await api.get("/billing/rent-roll", { params });
      setCharges(res.data.data || []);
      setTotal(res.data.pagination?.total ?? 0);
    } catch {
      toast.error("Failed to load rent roll");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filterStatus]);

  // const handleRunCycle = async () => {
  //   setRunning(true);
  //   try {
  //     const res = await api.post("/billing/run-cycle");
  //     const { chargesCreated, lateFeesApplied } = res.data.data;
  //     toast.success(
  //       `${chargesCreated} charge(s) created, ${lateFeesApplied} late fee(s) applied`,
  //     );
  //     fetchData();
  //   } catch (err) {
  //     toast.error(getErrorMessage(err));
  //   } finally {
  //     setRunning(false);
  //   }
  // };

  const handleWaive = async () => {
    if (!waiveTarget) return;
    try {
      await api.patch(`/billing/charges/${waiveTarget.id}/waive`, {
        notes: waiveNotes,
      });
      toast.success("Charge waived");
      setWaiveTarget(null);
      setWaiveNotes("");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Rent Roll
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monthly rent charges across your portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-700 dark:text-gray-200"
          >
            <option value="">All Statuses</option>
            {Object.entries(CHARGE_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          {/* <button
            onClick={handleRunCycle}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
          >
            <PlayCircle size={18} />{" "}
            {running ? "Running..." : "Run Billing Cycle"}
          </button> */}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : charges.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Receipt className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No charges yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Click "Run Billing Cycle" to generate this month's charges for all
            active leases.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-left text-xs text-gray-400">
                  <th className="p-4 font-medium">Tenant</th>
                  <th className="p-4 font-medium">Building / Unit</th>
                  <th className="p-4 font-medium">Period</th>
                  <th className="p-4 font-medium">Due Date</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                  <th className="p-4 font-medium text-right">Paid</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {charges.map((c) => {
                  const totalDue =
                    Number(c.baseAmount) + Number(c.appliedLateFee);
                  return (
                    <tr
                      key={c.id}
                      className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="p-4 font-medium text-gray-900 dark:text-white">
                        {c.tenancy.tenant?.name}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {c.building.name} · {c.tenancy.unitNumber}
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(c.periodMonth).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(c.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right text-gray-800 dark:text-gray-200">
                        ${totalDue.toLocaleString()}
                        {Number(c.appliedLateFee) > 0 && (
                          <span className="text-xs text-red-500 block">
                            +${Number(c.appliedLateFee).toLocaleString()} late
                            fee
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right text-gray-500">
                        ${Number(c.amountPaid).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            CHARGE_STATUS_STYLES[c.status],
                          )}
                        >
                          {CHARGE_STATUS_LABELS[c.status]}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {c.status !== "paid" && c.status !== "waived" && (
                          <button
                            onClick={() => setWaiveTarget(c)}
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            Waive
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-400">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}{" "}
                of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300 px-2">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {waiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setWaiveTarget(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Waive This Charge?
              </h3>
              <button onClick={() => setWaiveTarget(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <textarea
              rows={3}
              value={waiveNotes}
              onChange={(e) => setWaiveNotes(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setWaiveTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleWaive}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium"
              >
                Waive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
