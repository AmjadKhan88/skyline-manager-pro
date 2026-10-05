import { useEffect, useState, useRef } from "react";
import {
  FileText,
  Calendar,
  DollarSign,
  PenLine,
  X,
  CheckCircle2,
} from "lucide-react";
import api from "../../lib/api";
import SignaturePad, {
  SignaturePadHandle,
} from "../../components/SignaturePad";
import { LeaseSignature } from "../../types/index";
import { getErrorMessage } from "../../lib/utils";
import { toast } from "react-hot-toast";

export default function TenantLease() {
  const [tenancies, setTenancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [signaturesByTenancy, setSignaturesByTenancy] = useState<
    Record<string, { signatures: LeaseSignature[]; isFullyExecuted: boolean }>
  >({});
  const [signModalTenancy, setSignModalTenancy] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const padRef = useRef<SignaturePadHandle>(null);

  const fetchSignatureStatus = async (tenancyIds: string[]) => {
    const results = await Promise.all(
      tenancyIds.map((id) =>
        api
          .get(`/signatures/tenancy/${id}`)
          .then((res) => [id, res.data.data] as const),
      ),
    );
    setSignaturesByTenancy(Object.fromEntries(results));
  };

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const res = await api.get("/tenants/my-lease");
        setTenancies(res.data.data.tenancies || []);
        fetchSignatureStatus(tenancies.map((t: any) => t.id));
      } catch (err) {
        console.error("Failed to load lease history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, []);

  const handleSign = async () => {
    if (!signModalTenancy || !agreed || !typedName.trim()) {
      toast.error("Please type your name and agree to the terms.");
      return;
    }
    const file = await padRef.current?.getSignatureFile();
    if (!file) {
      toast.error("Please draw your signature first.");
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
      toast.success("Lease signed");
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

  if (tenancies.length === 0) {
    return (
      <div className="p-6 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium">No lease records yet</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4 dark:text-gray-100">
      <h1
        style={{ fontFamily: "var(--font-display)" }}
        className="text-2xl font-bold"
      >
        Lease History
      </h1>
      {tenancies.map((lease) => (
        <div
          key={lease.id}
          className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm space-y-2"
        >
          <h3 className="font-semibold">
            {lease.building?.name} — Unit {lease.unitNumber}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar size={14} /> {lease.leaseStart} →{" "}
            {lease.leaseEnd || "Ongoing"}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <DollarSign size={14} /> ${lease.monthlyRent}/month
          </p>
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              lease.paymentStatus === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {lease.paymentStatus}
          </span>
          {(() => {
            const sigInfo = signaturesByTenancy[lease.id];
            const alreadySigned = sigInfo?.signatures.some(
              (s) => s.signerRole === "tenant",
            );
            return (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                {sigInfo?.isFullyExecuted ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Lease fully
                    executed
                  </p>
                ) : alreadySigned ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Signed — awaiting owner/manager countersignature
                  </p>
                ) : (
                  <button
                    onClick={() => setSignModalTenancy(lease.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700"
                  >
                    <PenLine className="w-3.5 h-3.5" /> Sign this lease
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      ))}

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
                Sign Your Lease
              </h2>
              <button onClick={() => setSignModalTenancy(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Full Legal Name
                </label>
                <input
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
              >
                {signing ? "Signing..." : "Sign Lease"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
