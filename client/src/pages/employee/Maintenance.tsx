import { useEffect, useState } from "react";
import { Plus, X, Wrench, RefreshCw } from "lucide-react";
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

export default function EmployeeMaintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    priority: "medium",
    unitNumber: "",
  });

  const fetchData = async () => {
    try {
      const [meRes, reqRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/maintenance"),
      ]);
      setBuildingId(meRes.data.data.user.profile?.buildingId || null);
      setRequests(reqRes.data.data || []);
    } catch {
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingId) {
      toast.error("No building assigned — cannot report an issue.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/maintenance", { ...form, buildingId });
      toast.success("Request submitted");
      setModalOpen(false);
      setForm({
        title: "",
        description: "",
        category: "other",
        priority: "medium",
        unitNumber: "",
      });
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Maintenance
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Requests in your building, and anything assigned to you
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          disabled={!buildingId}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
        >
          <Plus size={18} /> Report Issue
        </button>
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
            const isMine = !!r.assignedTo;
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
                      {isMine && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                          Assigned to you
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {r.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Unit {r.unitNumber || "—"} · {timeAgo(r.createdAt)}
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
                {isMine && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{ fontFamily: "var(--font-display)" }}
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                Report an Issue
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Title *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Unit Number
                </label>
                <input
                  value={form.unitNumber}
                  onChange={(e) =>
                    setForm({ ...form, unitNumber: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Common area, Apt 2B, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
