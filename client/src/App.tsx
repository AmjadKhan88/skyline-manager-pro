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
import ManagerDashboard from "./pages/manager/Dashboard";
import ManagerBuilding from "./pages/manager/Building";
import ManagerEmployees from "./pages/manager/Employees";
import ManagerTenants from "./pages/manager/Tenants";
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeBuilding from "./pages/employee/Building";
import TenantDashboard from "./pages/tenant/Dashboard";
import TenantLease from "./pages/tenant/Lease";

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
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
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

          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="building" element={<EmployeeBuilding />} />
          </Route>

          <Route
            path="/tenant"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <TenantLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="lease" element={<TenantLease />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}
