import { useEffect, useState } from "react";
import { Plus, X, FolderOpen, Trash2, RefreshCw, Download } from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { AppDocument } from "../../types/index";
import { DOC_CATEGORY_CONFIG } from "../../lib/documentStyles";
import { useGlobal } from "../../context/GlobalContext";
import { getErrorMessage, timeAgo } from "../../lib/utils";

export default function ManagerDocuments() {
  const { user } = useGlobal();
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [linkToTenant, setLinkToTenant] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "inspection",
    tenancyId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, tenantRes] = await Promise.all([
        api.get("/documents"),
        api.get("/tenants", { params: { limit: 100 } }),
      ]);
      setDocuments(docRes.data.data || []);
      setTenants(tenantRes.data.data || []);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openUpload = () => {
    setForm({ title: "", category: "inspection", tenancyId: "" });
    setLinkToTenant(false);
    setFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a file");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("category", form.category);
      if (linkToTenant && form.tenancyId) {
        const tenant = tenants.find(
          (t) => t.tenancies?.[0]?.id === form.tenancyId,
        );
        fd.append("tenancyId", form.tenancyId);
        if (tenant) fd.append("subjectUserId", tenant.id);
      }
      fd.append("file", file);
      await api.post("/documents", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded");
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
      await api.delete(`/documents/${id}`);
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
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
            Documents
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            For your building and its tenants
          </p>
        </div>
        <button
          onClick={openUpload}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus size={18} /> Upload
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <FolderOpen className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No documents yet
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((d) => {
            const config = DOC_CATEGORY_CONFIG[d.category];
            const Icon = config.icon;
            const canDelete = d.uploadedBy.id === user?.id;
            return (
              <div
                key={d.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex gap-1">
                    <a
                      href={d.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <Download size={15} />
                    </a>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {d.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {config.label}
                  {d.subject ? ` · ${d.subject.name}` : ""}
                </p>
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {timeAgo(d.createdAt)}
                </p>
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
                Upload Document
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
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.entries(DOC_CATEGORY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={linkToTenant}
                  onChange={(e) => setLinkToTenant(e.target.checked)}
                />
                Link to a specific tenant's lease
              </label>
              {linkToTenant && (
                <select
                  value={form.tenancyId}
                  onChange={(e) =>
                    setForm({ ...form, tenancyId: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Tenant --</option>
                  {tenants
                    .filter((t) => t.tenancies?.[0])
                    .map((t) => (
                      <option key={t.id} value={t.tenancies[0].id}>
                        {t.name} — Unit {t.tenancies[0].unitNumber}
                      </option>
                    ))}
                </select>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  File * (PDF or image, max 10MB)
                </label>
                <input
                  required
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-500/10 dark:file:text-indigo-400"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
              >
                {submitting ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
