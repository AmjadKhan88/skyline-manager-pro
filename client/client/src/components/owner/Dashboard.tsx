import { Building2, UserCog, Users, UsersRound, AlertCircle, TrendingUp, TrendingDown, DollarSign, CheckCircle, XCircle, Wallet } from 'lucide-react';
import { StatCard } from './StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useOwner } from '../../context/OwnerContext';

export function Dashboard() {
  const { buildings, managers, employees, tenants} = useOwner();
  
  // Mock data for charts
  const monthlyIncomeData = [
    { month: 'Jan', income: 45000, expenses: 28000 },
    { month: 'Feb', income: 52000, expenses: 30000 },
    { month: 'Mar', income: 48000, expenses: 27000 },
    { month: 'Apr', income: 61000, expenses: 32000 },
    { month: 'May', income: 55000, expenses: 29000 },
    { month: 'Jun', income: 67000, expenses: 31000 },
  ];

  const complaintDistribution = [
    { name: 'Managers', value: 12 },
    { name: 'Employees', value: 8 },
    { name: 'Tenants', value: 23 },
  ];

  const paymentStatusData = [
    { category: 'Tenants Paid', value: 142 },
    { category: 'Tenants Unpaid', value: 18 },
    { category: 'Employees Paid', value: 45 },
    { category: 'Employees Unpaid', value: 5 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to Skyline Manager Pro - Your complete building management solution</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Buildings"
          value={buildings.length || 0}
          icon={Building2}
          color="blue"
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatCard
          title="Total Managers"
          value={managers.length || 0}
          icon={UserCog}
          color="purple"
          trend={{ value: 12.3, isPositive: true }}
        />
        <StatCard
          title="Total Employees"
          value={employees.length || 0}
          icon={Users}
          color="green"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="Total Tenants"
          value={tenants.length || 0}
          icon={UsersRound}
          color="orange"
          trend={{ value: 3.1, isPositive: false }}
        />
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Manager Complaints"
          value="12"
          icon={AlertCircle}
          color="red"
          subtitle="Pending resolution"
        />
        <StatCard
          title="Employee Complaints"
          value="8"
          icon={AlertCircle}
          color="yellow"
          subtitle="Pending resolution"
        />
        <StatCard
          title="Tenant Complaints"
          value="23"
          icon={AlertCircle}
          color="pink"
          subtitle="Pending resolution"
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-green-100 mb-1">Income This Month</p>
              <h2 className="text-4xl font-bold">$67,340</h2>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-100">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+15.3% from last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-red-100 mb-1">Lost Income This Month</p>
              <h2 className="text-4xl font-bold">$8,250</h2>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingDown className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-red-100">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">Unpaid rents & defaults</span>
          </div>
        </div>
      </div>

      {/* Payment Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tenants Paid"
          value="142"
          icon={CheckCircle}
          color="green"
          subtitle="Out of 160 total"
        />
        <StatCard
          title="Tenants Unpaid"
          value="18"
          icon={XCircle}
          color="red"
          subtitle="Payment pending"
        />
        <StatCard
          title="Employees Paid"
          value="45"
          icon={Wallet}
          color="blue"
          subtitle="Out of 50 total"
        />
        <StatCard
          title="Employees Unpaid"
          value="5"
          icon={XCircle}
          color="orange"
          subtitle="Salary pending"
        />
      </div>

      {/* Manager Payment Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Managers Paid"
          value="32"
          icon={CheckCircle}
          color="purple"
          subtitle="Out of 36 total"
        />
        <StatCard
          title="Managers Unpaid"
          value="4"
          icon={XCircle}
          color="pink"
          subtitle="Payment processing"
        />
      </div>

      {/* Total Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600">Total Received This Month</p>
              <h3 className="text-2xl font-bold text-gray-900">$189,450</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">All income sources combined</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600">Total Not Received This Month</p>
              <h3 className="text-2xl font-bold text-gray-900">$24,680</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-red-600">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">Pending collections & payments</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Income vs Expenses (6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyIncomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Complaints Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Complaints Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complaintDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {complaintDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
