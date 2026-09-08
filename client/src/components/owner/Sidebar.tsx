import { Building2, LayoutDashboard, Users, UserCog, UsersRound, Bell, TrendingUp, DollarSign, CheckSquare, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import useGlobal from '../../context/GlobalContext';
import {useOwner} from '../../context/OwnerContext';
type View = 'dashboard' | 'buildings' | 'managers' | 'employees' | 'tenants' | 'notifications' | 'analytics' | 'financial' | 'tasks' | 'settings';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  darkMode: boolean;
}

export function Sidebar({ currentView, onViewChange, darkMode }: SidebarProps) {
  const { user } = useGlobal();
  const {buildings,managers,employees,tenants} = useOwner();
  const menuItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'buildings' as View, label: 'Buildings', icon: Building2, badge: buildings.length.toString() || '0' },
    { id: 'managers' as View, label: 'Managers', icon: UserCog, badge: managers.length.toString() || '0'},
    { id: 'employees' as View, label: 'Employees', icon: Users, badge: employees.length.toString() || '0'},
    { id: 'tenants' as View, label: 'Tenants', icon: UsersRound, badge: '542' },
  ];

  const advancedItems = [
    { id: 'analytics' as View, label: 'Analytics', icon: TrendingUp, badge: null },
    { id: 'financial' as View, label: 'Financial Reports', icon: DollarSign, badge: null },
    { id: 'tasks' as View, label: 'Task Manager', icon: CheckSquare, badge: '12' },
    { id: 'notifications' as View, label: 'Notifications', icon: Bell, badge: '3' },
  ];

    

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;
    
    return (
      <li>
        <button
          onClick={() => onViewChange(item.id)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
            isActive
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
              : darkMode
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
            <span className="font-medium">{item.label}</span>
          </div>
          {item.badge && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-blue-500/20 text-blue-300'
            }`}>
              {item.badge}
            </span>
          )}
          {isActive && (
            <ChevronRight className="w-4 h-4 animate-pulse" />
          )}
        </button>
      </li>
    );
  };

  return (
    <aside className={`w-72 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'} text-white flex flex-col shadow-2xl`}>
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Building2 className="w-10 h-10 text-blue-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Skyline Manager
            </h1>
            <p className="text-xs text-slate-400 font-semibold">Pro Version 2.0</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <p className="text-xs text-blue-300">Total Income</p>
            <p className="text-sm font-bold text-white">$189K</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
            <p className="text-xs text-purple-300">Occupancy</p>
            <p className="text-sm font-bold text-white">88.5%</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4">Main Menu</p>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </ul>
        </div>
        
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4">Advanced</p>
          <ul className="space-y-2">
            {advancedItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </ul>
        </div>

       

        {/* Settings at bottom */}
        <div className="mt-6">
          <MenuItem item={{ id: 'settings' as View, label: 'Settings', icon: SettingsIcon, badge: null }} />
        </div>

      </nav>
      
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-blue-500/20">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center font-bold shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Building Owner</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
