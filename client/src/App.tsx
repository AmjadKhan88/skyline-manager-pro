import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Loading from './components/loaders/Loading';
import useGlobal from './context/GlobalContext';
import ProtectedRoute from './middleware/ProtectedRoute';

// Public
const Home = lazy(() => import('./pages/Home'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'));
const NotFound = lazy(() => import('./components/Notfound'));

// Layouts
const OwnerLayout = lazy(() => import('./layouts/OwnerLayout'));
const ManagerLayout = lazy(() => import('./layouts/ManagerLayout'));
const EmployeeLayout = lazy(() => import('./layouts/EmployeeLayout'));
const TenantLayout = lazy(() => import('./layouts/TenantLayout'));

// Owner pages
const OwnerDashboard = lazy(() => import('./pages/owner/Dashboard'));
const OwnerBuildings = lazy(() => import('./pages/owner/Buildings'));
const OwnerManagers = lazy(() => import('./pages/owner/Managers'));
const OwnerEmployees = lazy(() => import('./pages/owner/Employees'));
const OwnerTenants = lazy(() => import('./pages/owner/Tenants'));
const OwnerAnalytics = lazy(() => import('./pages/owner/Analytics'));
const OwnerFinancial = lazy(() => import('./pages/owner/Financial'));
const OwnerSettings = lazy(() => import('./pages/owner/Settings'));

// Manager pages
const ManagerDashboard = lazy(() => import('./pages/manager/Dashboard'));
const ManagerBuilding = lazy(() => import('./pages/manager/Building'));
const ManagerEmployees = lazy(() => import('./pages/manager/Employees'));
const ManagerTenants = lazy(() => import('./pages/manager/Tenants'));

// Employee pages
const EmployeeDashboard = lazy(() => import('./pages/employee/Dashboard'));
const EmployeeBuilding = lazy(() => import('./pages/employee/Building'));

// Tenant pages
const TenantDashboard = lazy(() => import('./pages/tenant/Dashboard'));
const TenantLease = lazy(() => import('./pages/tenant/Lease'));

export default function App() {
  const { user, loading } = useGlobal();

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public landing page — signup/login modal lives here */}
          <Route path="/" element={<Home />} />

          {/* Available to any authenticated user regardless of role */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* ── Owner ─────────────────────────────────────────────── */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute user={user} loading={loading} role="owner">
                <OwnerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="buildings" element={<OwnerBuildings />} />
            <Route path="managers" element={<OwnerManagers />} />
            <Route path="employees" element={<OwnerEmployees />} />
            <Route path="tenants" element={<OwnerTenants />} />
            <Route path="analytics" element={<OwnerAnalytics />} />
            <Route path="financial" element={<OwnerFinancial />} />
            <Route path="settings" element={<OwnerSettings />} />
          </Route>

          {/* ── Manager ───────────────────────────────────────────── */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute user={user} loading={loading} role="manager">
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="building" element={<ManagerBuilding />} />
            <Route path="employees" element={<ManagerEmployees />} />
            <Route path="tenants" element={<ManagerTenants />} />
          </Route>

          {/* ── Employee ──────────────────────────────────────────── */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute user={user} loading={loading} role="employee">
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="building" element={<EmployeeBuilding />} />
          </Route>

          {/* ── Tenant ────────────────────────────────────────────── */}
          <Route
            path="/tenant"
            element={
              <ProtectedRoute user={user} loading={loading} role="tenant">
                <TenantLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="lease" element={<TenantLease />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}