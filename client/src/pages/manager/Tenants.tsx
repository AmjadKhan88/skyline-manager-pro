import { useEffect, useState } from 'react';
import { UserRound, Mail } from 'lucide-react';
import api from '../../lib/api';

export default function ManagerTenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await api.get('/tenants?limit=100');
        setTenants(res.data.data || []);
      } catch (err) {
        console.error('Failed to load tenants', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6 dark:text-gray-100">
      <div>
        <h1 className="text-2xl font-bold">Tenants</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tenants in your building</p>
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
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => {
                const tenancy = t.tenancies?.[0];
                return (
                  <tr key={t.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3 text-gray-500 flex items-center gap-1"><Mail size={14} />{t.email}</td>
                    <td className="p-3">{tenancy?.unitNumber || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tenancy?.paymentStatus === 'paid' ? 'bg-green-100 text-green-700'
                        : tenancy?.paymentStatus === 'overdue' ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tenancy?.paymentStatus || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}