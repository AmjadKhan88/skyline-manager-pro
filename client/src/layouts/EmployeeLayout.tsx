import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import AppSidebar from '../components/common/AppSidebar';
import AppHeader from '../components/common/AppHeader';

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <AppSidebar
        open={sidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader
          onMenuClick={() => {
            setSidebarOpen(!sidebarOpen);
            setMobileSidebarOpen(!mobileSidebarOpen);
          }}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}