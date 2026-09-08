import { Moon, Sun, Bell, Lock, User, Building2, CreditCard, Globe, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useGlobal from '../../context/GlobalContext';
import api from '../../configs/api';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

interface SettingsProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Settings({ darkMode, onToggleDarkMode }: SettingsProps) {
  const { user, setUser } = useGlobal();
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();

    const handleLogout = async () => {
      try {
        const confirmed = await confirm({
          title: "Logout",
          message: "Are you sure you want to logout?",
          confirmText: "Logout",
          cancelText: "Cancel",
        });
        if (confirmed){
        const { data } = await api.post('/api/auth/logout');
        if(data.success){
          toast.success(data.message);
          navigate('/');
          setUser(null);
        }
      }else{
        return;
      }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error.message)
      }
    };
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-3 rounded-lg">
              {darkMode ? <Moon className="w-6 h-6 text-purple-600" /> : <Sun className="w-6 h-6 text-purple-600" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Appearance</h3>
              <p className="text-sm text-gray-600">Customize your interface</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Dark Mode</p>
                <p className="text-sm text-gray-600">Toggle dark theme</p>
              </div>
              <button
                onClick={onToggleDarkMode}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  darkMode ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'transform translate-x-7' : ''
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Language</p>
                <p className="text-sm text-gray-600">English (US)</p>
              </div>
              <Globe className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">Manage notification preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            {['Email Notifications', 'Push Notifications', 'SMS Alerts', 'Payment Reminders'].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">{item}</p>
                <button className="relative w-14 h-7 bg-blue-600 rounded-full">
                  <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Account</h3>
              <p className="text-sm text-gray-600">Manage your account details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="Building Owner"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="admin@skyline.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 p-3 rounded-lg">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Security</h3>
              <p className="text-sm text-gray-600">Protect your account</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors">
              <p className="font-semibold text-gray-900">Change Password</p>
              <p className="text-sm text-gray-600">Update your password</p>
            </button>
            <button className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors">
              <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </button>
          </div>
        </div>


        
        {/* Billing */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Billing & Subscription</h3>
              <p className="text-sm text-gray-600">Manage your subscription plan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <h4 className="font-bold text-gray-900 mb-2">Current Plan</h4>
              <p className="text-2xl font-bold text-blue-600 mb-1">Pro</p>
              <p className="text-sm text-gray-600">$99/month</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Next Billing</h4>
              <p className="text-2xl font-bold text-gray-900 mb-1">Feb 23</p>
              <p className="text-sm text-gray-600">2026</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Payment Method</h4>
              <p className="text-lg font-semibold text-gray-900 mb-1">•••• 4242</p>
              <p className="text-sm text-gray-600">Visa</p>
            </div>
          </div>
        </div>

         {/* Logout Section - New */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gray-100 p-3 rounded-lg">
              <LogOut className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Logout</h3>
              <p className="text-sm text-gray-600">Sign out from your account</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Logout</span>
            </button>
            <p className="text-xs text-gray-500 text-center">
              You will be redirected to the login page
            </p>
          </div>
        </div>


      </div>
    </div>
  );
}
