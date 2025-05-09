import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CircleDollarSign,
  DollarSign,
  LayoutDashboard,
  Layers,
  Users,
  Settings,
  CreditCard
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  // Statistics query
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/stats");
        return res.json();
      } catch (error) {
        // Return mock data for initial rendering
        return {
          success: true,
          data: {
            totalUsers: 0,
            totalUsdDeposited: 0,
            totalStakedValue: 0,
            totalTrades: 0
          }
        };
      }
    },
  });

  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const stats = statsData?.data || {
    totalUsers: 0,
    totalUsdDeposited: 0,
    totalStakedValue: 0,
    totalTrades: 0
  };

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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500">
              Overview of platform statistics and management
            </p>
          </div>
          
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Registered accounts
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Deposited
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalUsdDeposited)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Deposited funds in USD
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Staked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalStakedValue)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Staked assets in USD
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTrades}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Completed trades
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick actions */}
          <h2 className="text-xl font-bold mt-8 mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-[#0033a0]" />
                <CardTitle className="mt-4">Manage Users</CardTitle>
                <CardDescription>
                  View and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/admin/users">
                    Manage Users
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-[#0033a0]" />
                <CardTitle className="mt-4">Credit Balance</CardTitle>
                <CardDescription>
                  Add funds to user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/admin/users">
                    Credit Users
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Layers className="h-8 w-8 text-[#0033a0]" />
                <CardTitle className="mt-4">Staking Rates</CardTitle>
                <CardDescription>
                  Manage staking APY rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/admin/staking">
                    Manage Rates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CreditCard className="h-8 w-8 text-[#0033a0]" />
                <CardTitle className="mt-4">Deposits</CardTitle>
                <CardDescription>
                  View deposit transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  View Deposits
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}