import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft,
  ChevronRight,
  Users,
  Shield,
  DollarSign,
  Settings,
  Bell,
  HelpCircle,
  Info,
  ThumbsUp,
  Copy,
  Headphones
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export default function MobileProfile() {
  const { user, logoutMutation } = useAuth();

  const menuItems = [
    {
      icon: Users,
      label: 'Invite Friends',
      href: '/mobile/invite-friends',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    },
    {
      icon: Shield,
      label: 'Identity Verification',
      href: '/mobile/kyc',
      rightElement: (
        <div className="flex items-center space-x-2">
          <span className="text-green-500 text-sm">Lv.1 Verified</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      )
    },
    {
      icon: DollarSign,
      label: 'My Fee Rates',
      href: '/mobile/fees',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    },
    {
      icon: Settings,
      label: 'Security',
      href: '/mobile/security',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    },
    {
      icon: Users,
      label: 'Subaccount',
      href: '/mobile/subaccount',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    },
    {
      icon: Bell,
      label: 'Notification Center',
      href: '/mobile/notifications',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    },
    {
      icon: Headphones,
      label: 'Help & Contact Support',
      href: '/company/contact',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    },
    {
      icon: Info,
      label: 'About Us',
      href: '/company/about',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    },
    {
      icon: ThumbsUp,
      label: 'Rate Our App',
      href: '/mobile/rate',
      rightElement: <ChevronRight className="w-5 h-5 text-gray-400" />
    }
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <Link href="/mobile">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <div className="flex items-center space-x-3">
          <Headphones className="w-6 h-6 text-gray-400" />
          <Settings className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-4 pb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-white text-xl font-bold">
                {user?.username || 'User'}
              </h2>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-medium">
                Main Account
              </span>
              <span className="text-gray-400 text-sm">
                UID: {user?.id || '475573582'}
              </span>
              <Copy className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-1">
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <Card className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <item.icon className="w-6 h-6 text-orange-500" />
                  <span className="text-white font-medium">{item.label}</span>
                </div>
                {item.rightElement}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Account Actions */}
      <div className="px-4 py-6 space-y-3">
        <Button 
          variant="outline" 
          className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          Switch/Create Account
        </Button>
        
        <Button 
          variant="destructive" 
          className="w-full bg-red-900 hover:bg-red-800 text-white"
          onClick={() => logoutMutation.mutate()}
        >
          Log Out
        </Button>
      </div>

      {/* App Version */}
      <div className="px-4 pb-8">
        <div className="text-center text-gray-500 text-sm">
          Version 1.0.0
        </div>
      </div>
    </MobileLayout>
  );
}