import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Bell, 
  Headphones, 
  ChevronDown, 
  Eye, 
  EyeOff,
  Wallet,
  ArrowUp,
  ArrowDownUp,
  CreditCard,
  Gift,
  Users,
  MessageSquare,
  MoreHorizontal,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

export default function MobileHome() {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Exchange');

  const quickActions = [
    { name: 'Nedaxer Earn', icon: Gift, color: 'text-yellow-500' },
    { name: 'Invite Friends', icon: Users, color: 'text-green-500' }
  ];

  const cryptoPairs = [
    { 
      pair: 'BTC/USDT', 
      price: '105,224.9', 
      change: '-1.61%', 
      isPositive: false,
      favorite: true 
    },
    { 
      pair: 'ETH/USDT', 
      price: '2,536.64', 
      change: '-5.79%', 
      isPositive: false 
    },
    { 
      pair: 'APEX/USDT', 
      price: '0.2039', 
      change: '-11.46%', 
      isPositive: false 
    },
    { 
      pair: 'MNT/USDT', 
      price: '0.6437', 
      change: '-2.63%', 
      isPositive: false 
    }
  ];

  const marketTabs = ['Favorites', 'Hot', 'New', 'Gainers', 'Losers', 'Turnover'];

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <div className="flex items-center space-x-3">
          <Link href="/mobile/profile">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors">
              <span className="text-white text-sm font-bold">N</span>
            </div>
          </Link>
          <div className="flex space-x-2">
            <Button 
              variant={selectedTab === 'Exchange' ? 'default' : 'ghost'} 
              size="sm"
              className="text-xs bg-gray-700 hover:bg-gray-600"
            >
              Exchange
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Headphones className="w-6 h-6 text-gray-400" />
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">14</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="BDXN/USDT"
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
              <div className="w-3 h-3 grid grid-cols-2 gap-px">
                <div className="bg-gray-400 rounded-sm"></div>
                <div className="bg-gray-400 rounded-sm"></div>
                <div className="bg-gray-400 rounded-sm"></div>
                <div className="bg-gray-400 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Section */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Total Assets</span>
            <button onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? (
                <Eye className="w-4 h-4 text-gray-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6">
            Deposit
          </Button>
        </div>
        
        <div className="mb-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">
              {showBalance ? '0.51' : '****'}
            </span>
            <span className="text-gray-400">USD</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <span>≈ {showBalance ? '0.00000484' : '****'} BTC</span>
          </div>
        </div>

        {/* Promotional Banner */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-orange-500" />
              <span className="text-white">Apply Now!</span>
            </div>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <span className="text-xs text-gray-300 text-center">{action.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Market Tabs */}
      <div className="px-4">
        <div className="flex space-x-4 mb-4 overflow-x-auto scrollbar-hide">
          {marketTabs.map((tab) => (
            <button 
              key={tab}
              className={`whitespace-nowrap pb-2 ${
                tab === 'Favorites' 
                  ? 'text-orange-500 border-b-2 border-orange-500' 
                  : 'text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex space-x-4 mb-4">
          <button className="text-orange-500 border-b-2 border-orange-500 pb-2 font-medium">
            Spot
          </button>
          <button className="text-gray-400 pb-2">
            Derivatives
          </button>
        </div>

        {/* Crypto Pairs List */}
        <div className="space-y-4">
          {cryptoPairs.map((crypto, index) => (
            <Link key={index} href="/mobile/trade">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {crypto.favorite && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    )}
                    <span className="text-white font-medium">{crypto.pair}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{crypto.price}</div>
                  <div className={`text-sm flex items-center space-x-1 ${
                    crypto.isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {crypto.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{crypto.change}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}