import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  Mail,
  PenLine,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../lib/utils";
import SignaturePad, {
  SignaturePadHandle,
} from "../../components/SignaturePad";
import { LeaseSignature } from "../../types/index";

export default function ManagerTenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [signaturesByTenancy, setSignaturesByTenancy] = useState<
    Record<string, { signatures: LeaseSignature[]; isFullyExecuted: boolean }>
  >({});
  const [signModalTenancy, setSignModalTenancy] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const padRef = useRef<SignaturePadHandle>(null);

  const fetchTenants = async () => {
    try {
      const res = await api.get("/tenants?limit=100");
      const data = res.data.data || [];
      setTenants(data);
      const tenancyIds = data
        .map((t: any) => t.tenancies?.[0]?.id)
        .filter(Boolean);
      fetchSignatureStatus(tenancyIds);
    } catch (err) {
      console.error("Failed to load tenants", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSignatureStatus = async (tenancyIds: string[]) => {
    const results = await Promise.all(
      tenancyIds.map((id) =>
        api
          .get(`/signatures/tenancy/${id}`)
          .then((res) => [id, res.data.data] as const),
      ),
    );
    setSignaturesByTenancy((prev) => ({
      ...prev,
      ...Object.fromEntries(results),
    }));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSign = async () => {
    if (!signModalTenancy || !agreed || !typedName.trim()) {
      toast.error("Please type your name and agree to the terms.");
      return;
    }
    const file = await padRef.current?.getSignatureFile();
    if (!file) {
      toast.error("Please draw a signature first.");
      return;
    }
    setSigning(true);
    try {
      const fd = new FormData();
      fd.append("tenancyId", signModalTenancy);
      fd.append("typedName", typedName);
      fd.append("agreed", "true");
      fd.append("signature", file);
      await api.post("/signatures", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Lease countersigned");
      setSignModalTenancy(null);
      setTypedName("");
      setAgreed(false);
      fetchSignatureStatus(Object.keys(signaturesByTenancy));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSigning(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 dark:text-gray-100">
      <div>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-2xl font-bold"
        >
          Tenants
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tenants in your building
        </p>
      </div>

      {tenants.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <UserRound className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No tenants yet</h3>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Signature</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => {
                const tenancy = t.tenancies?.[0];
                const sigInfo = tenancy
                  ? signaturesByTenancy[tenancy.id]
                  : undefined;
                const staffSigned = sigInfo?.signatures.some(
                  (s) => s.signerRole === "owner" || s.signerRole === "manager",
                );
                return (
                  <tr
                    key={t.id}
                    className="border-t border-gray-100 dark:border-gray-700"
                  >
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3 text-gray-500 flex items-center gap-1">
                      <Mail size={14} />
                      {t.email}
                    </td>
                    <td className="p-3">{tenancy?.unitNumber || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tenancy?.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : tenancy?.paymentStatus === "overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {tenancy?.paymentStatus || "—"}
                      </span>
                    </td>
                    <td className="p-3">
                      {!tenancy ? (
                        <span className="text-xs text-gray-400">No lease</span>
                      ) : sigInfo?.isFullyExecuted ? (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Executed
                        </span>
                      ) : staffSigned ? (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          Awaiting tenant
                        </span>
                      ) : (
                        <button
                          onClick={() => setSignModalTenancy(tenancy.id)}
                          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                        >
                          <PenLine className="w-3.5 h-3.5" /> Countersign
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {signModalTenancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSignModalTenancy(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{ fontFamily: "var(--font-display)" }}
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                Countersign Lease
              </h2>
              <button onClick={() => setSignModalTenancy(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Signature
                </label>
                <SignaturePad ref={padRef} />
              </div>
              <label className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5"
                />
                I confirm this is my legal signature and I agree to the terms of
                this lease.
              </label>
              <button
                onClick={handleSign}
                disabled={signing}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
              >
                {signing ? "Signing..." : "Countersign Lease"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
