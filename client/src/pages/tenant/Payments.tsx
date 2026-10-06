import { useEffect, useState } from "react";
import {
  Plus,
  X,
  CreditCard,
  RefreshCw,
  Landmark,
  Copy,
  Check,
} from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import {
  PaymentAccount,
  PaymentSubmission,
  RentCharge,
} from "../../types/index";
import { METHOD_CONFIG, STATUS_CONFIG } from "../../lib/paymentStyles";
import { cn, getErrorMessage, timeAgo } from "../../lib/utils";

export default function TenantPayments() {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [lease, setLease] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1 = pick account, 2 = enter details + upload proof
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(
    null,
  );

  const [unpaidCharges, setUnpaidCharges] = useState<RentCharge[]>([]);
  const [selectedCharge, setSelectedCharge] = useState<RentCharge | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    amount: "",
    periodMonth: "",
    transactionReference: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, accRes, leaseRes] = await Promise.all([
        api.get("/payments/submissions"),
        api.get("/payments/accounts"),
        api.get("/tenants/my-lease"),
      ]);
      const chargesRes = await api.get("/billing/rent-roll", {
        params: { status: "pending" },
      });
      const overdueRes = await api.get("/billing/rent-roll", {
        params: { status: "overdue" },
      });
      setUnpaidCharges([
        ...(chargesRes.data.data || []),
        ...(overdueRes.data.data || []),
      ]);
      setSubmissions(subRes.data.data || []);
      setAccounts(accRes.data.data.accounts || []);
      const activeLease = leaseRes.data.data.tenancies?.[0] || null;
      setLease(activeLease);
      if (activeLease)
        setForm((f) => ({ ...f, amount: String(activeLease.monthlyRent) }));
    } catch {
      toast.error("Failed to load payment info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    setStep(1);
    setSelectedAccount(null);
    setProofFile(null);
    setForm({
      amount: lease ? String(lease.monthlyRent) : "",
      periodMonth: "",
      transactionReference: "",
    });
    setModalOpen(true);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lease) {
      toast.error("No active lease found.");
      return;
    }
    if (!selectedAccount) {
      toast.error("Please select a payment account.");
      return;
    }
    if (!proofFile) {
      toast.error("Please upload a screenshot of your payment.");
      return;
    }
    if (!selectedCharge) {
      toast.error("Please select which charge you are paying.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("tenancyId", lease.id);
      fd.append("paymentAccountId", selectedAccount.id);
      fd.append("amount", form.amount);
      fd.append("rentChargeId", selectedCharge.id);
      if (form.periodMonth) fd.append("periodMonth", form.periodMonth);
      if (form.transactionReference)
        fd.append("transactionReference", form.transactionReference);
      fd.append("proof", proofFile);

      await api.post("/payments/submissions", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        "Payment submitted — your owner/manager will review it shortly",
      );
      setModalOpen(false);
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
            Payments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Submit your rent payment and track its review status
          </p>
        </div>
        <button
          onClick={openModal}
          disabled={!lease || accounts.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
        >
          <Plus size={18} /> Submit Payment
        </button>
      </div>

      {!lease ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <CreditCard className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No active lease found
          </h3>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Landmark className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No payment methods set up yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Contact your property owner for payment instructions.
          </p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <CreditCard className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No payments submitted yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Click "Submit Payment" once you've transferred your rent.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const statusConfig = STATUS_CONFIG[s.status];
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-4"
              >
                <img
                  src={s.proofImageUrl}
                  alt="Proof"
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-gray-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
                        statusConfig.badge,
                      )}
                    >
                      <StatusIcon className="w-3 h-3" /> {statusConfig.label}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${Number(s.amount).toLocaleString()}
                  </p>
                  {s.reviewNotes && (
                    <p className="text-xs text-red-500 mt-0.5">
                      {s.reviewNotes}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {timeAgo(s.createdAt)}
                  </p>
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
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{ fontFamily: "var(--font-display)" }}
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                {step === 1
                  ? "Choose a Payment Method"
                  : "Confirm Your Payment"}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {step === 1 ? (
              <div className="space-y-3">
                {accounts.map((a) => {
                  const config = METHOD_CONFIG[a.method];
                  const Icon = config.icon;
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        setSelectedAccount(a);
                        setStep(2);
                      }}
                      className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {a.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {config.label}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Account details to transfer to */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-700 dark:text-amber-400">
                      Account Title
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedAccount?.accountTitle}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-700 dark:text-amber-400">
                      Account Number
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                        {selectedAccount?.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(selectedAccount!.accountNumber, "number")
                        }
                      >
                        {copiedField === "number" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  {selectedAccount?.bankName && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-700 dark:text-amber-400">
                        Bank
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedAccount.bankName}
                      </span>
                    </div>
                  )}
                  {selectedAccount?.iban && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-700 dark:text-amber-400">
                        IBAN
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {selectedAccount.iban}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(selectedAccount!.iban!, "iban")
                          }
                        >
                          {copiedField === "iban" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedAccount?.qrCodeUrl && (
                    <img
                      src={selectedAccount.qrCodeUrl}
                      alt="QR Code"
                      className="w-28 h-28 rounded-lg mx-auto mt-2"
                    />
                  )}
                  {selectedAccount?.instructions && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 pt-2 border-t border-amber-200 dark:border-amber-800">
                      {selectedAccount.instructions}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-400">
                  Transfer the amount above, then fill in the details below and
                  upload a screenshot of your confirmation.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Which charge are you paying? *
                    </label>
                    <select
                      required
                      value={selectedCharge?.id || ""}
                      onChange={(e) => {
                        const charge =
                          unpaidCharges.find((c) => c.id === e.target.value) ||
                          null;
                        setSelectedCharge(charge);
                        if (charge)
                          setForm({
                            ...form,
                            amount: String(
                              Number(charge.baseAmount) +
                                Number(charge.appliedLateFee) -
                                Number(charge.amountPaid),
                            ),
                          });
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- Select a charge --</option>
                      {unpaidCharges.map((c) => (
                        <option key={c.id} value={c.id}>
                          {new Date(c.periodMonth).toLocaleDateString(
                            undefined,
                            { month: "long", year: "numeric" },
                          )}{" "}
                          — $
                          {(
                            Number(c.baseAmount) +
                            Number(c.appliedLateFee) -
                            Number(c.amountPaid)
                          ).toLocaleString()}{" "}
                          due
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      For Month (optional)
                    </label>
                    <input
                      type="month"
                      value={form.periodMonth}
                      onChange={(e) =>
                        setForm({ ...form, periodMonth: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Transaction Reference (optional)
                    </label>
                    <input
                      value={form.transactionReference}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          transactionReference: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="TrxID, slip number, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Payment Screenshot *
                    </label>
                    <input
                      required
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setProofFile(e.target.files?.[0] || null)
                      }
                      className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-amber-50 file:text-amber-700 dark:file:bg-amber-500/10 dark:file:text-amber-400"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium disabled:opacity-60"
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
