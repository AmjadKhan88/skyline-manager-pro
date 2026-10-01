import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Megaphone,
  Trash2,
  Edit2,
  RefreshCw,
  Building2,
} from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Announcement } from "../../types";
import { PRIORITY_CONFIG } from "../../lib/announcementStyles";
import { useGlobal } from "../../context/GlobalContext";
import { cn, getErrorMessage, timeAgo } from "../../lib/utils";

export default function ManagerAnnouncements() {
  const { user } = useGlobal();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", priority: "info" });

  const fetchData = async () => {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data.data || []);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", body: "", priority: "info" });
    setModalOpen(true);
  };
  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({ title: a.title, body: a.body, priority: a.priority });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/announcements/${editing.id}`, form);
        toast.success("Announcement updated");
      } else {
        await api.post("/announcements", form); // buildingId forced server-side to the manager's own building
        toast.success("Announcement posted");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Announcements
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Portfolio-wide updates, plus anything for your building
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus size={18} /> Post
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Megaphone className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No announcements yet
          </h3>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const config = PRIORITY_CONFIG[a.priority];
            const Icon = config.icon;
            const isMine = a.author?.id === user?.id;
            return (
              <div
                key={a.id}
                className={cn(
                  "p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4",
                  config.border,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
                          config.badge,
                        )}
                      >
                        <Icon className="w-3 h-3" /> {config.label}
                      </span>
                      {!a.buildingId && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> All Buildings
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {a.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                      {a.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {a.author?.name} · {timeAgo(a.createdAt)}
                    </p>
                  </div>
                  {isMine && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => openEdit(a)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
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
                {editing ? "Edit Announcement" : "Post to Your Building"}
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
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
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
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Post Announcement"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
