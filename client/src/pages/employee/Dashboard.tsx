import { useEffect, useState } from "react";
import { User, Building2, MapPin, Briefcase, RefreshCw } from "lucide-react";
import api from "../../lib/api";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  profile?: {
    jobTitle?: string;
    phone?: string;
    building?: {
      id: string;
      name: string;
      address: string;
      buildingType: string;
    } | null;
  };
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data.user); // real shape: { ...user, profile: { jobTitle, building: {...} } }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );
  }

  const building = user?.profile?.building;

  return (
    <div className="max-w-5xl">
      <div className="bg-linear-to-r from-violet-600 to-blue-600 rounded-3xl p-8 mb-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <User className="w-64 h-64 -mt-10 -mr-10" />
        </div>
        <div className="relative z-10">
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-3xl font-bold mb-2"
          >
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-blue-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />{" "}
            {user?.profile?.jobTitle || "Employee Portal"}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"
          >
            <User className="w-5 h-5 text-violet-500" /> My Profile
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Email Address
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
              <span className="inline-block px-3 py-1 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 rounded-full text-sm font-medium mt-1 capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"
          >
            <Building2 className="w-5 h-5 text-blue-500" /> Assigned Building
          </h2>
          {building ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Building Name
                </p>
                <p className="font-medium text-gray-900 dark:text-white text-lg">
                  {building.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Address
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />{" "}
                  {building.address}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {building.buildingType}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                You are not currently assigned to any building.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
