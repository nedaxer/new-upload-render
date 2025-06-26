import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Settings, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/language-context';
import PullToRefresh from 'react-pull-to-refresh';

export default function MobileNotifications() {
  const [activeTab, setActiveTab] = useState('All');
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Fetch notifications with automatic refetch every 10 seconds for real-time updates
  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    refetchIntervalInBackground: true,
  });

  const notifications = notificationsResponse?.data || [];
  const notificationData = Array.isArray(notifications) ? notifications : [];

  // Pull to refresh handler
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    // Also refresh wallet/balance data
    await queryClient.invalidateQueries({ queryKey: ['/api/wallet/summary'] });
    await queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
  };

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connected for real-time notifications');
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Real-time update received:', data);
        
        if (data.type === 'DEPOSIT_CREATED') {
          // Automatically refresh notifications and balance data
          queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
          queryClient.invalidateQueries({ queryKey: ['/api/wallet/summary'] });
          queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
          
          console.log('Auto-refreshed notifications and balance due to new deposit');
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    // Cleanup on component unmount
    return () => {
      socket.close();
    };
  }, [queryClient]);

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest('PUT', `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
    if (notificationData && Array.isArray(notificationData)) {
      const unreadNotifications = notificationData.filter((n: any) => !n.read);
      for (const notification of unreadNotifications) {
        markAsReadMutation.mutate(notification.id.toString());
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a40]">
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

      {/* Notifications Content with Pull-to-Refresh */}
      <PullToRefresh
        onRefresh={handleRefresh}
        style={{ backgroundColor: '#0a0a2e' }}
      >
        <div className="min-h-screen">
          {/* Notifications List */}
          {isLoading ? (
            <div className="px-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-[#1a1a40] border-[#2a2a50] p-4 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </Card>
              ))}
            </div>
          ) : notificationData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-[#1a1a40] rounded-full flex items-center justify-center mb-4">
                <CheckCheck className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 text-center">No notifications yet</p>
              <p className="text-gray-500 text-sm text-center mt-1">
                You'll see important updates here
              </p>
            </div>
          ) : (
            <div className="px-4 space-y-3">
              {notificationData
                .filter((notification: any) => 
                  activeTab === 'All' || 
                  notification.type === activeTab.toLowerCase() ||
                  (activeTab === t('system_notification') && notification.type === 'system') ||
                  (activeTab === t('latest_events') && notification.type === 'deposit') ||
                  (activeTab === t('announcement') && notification.type === 'announcement') ||
                  (activeTab === t('rewards') && notification.type === 'rewards')
                )
                .map((notification: any) => (
                  <Card 
                    key={notification._id} 
                    className={`border-[#2a2a50] p-4 ${notification.isRead ? 'bg-[#1a1a40]' : 'bg-[#1a1a40]'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-medium text-sm">{notification.title}</h3>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs mb-2 whitespace-pre-line">
                      {notification.message}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs capitalize">
                        {notification.type === 'deposit' ? 'System Notification' : notification.type}
                      </span>
                      {notification.type === 'deposit' && notification.data && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-orange-500 text-xs p-0 h-auto hover:text-orange-400"
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsReadMutation.mutate(notification._id);
                            }
                            // Navigate to asset history
                            window.location.hash = '#/mobile/assets-history';
                          }}
                        >
                          View More →
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}