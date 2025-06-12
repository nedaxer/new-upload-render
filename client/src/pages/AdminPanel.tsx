import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield,
  Users,
  DollarSign,
  Activity,
  Settings,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Percent
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiRequest } from "@/lib/queryClient";

interface AdminStats {
  totalUsers: number;
  totalBalance: number;
  totalTransactions: number;
  platformValue: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  kycStatus: string;
  totalPortfolioValue: number;
  createdAt: string;
}

interface Transaction {
  id: number;
  userId: number;
  type: string;
  sourceAmount: number;
  targetAmount: number;
  status: string;
  createdAt: string;
  username: string;
}

export default function AdminPanel() {
  const [creditUserId, setCreditUserId] = useState("");
  const [creditCurrency, setCreditCurrency] = useState("USDT");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [stakingCurrency, setStakingCurrency] = useState("ETH");
  const [stakingRate, setStakingRate] = useState("");
  const [stakingMinAmount, setStakingMinAmount] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000,
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch recent transactions
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/recent-transactions'],
  });

  // Credit user balance mutation
  const creditBalanceMutation = useMutation({
    mutationFn: (data: { userId: number; currencySymbol: string; amount: number; reason: string }) => 
      apiRequest('/api/admin/credit-balance', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Balance Credited",
        description: "User balance has been credited successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setCreditUserId("");
      setCreditAmount("");
      setCreditReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Credit Failed",
        description: error.message || "Failed to credit user balance",
        variant: "destructive",
      });
    },
  });

  // Update staking rates mutation
  const updateStakingRatesMutation = useMutation({
    mutationFn: (data: { currencySymbol: string; rate: number; minAmount: number }) => 
      apiRequest('/api/admin/staking-rates', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Staking Rates Updated",
        description: "Staking rates have been updated successfully",
      });
      setStakingRate("");
      setStakingMinAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update staking rates",
        variant: "destructive",
      });
    },
  });

  const handleCreditBalance = () => {
    if (!creditUserId || !creditAmount || !creditReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    creditBalanceMutation.mutate({
      userId: parseInt(creditUserId),
      currencySymbol: creditCurrency,
      amount: parseFloat(creditAmount),
      reason: creditReason
    });
  };

  const handleUpdateStakingRates = () => {
    if (!stakingRate || !stakingMinAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    updateStakingRatesMutation.mutate({
      currencySymbol: stakingCurrency,
      rate: parseFloat(stakingRate) / 100, // Convert percentage to decimal
      minAmount: parseFloat(stakingMinAmount)
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users, balances, and platform settings</p>
          </div>
        </div>
        <Badge variant="destructive" className="text-sm">
          ADMIN ACCESS
        </Badge>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <div className="text-xs text-muted-foreground">
              Registered accounts
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.platformValue || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              Assets under management
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
            <div className="text-xs text-muted-foreground">
              Completed transactions
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <div className="text-xs text-muted-foreground">
              All systems operational
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Controls */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="credit">Credit Balances</TabsTrigger>
          <TabsTrigger value="staking">Staking Rates</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">{user.firstName[0]}{user.lastName[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">ID: {user.id} • Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium">${user.totalPortfolioValue.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">Portfolio Value</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={user.isVerified ? "default" : "secondary"}>
                            {user.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                          <Badge variant="outline">
                            {user.kycStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Balances */}
        <TabsContent value="credit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Credit User Balances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <Input
                    type="number"
                    placeholder="Enter user ID"
                    value={creditUserId}
                    onChange={(e) => setCreditUserId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={creditCurrency} onValueChange={setCreditCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="BNB">BNB</SelectItem>
                      <SelectItem value="ADA">ADA</SelectItem>
                      <SelectItem value="SOL">SOL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount to credit"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  placeholder="Enter reason for crediting (required for audit trail)"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleCreditBalance}
                disabled={creditBalanceMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {creditBalanceMutation.isPending ? 'Processing...' : 'Credit User Balance'}
              </Button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Important Notice</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Crediting user balances will appear as "Deposit Successful" in their transaction history. 
                  This action is logged for audit purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staking Rates */}
        <TabsContent value="staking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Manage Staking Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={stakingCurrency} onValueChange={setStakingCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="ADA">Cardano (ADA)</SelectItem>
                      <SelectItem value="DOT">Polkadot (DOT)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                      <SelectItem value="ATOM">Cosmos (ATOM)</SelectItem>
                      <SelectItem value="MATIC">Polygon (MATIC)</SelectItem>
                      <SelectItem value="AVAX">Avalanche (AVAX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Annual Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 5.67"
                    value={stakingRate}
                    onChange={(e) => setStakingRate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Minimum Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Minimum stake amount"
                    value={stakingMinAmount}
                    onChange={(e) => setStakingMinAmount(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleUpdateStakingRates}
                disabled={updateStakingRatesMutation.isPending}
                className="w-full"
              >
                {updateStakingRatesMutation.isPending ? 'Updating...' : 'Update Staking Rate'}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Current Rates</span>
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="text-blue-700">ETH: 4.5% APY</div>
                  <div className="text-blue-700">ADA: 5.2% APY</div>
                  <div className="text-blue-700">DOT: 6.7% APY</div>
                  <div className="text-blue-700">SOL: 5.8% APY</div>
                  <div className="text-blue-700">ATOM: 7.8% APY</div>
                  <div className="text-blue-700">MATIC: 8.9% APY</div>
                  <div className="text-blue-700">AVAX: 6.3% APY</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Transactions */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 20).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${transaction.status === 'completed' ? 'bg-green-500' : transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                      <div>
                        <div className="font-medium">{transaction.type.toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground">
                          User: {transaction.username} (ID: {transaction.userId})
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${transaction.sourceAmount.toFixed(2)}</div>
                      <Badge variant={transaction.status === 'completed' ? 'default' : transaction.status === 'pending' ? 'secondary' : 'destructive'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}