import { useEffect, useState } from 'react';
import { Building2, MapPin, Layers, Home } from 'lucide-react';
import api from '../../lib/api';

export default function ManagerBuilding() {
  const [building, setBuilding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const res = await api.get('/manager/building');
        setBuilding(res.data.data.building);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load building');
      } finally {
        setLoading(false);
      }
    };
    fetchBuilding();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (error || !building) {
    return (
      <div className="p-6 text-center">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium">{error || 'No building assigned yet'}</h3>
        <p className="text-gray-500 text-sm mt-1">Contact your owner to get assigned to a building.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 dark:text-gray-100">
      <div>
        <h1 className="text-2xl font-bold">{building.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <MapPin size={14} /> {building.address}{building.city ? `, ${building.city}` : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Layers className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Floors</p>
            <h3 className="text-2xl font-bold">{building.floors ?? '—'}</h3>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/30">
            <Home className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Units</p>
            <h3 className="text-2xl font-bold">{building.units ?? '—'}</h3>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Building2 className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy</p>
            <h3 className="text-2xl font-bold">{building.occupancy ?? 0}%</h3>
          </div>
        </div>
      </div>

      {building.description && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-medium mb-2">About this building</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{building.description}</p>
        </div>
      )}
    </div>
  );
}