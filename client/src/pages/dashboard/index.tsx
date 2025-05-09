import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { CryptoChart, bitcoinData } from "@/components/crypto-chart";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  CircleDollarSign,
  CornerRightDown,
  CreditCard,
  DollarSign,
  Download,
  History,
  Layers,
  LayoutDashboard,
  LineChart,
  PieChart,
  Plus,
  RefreshCcw,
  Wallet,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// WebSocket connection for real-time updates
let ws: WebSocket | null = null;

export default function Dashboard() {
  const { user } = useAuth();
  const [prices, setPrices] = useState<{[key: string]: number}>({});
  const [connected, setConnected] = useState(false);
  
  // Dashboard data query
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/user/dashboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/dashboard");
      return res.json();
    },
  });
  
  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Format crypto amount with appropriate precision
  const formatCrypto = (value: number, symbol: string) => {
    let precision = 8;
    if (symbol === 'BTC') precision = 8;
    if (symbol === 'ETH') precision = 6;
    if (symbol === 'BNB') precision = 4;
    if (symbol === 'USDT') precision = 2;
    
    return value.toFixed(precision);
  };
  
  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Send ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
      
      return () => clearInterval(pingInterval);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'prices') {
          // Update price data
          const newPrices: {[key: string]: number} = {};
          data.data.forEach((price: any) => {
            newPrices[price.currency.symbol] = price.price;
          });
          setPrices(newPrices);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#0033a0]"></div>
      </div>
    );
  }
  
  const portfolioValue = dashboardData?.data?.totalPortfolioValue || 0;
  const balances = dashboardData?.data?.balances || [];
  const transactions = dashboardData?.data?.transactions || [];
  const stakingPositions = dashboardData?.data?.stakingPositions || [];
  const totalStakingEarnings = dashboardData?.data?.totalStakingEarnings || 0;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <CircleDollarSign className="h-6 w-6 text-[#0033a0]" />
              <span className="text-lg font-bold">Nedaxer</span>
            </a>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-sm font-medium">Dashboard</a>
            <a href="/dashboard/trade" className="text-sm font-medium">Trade</a>
            <a href="/dashboard/staking" className="text-sm font-medium">Stake</a>
            <a href="/dashboard/deposit" className="text-sm font-medium">Deposit</a>
          </nav>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="sr-only">User menu</span>
                  <div className="rounded-full bg-gray-200 p-1">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="container flex-1 py-8 px-4 md:px-6">
        <div className="grid gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.firstName}</h1>
              <p className="text-gray-500">
                Your crypto portfolio overview
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-1"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </div>
          
          {/* Portfolio summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Portfolio Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
                <div className="text-xs text-green-500 flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  3.2% last 24h
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  USD Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(balances.find((b: any) => b.currency.symbol === 'USD')?.balance || 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Available for trading
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Active Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {transactions.filter((t: any) => 
                    (t.type === 'trade_buy' || t.type === 'trade_sell') && 
                    new Date(t.createdAt).getTime() > Date.now() - 86400000 // Last 24h
                  ).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  In the last 24 hours
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Staking Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalStakingEarnings)}
                </div>
                <div className="text-xs text-green-500 flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  Earning daily
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {/* Balances section */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Your Assets</CardTitle>
                <CardDescription>
                  Current cryptocurrency balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Value (USD)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.map((balance: any) => {
                      const cryptoValue = balance.balance;
                      const symbol = balance.currency.symbol;
                      const price = prices[symbol] || 1; // Default to 1 for USD
                      const usdValue = symbol === 'USD' ? cryptoValue : cryptoValue * price;
                      
                      return (
                        <TableRow key={balance.id}>
                          <TableCell className="font-medium">
                            {balance.currency.name} ({symbol})
                          </TableCell>
                          <TableCell>
                            {symbol === 'USD' 
                              ? formatCurrency(cryptoValue)
                              : `${formatCrypto(cryptoValue, symbol)} ${symbol}`
                            }
                          </TableCell>
                          <TableCell>
                            {formatCurrency(usdValue)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Trade</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your crypto assets
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Deposit</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <ArrowUp className="h-4 w-4" />
                  <span>Buy Crypto</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <ArrowDown className="h-4 w-4" />
                  <span>Sell Crypto</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Layers className="h-4 w-4" />
                  <span>Stake Crypto</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <History className="h-4 w-4" />
                  <span>Transaction History</span>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Price chart */}
          <Card>
            <CardHeader>
              <CardTitle>Market Prices</CardTitle>
              <CardDescription>
                Real-time cryptocurrency price charts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bitcoin" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
                  <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
                  <TabsTrigger value="bnb">BNB</TabsTrigger>
                  <TabsTrigger value="usdt">USDT</TabsTrigger>
                </TabsList>
                <TabsContent value="bitcoin" className="p-0">
                  <div className="h-[300px]">
                    <CryptoChart
                      data={bitcoinData}
                      coinName="Bitcoin"
                      coinSymbol="BTC"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="ethereum" className="p-0">
                  <div className="h-[300px]">
                    <CryptoChart
                      data={bitcoinData} // Replace with Ethereum data
                      coinName="Ethereum"
                      coinSymbol="ETH"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="bnb" className="p-0">
                  <div className="h-[300px]">
                    <CryptoChart
                      data={bitcoinData} // Replace with BNB data
                      coinName="BNB"
                      coinSymbol="BNB"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="usdt" className="p-0">
                  <div className="h-[300px]">
                    <CryptoChart
                      data={bitcoinData} // Replace with USDT data
                      coinName="Tether USD"
                      coinSymbol="USDT"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Recent transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest cryptocurrency activity</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 5).map((tx: any) => {
                    const date = new Date(tx.createdAt);
                    const formattedDate = new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(date);
                    
                    // Format transaction type
                    let txType = '';
                    let txIcon = <Activity className="h-4 w-4 text-gray-500" />;
                    
                    if (tx.type === 'deposit') {
                      txType = 'Deposit';
                      txIcon = <CornerRightDown className="h-4 w-4 text-green-500" />;
                    } else if (tx.type === 'trade_buy') {
                      txType = 'Buy';
                      txIcon = <ArrowDown className="h-4 w-4 text-green-500" />;
                    } else if (tx.type === 'trade_sell') {
                      txType = 'Sell';
                      txIcon = <ArrowUp className="h-4 w-4 text-red-500" />;
                    } else if (tx.type === 'stake') {
                      txType = 'Stake';
                      txIcon = <Layers className="h-4 w-4 text-blue-500" />;
                    } else if (tx.type === 'unstake') {
                      txType = 'Unstake';
                      txIcon = <Layers className="h-4 w-4 text-orange-500" />;
                    } else if (tx.type === 'reward') {
                      txType = 'Reward';
                      txIcon = <DollarSign className="h-4 w-4 text-green-500" />;
                    }
                    
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="flex items-center gap-2">
                          {txIcon}
                          <span>{txType}</span>
                        </TableCell>
                        <TableCell>
                          {tx.type === 'trade_buy' || tx.type === 'stake'
                            ? `-${formatCurrency(tx.sourceAmount)}`
                            : tx.type === 'trade_sell' || tx.type === 'unstake' || tx.type === 'reward'
                              ? `+${formatCurrency(tx.targetAmount)}`
                              : tx.type === 'deposit'
                                ? `+${formatCrypto(tx.targetAmount, tx.targetCurrency.symbol)} ${tx.targetCurrency.symbol}`
                                : formatCurrency(tx.targetAmount || tx.sourceAmount)
                          }
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                            tx.status === 'completed' ? 'bg-green-100 text-green-700' : 
                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{formattedDate}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}