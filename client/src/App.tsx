import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Loading from './components/loaders/Loading';
import useGlobal from './context/GlobalContext';

// Lazy loaded layouts
const OwnerLayout = lazy(() => import('./layouts/OwnerLayout'));
const ManagerLayout = lazy(() => import('./layouts/ManagerLayout'));
const EmployeeLayout = lazy(() => import('./layouts/EmployeeLayout'));
const TenantLayout = lazy(() => import('./layouts/TenantLayout'));

// Lazy loaded owner pages
const OwnerDashboard = lazy(() => import('./pages/owner/Dashboard'));
const OwnerBuildings = lazy(() => import('./pages/owner/Buildings'));
const OwnerManagers = lazy(() => import('./pages/owner/Managers'));
const OwnerEmployees = lazy(() => import('./pages/owner/Employees'));
const OwnerTenants = lazy(() => import('./pages/owner/Tenants'));
const OwnerAnalytics = lazy(() => import('./pages/owner/Analytics'));
const OwnerFinancial = lazy(() => import('./pages/owner/Financial'));
const OwnerSettings = lazy(() => import('./pages/owner/Settings'));

// Other pages
const Home = lazy(() => import('./pages/Home'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'));
const NotFound = lazy(() => import('./components/Notfound'));

import ProtectedRoute from './middleware/ProtectedRoute';

export default function App() {
  const { user, loading } = useGlobal();

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Owner Routes */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute user={user} role="owner" loading={loading}>
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

          {/* Manager Routes */}
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute user={user} role="manager" loading={loading}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee/*"
            element={
              <ProtectedRoute user={user} role="employee" loading={loading}>
                <EmployeeLayout />
              </ProtectedRoute>
            }
          />

          {/* Tenant Routes */}
          <Route
            path="/tenant/*"
            element={
              <ProtectedRoute user={user} role="tenant" loading={loading}>
                <TenantLayout />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}
