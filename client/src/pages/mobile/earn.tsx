import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Gift,
  TrendingUp,
  Clock,
  Percent,
  ChevronRight,
  Star,
  Users,
  Coins,
  Target,
  Calendar
} from 'lucide-react';
import { Link } from 'wouter';

export default function MobileEarn() {
  const earnProducts = [
    {
      title: 'Flexible Savings',
      subtitle: 'Start earning anytime',
      apy: '5.2%',
      icon: Percent,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Fixed Savings',
      subtitle: 'Higher returns, locked terms',
      apy: '8.5%',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Staking',
      subtitle: 'Stake and earn rewards',
      apy: '12.3%',
      icon: Coins,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'DeFi Mining',
      subtitle: 'Liquidity mining rewards',
      apy: '15.7%',
      icon: Target,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  const popularCoins = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      apy: '4.5%',
      minAmount: '0.001',
      duration: 'Flexible'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      apy: '5.2%',
      minAmount: '0.01',
      duration: 'Flexible'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      apy: '8.0%',
      minAmount: '10',
      duration: '30 Days'
    },
    {
      symbol: 'BNB',
      name: 'BNB',
      apy: '6.8%',
      minAmount: '0.1',
      duration: 'Flexible'
    }
  ];

  const events = [
    {
      title: 'Welcome Bonus',
      description: 'Get 50 USDT for new users',
      reward: '50 USDT',
      endDate: '7 days left',
      bgGradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Staking Challenge',
      description: 'Stake any amount and win',
      reward: '1000 USDT',
      endDate: '12 days left',
      bgGradient: 'from-blue-500 to-purple-500'
    }
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <h1 className="text-xl font-bold text-white">Earn</h1>
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-gray-400" />
          <Gift className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* Total Earnings */}
      <div className="px-4 pb-6">
        <Card className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm opacity-90">Total Earnings</div>
              <div className="text-2xl font-bold">$127.45</div>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Yesterday: +$2.34</span>
            <Button size="sm" className="bg-white/20 hover:bg-white/30 backdrop-blur">
              View Details
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-4">
          {earnProducts.map((product, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 p-4">
              <div className={`w-12 h-12 ${product.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <product.icon className={`w-6 h-6 ${product.color}`} />
              </div>
              <div className="mb-2">
                <div className="text-white font-medium">{product.title}</div>
                <div className="text-gray-400 text-sm">{product.subtitle}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-bold ${product.color}`}>APY {product.apy}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      

      {/* Popular Savings */}
      <div className="px-4 pb-6">
        <h3 className="text-white font-medium mb-4">Popular Savings</h3>
        
        <div className="space-y-3">
          {popularCoins.map((coin, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {coin.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{coin.symbol}</div>
                    <div className="text-gray-400 text-sm">{coin.name}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-green-500 font-bold">APY {coin.apy}</div>
                  <div className="text-gray-400 text-sm">Min: {coin.minAmount}</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-white text-sm">{coin.duration}</div>
                    <div className="text-gray-400 text-xs">Duration</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      

      {/* My Products */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">My Products</h3>
          <Link href="/mobile/my-earnings">
            <span className="text-orange-500 text-sm">View All</span>
          </Link>
        </div>
        
        <Card className="bg-gray-800 border-gray-700 p-4 text-center">
          <div className="text-gray-400 mb-2">No active products</div>
          <div className="text-gray-500 text-sm mb-4">Start earning with flexible savings</div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Start Earning
          </Button>
        </Card>
      </div>
    </MobileLayout>
  );
}