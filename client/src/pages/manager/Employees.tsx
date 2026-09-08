import { useEffect, useState } from 'react';
import { Users, Mail, Briefcase } from 'lucide-react';
import api from '../../lib/api';

export default function ManagerEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/staff?role=employee&limit=100');
        setEmployees(res.data.data || []);
      } catch (err) {
        console.error('Failed to load employees', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6 dark:text-gray-100">
      <div>
        <h1 className="text-2xl font-bold">Employees</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Employees in your building</p>
      </div>

      {employees.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No employees yet</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div key={emp.id} className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold">{emp.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <Mail size={14} /> {emp.email}
              </p>
              {emp.profile?.jobTitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <Briefcase size={14} /> {emp.profile.jobTitle}
                </p>
              )}
              <span className={`inline-block mt-3 px-2 py-1 rounded-full text-xs font-medium ${
                emp.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {emp.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}