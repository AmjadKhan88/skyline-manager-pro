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

export default function TenantMaintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    priority: "medium",
    unitNumber: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      const [leaseRes, reqRes] = await Promise.all([
        api.get("/tenants/my-lease"),
        api.get("/maintenance"),
      ]);
      const lease = leaseRes.data.data.tenancies?.[0];
      if (lease) {
        setBuildingId(lease.buildingId);
        setForm((f) => ({ ...f, unitNumber: lease.unitNumber || "" }));
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingId) {
      toast.error("No active lease found — cannot submit a request.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries({ ...form, buildingId }).forEach(([k, v]) =>
        fd.append(k, v),
      );
      if (photo) fd.append("photo", photo);
      await api.post("/maintenance", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Request submitted");
      setModalOpen(false);
      setForm({
        title: "",
        description: "",
        category: "other",
        priority: "medium",
        unitNumber: form.unitNumber,
      });
      setPhoto(null);
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
        <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
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
            Maintenance Requests
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Report an issue in your unit
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          disabled={!buildingId}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
        >
          <Plus size={18} /> New Request
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Wrench className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No requests yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Report an issue and it'll show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((r) => {
            const CategoryIcon = CATEGORY_CONFIG[r.category].icon;
            return (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {CATEGORY_CONFIG[r.category].label}
                    </span>
                  </div>
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
                {r.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {r.description}
                  </p>
                )}
                {r.photoUrl && (
                  <img
                    src={r.photoUrl}
                    alt=""
                    className="mt-3 rounded-lg w-full h-32 object-cover"
                  />
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      PRIORITY_STYLES[r.priority],
                    )}
                  >
                    {r.priority}
                  </span>
                  <span className="text-xs text-gray-400">
                    {timeAgo(r.createdAt)}
                  </span>
                </div>
                {r.status === "resolved" && r.resolutionNotes && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-lg">
                    ✓ {r.resolutionNotes}
                  </p>
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
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Leaking kitchen faucet"
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
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
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
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Photo (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-amber-50 file:text-amber-700 dark:file:bg-amber-500/10 dark:file:text-amber-400"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
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
