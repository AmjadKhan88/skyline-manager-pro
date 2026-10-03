import { NavLink, useNavigate } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  UserCog,
  Users,
  UsersRound,
  BarChart3,
  DollarSign,
  Settings,
  LogOut,
  X,
  Zap,
  Key,
  Sparkles,
  Wrench,
  Megaphone,
  FolderOpen,
  CreditCard,
  Landmark,
} from "lucide-react";
import { cn } from "../../lib/utils";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { useGlobal } from "../../context/GlobalContext";
import { getInitials } from "../../lib/utils";

// Nav items are grouped into sections (Main / Insights / System) purely for
// visual organization — matches the reference design's sidebar grouping.
const NAV_CONFIG = {
  OWNER: [
    {
      section: "Main",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, to: "/owner/dashboard" },
        { label: "Buildings", icon: Building2, to: "/owner/buildings" },
        { label: "Managers", icon: UserCog, to: "/owner/managers" },
        { label: "Employees", icon: Users, to: "/owner/employees" },
        { label: "Tenants", icon: UsersRound, to: "/owner/tenants" },
        { label: "Maintenance", icon: Wrench, to: "/owner/maintenance" },
        { label: "Announcements", icon: Megaphone, to: "/owner/announcements" },
        { label: "Documents", icon: FolderOpen, to: "/owner/documents" },
        { label: "Payments", icon: CreditCard, to: "/owner/payments" },
        {
          label: "Payment Accounts",
          icon: Landmark,
          to: "/owner/payment-accounts",
        },
      ],
    },
    {
      section: "Insights",
      items: [
        { label: "Analytics", icon: BarChart3, to: "/owner/analytics" },
        { label: "Financial", icon: DollarSign, to: "/owner/financial" },
      ],
    },
    {
      section: "System",
      items: [{ label: "Settings", icon: Settings, to: "/owner/settings" }],
    },
  ],
  MANAGER: [
    {
      section: "Main",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, to: "/manager/dashboard" },
        { label: "My Building", icon: Building2, to: "/manager/building" },
        { label: "Employees", icon: Users, to: "/manager/employees" },
        { label: "Tenants", icon: UsersRound, to: "/manager/tenants" },
        { label: "Maintenance", icon: Wrench, to: "/manager/maintenance" },
        {
          label: "Announcements",
          icon: Megaphone,
          to: "/manager/announcements",
        },
        { label: "Documents", icon: FolderOpen, to: "/manager/documents" },
        { label: "Payments", icon: CreditCard, to: "/manager/payments" },
      ],
    },
  ],
  EMPLOYEE: [
    {
      section: "Main",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          to: "/employee/dashboard",
        },
        { label: "My Building", icon: Building2, to: "/employee/building" },
        { label: "Maintenance", icon: Wrench, to: "/employee/maintenance" },
        {
          label: "Announcements",
          icon: Megaphone,
          to: "/employee/announcements",
        },
      ],
    },
  ],
  TENANT: [
    {
      section: "Main",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, to: "/tenant/dashboard" },
        { label: "My Lease", icon: Key, to: "/tenant/lease" },
        { label: "Maintenance", icon: Wrench, to: "/tenant/maintenance" },
        {
          label: "Announcements",
          icon: Megaphone,
          to: "/tenant/announcements",
        },
        { label: "Documents", icon: FolderOpen, to: "/tenant/documents" },
        { label: "Payments", icon: CreditCard, to: "/tenant/payments" },
      ],
    },
  ],
};

interface Props {
  open: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AppSidebar({ open, mobileOpen, onMobileClose }: Props) {
  const navigate = useNavigate();
  const { user, setUser } = useGlobal();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      navigate("/");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  const sections = user?.role
    ? NAV_CONFIG[user.role.toUpperCase() as keyof typeof NAV_CONFIG] ||
      NAV_CONFIG.OWNER
    : NAV_CONFIG.OWNER;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 h-16 px-4 border-b border-slate-800 flex-shrink-0",
          !open && "justify-center px-2",
        )}
      >
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {open && (
          <div className="min-w-0">
            <p
              style={{ fontFamily: "var(--font-display)" }}
              className="text-sm font-bold text-white leading-tight truncate"
            >
              SkyLine
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Manager Pro
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {sections.map((group) => (
          <div key={group.section} className="mb-5 last:mb-0">
            {open && (
              <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.section}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map(({ label, icon: Icon, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white",
                      !open && "justify-center px-0",
                    )
                  }
                >
                  <Icon className="flex-shrink-0 w-5 h-5" />
                  {open && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Plan card — owner only */}
      {open && user?.role === "owner" && (
        <div className="p-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <p className="text-sm font-semibold">Upgrade Plan</p>
            </div>
            <p className="text-xs text-blue-100">
              Unlock advanced analytics & financial reports
            </p>
            <a
              href="/owner/settings"
              className="mt-3 block text-center w-full bg-white text-blue-700 text-xs font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              View Plans
            </a>
          </div>
        </div>
      )}

      {/* User Footer */}
      <div
        className={cn(
          "p-3 border-t border-slate-800 flex-shrink-0",
          !open && "px-2",
        )}
      >
        {open ? (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-bold flex-shrink-0 text-white">
              {getInitials(user?.name || "U")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-white">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-500 truncate capitalize">
                {user?.role?.toLowerCase() || "Role"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out",
          open ? "w-64" : "w-16",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-64 shadow-2xl">
            <SidebarContent />
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
