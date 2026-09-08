import { useEffect, useState } from 'react';
import { FileText, Calendar, DollarSign } from 'lucide-react';
import api from '../../lib/api';

export default function TenantLease() {
  const [tenancies, setTenancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const res = await api.get('/tenants/my-lease');
        setTenancies(res.data.data.tenancies || []);
      } catch (err) {
        console.error('Failed to load lease history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeases();
  }, []);

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
    <div className="p-6 space-y-4 dark:text-gray-100">
      <h1 className="text-2xl font-bold">Lease History</h1>
      {tenancies.map((lease) => (
        <div key={lease.id} className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
          <h3 className="font-semibold">{lease.building?.name} — Unit {lease.unitNumber}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} /> {lease.leaseStart} → {lease.leaseEnd || 'Ongoing'}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1"><DollarSign size={14} /> ${lease.monthlyRent}/month</p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            lease.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {lease.paymentStatus}
          </span>
        </div>
      ))}
    </div>
  );
}