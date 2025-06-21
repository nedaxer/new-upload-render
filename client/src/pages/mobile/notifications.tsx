import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  cryptoSymbol?: string;
  amount?: number;
  address?: string;
  txHash?: string;
  timestamp?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('System Notification');

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    retry: false,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to asset history if it's a deposit notification
    if (notification.type === 'deposit') {
      setLocation(`/mobile/asset-history?notificationId=${notification.id}`);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) {
      return `${String(date.getHours()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else {
      return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
  };

  const notifications = (notificationsData as any)?.notifications || [];
  const systemNotifications = notifications.filter((n: Notification) => n.type === 'deposit' || n.type === 'system');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/mobile/home')}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Notification Center</h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
          <div className="px-4 text-sm text-gray-400">All 1</div>
          <button
            onClick={() => setActiveTab('System Notification')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'System Notification'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            System Notification
          </button>
          <button
            onClick={() => setActiveTab('Latest Events')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'Latest Events'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Latest Events
          </button>
          <button
            onClick={() => setActiveTab('Announcement')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'Announcement'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Announcement
          </button>
          <button
            onClick={() => setActiveTab('Reward')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'Reward'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Reward
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* System Notification Tab */}
        {activeTab === 'System Notification' && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : systemNotifications.length > 0 ? (
              systemNotifications.map((notification: Notification) => (
                <Card 
                  key={notification.id} 
                  className="bg-gray-900 border-gray-800 p-4 cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-white">{notification.title}</h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-300 mb-3 whitespace-pre-line">
                        {notification.message}
                      </div>
                      
                      {notification.cryptoSymbol && notification.amount && (
                        <div className="text-sm text-orange-500 font-medium mb-2">
                          Deposit amount: {notification.amount.toFixed(8)} {notification.cryptoSymbol}
                        </div>
                      )}
                      
                      {notification.address && (
                        <div className="text-xs text-gray-400 mb-2">
                          Deposit address: {notification.address}
                        </div>
                      )}
                      
                      {notification.timestamp && (
                        <div className="text-xs text-gray-400 mb-2">
                          Timestamp: {notification.timestamp}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {formatTimestamp(notification.createdAt)}
                        </div>
                        {notification.type === 'deposit' && (
                          <div className="flex items-center space-x-1 text-orange-500">
                            <span className="text-xs">View More</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {notification.isRead && (
                      <Check className="w-4 h-4 text-green-500 ml-3 flex-shrink-0" />
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">No notifications yet</div>
                <div className="text-sm text-gray-500">You'll see deposit confirmations and system messages here</div>
              </div>
            )}
          </div>
        )}

        {/* Other tabs - empty for now */}
        {activeTab !== 'System Notification' && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No {activeTab.toLowerCase()} yet</div>
            <div className="text-sm text-gray-500">This section is currently empty</div>
          </div>
        )}
      </div>
    </div>
  );
}