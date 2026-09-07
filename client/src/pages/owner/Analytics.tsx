import React from 'react';
import { BarChart3, TrendingUp, Users, Building2 } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="p-6 space-y-6 dark:text-gray-100">
      <div>
        <h1 className="text-2xl font-bold">Analytics Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">View performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '$124,500', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Occupancy Rate', value: '92%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Active Leases', value: '145', icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
          { label: 'Maintenance ROI', value: '+14%', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Revenue Growth Chart</h3>
            <p className="text-gray-500 dark:text-gray-400">Chart implementation coming soon</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Tenant Retention Analytics</h3>
            <p className="text-gray-500 dark:text-gray-400">Chart implementation coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
