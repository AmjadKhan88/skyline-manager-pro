import { useEffect, useState } from "react";
import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X,
} from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { PaymentSubmission } from "../../types/index";
import { METHOD_CONFIG, STATUS_CONFIG } from "../../lib/paymentStyles";
import { cn, getErrorMessage, timeAgo } from "../../lib/utils";

export default function ManagerPayments() {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PaymentSubmission | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      const res = await api.get("/payments/submissions", { params });
      setSubmissions(res.data.data || []);
    } catch {
      toast.error("Failed to load payment submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      await api.patch(`/payments/submissions/${id}/review`, {
        status: "approved",
      });
      toast.success("Payment approved — tenant marked as paid");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setBusyId(rejectTarget.id);
    try {
      await api.patch(`/payments/submissions/${rejectTarget.id}/review`, {
        status: "rejected",
        reviewNotes: rejectReason,
      });
      toast.success("Payment rejected");
      setRejectTarget(null);
      setRejectReason("");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Payment Submissions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tenant-submitted rent payments for your building, awaiting review
          </p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-700 dark:text-gray-200"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <CreditCard className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No submissions here
          </h3>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const methodConfig = METHOD_CONFIG[s.method];
            const statusConfig = STATUS_CONFIG[s.status];
            const StatusIcon = statusConfig.icon;
            const MethodIcon = methodConfig.icon;
            return (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
                          statusConfig.badge,
                        )}
                      >
                        <StatusIcon className="w-3 h-3" /> {statusConfig.label}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MethodIcon className="w-3 h-3" /> {methodConfig.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {s.tenant.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {s.tenancy.building.name} · Unit {s.tenancy.unitNumber} ·
                      ${Number(s.amount).toLocaleString()}
                      {s.periodMonth &&
                        ` · for ${new Date(s.periodMonth).toLocaleDateString(undefined, { month: "long", year: "numeric" })}`}
                    </p>
                    {s.transactionReference && (
                      <p className="text-xs text-gray-400 mt-1">
                        Ref: {s.transactionReference}
                      </p>
                    )}
                    {s.reviewNotes && (
                      <p className="text-xs text-red-500 mt-1">
                        Note: {s.reviewNotes}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {timeAgo(s.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewImage(s.proofImageUrl)}
                    className="shrink-0 relative group"
                  >
                    <img
                      src={s.proofImageUrl}
                      alt="Proof"
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                  </button>
                </div>
                {s.status === "pending" && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleApprove(s.id)}
                      disabled={busyId === s.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} /> Approve
                    </button>
                    <button
                      onClick={() => setRejectTarget(s)}
                      disabled={busyId === s.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 text-red-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Proof"
            className="max-w-full max-h-full rounded-lg"
          />
          <button className="absolute top-4 right-4 text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setRejectTarget(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              Reject this payment?
            </h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (optional) — e.g. 'Amount doesn't match' or 'Screenshot unreadable'"
              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
