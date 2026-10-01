import { Outlet } from "react-router-dom";
import { useState } from "react";
import AppSidebar from "../components/common/AppSidebar";
import AppHeader from "../components/common/AppHeader";

export default function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen((prev) => !prev);
    } else {
      setMobileSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <AppSidebar
        open={sidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
