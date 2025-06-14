import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Settings, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MobileNotifications() {
  const [activeTab, setActiveTab] = useState('All');

  const notificationTabs = [
    'All',
    'System Notification',
    'Latest Events',
    'Announcement',
    'Rewards'
  ];

  const handleReadAll = () => {
    // Handle mark all as read functionality
    console.log('Mark all as read');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/mobile">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-lg font-semibold">Notification</h1>
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

      {/* Empty State */}
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