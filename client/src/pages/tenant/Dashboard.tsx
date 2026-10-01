import { useEffect, useState } from "react";
import {
  Home,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface LeaseData {
  unitNumber: string;
  building: { id: string; name: string; address: string } | null;
  monthlyRent: number;
  leaseStart: string;
  leaseEnd: string | null;
  paymentStatus: "paid" | "unpaid" | "overdue" | "partial";
}

const statusConfig = {
  paid: {
    color:
      "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
    text: "Paid",
  },
  partial: {
    color:
      "text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    icon: Clock,
    text: "Partially Paid",
  },
  unpaid: {
    color:
      "text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    icon: AlertCircle,
    text: "Unpaid",
  },
  overdue: {
    color:
      "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    icon: AlertCircle,
    text: "Overdue",
  },
};

export default function TenantDashboard() {
  const [lease, setLease] = useState<LeaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLease = async () => {
      try {
        const res = await api.get("/tenants/my-lease");
        const tenancies = res.data.data.tenancies || [];
        setLease(tenancies.length > 0 ? tenancies[0] : null);
      } catch (err) {
        console.error("Failed to load lease", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLease();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  const status = statusConfig[lease?.paymentStatus || "unpaid"];
  const StatusIcon = status.icon;

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Tenant Portal
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your lease and payments
        </p>
      </div>

      {!lease ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-800">
          <Home className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3
            style={{ fontFamily: "var(--font-display)" }}
            className="text-lg font-bold text-gray-900 dark:text-white"
          >
            No active lease found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Contact your property manager if you believe this is an error.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4">
              <Home className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h2 className="text-amber-100 font-medium mb-1 text-sm">
                Current Unit
              </h2>
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-4xl font-bold mb-4"
              >
                Unit {lease.unitNumber}
              </p>
              <p className="text-lg font-medium">
                {lease.building?.name || "Building"}
              </p>
              {lease.building?.address && (
                <p className="text-amber-100 text-sm">
                  {lease.building.address}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <h3
              style={{ fontFamily: "var(--font-display)" }}
              className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
            >
              <CreditCard className="w-5 h-5 text-amber-500" /> Payment Status
            </h3>

            <div
              className={`p-4 rounded-xl border flex items-center gap-4 mb-6 ${status.color}`}
            >
              <StatusIcon className="w-8 h-8 shrink-0" />
              <div>
                <p className="font-semibold">{status.text}</p>
                <p className="text-sm opacity-80">
                  Monthly Rent: ${Number(lease.monthlyRent).toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                toast(
                  "Online payments aren't available yet — pay your property manager directly for now.",
                  { icon: "ℹ️" },
                )
              }
              className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium transition-colors"
            >
              Make a Payment
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 md:col-span-2">
            <h3
              style={{ fontFamily: "var(--font-display)" }}
              className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
            >
              <Calendar className="w-5 h-5 text-blue-500" /> Lease Details
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Start Date
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(lease.leaseStart).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  End Date
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {lease.leaseEnd
                    ? new Date(lease.leaseEnd).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Ongoing"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Monthly Rent
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  ${Number(lease.monthlyRent).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
