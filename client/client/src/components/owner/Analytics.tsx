import { TrendingUp, DollarSign, Users, Building2, Calendar, Download, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export function Analytics() {
  const monthlyRevenue = [
    { month: 'Jul', revenue: 45000, expenses: 28000, profit: 17000 },
    { month: 'Aug', revenue: 52000, expenses: 30000, profit: 22000 },
    { month: 'Sep', revenue: 48000, expenses: 27000, profit: 21000 },
    { month: 'Oct', revenue: 61000, expenses: 32000, profit: 29000 },
    { month: 'Nov', revenue: 55000, expenses: 29000, profit: 26000 },
    { month: 'Dec', revenue: 67000, expenses: 31000, profit: 36000 },
    { month: 'Jan', revenue: 72000, expenses: 33000, profit: 39000 },
  ];

  const buildingPerformance = [
    { building: 'Tower A', occupancy: 92, revenue: 125000, satisfaction: 8.5 },
    { building: 'Tower B', occupancy: 87, revenue: 108000, satisfaction: 7.8 },
    { building: 'Harbor View', occupancy: 95, revenue: 145000, satisfaction: 9.2 },
    { building: 'Garden Heights', occupancy: 78, revenue: 89000, satisfaction: 7.5 },
  ];

  const performanceMetrics = [
    { metric: 'Revenue', value: 95 },
    { metric: 'Occupancy', value: 88 },
    { metric: 'Maintenance', value: 78 },
    { metric: 'Tenant Satisfaction', value: 85 },
    { metric: 'Staff Efficiency', value: 82 },
    { metric: 'Payment Collection', value: 90 },
  ];

  const tenantRetention = [
    { quarter: 'Q1 2025', retention: 88, newTenants: 45, lostTenants: 12 },
    { quarter: 'Q2 2025', retention: 90, newTenants: 52, lostTenants: 10 },
    { quarter: 'Q3 2025', retention: 87, newTenants: 38, lostTenants: 15 },
    { quarter: 'Q4 2025', retention: 92, newTenants: 61, lostTenants: 8 },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Advanced Analytics
          </h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +18.2%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Revenue (YTD)</h3>
          <p className="text-3xl font-bold text-gray-900">$487K</p>
          <p className="text-xs text-gray-500 mt-2">Last updated: Today</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +5.1%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Avg Occupancy Rate</h3>
          <p className="text-3xl font-bold text-gray-900">88.5%</p>
          <p className="text-xs text-gray-500 mt-2">Across all buildings</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12.3%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Tenant Retention</h3>
          <p className="text-3xl font-bold text-gray-900">92%</p>
          <p className="text-xs text-gray-500 mt-2">Q4 2025 Performance</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +22.5%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Net Profit Margin</h3>
          <p className="text-3xl font-bold text-gray-900">54.2%</p>
          <p className="text-xs text-gray-500 mt-2">January 2026</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue, Expenses & Profit Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              <Area type="monotone" dataKey="profit" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Building Performance Comparison */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Building Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={buildingPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="building" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="occupancy" fill="#8b5cf6" />
              <Bar dataKey="satisfaction" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Radar */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceMetrics}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Tenant Retention */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tenant Retention Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tenantRetention}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="retention" stroke="#3b82f6" strokeWidth={3} />
              <Line type="monotone" dataKey="newTenants" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="lostTenants" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Top Performing Building</h3>
          <p className="text-3xl font-bold mb-2">Harbor View Plaza</p>
          <div className="space-y-2 text-blue-100">
            <p className="text-sm">Occupancy: 95%</p>
            <p className="text-sm">Revenue: $145,000/month</p>
            <p className="text-sm">Satisfaction: 9.2/10</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Revenue Growth</h3>
          <p className="text-3xl font-bold mb-2">+18.2%</p>
          <div className="space-y-2 text-purple-100">
            <p className="text-sm">Year-to-Date Performance</p>
            <p className="text-sm">Projected Annual: $584K</p>
            <p className="text-sm">Target Achievement: 112%</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Collection Efficiency</h3>
          <p className="text-3xl font-bold mb-2">89.7%</p>
          <div className="space-y-2 text-green-100">
            <p className="text-sm">On-time Payments: 142/160</p>
            <p className="text-sm">Outstanding: $24,680</p>
            <p className="text-sm">Default Rate: 2.1%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
