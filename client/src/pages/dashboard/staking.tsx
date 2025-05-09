import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowRight,
  CheckSquare,
  CircleDollarSign,
  Clock,
  DollarSign,
  InfoIcon,
  Layers,
  PercentIcon,
  RefreshCcw,
  Shield,
  Sparkles,
  Timer,
  Trophy,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function StakingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Staking form state
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [stakingAmount, setStakingAmount] = useState<string>("");
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(null);
  
  // Staking rates query
  const { data: stakingRatesData, isLoading: stakingRatesLoading } = useQuery({
    queryKey: ["/api/staking/rates"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/staking/rates");
      return res.json();
    },
  });

  // User balances query
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/user/balances"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/balances");
      return res.json();
    },
  });
  
  // User staking positions query
  const { data: positionsData, isLoading: positionsLoading } = useQuery({
    queryKey: ["/api/staking/positions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/staking/positions");
      return res.json();
    },
  });
  
  // Stake mutation
  const stakeMutation = useMutation({
    mutationFn: async (data: { currencyId: number, amount: number }) => {
      const res = await apiRequest("POST", "/api/staking/stake", data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/user/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staking/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/dashboard"] });
      
      toast({
        title: "Success",
        description: `Successfully staked ${stakingAmount} ${selectedCurrency}`,
      });
      
      // Reset form
      setStakingAmount("");
      setSelectedCurrency(null);
      setSelectedCurrencyId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to stake currency",
        variant: "destructive",
      });
    },
  });
  
  // Unstake mutation
  const unstakeMutation = useMutation({
    mutationFn: async (positionId: number) => {
      const res = await apiRequest("POST", `/api/staking/unstake/${positionId}`);
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/user/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/staking/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/dashboard"] });
      
      const { unstaked } = data.data;
      toast({
        title: "Success",
        description: `Successfully unstaked ${unstaked.principal} ${unstaked.currency.symbol} with ${unstaked.rewards} ${unstaked.currency.symbol} rewards`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unstake",
        variant: "destructive",
      });
    },
  });
  
  // Process rewards mutation
  const processRewardsMutation = useMutation({
    mutationFn: async (positionId: number) => {
      const res = await apiRequest("POST", `/api/staking/rewards/${positionId}`);
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/staking/positions"] });
      
      toast({
        title: "Rewards Updated",
        description: `Earned ${parseFloat(data.data.reward).toFixed(8)} in rewards`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process rewards",
        variant: "destructive",
      });
    },
  });
  
  // When staking rates load, set default currency
  useEffect(() => {
    if (stakingRatesData?.data && stakingRatesData.data.length > 0 && !selectedCurrency) {
      const defaultRate = stakingRatesData.data[0];
      setSelectedCurrency(defaultRate.currency.symbol);
      setSelectedCurrencyId(defaultRate.currencyId);
    }
  }, [stakingRatesData, selectedCurrency]);
  
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
    
    return value.toFixed(precision);
  };
  
  // Format percentage
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };
  
  // Calculate expected annual rewards
  const calculateAnnualRewards = (amount: number, rate: number) => {
    return amount * rate;
  };
  
  // Handle currency selection
  const handleCurrencyChange = (symbol: string) => {
    setSelectedCurrency(symbol);
    
    // Find currency ID
    const currency = stakingRatesData?.data.find((r: any) => r.currency.symbol === symbol);
    setSelectedCurrencyId(currency?.currencyId || null);
    
    // Reset amount
    setStakingAmount("");
  };
  
  // Handle staking submission
  const handleStakeSubmit = () => {
    if (!selectedCurrencyId || !stakingAmount) {
      toast({
        title: "Error",
        description: "Please select a currency and enter an amount",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(stakingAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    // Find staking rate
    const stakingRate = stakingRatesData?.data.find(
      (r: any) => r.currencyId === selectedCurrencyId
    );
    
    // Check min amount
    if (stakingRate && amount < stakingRate.minAmount) {
      toast({
        title: "Error",
        description: `Minimum staking amount is ${stakingRate.minAmount} ${selectedCurrency}`,
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has enough balance
    const userBalance = balanceData?.data.find(
      (b: any) => b.currency.symbol === selectedCurrency
    );
    
    if (!userBalance || userBalance.balance < amount) {
      toast({
        title: "Error",
        description: `Insufficient ${selectedCurrency} balance`,
        variant: "destructive",
      });
      return;
    }
    
    stakeMutation.mutate({
      currencyId: selectedCurrencyId,
      amount,
    });
  };
  
  // Handle unstake
  const handleUnstake = (positionId: number) => {
    unstakeMutation.mutate(positionId);
  };
  
  // Handle process rewards
  const handleProcessRewards = (positionId: number) => {
    processRewardsMutation.mutate(positionId);
  };
  
  // Format time remaining
  const formatTimeRemaining = (position: any) => {
    if (!position.endsAt) {
      return "No lock period";
    }
    
    const now = new Date();
    const endDate = new Date(position.endsAt);
    const timeRemaining = endDate.getTime() - now.getTime();
    
    if (timeRemaining <= 0) {
      return "Completed";
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h remaining`;
  };
  
  // Loading state
  if (stakingRatesLoading || balanceLoading || positionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#0033a0]"></div>
      </div>
    );
  }
  
  // Get data
  const stakingRates = stakingRatesData?.data || [];
  const balances = balanceData?.data || [];
  const stakingPositions = positionsData?.data || [];
  
  // Get balance for selected currency
  const selectedBalance = balances.find(
    (b: any) => b.currency.symbol === selectedCurrency
  )?.balance || 0;
  
  // Get staking rate for selected currency
  const selectedRate = stakingRates.find(
    (r: any) => r.currency.symbol === selectedCurrency
  );
  
  // Calculate total staked value
  const totalStakedValue = stakingPositions.reduce((total: number, position: any) => {
    // Find staking rate to get USD value
    const rate = stakingRates.find(
      (r: any) => r.currencyId === position.currencyId
    );
    
    if (!rate) return total;
    
    // Convert to USD based on some exchange rate logic
    // This is simplified; in a real app, you'd use real exchange rates
    let usdValue = position.amount;
    if (position.currency.symbol === 'BTC') {
      usdValue = position.amount * 50000; // Example BTC price
    } else if (position.currency.symbol === 'ETH') {
      usdValue = position.amount * 3000; // Example ETH price
    } else if (position.currency.symbol === 'BNB') {
      usdValue = position.amount * 300; // Example BNB price
    }
    
    return total + usdValue;
  }, 0);
  
  // Calculate total rewards
  const totalRewards = stakingPositions.reduce(
    (total: number, position: any) => total + position.accumulatedRewards,
    0
  );
  
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
            <a href="/dashboard/staking" className="text-sm font-medium text-[#0033a0]">Stake</a>
            <a href="/dashboard/deposit" className="text-sm font-medium">Deposit</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-sm text-green-600 font-medium">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-1 text-green-500" />
                Staking Rewards: {formatCurrency(totalRewards)}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container flex-1 py-8 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Crypto Staking</h1>
              <p className="text-gray-500">
                Earn rewards by staking your cryptocurrency
              </p>
            </div>
            
            {/* Staking stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Staked Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalStakedValue)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Across {stakingPositions.length} active positions
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalRewards)}</div>
                  <div className="text-xs text-green-500 flex items-center mt-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Earning daily rewards
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Available Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stakingRates.length}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Cryptocurrencies available for staking
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Active staking positions */}
            <Card>
              <CardHeader>
                <CardTitle>Your Staking Positions</CardTitle>
                <CardDescription>
                  Active cryptocurrency staking positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stakingPositions.length > 0 ? (
                  <div className="space-y-6">
                    {stakingPositions.map((position: any) => (
                      <div 
                        key={position.id} 
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-[#0033a0]" />
                            <h3 className="font-semibold">{position.currency.name} ({position.currency.symbol})</h3>
                          </div>
                          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                            {formatPercent(position.rate)} APY
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Staked Amount</div>
                            <div className="font-semibold">
                              {formatCrypto(position.amount, position.currency.symbol)} {position.currency.symbol}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Accumulated Rewards</div>
                            <div className="font-semibold text-green-600">
                              +{formatCrypto(position.accumulatedRewards, position.currency.symbol)} {position.currency.symbol}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Started</div>
                            <div className="font-semibold">
                              {new Date(position.startedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Status</div>
                            <div className="font-semibold flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-blue-500" />
                              {formatTimeRemaining(position)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between gap-4">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleProcessRewards(position.id)}
                            disabled={processRewardsMutation.isPending}
                          >
                            {processRewardsMutation.isPending ? (
                              <>
                                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Update Rewards
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleUnstake(position.id)}
                            disabled={unstakeMutation.isPending}
                          >
                            {unstakeMutation.isPending ? (
                              <>
                                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                                Unstaking...
                              </>
                            ) : (
                              <>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Unstake
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Layers className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Staking</h3>
                    <p className="text-gray-500 mb-4">
                      You don't have any active staking positions. Start staking your crypto to earn rewards.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Staking form */}
            <Card>
              <CardHeader>
                <CardTitle>Stake Cryptocurrency</CardTitle>
                <CardDescription>
                  Earn rewards by staking your crypto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Select Currency</Label>
                  <Select
                    value={selectedCurrency || ""}
                    onValueChange={handleCurrencyChange}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {stakingRates.map((rate: any) => (
                        <SelectItem
                          key={rate.id}
                          value={rate.currency.symbol}
                        >
                          {rate.currency.name} ({rate.currency.symbol}) - {formatPercent(rate.rate)} APY
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCurrency && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="amount">Staking Amount</Label>
                        <span className="text-xs text-gray-500">
                          Available: {formatCrypto(selectedBalance, selectedCurrency)} {selectedCurrency}
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          value={stakingAmount}
                          onChange={(e) => setStakingAmount(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.000001"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <span className="text-gray-500">{selectedCurrency}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <div className="flex justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            if (selectedBalance > 0) {
                              setStakingAmount((selectedBalance * 0.25).toString());
                            }
                          }}
                        >
                          25%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            if (selectedBalance > 0) {
                              setStakingAmount((selectedBalance * 0.5).toString());
                            }
                          }}
                        >
                          50%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            if (selectedBalance > 0) {
                              setStakingAmount((selectedBalance * 0.75).toString());
                            }
                          }}
                        >
                          75%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            if (selectedBalance > 0) {
                              setStakingAmount(selectedBalance.toString());
                            }
                          }}
                        >
                          Max
                        </Button>
                      </div>
                    </div>
                    
                    {selectedRate && stakingAmount && !isNaN(parseFloat(stakingAmount)) && (
                      <div className="rounded-lg border p-4 space-y-3">
                        <h4 className="font-semibold">Staking Preview</h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500">Annual Rate (APY)</div>
                          <div className="text-right font-medium text-green-600">
                            {formatPercent(selectedRate.rate)}
                          </div>
                          
                          <div className="text-gray-500">Minimum Stake</div>
                          <div className="text-right font-medium">
                            {selectedRate.minAmount} {selectedCurrency}
                          </div>
                          
                          <div className="text-gray-500">Lock Period</div>
                          <div className="text-right font-medium">
                            None (Flexible)
                          </div>
                          
                          <div className="text-gray-500">Rewards Distribution</div>
                          <div className="text-right font-medium">
                            Real-time Accumulation
                          </div>
                          
                          <div className="border-t pt-2 text-gray-500">Annual Reward Estimate</div>
                          <div className="border-t pt-2 text-right font-medium text-green-600">
                            {formatCrypto(
                              calculateAnnualRewards(
                                parseFloat(stakingAmount),
                                selectedRate.rate
                              ),
                              selectedCurrency
                            )} {selectedCurrency}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStakingAmount("");
                  }}
                >
                  Reset
                </Button>
                <Button 
                  onClick={handleStakeSubmit}
                  disabled={
                    !selectedCurrencyId || 
                    !stakingAmount || 
                    isNaN(parseFloat(stakingAmount)) || 
                    parseFloat(stakingAmount) <= 0 ||
                    stakeMutation.isPending
                  }
                >
                  {stakeMutation.isPending ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Staking...
                    </>
                  ) : (
                    <>
                      Stake {selectedCurrency}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Staking rates */}
            <Card>
              <CardHeader>
                <CardTitle>Available Staking Options</CardTitle>
                <CardDescription>
                  Current staking rates and rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>APY</TableHead>
                      <TableHead>Min. Stake</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stakingRates.map((rate: any) => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">
                          {rate.currency.symbol}
                        </TableCell>
                        <TableCell className="text-green-600">
                          {formatPercent(rate.rate)}
                        </TableCell>
                        <TableCell>
                          {rate.minAmount} {rate.currency.symbol}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* How staking works */}
            <Card>
              <CardHeader>
                <CardTitle>How Staking Works</CardTitle>
                <CardDescription>
                  Learn about crypto staking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-100 p-1 rounded-full">
                      <Layers className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">What is Staking?</h4>
                      <p className="text-sm text-gray-600">
                        Staking is like earning interest on your crypto assets. By staking, you're helping to maintain blockchain networks while earning rewards.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="bg-green-100 p-1 rounded-full">
                      <PercentIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Earn Passive Income</h4>
                      <p className="text-sm text-gray-600">
                        Our staking program offers competitive APY rates, allowing you to generate passive income from your crypto holdings.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="bg-amber-100 p-1 rounded-full">
                      <Timer className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Flexible Staking</h4>
                      <p className="text-sm text-gray-600">
                        Our staking is flexible with no lock-up period. You can unstake your crypto at any time and access your funds immediately.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="bg-purple-100 p-1 rounded-full">
                      <Trophy className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Real-time Rewards</h4>
                      <p className="text-sm text-gray-600">
                        Your staking rewards accumulate in real-time. You can track your earnings and update your reward balance at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}