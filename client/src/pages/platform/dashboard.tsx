import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Wallet, BarChart3, PiggyBank, ArrowUpRight, ArrowDownRight, Star, Bell, Settings, Menu } from 'lucide-react';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume24h?: number;
  marketCap?: number;
}

interface Portfolio {
  totalValue: number;
  totalChange: number;
  assets: {
    symbol: string;
    name: string;
    balance: number;
    value: number;
    change: number;
    logo: string;
  }[];
}

// Mobile-first responsive design
export default function TradingDashboard() {
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
  const [timeframe, setTimeframe] = useState('1D');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch market data
  const { data: markets, isLoading: marketsLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/markets'],
    refetchInterval: 5000 // Real-time updates every 5 seconds
  });

  // Mock portfolio data with real-looking values
  const portfolio: Portfolio = {
    totalValue: 24567.89,
    totalChange: 5.67,
    assets: [
      { symbol: 'BTC', name: 'Bitcoin', balance: 0.5423, value: 23450.12, change: 2.5, logo: '₿' },
      { symbol: 'ETH', name: 'Ethereum', balance: 4.2156, value: 11171.34, change: -1.2, logo: 'Ξ' },
      { symbol: 'USDT', name: 'Tether', balance: 2500.00, value: 2500.00, change: 0.1, logo: '₮' },
      { symbol: 'SOL', name: 'Solana', balance: 85.67, value: 8438.12, change: 8.9, logo: '◎' }
    ]
  };

  // Mock staking positions
  const stakingPositions = [
    { asset: 'ETH', amount: 2.0, apy: 4.2, rewards: 0.0234, status: 'Active' },
    { asset: 'SOL', amount: 50.0, apy: 6.8, rewards: 1.23, status: 'Active' },
    { asset: 'ADA', amount: 1000.0, apy: 5.1, rewards: 12.45, status: 'Active' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-[#0033a0]">Nedaxer</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Hidden on mobile unless toggled */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 lg:z-0 w-64 h-screen bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#0033a0]">Portfolio</h2>
            <div className="mt-2">
              <div className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
              <div className={`flex items-center text-sm ${portfolio.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolio.totalChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {portfolio.totalChange >= 0 ? '+' : ''}{portfolio.totalChange}%
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-3" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Wallet className="h-4 w-4 mr-3" />
              Spot Trading
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-3" />
              Futures
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <PiggyBank className="h-4 w-4 mr-3" />
              Staking
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <ArrowUpRight className="h-4 w-4 mr-3" />
              Deposit
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <ArrowDownRight className="h-4 w-4 mr-3" />
              Withdraw
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Balance</p>
                    <p className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-[#0033a0]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">24h Change</p>
                    <p className={`text-2xl font-bold ${portfolio.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolio.totalChange >= 0 ? '+' : ''}{portfolio.totalChange}%
                    </p>
                  </div>
                  {portfolio.totalChange >= 0 ? 
                    <TrendingUp className="h-8 w-8 text-green-600" /> : 
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Staking Rewards</p>
                    <p className="text-2xl font-bold text-green-600">$42.18</p>
                  </div>
                  <PiggyBank className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Open Orders</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-[#0033a0]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Trading Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Market Data & Chart */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span className="text-2xl">{selectedAsset === 'BTC' ? '₿' : selectedAsset === 'ETH' ? 'Ξ' : '₮'}</span>
                        <span>{selectedAsset}/USDT</span>
                      </CardTitle>
                      <p className="text-2xl font-bold text-green-600">
                        ${markets?.find(m => m.symbol === selectedAsset)?.price.toLocaleString() || '0.00'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {['1H', '1D', '1W', '1M'].map((tf) => (
                        <Button
                          key={tf}
                          variant={timeframe === tf ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTimeframe(tf)}
                        >
                          {tf}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Mock Chart Area */}
                  <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-[#0033a0] mx-auto mb-2" />
                      <p className="text-gray-600">Interactive Trading Chart</p>
                      <p className="text-sm text-gray-500">Real-time price data with technical indicators</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market List */}
              <Card>
                <CardHeader>
                  <CardTitle>Markets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {marketsLoading ? (
                      <div className="space-y-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gray-100 rounded animate-pulse">
                            <div className="h-4 bg-gray-300 rounded w-16"></div>
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                            <div className="h-4 bg-gray-300 rounded w-12"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      markets?.map((market) => (
                        <div
                          key={market.symbol}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedAsset === market.symbol ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedAsset(market.symbol)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#0033a0] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {market.symbol.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{market.symbol}</p>
                              <p className="text-sm text-gray-500">{market.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${market.price.toLocaleString()}</p>
                            <p className={`text-sm ${market.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {market.change >= 0 ? '+' : ''}{market.change}%
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trading Panel */}
            <div className="space-y-4">
              {/* Buy/Sell Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Trade {selectedAsset}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="buy" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="buy" className="text-green-600">Buy</TabsTrigger>
                      <TabsTrigger value="sell" className="text-red-600">Sell</TabsTrigger>
                    </TabsList>
                    <TabsContent value="buy" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Price (USDT)</label>
                        <input
                          type="number"
                          className="w-full mt-1 p-2 border rounded-lg"
                          placeholder={markets?.find(m => m.symbol === selectedAsset)?.price.toString() || '0.00'}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Amount ({selectedAsset})</label>
                        <input
                          type="number"
                          className="w-full mt-1 p-2 border rounded-lg"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Available: 2,500.00 USDT</span>
                        <span>≈ $2,500.00</span>
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Buy {selectedAsset}
                      </Button>
                    </TabsContent>
                    <TabsContent value="sell" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Price (USDT)</label>
                        <input
                          type="number"
                          className="w-full mt-1 p-2 border rounded-lg"
                          placeholder={markets?.find(m => m.symbol === selectedAsset)?.price.toString() || '0.00'}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Amount ({selectedAsset})</label>
                        <input
                          type="number"
                          className="w-full mt-1 p-2 border rounded-lg"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Available: 0.5423 {selectedAsset}</span>
                        <span>≈ $23,450.12</span>
                      </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        Sell {selectedAsset}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Staking Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PiggyBank className="h-5 w-5" />
                    <span>Staking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stakingPositions.map((position, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{position.asset}</span>
                          <Badge variant="outline" className="text-green-600">
                            {position.apy}% APY
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Staked: {position.amount} {position.asset}</p>
                          <p>Rewards: {position.rewards} {position.asset}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Star className="h-4 w-4 mr-2" />
                      Stake More Assets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}