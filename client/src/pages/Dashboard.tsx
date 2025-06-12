import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  BarChart3,
  Wallet,
  PieChart,
  Clock
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from "recharts";

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: string;
}

interface Portfolio {
  totalValue: number;
  dailyPnl: number;
  spotValue: number;
  futuresValue: number;
  stakingValue: number;
}

interface UserBalance {
  symbol: string;
  balance: number;
  value: number;
}

export default function Dashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");

  // Fetch market data
  const { data: marketData = [], isLoading: marketLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market/prices'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch user balances
  const { data: balances = [], isLoading: balancesLoading } = useQuery<UserBalance[]>({
    queryKey: ['/api/user/balances'],
  });

  // Mock portfolio data for demo
  const portfolioData: Portfolio = {
    totalValue: 45750.32,
    dailyPnl: 1247.89,
    spotValue: 32500.00,
    futuresValue: 8750.32,
    stakingValue: 4500.00
  };

  // Generate chart data for portfolio performance
  const generateChartData = () => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toISOString().slice(11, 16),
        value: portfolioData.totalValue + (Math.random() - 0.5) * 2000,
        pnl: portfolioData.dailyPnl + (Math.random() - 0.5) * 500
      });
    }
    return data;
  };

  const chartData = generateChartData();
  const pieData = [
    { name: 'Spot Trading', value: portfolioData.spotValue, color: '#0088FE' },
    { name: 'Futures Trading', value: portfolioData.futuresValue, color: '#00C49F' },
    { name: 'Staking Rewards', value: portfolioData.stakingValue, color: '#FFBB28' }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5.67% today
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+${portfolioData.dailyPnl.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              Last 24 hours
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <div className="text-xs text-muted-foreground">
              4 Spot • 3 Futures
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staking Rewards</CardTitle>
            <PieChart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolioData.stakingValue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              8.9% APY average
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Portfolio Performance
            </CardTitle>
            <div className="flex gap-2">
              {["1h", "24h", "7d", "30d"].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#0088FE" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                marketData.slice(0, 8).map((coin) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{coin.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{coin.symbol}</div>
                        <div className="text-xs text-muted-foreground">Vol: ${(coin.volume24h / 1000000).toFixed(1)}M</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${coin.price.toLocaleString()}</div>
                      <div className={`text-xs flex items-center gap-1 ${coin.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {coin.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(coin.change24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Portfolio Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: "Spot Buy", asset: "BTC", amount: "0.5", value: "$22,500", time: "2 minutes ago", status: "completed" },
              { type: "Futures Long", asset: "ETH", amount: "10", value: "$18,750", time: "15 minutes ago", status: "open" },
              { type: "Staking Reward", asset: "ADA", amount: "125", value: "$45.50", time: "1 hour ago", status: "completed" },
              { type: "Spot Sell", asset: "SOL", amount: "50", value: "$3,250", time: "2 hours ago", status: "completed" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <div>
                    <div className="font-medium">{activity.type} • {activity.asset}</div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{activity.value}</div>
                  <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}