import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2, LayoutDashboard, UserCog, Users, UsersRound,
  BarChart3, DollarSign, Settings, LogOut, X, Zap, Key
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useGlobal } from '../../context/GlobalContext';
import { getInitials } from '../../lib/utils';

const NAV_CONFIG = {
  OWNER: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/owner/dashboard' },
    { label: 'Buildings', icon: Building2, to: '/owner/buildings' },
    { label: 'Managers', icon: UserCog, to: '/owner/managers' },
    { label: 'Employees', icon: Users, to: '/owner/employees' },
    { label: 'Tenants', icon: UsersRound, to: '/owner/tenants' },
    { label: 'Analytics', icon: BarChart3, to: '/owner/analytics' },
    { label: 'Financial', icon: DollarSign, to: '/owner/financial' },
    { label: 'Settings', icon: Settings, to: '/owner/settings' },
  ],
  MANAGER: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/manager/dashboard' },
    { label: 'My Building', icon: Building2, to: '/manager/building' },
    { label: 'Employees', icon: Users, to: '/manager/employees' },
    { label: 'Tenants', icon: UsersRound, to: '/manager/tenants' },
  ],
  EMPLOYEE: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/employee/dashboard' },
    { label: 'My Building', icon: Building2, to: '/employee/building' },
  ],
  TENANT: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/tenant/dashboard' },
    { label: 'My Lease', icon: Key, to: '/tenant/lease' },
  ]
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
      await api.post('/api/v1/auth/logout');
      setUser(null);
      navigate('/');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  const navItems = user?.role ? NAV_CONFIG[user.role.toUpperCase() as keyof typeof NAV_CONFIG] || NAV_CONFIG.OWNER : NAV_CONFIG.OWNER;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0f1629] text-white">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-white/10',
        !open && 'justify-center px-2'
      )}>
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {open && (
          <div>
            <p className="text-sm font-bold tracking-wide">SkyLine</p>
            <p className="text-xs text-blue-300">Manager Pro</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon className={cn('flex-shrink-0 w-5 h-5', !open && 'mx-auto')} />
            {open && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className={cn('p-3 border-t border-white/10', !open && 'px-2')}>
        {open ? (
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-bold flex-shrink-0 text-white">
              {getInitials(user?.name || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user?.role?.toLowerCase() || 'Role'}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-xl transition-all"
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
          'hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out',
          open ? 'w-60' : 'w-16'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-full w-64 shadow-2xl">
            <SidebarContent />
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
