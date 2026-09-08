import { useEffect, useState } from 'react';
import { Building2, MapPin } from 'lucide-react';
import api from '../../lib/api';

export default function EmployeeBuilding() {
  const [building, setBuilding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setBuilding(res.data.data.user.profile?.building || null);
      } catch (err) {
        console.error('Failed to load building', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!building) {
    return (
      <div className="p-6 text-center">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium">No building assigned yet</h3>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 dark:text-gray-100">
      <h1 className="text-2xl font-bold">{building.name}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <MapPin size={14} /> {building.address}
      </p>
      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        {building.buildingType}
      </span>
    </div>
  );
}