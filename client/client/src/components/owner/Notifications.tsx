import { useState } from 'react';
import { Bell, Send, UserCog, Users, UsersRound, AlertCircle, CheckCircle } from 'lucide-react';

type RecipientType = 'managers' | 'employees' | 'tenants';

export function Notifications() {
  const [recipientType, setRecipientType] = useState<RecipientType>('managers');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sentNotifications, setSentNotifications] = useState<Array<{
    id: number;
    to: RecipientType;
    subject: string;
    message: string;
    timestamp: string;
  }>>([
    {
      id: 1,
      to: 'managers',
      subject: 'Monthly Meeting Reminder',
      message: 'Please attend the monthly managers meeting on Friday at 2 PM.',
      timestamp: '2026-01-20 10:30 AM',
    },
    {
      id: 2,
      to: 'employees',
      subject: 'Maintenance Schedule Update',
      message: 'New maintenance schedules have been posted. Please check your assignments.',
      timestamp: '2026-01-19 3:15 PM',
    },
    {
      id: 3,
      to: 'tenants',
      subject: 'Rent Payment Reminder',
      message: 'This is a friendly reminder that rent is due by the end of the month.',
      timestamp: '2026-01-18 9:00 AM',
    },
  ]);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newNotification = {
      id: sentNotifications.length + 1,
      to: recipientType,
      subject,
      message,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };

    setSentNotifications([newNotification, ...sentNotifications]);
    setSubject('');
    setMessage('');
    
    // Show success message (in a real app, this would be a toast notification)
    alert(`Notification sent successfully to all ${recipientType}!`);
  };

  const getRecipientIcon = (type: RecipientType) => {
    switch (type) {
      case 'managers':
        return <UserCog className="w-5 h-5" />;
      case 'employees':
        return <Users className="w-5 h-5" />;
      case 'tenants':
        return <UsersRound className="w-5 h-5" />;
    }
  };

  const getRecipientColor = (type: RecipientType) => {
    switch (type) {
      case 'managers':
        return 'bg-purple-100 text-purple-600';
      case 'employees':
        return 'bg-green-100 text-green-600';
      case 'tenants':
        return 'bg-orange-100 text-orange-600';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications Center</h1>
        <p className="text-gray-600">Send notifications to managers, employees, and tenants</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send Notification</h2>
              <p className="text-sm text-gray-600">Compose and send messages</p>
            </div>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Send To</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRecipientType('managers')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    recipientType === 'managers'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserCog className={`w-6 h-6 ${recipientType === 'managers' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${recipientType === 'managers' ? 'text-purple-900' : 'text-gray-600'}`}>
                    Managers
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType('employees')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    recipientType === 'employees'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className={`w-6 h-6 ${recipientType === 'employees' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${recipientType === 'employees' ? 'text-green-900' : 'text-gray-600'}`}>
                    Employees
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType('tenants')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    recipientType === 'tenants'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UsersRound className={`w-6 h-6 ${recipientType === 'tenants' ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${recipientType === 'tenants' ? 'text-orange-900' : 'text-gray-600'}`}>
                    Tenants
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Important Update"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Type your message here..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-5 h-5" />
              Send Notification
            </button>
          </form>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Templates</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setSubject('Payment Reminder');
                  setMessage('This is a reminder that your payment is due soon. Please ensure timely payment to avoid any inconvenience.');
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Payment Reminder
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubject('Maintenance Notice');
                  setMessage('Scheduled maintenance will be performed in your building. Please plan accordingly and contact us if you have any concerns.');
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Maintenance Notice
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubject('Meeting Invitation');
                  setMessage('You are invited to attend an important meeting. Your presence is highly valued. Details will be shared shortly.');
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Meeting Invitation
              </button>
            </div>
          </div>
        </div>

        {/* Notification History */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-lg">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notification History</h2>
              <p className="text-sm text-gray-600">Recently sent notifications</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {sentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getRecipientColor(notification.to)}`}>
                      {getRecipientIcon(notification.to)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        To: {notification.to}
                      </p>
                      <p className="text-xs text-gray-500">{notification.timestamp}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{notification.subject}</h4>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <UserCog className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Managers</h3>
          </div>
          <p className="text-3xl font-bold mb-1">36</p>
          <p className="text-purple-100 text-sm">Total recipients</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Employees</h3>
          </div>
          <p className="text-3xl font-bold mb-1">148</p>
          <p className="text-green-100 text-sm">Total recipients</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <UsersRound className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Tenants</h3>
          </div>
          <p className="text-3xl font-bold mb-1">542</p>
          <p className="text-orange-100 text-sm">Total recipients</p>
        </div>
      </div>
    </div>
  );
}
