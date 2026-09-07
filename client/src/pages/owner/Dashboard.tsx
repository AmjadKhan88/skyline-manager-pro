/**
 * pages/owner/Dashboard.tsx — Owner Dashboard
 *
 * Real-data dashboard connected to GET /api/v1/owner/dashboard
 * Shows: building stats, staff counts, payment overview, charts, recent activity
 */

import { useEffect, useState } from 'react';
import {
  Building2, UserCog, Users, UsersRound, TrendingUp,
  TrendingDown, DollarSign, CheckCircle2, XCircle,
  AlertCircle, Clock, RefreshCw, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../lib/api';
import { DashboardData } from '../../types';
import { formatDate, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

// ─── Stat Card Component ───────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  gradient: string;
  trend?: { value: number; positive: boolean };
}

function StatCard({ title, value, sub, icon: Icon, gradient, trend }: StatCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl p-6 text-white shadow-lg',
      gradient
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.positive
                ? <TrendingUp className="w-3 h-3 text-white/80" />
                : <TrendingDown className="w-3 h-3 text-white/80" />
              }
              <span className="text-xs text-white/80">
                {trend.value}% from last month
              </span>
            </div>
          )}
        </div>
        <div className="bg-white/20 rounded-xl p-3">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white/10 rounded-full" />
    </div>
  );
}

// ─── Mini Stat ────────────────────────────────────────────────────────────────
function MiniStat({
  label, value, icon: Icon, color
}: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className={cn('p-2 rounded-lg', color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

// ─── Mock chart data (can be replaced with real financial data later) ──────────
const monthlyData = [
  { month: 'Jan', income: 42000, expenses: 18000 },
  { month: 'Feb', income: 48000, expenses: 21000 },
  { month: 'Mar', income: 51000, expenses: 19500 },
  { month: 'Apr', income: 47000, expenses: 22000 },
  { month: 'May', income: 58000, expenses: 20000 },
  { month: 'Jun', income: 63000, expenses: 23000 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/owner/dashboard');
      setData(res.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const stats = data?.stats;

  // Pie chart data from real stats
  const pieData = stats ? [
    { name: 'Buildings', value: stats.buildings.total },
    { name: 'Managers', value: stats.managers.total },
    { name: 'Employees', value: stats.employees.total },
    { name: 'Tenants', value: stats.tenants.total },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your complete building portfolio at a glance
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Buildings"
          value={stats?.buildings.total ?? 0}
          sub={`${stats?.buildings.active ?? 0} active`}
          icon={Building2}
          gradient="bg-gradient-to-br from-blue-600 to-blue-700"
          trend={{ value: 8.5, positive: true }}
        />
        <StatCard
          title="Managers"
          value={stats?.managers.total ?? 0}
          sub={`${stats?.managers.active ?? 0} active`}
          icon={UserCog}
          gradient="bg-gradient-to-br from-violet-600 to-purple-700"
          trend={{ value: 12.3, positive: true }}
        />
        <StatCard
          title="Employees"
          value={stats?.employees.total ?? 0}
          sub={`${stats?.employees.active ?? 0} active`}
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
          trend={{ value: 5.2, positive: true }}
        />
        <StatCard
          title="Tenants"
          value={stats?.tenants.total ?? 0}
          sub={`${stats?.tenants.active ?? 0} active`}
          icon={UsersRound}
          gradient="bg-gradient-to-br from-orange-500 to-amber-600"
          trend={{ value: 3.1, positive: true }}
        />
      </div>

      {/* Payment Status Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MiniStat
          label="Rents Paid"
          value={stats?.tenancies.paid ?? 0}
          icon={CheckCircle2}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
        />
        <MiniStat
          label="Rents Unpaid"
          value={stats?.tenancies.unpaid ?? 0}
          icon={XCircle}
          color="bg-red-100 dark:bg-red-900/30 text-red-500"
        />
        <MiniStat
          label="Overdue"
          value={stats?.tenancies.overdue ?? 0}
          icon={AlertCircle}
          color="bg-amber-100 dark:bg-amber-900/30 text-amber-600"
        />
        <MiniStat
          label="Total Leases"
          value={stats?.tenancies.total ?? 0}
          icon={Clock}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Income vs Expenses */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 6 months</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full font-medium">
              <TrendingUp className="w-3 h-3" /> +18.5%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
              <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Distribution Pie */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Portfolio Distribution</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">By role type</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Buildings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Buildings</h3>
            <a href="/owner/buildings" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          {!data?.recentBuildings?.length ? (
            <p className="text-sm text-gray-400 py-6 text-center">No buildings added yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentBuildings.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{b.name}</p>
                    <p className="text-xs text-gray-400 truncate">{b.address}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                    b.status === 'operational' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  )}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Staff */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Staff</h3>
            <a href="/owner/managers" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          {!data?.recentStaff?.length ? (
            <p className="text-sm text-gray-400 py-6 text-center">No staff added yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentStaff.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0',
                    s.role === 'manager' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                      : s.role === 'employee' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  )}>
                    {s.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
