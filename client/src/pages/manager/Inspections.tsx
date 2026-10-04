import { useEffect, useState } from "react";
import {
  Plus,
  X,
  ClipboardCheck,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Inspection, InspectionItem, ItemCondition } from "../../types/index";
import { CONDITION_STYLES, CONDITION_LABELS } from "../../lib/inspectionStyles";
import { cn, getErrorMessage } from "../../lib/utils";

const QUICK_AREAS = [
  "Living Room",
  "Kitchen",
  "Bathroom",
  "Bedroom",
  "Hallway",
  "General",
];
const CONDITIONS: ItemCondition[] = [
  "excellent",
  "good",
  "fair",
  "poor",
  "damaged",
  "not_applicable",
];

export default function OwnerInspections() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState<Inspection | null>(null);
  const [editing, setEditing] = useState<Inspection | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    tenancyId: "",
    type: "move_in",
    inspectionDate: "",
    generalNotes: "",
    status: "draft",
  });
  const [items, setItems] = useState<InspectionItem[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insRes, tenantRes] = await Promise.all([
        api.get("/inspections"),
        api.get("/tenants", { params: { limit: 100 } }),
      ]);
      setInspections(insRes.data.data || []);
      setTenants(tenantRes.data.data || []);
    } catch {
      toast.error("Failed to load inspections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      tenancyId: "",
      type: "move_in",
      inspectionDate: new Date().toISOString().split("T")[0],
      generalNotes: "",
      status: "draft",
    });
    setItems([]);
    setModalOpen(true);
  };

  const openEdit = (insp: Inspection) => {
    setEditing(insp);
    setForm({
      tenancyId: insp.tenancyId,
      type: insp.type,
      inspectionDate: insp.inspectionDate,
      generalNotes: insp.generalNotes || "",
      status: insp.status,
    });
    setItems(insp.items || []);
    setModalOpen(true);
  };

  const addItem = (area = "") => {
    setItems([...items, { area, item: "", condition: "good", notes: "" }]);
  };

  const updateItem = (
    index: number,
    field: keyof InspectionItem,
    value: string,
  ) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, items };
      if (editing) {
        await api.put(`/inspections/${editing.id}`, payload);
        toast.success("Inspection updated");
      } else {
        await api.post("/inspections", payload);
        toast.success("Inspection created");
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
      await api.delete(`/inspections/${id}`);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Inspections
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Move-in and move-out condition checklists
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus size={18} /> New Inspection
        </button>
      </div>

      {inspections.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <ClipboardCheck className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No inspections recorded yet
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inspections.map((insp) => (
            <div
              key={insp.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between mb-2">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    insp.type === "move_in"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
                  )}
                >
                  {insp.type === "move_in" ? "Move-In" : "Move-Out"}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    insp.status === "completed"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                  )}
                >
                  {insp.status === "completed" ? "Completed" : "Draft"}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {insp.building.name} — Unit {insp.tenancy.unitNumber}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(insp.inspectionDate).toLocaleDateString()} ·{" "}
                {insp.items.length} item{insp.items.length !== 1 ? "s" : ""}{" "}
                recorded
              </p>
              {insp.tenantAcknowledged && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
                  <CheckCircle2 className="w-3 h-3" /> Acknowledged by tenant
                </p>
              )}
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setViewing(insp)}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View Details
                </button>
                <button
                  onClick={() => openEdit(insp)}
                  className="text-xs font-medium text-emerald-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(insp.id)}
                  className="text-xs font-medium text-red-600 hover:underline ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{ fontFamily: "var(--font-display)" }}
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                {editing ? "Edit" : "New"} Inspection
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Tenant / Unit *
                  </label>
                  <select
                    required
                    disabled={!!editing}
                    value={form.tenancyId}
                    onChange={(e) =>
                      setForm({ ...form, tenancyId: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  >
                    <option value="">-- Select --</option>
                    {tenants
                      .filter((t) => t.tenancies?.[0])
                      .map((t) => (
                        <option key={t.id} value={t.tenancies[0].id}>
                          {t.name} — Unit {t.tenancies[0].unitNumber}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="move_in">Move-In</option>
                    <option value="move_out">Move-Out</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Inspection Date *
                </label>
                <input
                  required
                  type="date"
                  value={form.inspectionDate}
                  onChange={(e) =>
                    setForm({ ...form, inspectionDate: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Items builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Checklist Items
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {QUICK_AREAS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => addItem(a)}
                        className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        + {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <input
                        value={item.area}
                        onChange={(e) =>
                          updateItem(idx, "area", e.target.value)
                        }
                        placeholder="Area"
                        className="col-span-3 p-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <input
                        value={item.item}
                        onChange={(e) =>
                          updateItem(idx, "item", e.target.value)
                        }
                        placeholder="Item (e.g. Flooring)"
                        className="col-span-4 p-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <select
                        value={item.condition}
                        onChange={(e) =>
                          updateItem(idx, "condition", e.target.value)
                        }
                        className="col-span-3 p-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {CONDITIONS.map((c) => (
                          <option key={c} value={c}>
                            {CONDITION_LABELS[c]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="col-span-2 text-red-500 text-xs justify-self-end"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No items yet — use the quick-add buttons above.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  General Notes
                </label>
                <textarea
                  rows={2}
                  value={form.generalNotes}
                  onChange={(e) =>
                    setForm({ ...form, generalNotes: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft (still in progress)</option>
                  <option value="completed">
                    Completed (tenant can now acknowledge)
                  </option>
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
                    : "Create Inspection"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewing(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{ fontFamily: "var(--font-display)" }}
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                {viewing.building.name} — Unit {viewing.tenancy.unitNumber}
              </h2>
              <button onClick={() => setViewing(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {viewing.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.area} — {item.item}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-400">{item.notes}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      CONDITION_STYLES[item.condition],
                    )}
                  >
                    {CONDITION_LABELS[item.condition]}
                  </span>
                </div>
              ))}
            </div>
            {viewing.generalNotes && (
              <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                {viewing.generalNotes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
