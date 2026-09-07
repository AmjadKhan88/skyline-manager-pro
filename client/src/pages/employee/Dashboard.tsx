import { useEffect, useState } from 'react';
import { User, Building2, MapPin, Briefcase } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedBuilding?: {
    name: string;
    address: string;
    type: string;
  };
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data || res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <User className="w-64 h-64 -mt-10 -mr-10" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
          <p className="text-blue-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Employee Portal
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-violet-500" /> My Profile
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
              <p className="font-medium text-slate-900 dark:text-white">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Email Address</p>
              <p className="font-medium text-slate-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Role</p>
              <span className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium mt-1">
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" /> Assigned Building
          </h2>
          {user?.assignedBuilding ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Building Name</p>
                <p className="font-medium text-slate-900 dark:text-white text-lg">{user.assignedBuilding.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> {user.assignedBuilding.address}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Type</p>
                <p className="font-medium text-slate-900 dark:text-white capitalize">{user.assignedBuilding.type}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">You are not currently assigned to any building.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
