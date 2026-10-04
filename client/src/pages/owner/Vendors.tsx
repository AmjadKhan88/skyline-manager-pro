import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Hammer,
  Edit2,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Vendor } from "../../types/index";
import { CATEGORY_CONFIG } from "../../lib/maintenanceStyles";
import { cn, getErrorMessage } from "../../lib/utils";

const SPECIALTY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC" },
  { value: "appliance", label: "Appliance" },
  { value: "structural", label: "Structural" },
  { value: "pest-control", label: "Pest Control" },
];

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    specialty: "general",
    notes: "",
  });

  const fetchVendors = async () => {
    try {
      const res = await api.get("/vendors");
      setVendors(res.data.data.vendors || []);
    } catch {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      companyName: "",
      phone: "",
      email: "",
      specialty: "general",
      notes: "",
    });
    setModalOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setEditing(v);
    setForm({
      name: v.name,
      companyName: v.companyName || "",
      phone: v.phone || "",
      email: v.email || "",
      specialty: v.specialty,
      notes: v.notes || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/vendors/${editing.id}`, form);
        toast.success("Vendor updated");
      } else {
        await api.post("/vendors", form);
        toast.success("Vendor added");
      }
      setModalOpen(false);
      fetchVendors();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (v: Vendor) => {
    try {
      await api.put(`/vendors/${v.id}`, { isActive: !v.isActive });
      fetchVendors();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/vendors/${id}`);
      toast.success("Vendor removed");
      fetchVendors();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Vendors
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Outside contractors you can assign maintenance work to
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus size={18} /> Add Vendor
        </button>
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Hammer className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No vendors yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add a plumber, electrician, or general contractor to assign work
            orders to.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((v) => {
            const specialtyConfig =
              CATEGORY_CONFIG[
                v.specialty === "general" ? "other" : (v.specialty as any)
              ];
            const Icon = specialtyConfig?.icon || Hammer;
            return (
              <div
                key={v.id}
                className={cn(
                  "p-5 rounded-2xl bg-white dark:bg-gray-900 border",
                  v.isActive
                    ? "border-gray-200 dark:border-gray-800"
                    : "border-gray-200 dark:border-gray-800 opacity-50",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(v)}
                      className="p-1.5 text-gray-400 hover:text-emerald-600"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {v.name}
                </h3>
                {v.companyName && (
                  <p className="text-xs text-gray-400">{v.companyName}</p>
                )}
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {v.specialty.replace("-", " ")}
                </p>
                <div className="space-y-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {v.phone && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Phone size={12} /> {v.phone}
                    </p>
                  )}
                  {v.email && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Mail size={12} /> {v.email}
                    </p>
                  )}
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                  <input
                    type="checkbox"
                    checked={v.isActive}
                    onChange={() => handleToggleActive(v)}
                  />{" "}
                  Active
                </label>
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
                {editing ? "Edit" : "Add"} Vendor
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Company Name
                </label>
                <input
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Specialty
                </label>
                <select
                  value={form.specialty}
                  onChange={(e) =>
                    setForm({ ...form, specialty: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SPECIALTY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
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
                    : "Add Vendor"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
