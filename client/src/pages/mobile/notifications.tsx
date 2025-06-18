import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Settings, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/language-context';

export default function MobileNotifications() {
  const [activeTab, setActiveTab] = useState('All');
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiRequest('/api/users/notifications'),
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/users/notifications/${notificationId}/read`, {
        method: 'PUT'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    }
  });

  const notificationTabs = [
    'All',
    t('system_notification'),
    t('latest_events'),
    t('announcement'),
    t('rewards')
  ];

  const handleReadAll = async () => {
    if (notifications?.data) {
      const unreadNotifications = notifications.data.filter((n: any) => !n.read);
      for (const notification of unreadNotifications) {
        markAsReadMutation.mutate(notification.id.toString());
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/mobile">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-lg font-semibold">{t('notifications')}</h1>
        <div className="flex items-center space-x-3">
          <button onClick={handleReadAll}>
            <CheckCheck className="w-6 h-6 text-gray-400" />
          </button>
          <Link href="/mobile/notification-settings">
            <Settings className="w-6 h-6 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Notification Tabs */}
      <div className="px-4 py-4">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {notificationTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-2 px-2 text-sm ${
                activeTab === tab
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading notifications...</p>
          </div>
        </div>
      ) : notifications?.data && notifications.data.length > 0 ? (
        <div className="px-4 space-y-3">
          {notifications.data
            .filter((notification: any) => 
              activeTab === 'All' || 
              notification.type === activeTab.toLowerCase().replace(' notification', '').replace(' events', '').replace('latest ', '')
            )
            .map((notification: any) => (
              <Card 
                key={notification.id} 
                className={`border-gray-700 p-4 cursor-pointer hover:bg-gray-800 transition-colors ${
                  notification.read ? 'bg-gray-900' : 'bg-gray-800'
                }`}
                onClick={() => !notification.read && markAsReadMutation.mutate(notification.id.toString())}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-medium text-sm ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                    {notification.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mb-2">
                  {notification.message}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs capitalize">
                    {notification.type} Notification
                  </span>
                  <Button variant="ghost" size="sm" className="text-orange-500 text-xs p-0 h-auto">
                    View More →
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-2xl">🔔</span>
              </div>
            </div>
            <h3 className="text-gray-300 text-lg font-medium mb-2">No Notifications</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        </div>
      )}

      {/* Sample notification structure (commented out since you want it empty) */}
      {/*
      <div className="px-4 space-y-3">
        <Card className="bg-gray-900 border-gray-700 p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-white font-medium text-sm">Deposit Confirmed</h3>
            <span className="text-xs text-gray-500">Yesterday 21:43</span>
          </div>
          <p className="text-gray-400 text-xs mb-2">
            Dear valued Nedaxer trader,<br/>
            Your deposit has been confirmed.<br/>
            Deposit amount: 0.00049602 BNB
          </p>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">System Notification</span>
            <Button variant="ghost" size="sm" className="text-orange-500 text-xs p-0 h-auto">
              View More →
            </Button>
          </div>
        </Card>
      </div>
      */}
    </div>
  );
}