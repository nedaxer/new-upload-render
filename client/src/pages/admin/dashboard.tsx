import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowDownUp,
  CircleDollarSign,
  CreditCard,
  DollarSign,
  Layers,
  RefreshCcw,
  Settings,
  TrendingUp,
  Users
} from "lucide-react";
import { Link } from "wouter";

// Dashboard statistics card component
interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: number;
  loading?: boolean;
}

function StatsCard({ title, value, description, icon, trend, loading }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 p-1.5 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-gray-200"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-gray-500">{description}</p>
        {trend !== undefined && (
          <div className={`mt-1 flex items-center text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? "+" : ""}{trend}%
            <TrendingUp className={`ml-1 h-3 w-3 ${trend >= 0 ? '' : 'rotate-180'}`} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  // Platform stats query
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/stats");
        return res.json();
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        return { 
          success: false, 
          data: { 
            totalUsers: 0,
            totalTradingVolume: 0,
            activeStakingPositions: 0,
            totalStakedValue: 0,
            recentDeposits: [],
            tradingVolumeTrend: 0,
            userGrowthRate: 0
          } 
        };
      }
    },
  });

  // Recent transactions query
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/recent-transactions"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/recent-transactions");
        return res.json();
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return { success: false, data: [] };
      }
    },
  });
  
  // Format numbers for display
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const stats = statsData?.data || {
    totalUsers: 0,
    totalTradingVolume: 0,
    activeStakingPositions: 0,
    totalStakedValue: 0,
    tradingVolumeTrend: 0,
    userGrowthRate: 0
  };
  
  const transactions = transactionsData?.data || [];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 w-full bg-gray-900 text-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-6 w-6" />
              <span className="text-lg font-bold">Admin Panel</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/admin/dashboard" className="text-sm font-medium text-white">Dashboard</Link>
            <Link href="/admin/users" className="text-sm font-medium text-gray-300 hover:text-white">Users</Link>
            <Link href="/admin/staking" className="text-sm font-medium text-gray-300 hover:text-white">Staking Rates</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-gray-800">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container flex-1 py-8 px-4 md:px-6">
        <div className="grid gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
              <p className="text-gray-500">
                Monitor and manage your cryptocurrency trading platform
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Stats grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Users"
              value={formatNumber(stats.totalUsers)}
              description="Total registered users"
              icon={<Users className="h-full w-full" />}
              trend={stats.userGrowthRate}
              loading={statsLoading}
            />
            
            <StatsCard
              title="Trading Volume (24h)"
              value={formatCurrency(stats.totalTradingVolume)}
              description="Total value of trades in the last 24 hours"
              icon={<ArrowDownUp className="h-full w-full" />}
              trend={stats.tradingVolumeTrend}
              loading={statsLoading}
            />
            
            <StatsCard
              title="Active Staking Positions"
              value={formatNumber(stats.activeStakingPositions)}
              description="Number of active staking positions"
              icon={<Layers className="h-full w-full" />}
              loading={statsLoading}
            />
            
            <StatsCard
              title="Total Staked Value"
              value={formatCurrency(stats.totalStakedValue)}
              description="Total value of staked assets"
              icon={<CreditCard className="h-full w-full" />}
              loading={statsLoading}
            />
          </div>
          
          {/* Recent transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest trading and staking activities on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCcw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction: any, index: number) => (
                    <div 
                      key={transaction.id} 
                      className={`flex items-center justify-between p-4 ${
                        index < transactions.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-2 ${
                          transaction.type === 'buy' ? "bg-green-100" : 
                          transaction.type === 'sell' ? "bg-red-100" :
                          transaction.type === 'deposit' ? "bg-blue-100" :
                          transaction.type === 'staking' ? "bg-amber-100" : "bg-gray-100"
                        }`}>
                          {transaction.type === 'buy' && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {transaction.type === 'sell' && <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />}
                          {transaction.type === 'deposit' && <CreditCard className="h-4 w-4 text-blue-600" />}
                          {transaction.type === 'staking' && <Layers className="h-4 w-4 text-amber-600" />}
                        </div>
                        
                        <div>
                          <div className="font-medium">
                            {transaction.type === 'buy' && `Bought ${transaction.amount} ${transaction.currency}`}
                            {transaction.type === 'sell' && `Sold ${transaction.amount} ${transaction.currency}`}
                            {transaction.type === 'deposit' && `Deposited ${transaction.amount} ${transaction.currency}`}
                            {transaction.type === 'staking' && `Staked ${transaction.amount} ${transaction.currency}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.user.firstName} {transaction.user.lastName} • {formatDate(transaction.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold">
                          {transaction.type === 'buy' && "-"}
                          {transaction.type === 'sell' && "+"}
                          {formatCurrency(transaction.value)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.status === 'completed' ? "Completed" : 
                           transaction.status === 'pending' ? "Pending" : 
                           transaction.status === 'failed' ? "Failed" : transaction.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <ArrowDownUp className="h-10 w-10 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
                  <p className="text-gray-500 mb-4 text-center">
                    There are no recent transactions to display
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                Export Report
              </Button>
              <Link href="/admin/transactions">
                <Button variant="link">
                  View All Transactions →
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* Quick actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-500">
                  Add, edit, or suspend user accounts. Credit USD balances and view transaction history.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/admin/users" className="w-full">
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Staking Rates</CardTitle>
                <CardDescription>
                  Configure cryptocurrency staking rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-500">
                  Set APY rates for different cryptocurrencies and minimum stake requirements.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/admin/staking" className="w-full">
                  <Button className="w-full">
                    <Layers className="h-4 w-4 mr-2" />
                    Manage Staking
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  View financial statistics and reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-500">
                  Generate reports on trading volume, fees collected, and platform growth.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}