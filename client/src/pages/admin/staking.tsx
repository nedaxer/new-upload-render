import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  CircleDollarSign, 
  Layers, 
  Percent, 
  PlusCircle, 
  RefreshCcw, 
  Settings
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "wouter";

export default function AdminStaking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRate, setSelectedRate] = useState<any>(null);
  const [ratePercent, setRatePercent] = useState("");
  const [minAmount, setMinAmount] = useState("");
  
  // Staking rates query
  const { data: ratesData, isLoading: ratesLoading } = useQuery({
    queryKey: ["/api/staking/rates"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/staking/rates");
        return res.json();
      } catch (error) {
        console.error("Error fetching staking rates:", error);
        return { success: false, data: [] };
      }
    },
  });
  
  // Update staking rate mutation
  const updateRateMutation = useMutation({
    mutationFn: async (data: { currencyId: number, rate: number, minAmount: number }) => {
      const res = await apiRequest("POST", "/api/admin/staking-rates", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Staking rate updated successfully",
        });
        
        // Clear the form
        setRatePercent("");
        setMinAmount("");
        
        // Refetch rates data
        queryClient.invalidateQueries({ queryKey: ["/api/staking/rates"] });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update staking rate",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Format percentage
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };
  
  // Handle rate update
  const handleUpdateRate = () => {
    if (!selectedRate) {
      toast({
        title: "Error",
        description: "No currency selected",
        variant: "destructive",
      });
      return;
    }
    
    const rateValue = parseFloat(ratePercent) / 100;
    const minValue = parseFloat(minAmount);
    
    if (isNaN(rateValue) || rateValue < 0 || rateValue > 1) {
      toast({
        title: "Error",
        description: "Please enter a valid rate percentage (0-100%)",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(minValue) || minValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid minimum amount",
        variant: "destructive",
      });
      return;
    }
    
    updateRateMutation.mutate({
      currencyId: selectedRate.currencyId,
      rate: rateValue,
      minAmount: minValue,
    });
  };
  
  const stakingRates = ratesData?.data || [];
  
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
            <Link href="/admin/dashboard" className="text-sm font-medium text-gray-300 hover:text-white">Dashboard</Link>
            <Link href="/admin/users" className="text-sm font-medium text-gray-300 hover:text-white">Users</Link>
            <Link href="/admin/staking" className="text-sm font-medium text-white">Staking Rates</Link>
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
              <h1 className="text-3xl font-bold tracking-tight">Staking Rates</h1>
              <p className="text-gray-500">
                Manage cryptocurrency staking rates
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/staking/rates"] });
                }}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Staking rates table */}
          <Card>
            <CardHeader>
              <CardTitle>Staking APY Rates</CardTitle>
              <CardDescription>
                Configure annual percentage yield rates for cryptocurrency staking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ratesLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCcw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : stakingRates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead>Current Rate (APY)</TableHead>
                      <TableHead>Min. Stake</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stakingRates.map((rate: any) => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-[#0033a0]" />
                            <span>
                              {rate.currency.name} ({rate.currency.symbol})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatPercent(rate.rate)}
                        </TableCell>
                        <TableCell>
                          {rate.minAmount} {rate.currency.symbol}
                        </TableCell>
                        <TableCell>
                          {rate.isActive ? (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedRate(rate);
                                  setRatePercent((rate.rate * 100).toString());
                                  setMinAmount(rate.minAmount.toString());
                                }}
                              >
                                <Percent className="h-4 w-4 mr-1" />
                                Update Rate
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Staking Rate</DialogTitle>
                                <DialogDescription>
                                  Configure staking rate for {selectedRate?.currency?.name} ({selectedRate?.currency?.symbol})
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="ratePercent">APY Rate (%)</Label>
                                  <div className="relative">
                                    <Input
                                      id="ratePercent"
                                      type="number"
                                      placeholder="0.00"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      value={ratePercent}
                                      onChange={(e) => setRatePercent(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500">%</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Enter the annual percentage yield (APY) for staking.
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="minAmount">Minimum Stake Amount</Label>
                                  <div className="relative">
                                    <Input
                                      id="minAmount"
                                      type="number"
                                      placeholder="0.00"
                                      min="0"
                                      step="0.000001"
                                      value={minAmount}
                                      onChange={(e) => setMinAmount(e.target.value)}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    The minimum amount required to stake this cryptocurrency.
                                  </p>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setRatePercent("");
                                    setMinAmount("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleUpdateRate}
                                  disabled={
                                    !ratePercent || 
                                    !minAmount ||
                                    isNaN(parseFloat(ratePercent)) || 
                                    isNaN(parseFloat(minAmount)) || 
                                    parseFloat(ratePercent) < 0 ||
                                    parseFloat(ratePercent) > 100 ||
                                    parseFloat(minAmount) <= 0 ||
                                    updateRateMutation.isPending
                                  }
                                >
                                  {updateRateMutation.isPending ? (
                                    <>
                                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    <>Update Rate</>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Layers className="h-10 w-10 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Staking Rates Found</h3>
                  <p className="text-gray-500 mb-4 text-center">
                    There are no staking rates configured yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Information card */}
          <Card>
            <CardHeader>
              <CardTitle>About Staking Rates</CardTitle>
              <CardDescription>
                Information about how staking rates affect the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Annual Percentage Yield (APY)</h3>
                <p className="text-sm text-gray-600">
                  The APY is the annual rate of return that users earn on their staked assets. A higher rate attracts more stakers but increases platform costs.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Minimum Stake Amount</h3>
                <p className="text-sm text-gray-600">
                  The minimum amount required for a user to begin staking a particular cryptocurrency. This helps prevent micro-stakes that would be inefficient to process.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Impact on Platform</h3>
                <p className="text-sm text-gray-600">
                  Changes to staking rates affect all new staking positions immediately. Existing staking positions will continue to earn at their original rate.
                </p>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md text-sm text-amber-800">
                <h4 className="font-semibold mb-1">Recommendation</h4>
                <p>
                  Keep staking rates competitive but sustainable. Best practice is to set APY rates between 2-6% depending on the cryptocurrency.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}