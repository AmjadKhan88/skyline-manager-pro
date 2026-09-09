/**
 * pages/owner/Dashboard.tsx — Owner Dashboard
 *
 * Real-data dashboard connected to GET /api/v1/owner/dashboard
 * Design: flat status-driven cards (not gradient decoration), Manrope
 * for headings/numbers, brand blue kept as the one quiet accent, with
 * semantic color reserved for things that need attention.
 */

import { useEffect, useState } from 'react';
import {
  Building2, UserCog, Users, UsersRound, TrendingUp, TrendingDown,
  CheckCircle2, XCircle, AlertCircle, Clock, RefreshCw, ArrowUpRight, Plus,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import api from '../../lib/api';
import { DashboardData } from '../../types';
import { cn } from '../../lib/utils';
import { useGlobal } from '../../context/GlobalContext';
import toast from 'react-hot-toast';
import {Link} from "react-router-dom";

// ─── KPI Card ───────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: number;
  sub: string;
  icon: React.ElementType;
  accent: string; // tailwind color name, e.g. 'blue', 'violet', 'emerald', 'amber'
  href: string;
}

function KpiCard({ title, value, sub, icon: Icon, accent, href }: KpiCardProps) {
  return (
    <Link
      to={href}
      className="group relative flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className={cn('p-2.5 rounded-lg', `bg-${accent}-50 dark:bg-${accent}-500/10`)}>
          <Icon className={cn('w-5 h-5', `text-${accent}-600 dark:text-${accent}-400`)} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors" />
      </div>
      <div className="mt-4">
        <p style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">
          {value}
        </p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{title}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-56 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="h-9 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-gray-900 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-72 bg-gray-100 dark:bg-gray-900 rounded-xl" />
        <div className="h-72 bg-gray-100 dark:bg-gray-900 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Mock revenue trend (replace once a financial-reports endpoint exists) ────
const monthlyData = [
  { month: 'Jan', income: 42000 },
  { month: 'Feb', income: 48000 },
  { month: 'Mar', income: 51000 },
  { month: 'Apr', income: 47000 },
  { month: 'May', income: 58000 },
  { month: 'Jun', income: 63000 },
];

export default function Dashboard() {
  const { user } = useGlobal();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const res = await api.get('/owner/dashboard');
      setData(res.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats;
  const hasNoBuildings = (stats?.buildings.total ?? 0) === 0;

  // Payment health as a share of active leases
  const totalLeases = stats?.tenancies.total || 1;
  const paidPct = Math.round(((stats?.tenancies.paid ?? 0) / totalLeases) * 100);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {greeting}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening across your portfolio today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            Refresh
          </button>
          <Link
            to="/owner/buildings"
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-brand hover:opacity-90 rounded-lg transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Building
          </Link>
        </div>
      </div>

      {hasNoBuildings ? (
        /* Empty state — points at the action, not just blank space */
        <div className="text-center py-16 px-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Building2 className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-bold text-gray-900 dark:text-white">
            Add your first building to get started
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">
            Your dashboard fills in once you have a building on the platform.
          </p>
          <Link
            to="/owner/buildings"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand hover:opacity-90 rounded-lg transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add a building
          </Link>
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              title="Buildings" sub={`${stats?.buildings.active ?? 0} active`}
              value={stats?.buildings.total ?? 0} icon={Building2} accent="blue" href="/owner/buildings"
            />
            <KpiCard
              title="Managers" sub={`${stats?.managers.active ?? 0} active`}
              value={stats?.managers.total ?? 0} icon={UserCog} accent="violet" href="/owner/managers"
            />
            <KpiCard
              title="Employees" sub={`${stats?.employees.active ?? 0} active`}
              value={stats?.employees.total ?? 0} icon={Users} accent="emerald" href="/owner/employees"
            />
            <KpiCard
              title="Tenants" sub={`${stats?.tenants.active ?? 0} active`}
              value={stats?.tenants.total ?? 0} icon={UsersRound} accent="amber" href="/owner/tenants"
            />
          </div>

          {/* Revenue + Payment Health */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)' }} className="font-bold text-gray-900 dark:text-white">
                    Revenue trend
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Last 6 months</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> +18.5%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'currentColor' }} axisLine={false} tickLine={false} className="text-gray-400" />
                  <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} className="text-gray-400" />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Income']} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
                  <Area type="monotone" dataKey="income" stroke="#0ea5e9" strokeWidth={2} fill="url(#incomeGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Payment health — equal weight to size, since it's what needs action */}
            <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <h3 style={{ fontFamily: 'var(--font-display)' }} className="font-bold text-gray-900 dark:text-white mb-1">
                Payment health
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">Active leases this month</p>
              <ResponsiveContainer width="100%" height={140}>
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: paidPct, fill: '#0ea5e9' }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <p style={{ fontFamily: 'var(--font-display)' }} className="text-center text-2xl font-extrabold text-gray-900 dark:text-white -mt-16 mb-14">
                {paidPct}%
              </p>
              <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                <PaymentRow icon={CheckCircle2} label="Paid" value={stats?.tenancies.paid ?? 0} color="emerald" />
                <PaymentRow icon={XCircle} label="Unpaid" value={stats?.tenancies.unpaid ?? 0} color="gray" />
                <PaymentRow icon={AlertCircle} label="Overdue" value={stats?.tenancies.overdue ?? 0} color="red" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ActivityPanel
              title="Recent buildings" viewAllHref="/owner/buildings"
              empty="No buildings added yet"
            >
              {data?.recentBuildings?.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{b.name}</p>
                    <p className="text-xs text-gray-400 truncate">{b.address}</p>
                  </div>
                  <StatusPill status={b.status} />
                </div>
              ))}
            </ActivityPanel>

            <ActivityPanel
              title="Recent staff" viewAllHref="/owner/managers"
              empty="No staff added yet"
            >
              {data?.recentStaff?.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                  <div style={{ fontFamily: 'var(--font-display)' }} className="w-9 h-9 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900 text-xs font-bold flex-shrink-0">
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  </div>
                  <RolePill role={s.role} />
                </div>
              ))}
            </ActivityPanel>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Small presentational helpers ─────────────────────────────────────────────
function PaymentRow({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', `text-${color}-500`)} />
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
      </div>
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function ActivityPanel({ title, viewAllHref, empty, children }: { title: string; viewAllHref: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.some(Boolean) && (children as any[]).length > 0 : !!children;
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontFamily: 'var(--font-display)' }} className="font-bold text-gray-900 dark:text-white">{title}</h3>
        <Link to={viewAllHref} className="text-xs font-medium text-brand hover:underline flex items-center gap-1">
          View all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      {!hasChildren ? (
        <p className="text-sm text-gray-400 py-8 text-center">{empty}</p>
      ) : (
        <div className="space-y-1">{children}</div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isGood = status === 'operational';
  return (
    <span className={cn(
      'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
      isGood ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
    )}>
      {status}
    </span>
  );
}

function RolePill({ role }: { role: string }) {
  const styles: Record<string, string> = {
    manager: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
    employee: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    tenant: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  };
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0', styles[role] || styles.tenant)}>
      {role}
    </span>
  );
}