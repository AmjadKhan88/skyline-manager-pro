import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  UsersRound,
  MapPin,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import api from "../../lib/api";
import { useGlobal } from "../../context/GlobalContext";
import { timeAgo } from "../../lib/utils";

interface ManagerDashboardData {
  building: {
    id: string;
    name: string;
    address: string;
    status: string;
    buildingType: string;
  } | null;
  employeesCount: number;
  tenantsCount: number;
  recentActivity: {
    id: string;
    unitNumber: string;
    createdAt: string;
    tenant: { id: string; name: string; email: string } | null;
  }[];
}

export default function ManagerDashboard() {
  const { user } = useGlobal();
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/manager/dashboard");
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to load manager dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {greeting}, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening at your building
        </p>
      </div>

      {!data?.building ? (
        <div className="text-center py-16 px-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Building2 className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3
            style={{ fontFamily: "var(--font-display)" }}
            className="text-lg font-bold text-gray-900 dark:text-white"
          >
            You're not assigned to a building yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Contact your property owner to get assigned to one.
          </p>
        </div>
      ) : (
        <>
          {/* My Building card */}
          <a
            href="/manager/building"
            className="group flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p
                  style={{ fontFamily: "var(--font-display)" }}
                  className="font-bold text-gray-900 dark:text-white"
                >
                  {data.building.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {data.building.address}
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-gray-400 transition-colors" />
          </a>

          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/manager/employees"
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                {data.employeesCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Employees
              </p>
            </a>
            <a
              href="/manager/tenants"
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-3">
                <UsersRound className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                {data.tenantsCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tenants
              </p>
            </a>
          </div>

          {/* Recent activity — real recent tenancies, not generic log entries */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <h3
              style={{ fontFamily: "var(--font-display)" }}
              className="font-bold text-gray-900 dark:text-white mb-4"
            >
              Recent Tenants
            </h3>
            {!data.recentActivity || data.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                No tenant activity yet
              </p>
            ) : (
              <div className="space-y-1">
                {data.recentActivity.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <div
                      style={{ fontFamily: "var(--font-display)" }}
                      className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-400 text-xs font-bold flex-shrink-0"
                    >
                      {(t.tenant?.name || "T").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {t.tenant?.name || "Unknown tenant"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Unit {t.unitNumber}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {timeAgo(t.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
