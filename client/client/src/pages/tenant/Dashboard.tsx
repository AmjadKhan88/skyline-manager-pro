import { useEffect, useState } from 'react';
import { Home, Calendar, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface LeaseData {
  unitNumber: string;
  buildingName: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  paymentStatus: 'paid' | 'unpaid' | 'overdue';
}

export default function TenantDashboard() {
  const [lease, setLease] = useState<LeaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLease = async () => {
      try {
        const res = await api.get('/tenants/my-lease');
        setLease(res.data.data || res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load lease details');
      } finally {
        setLoading(false);
      }
    };
    fetchLease();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const statusConfig = {
    paid: { color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2, text: 'Paid' },
    unpaid: { color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: AlertCircle, text: 'Unpaid' },
    overdue: { color: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: AlertCircle, text: 'Overdue' }
  };

  const status = lease?.paymentStatus || 'unpaid';
  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tenant Portal</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your lease and payments.</p>
      </div>

      {!lease ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
          <Home className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No active lease found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Please contact your property manager if you believe this is an error.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4">
              <Home className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h2 className="text-amber-100 font-medium mb-1">Current Unit</h2>
              <p className="text-4xl font-bold mb-4">Unit {lease.unitNumber}</p>
              <p className="text-xl font-medium mb-1">{lease.buildingName}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" /> Payment Status
            </h3>
            
            <div className={`p-4 rounded-xl border flex items-center gap-4 mb-6 ${statusConfig[status].color}`}>
              <StatusIcon className="w-8 h-8" />
              <div>
                <p className="font-semibold">{statusConfig[status].text}</p>
                <p className="text-sm opacity-80">Monthly Rent: ${lease.monthlyRent}</p>
              </div>
            </div>

            <button className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-medium transition-colors">
              Make a Payment
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" /> Lease Details
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Start Date</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {new Date(lease.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">End Date</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {new Date(lease.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Monthly Rent</p>
                <p className="font-medium text-slate-900 dark:text-white">${lease.monthlyRent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
