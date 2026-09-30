import { Menu, Moon, Sun, Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useGlobal } from '../../context/GlobalContext';
import { getInitials } from '../../lib/utils';

interface Props {
  onMenuClick: () => void;
}

export default function AppHeader({ onMenuClick }: Props) {
  const { darkMode, setDarkMode, user } = useGlobal();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (!path) return 'Dashboard';
    return path.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const isDashboard = location.pathname.endsWith('/dashboard');
  const firstName = user?.name?.split(' ')[0] || 'there';

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <header className="flex-shrink-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
            {getPageTitle()}
          </h1>
          {isDashboard && (
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block truncate">
              {greeting}, {firstName} 👋
            </p>
          )}
        </div>
      </div>

      {/* Search — visual for now; wire to a real search endpoint once one exists */}
      <div className="hidden md:flex relative w-64 lg:w-72 mx-4 flex-shrink-0">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search buildings, tenants..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-colors text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
        </button>

        <div className="flex items-center gap-2 pl-2.5 ml-1 border-l border-gray-200 dark:border-gray-800">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
            {getInitials(user?.name || 'U')}
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight truncate max-w-[120px]">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'role'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}