import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Wallet,
  Edit2,
  Trash2,
  RefreshCw,
  QrCode,
} from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { PaymentAccount } from "../../types/index";
import { METHOD_CONFIG } from "../../lib/paymentStyles";
import { cn, getErrorMessage } from "../../lib/utils";

export default function PaymentAccounts() {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentAccount | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    method: "bank_transfer",
    label: "",
    accountTitle: "",
    accountNumber: "",
    bankName: "",
    iban: "",
    instructions: "",
  });

  const fetchAccounts = async () => {
    try {
      const res = await api.get("/payments/accounts");
      setAccounts(res.data.data.accounts || []);
    } catch {
      toast.error("Failed to load payment accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      method: "bank_transfer",
      label: "",
      accountTitle: "",
      accountNumber: "",
      bankName: "",
      iban: "",
      instructions: "",
    });
    setQrFile(null);
    setModalOpen(true);
  };

  const openEdit = (a: PaymentAccount) => {
    setEditing(a);
    setForm({
      method: a.method,
      label: a.label,
      accountTitle: a.accountTitle,
      accountNumber: a.accountNumber,
      bankName: a.bankName || "",
      iban: a.iban || "",
      instructions: a.instructions || "",
    });
    setQrFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (qrFile) fd.append("qrCode", qrFile);

      if (editing) {
        await api.put(`/payments/accounts/${editing.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Account updated");
      } else {
        await api.post("/payments/accounts", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Payment account added");
      }
      setModalOpen(false);
      fetchAccounts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (a: PaymentAccount) => {
    try {
      await api.put(`/payments/accounts/${a.id}`, { isActive: !a.isActive });
      fetchAccounts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/payments/accounts/${id}`);
      toast.success("Deleted");
      fetchAccounts();
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
            Payment Accounts
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Where tenants send rent — shown to them when they submit a payment
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus size={18} /> Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Wallet className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No payment accounts yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add a bank account or JazzCash/EasyPaisa number so tenants can pay
            you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((a) => {
            const config = METHOD_CONFIG[a.method];
            const Icon = config.icon;
            return (
              <div
                key={a.id}
                className={cn(
                  "p-5 rounded-2xl bg-white dark:bg-gray-900 border",
                  a.isActive
                    ? "border-gray-200 dark:border-gray-800"
                    : "border-gray-200 dark:border-gray-800 opacity-50",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {a.label}
                      </p>
                      <p className="text-xs text-gray-400">{config.label}</p>
                    </div>
                  </div>
                  {a.qrCodeUrl && (
                    <img
                      src={a.qrCodeUrl}
                      alt="QR"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="text-gray-400">Title:</span>{" "}
                    {a.accountTitle}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="text-gray-400">Number:</span>{" "}
                    {a.accountNumber}
                  </p>
                  {a.bankName && (
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="text-gray-400">Bank:</span> {a.bankName}
                    </p>
                  )}
                  {a.iban && (
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="text-gray-400">IBAN:</span> {a.iban}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <label className="flex items-center gap-2 text-xs text-gray-500">
                    <input
                      type="checkbox"
                      checked={a.isActive}
                      onChange={() => handleToggleActive(a)}
                    />{" "}
                    Active
                  </label>
                  <div className="flex gap-1.5">
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
                {editing ? "Edit" : "Add"} Payment Account
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Method *
                </label>
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(METHOD_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Label *
                </label>
                <input
                  required
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Main HBL Account"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Account Title *
                </label>
                <input
                  required
                  value={form.accountTitle}
                  onChange={(e) =>
                    setForm({ ...form, accountTitle: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Account / Mobile Number *
                </label>
                <input
                  required
                  value={form.accountNumber}
                  onChange={(e) =>
                    setForm({ ...form, accountNumber: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {form.method === "bank_transfer" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Bank Name
                    </label>
                    <input
                      value={form.bankName}
                      onChange={(e) =>
                        setForm({ ...form, bankName: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="HBL, UBL, Meezan..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      IBAN
                    </label>
                    <input
                      value={form.iban}
                      onChange={(e) =>
                        setForm({ ...form, iban: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <QrCode size={14} /> QR Code (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-500/10 dark:file:text-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Instructions (optional)
                </label>
                <textarea
                  rows={2}
                  value={form.instructions}
                  onChange={(e) =>
                    setForm({ ...form, instructions: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Please include your unit number in the transfer note"
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
                    : "Add Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
