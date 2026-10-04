import { useEffect, useState } from "react";
import { ClipboardCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Inspection } from "../../types/index";
import { CONDITION_STYLES, CONDITION_LABELS } from "../../lib/inspectionStyles";
import { cn, getErrorMessage } from "../../lib/utils";

export default function TenantInspections() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.get("/inspections");
      setInspections(res.data.data || []);
    } catch {
      toast.error("Failed to load inspections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcknowledge = async (id: string) => {
    setBusyId(id);
    try {
      await api.patch(`/inspections/${id}/acknowledge`);
      toast.success("Acknowledged");
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
        <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Inspections
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Move-in and move-out condition records for your unit
        </p>
      </div>

      {inspections.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <ClipboardCheck className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No inspections recorded yet
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {inspections.map((insp) => (
            <div
              key={insp.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      insp.type === "move_in"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
                    )}
                  >
                    {insp.type === "move_in"
                      ? "Move-In Inspection"
                      : "Move-Out Inspection"}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(insp.inspectionDate).toLocaleDateString()} ·
                    Inspected by {insp.inspectedBy.name}
                  </p>
                </div>
                {insp.status !== "completed" ? (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    In Progress
                  </span>
                ) : insp.tenantAcknowledged ? (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(insp.id)}
                    disabled={busyId === insp.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
                  >
                    {busyId === insp.id ? "Saving..." : "Acknowledge"}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {insp.items.map((item, idx) => (
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
              {insp.generalNotes && (
                <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {insp.generalNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
