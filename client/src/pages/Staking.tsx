import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Coins,
  TrendingUp,
  Clock,
  DollarSign,
  Calculator,
  Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiRequest } from "@/lib/queryClient";

interface StakingRate {
  id: number;
  symbol: string;
  name: string;
  rate: number;
  minAmount: number;
  isActive: boolean;
}

interface StakingPosition {
  id: number;
  symbol: string;
  amount: number;
  rate: number;
  startedAt: string;
  accumulatedRewards: number;
  status: string;
}

interface UserBalance {
  symbol: string;
  balance: number;
}

export default function Staking() {
  const [selectedCoin, setSelectedCoin] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch staking rates
  const { data: stakingRates = [] } = useQuery<StakingRate[]>({
    queryKey: ['/api/staking/rates'],
  });

  // Fetch user's staking positions
  const { data: stakingPositions = [] } = useQuery<StakingPosition[]>({
    queryKey: ['/api/staking/positions'],
    refetchInterval: 10000,
  });

  // Fetch user balances
  const { data: balances = [] } = useQuery<UserBalance[]>({
    queryKey: ['/api/user/balances'],
  });

  // Stake mutation
  const stakeMutation = useMutation({
    mutationFn: (data: { symbol: string; amount: number }) => 
      apiRequest('/api/staking/stake', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Staking Successful",
        description: "Your tokens have been staked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/staking/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
      setStakeAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Staking Failed",
        description: error.message || "Failed to stake tokens",
        variant: "destructive",
      });
    },
  });

  // Unstake mutation
  const unstakeMutation = useMutation({
    mutationFn: (data: { positionId: number; amount: number }) => 
      apiRequest('/api/staking/unstake', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Unstaking Successful",
        description: "Your tokens have been unstaked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/staking/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
      setUnstakeAmount("");
    },
  });

  // Claim rewards mutation
  const claimRewardsMutation = useMutation({
    mutationFn: (positionId: number) => 
      apiRequest('/api/staking/claim-rewards', 'POST', { positionId }),
    onSuccess: () => {
      toast({
        title: "Rewards Claimed",
        description: "Your staking rewards have been claimed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/staking/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
    },
  });

  const totalStakedValue = stakingPositions.reduce((sum, pos) => {
    const rate = stakingRates.find(r => r.symbol === pos.symbol);
    return sum + pos.amount * (rate ? 45000 : 1); // Using placeholder price for demo
  }, 0);

  const totalRewards = stakingPositions.reduce((sum, pos) => sum + pos.accumulatedRewards, 0);

  const calculateProjectedEarnings = (amount: number, rate: number, days: number) => {
    return (amount * (rate / 100) * days) / 365;
  };

  // Generate rewards chart data
  const generateRewardsChart = () => {
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        day: i + 1,
        rewards: totalRewards * (1 + (i * 0.002)), // Simulated growth
      });
    }
    return data;
  };

  const chartData = generateRewardsChart();

  return (
    <div className="p-6 space-y-6">
      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked Value</CardTitle>
            <Coins className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStakedValue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              Across {stakingPositions.length} positions
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRewards.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              All-time earnings
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.8%</div>
            <div className="text-xs text-muted-foreground">
              Weighted average
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Rewards</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.47</div>
            <div className="text-xs text-muted-foreground">
              Expected today
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Rewards Growth (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Rewards']}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="rewards" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Staking Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Staking Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Available Staking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stakingRates.map((rate) => {
              const userBalance = balances.find(b => b.symbol === rate.symbol);
              const availableBalance = userBalance?.balance || 0;
              
              return (
                <div key={rate.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">{rate.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{rate.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Min: {rate.minAmount} {rate.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{(rate.rate * 100).toFixed(1)}% APY</div>
                      <div className="text-xs text-muted-foreground">
                        Available: {availableBalance.toFixed(4)} {rate.symbol}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount to Stake</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={`Min ${rate.minAmount}`}
                        value={selectedCoin === rate.symbol ? stakeAmount : ""}
                        onChange={(e) => {
                          setSelectedCoin(rate.symbol);
                          setStakeAmount(e.target.value);
                        }}
                        max={availableBalance}
                      />
                      <Button
                        onClick={() => {
                          if (!stakeAmount || parseFloat(stakeAmount) < rate.minAmount) {
                            toast({
                              title: "Invalid Amount",
                              description: `Minimum stake amount is ${rate.minAmount} ${rate.symbol}`,
                              variant: "destructive",
                            });
                            return;
                          }
                          stakeMutation.mutate({
                            symbol: rate.symbol,
                            amount: parseFloat(stakeAmount)
                          });
                        }}
                        disabled={stakeMutation.isPending || !stakeAmount || parseFloat(stakeAmount || "0") < rate.minAmount}
                      >
                        Stake
                      </Button>
                    </div>
                  </div>

                  {selectedCoin === rate.symbol && stakeAmount && parseFloat(stakeAmount) >= rate.minAmount && (
                    <div className="bg-muted p-3 rounded text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Daily Rewards:</span>
                        <span className="font-medium">
                          ${calculateProjectedEarnings(parseFloat(stakeAmount) * 45000, rate.rate * 100, 1).toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Rewards:</span>
                        <span className="font-medium">
                          ${calculateProjectedEarnings(parseFloat(stakeAmount) * 45000, rate.rate * 100, 30).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Rewards:</span>
                        <span className="font-medium">
                          ${calculateProjectedEarnings(parseFloat(stakeAmount) * 45000, rate.rate * 100, 365).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Current Staking Positions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Your Staking Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stakingPositions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active staking positions
                </div>
              ) : (
                stakingPositions.map((position) => {
                  const daysSinceStart = Math.floor((Date.now() - new Date(position.startedAt).getTime()) / (1000 * 60 * 60 * 24));
                  const dailyReward = (position.amount * position.rate) / 365;
                  
                  return (
                    <div key={position.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{position.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{position.symbol}</div>
                            <div className="text-sm text-muted-foreground">
                              {(position.rate * 100).toFixed(1)}% APY
                            </div>
                          </div>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Staked Amount</Label>
                          <div className="font-medium">{position.amount.toFixed(4)} {position.symbol}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Days Staked</Label>
                          <div className="font-medium">{daysSinceStart} days</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Daily Rewards</Label>
                          <div className="font-medium text-green-600">${dailyReward.toFixed(4)}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Total Earned</Label>
                          <div className="font-medium text-green-600">${position.accumulatedRewards.toFixed(4)}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress to next reward</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => claimRewardsMutation.mutate(position.id)}
                          disabled={claimRewardsMutation.isPending || position.accumulatedRewards <= 0}
                        >
                          Claim Rewards (${position.accumulatedRewards.toFixed(4)})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Handle unstaking - would show modal or form
                            const amount = prompt(`Enter amount to unstake (max: ${position.amount})`);
                            if (amount && parseFloat(amount) > 0 && parseFloat(amount) <= position.amount) {
                              unstakeMutation.mutate({
                                positionId: position.id,
                                amount: parseFloat(amount)
                              });
                            }
                          }}
                          disabled={unstakeMutation.isPending}
                        >
                          Unstake
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}