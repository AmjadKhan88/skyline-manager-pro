import { useEffect, useState } from "react";
import { Wrench, RefreshCw, User as UserIcon } from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { MaintenanceRequest } from "../../types";
import {
  CATEGORY_CONFIG,
  PRIORITY_STYLES,
  STATUS_STYLES,
  STATUS_LABELS,
} from "../../lib/maintenanceStyles";
import { cn, getErrorMessage, timeAgo } from "../../lib/utils";

export default function ManagerMaintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [reqRes, empRes] = await Promise.all([
        api.get("/maintenance"),
        api.get("/staff", { params: { role: "employee", limit: 100 } }),
      ]);
      setRequests(reqRes.data.data || []);
      setEmployees(empRes.data.data || []);
    } catch {
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (id: string, assignedToId: string) => {
    if (!assignedToId) return;
    setBusyId(id);
    try {
      await api.patch(`/maintenance/${id}/assign`, { assignedToId });
      toast.success("Assigned");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setBusyId(id);
    try {
      await api.patch(`/maintenance/${id}/status`, { status });
      toast.success("Status updated");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Maintenance Requests
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {requests.length} request{requests.length !== 1 ? "s" : ""} in your
          building
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Wrench className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No requests yet
          </h3>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const CategoryIcon = CATEGORY_CONFIG[r.category].icon;
            return (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryIcon className="w-4 h-4 text-gray-400" />
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          PRIORITY_STYLES[r.priority],
                        )}
                      >
                        {r.priority}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          STATUS_STYLES[r.status],
                        )}
                      >
                        {STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {r.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Unit {r.unitNumber || "—"} · Reported by{" "}
                      {r.reportedBy?.name} · {timeAgo(r.createdAt)}
                    </p>
                    {r.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        {r.description}
                      </p>
                    )}
                  </div>
                  {r.photoUrl && (
                    <img
                      src={r.photoUrl}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <select
                      value={r.assignedTo?.id || ""}
                      onChange={(e) => handleAssign(r.id, e.target.value)}
                      disabled={busyId === r.id}
                      className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-gray-700 dark:text-gray-200"
                    >
                      <option value="">Assign to employee...</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    disabled={busyId === r.id}
                    className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-gray-700 dark:text-gray-200"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
