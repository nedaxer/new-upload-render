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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
  ArrowDown,
  Circle,
  CircleDollarSign,
  Clock,
  Copy,
  CornerRightDown,
  QrCode,
  RefreshCcw,
  Shield,
  Wallet,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function DepositPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCrypto, setSelectedCrypto] = useState<string>("BTC");
  
  // Wallets query
  const { 
    data: walletData, 
    isLoading: walletLoading,
    refetch: refetchWallets
  } = useQuery({
    queryKey: ["/api/wallet/addresses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/wallet/addresses");
      return res.json();
    },
  });

  // Transactions query
  const { 
    data: transactionData, 
    isLoading: transactionLoading,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ["/api/user/transactions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/transactions");
      return res.json();
    },
  });
  
  // Check deposits mutation
  const checkDepositsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/wallet/check-deposits");
      return res.json();
    },
    onSuccess: (data) => {
      // Refetch transactions and wallets
      refetchTransactions();
      queryClient.invalidateQueries({ queryKey: ["/api/user/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/dashboard"] });
      
      if (data.data.depositsFound > 0) {
        toast({
          title: "Deposits Found",
          description: `${data.data.depositsFound} new deposits have been credited to your account.`,
        });
      } else {
        toast({
          title: "No Deposits Found",
          description: "No new deposits were detected.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check for deposits",
        variant: "destructive",
      });
    },
  });
  
  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };
  
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
  
  if (walletLoading || transactionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#0033a0]"></div>
      </div>
    );
  }
  
  const wallets = walletData?.data || [];
  const transactions = transactionData?.data || [];
  
  // Filter deposit transactions
  const depositTransactions = transactions.filter((tx: any) => tx.type === 'deposit');
  
  // Get the selected wallet
  const selectedWallet = wallets.find((w: any) => 
    w.currency?.symbol === selectedCrypto
  );
  
  // Get wallet for each crypto
  const btcWallet = wallets.find((w: any) => w.currency?.symbol === 'BTC');
  const ethWallet = wallets.find((w: any) => w.currency?.symbol === 'ETH');
  const bnbWallet = wallets.find((w: any) => w.currency?.symbol === 'BNB');
  const usdtWallet = wallets.find((w: any) => w.currency?.symbol === 'USDT');
  
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
            <a href="/dashboard/deposit" className="text-sm font-medium text-[#0033a0]">Deposit</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => checkDepositsMutation.mutate()}>
              <RefreshCcw className={`h-4 w-4 ${checkDepositsMutation.isPending ? 'animate-spin' : ''}`} />
              <span>Check Deposits</span>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container flex-1 py-8 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Deposit Crypto</h1>
              <p className="text-gray-500">
                Fund your account with cryptocurrency deposits
              </p>
            </div>
            
            {/* Deposit information */}
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Deposit Addresses</CardTitle>
                  <CardDescription>
                    Use these addresses to deposit cryptocurrency to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs 
                    defaultValue={selectedCrypto} 
                    onValueChange={setSelectedCrypto}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="BTC">Bitcoin</TabsTrigger>
                      <TabsTrigger value="ETH">Ethereum</TabsTrigger>
                      <TabsTrigger value="BNB">BNB</TabsTrigger>
                      <TabsTrigger value="USDT">USDT</TabsTrigger>
                    </TabsList>
                    
                    {/* Bitcoin deposit */}
                    <TabsContent value="BTC" className="pt-4 space-y-6">
                      {btcWallet ? (
                        <>
                          <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-none bg-white p-3 border rounded-lg">
                              {btcWallet.qrCode ? (
                                <img 
                                  src={btcWallet.qrCode} 
                                  alt="Bitcoin Address QR Code" 
                                  className="w-48 h-48 object-contain"
                                />
                              ) : (
                                <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                                  <QrCode className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-4">
                              <div>
                                <h3 className="text-lg font-semibold">Bitcoin (BTC) Address</h3>
                                <p className="text-sm text-gray-500">
                                  Send only Bitcoin (BTC) to this address. Sending any other cryptocurrency may result in permanent loss.
                                </p>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-mono break-all">{btcWallet.address}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(btcWallet.address)}
                                    className="ml-2"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Network</h4>
                                <div className="flex items-center">
                                  <Circle className="h-2 w-2 text-green-500 mr-2" />
                                  <span className="text-sm">Bitcoin Mainnet</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Minimum Deposit</h4>
                                <span className="text-sm">0.0001 BTC</span>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Expected Confirmation Time</h4>
                                <span className="text-sm">2-6 confirmations (approximately 20-60 minutes)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="rounded-lg border bg-amber-50 p-4">
                            <div className="flex items-start">
                              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                              <div>
                                <h4 className="font-semibold text-amber-800">Important</h4>
                                <ul className="mt-2 space-y-2 text-sm text-amber-700">
                                  <li>Only send BTC to this address. Sending any other cryptocurrency may result in permanent loss.</li>
                                  <li>Deposits typically require 2-6 network confirmations to be credited.</li>
                                  <li>Your deposit will automatically be converted to USD and credited to your account balance.</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-10">
                          <Wallet className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No BTC Wallet Found</h3>
                          <p className="text-gray-500 mb-4">
                            Your Bitcoin wallet address has not been generated yet.
                          </p>
                          <Button
                            onClick={() => refetchWallets()}
                            disabled={walletLoading}
                          >
                            Generate Wallet Address
                            {walletLoading && <RefreshCcw className="ml-2 h-4 w-4 animate-spin" />}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* Ethereum deposit */}
                    <TabsContent value="ETH" className="pt-4 space-y-6">
                      {ethWallet ? (
                        <>
                          <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-none bg-white p-3 border rounded-lg">
                              {ethWallet.qrCode ? (
                                <img 
                                  src={ethWallet.qrCode} 
                                  alt="Ethereum Address QR Code" 
                                  className="w-48 h-48 object-contain"
                                />
                              ) : (
                                <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                                  <QrCode className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-4">
                              <div>
                                <h3 className="text-lg font-semibold">Ethereum (ETH) Address</h3>
                                <p className="text-sm text-gray-500">
                                  Send only Ethereum (ETH) to this address. Sending any other cryptocurrency may result in permanent loss.
                                </p>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-mono break-all">{ethWallet.address}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(ethWallet.address)}
                                    className="ml-2"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Network</h4>
                                <div className="flex items-center">
                                  <Circle className="h-2 w-2 text-green-500 mr-2" />
                                  <span className="text-sm">Ethereum Mainnet (ERC-20)</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Minimum Deposit</h4>
                                <span className="text-sm">0.01 ETH</span>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Expected Confirmation Time</h4>
                                <span className="text-sm">12-15 confirmations (approximately 3-5 minutes)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="rounded-lg border bg-amber-50 p-4">
                            <div className="flex items-start">
                              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                              <div>
                                <h4 className="font-semibold text-amber-800">Important</h4>
                                <ul className="mt-2 space-y-2 text-sm text-amber-700">
                                  <li>Only send ETH to this address. Sending any other cryptocurrency may result in permanent loss.</li>
                                  <li>Deposits typically require 12-15 network confirmations to be credited.</li>
                                  <li>Your deposit will automatically be converted to USD and credited to your account balance.</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-10">
                          <Wallet className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No ETH Wallet Found</h3>
                          <p className="text-gray-500 mb-4">
                            Your Ethereum wallet address has not been generated yet.
                          </p>
                          <Button
                            onClick={() => refetchWallets()}
                            disabled={walletLoading}
                          >
                            Generate Wallet Address
                            {walletLoading && <RefreshCcw className="ml-2 h-4 w-4 animate-spin" />}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* BNB deposit */}
                    <TabsContent value="BNB" className="pt-4 space-y-6">
                      {bnbWallet ? (
                        <>
                          <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-none bg-white p-3 border rounded-lg">
                              {bnbWallet.qrCode ? (
                                <img 
                                  src={bnbWallet.qrCode} 
                                  alt="BNB Address QR Code" 
                                  className="w-48 h-48 object-contain"
                                />
                              ) : (
                                <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                                  <QrCode className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-4">
                              <div>
                                <h3 className="text-lg font-semibold">BNB Address</h3>
                                <p className="text-sm text-gray-500">
                                  Send only BNB to this address. Sending any other cryptocurrency may result in permanent loss.
                                </p>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-mono break-all">{bnbWallet.address}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(bnbWallet.address)}
                                    className="ml-2"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Network</h4>
                                <div className="flex items-center">
                                  <Circle className="h-2 w-2 text-green-500 mr-2" />
                                  <span className="text-sm">BNB Smart Chain (BSC)</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Minimum Deposit</h4>
                                <span className="text-sm">0.1 BNB</span>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Expected Confirmation Time</h4>
                                <span className="text-sm">15 confirmations (approximately 3-5 minutes)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="rounded-lg border bg-amber-50 p-4">
                            <div className="flex items-start">
                              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                              <div>
                                <h4 className="font-semibold text-amber-800">Important</h4>
                                <ul className="mt-2 space-y-2 text-sm text-amber-700">
                                  <li>Only send BNB to this address. Sending any other cryptocurrency may result in permanent loss.</li>
                                  <li>Deposits typically require 15 network confirmations to be credited.</li>
                                  <li>Your deposit will automatically be converted to USD and credited to your account balance.</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-10">
                          <Wallet className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No BNB Wallet Found</h3>
                          <p className="text-gray-500 mb-4">
                            Your BNB wallet address has not been generated yet.
                          </p>
                          <Button
                            onClick={() => refetchWallets()}
                            disabled={walletLoading}
                          >
                            Generate Wallet Address
                            {walletLoading && <RefreshCcw className="ml-2 h-4 w-4 animate-spin" />}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* USDT deposit */}
                    <TabsContent value="USDT" className="pt-4 space-y-6">
                      {usdtWallet ? (
                        <>
                          <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-none bg-white p-3 border rounded-lg">
                              {usdtWallet.qrCode ? (
                                <img 
                                  src={usdtWallet.qrCode} 
                                  alt="USDT Address QR Code" 
                                  className="w-48 h-48 object-contain"
                                />
                              ) : (
                                <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                                  <QrCode className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-4">
                              <div>
                                <h3 className="text-lg font-semibold">USDT Address (ERC-20)</h3>
                                <p className="text-sm text-gray-500">
                                  Send only USDT (ERC-20) to this address. Sending any other cryptocurrency may result in permanent loss.
                                </p>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-mono break-all">{usdtWallet.address}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(usdtWallet.address)}
                                    className="ml-2"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Network</h4>
                                <div className="flex items-center">
                                  <Circle className="h-2 w-2 text-green-500 mr-2" />
                                  <span className="text-sm">Ethereum Mainnet (ERC-20)</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Minimum Deposit</h4>
                                <span className="text-sm">10 USDT</span>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Expected Confirmation Time</h4>
                                <span className="text-sm">12 confirmations (approximately 3-5 minutes)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="rounded-lg border bg-amber-50 p-4">
                            <div className="flex items-start">
                              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                              <div>
                                <h4 className="font-semibold text-amber-800">Important</h4>
                                <ul className="mt-2 space-y-2 text-sm text-amber-700">
                                  <li>Only send USDT (ERC-20) to this address. Sending any other cryptocurrency may result in permanent loss.</li>
                                  <li>Make sure you're using the Ethereum (ERC-20) network for USDT transfers.</li>
                                  <li>Your deposit will automatically be converted to USD and credited to your account balance.</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-10">
                          <Wallet className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No USDT Wallet Found</h3>
                          <p className="text-gray-500 mb-4">
                            Your USDT wallet address has not been generated yet.
                          </p>
                          <Button
                            onClick={() => refetchWallets()}
                            disabled={walletLoading}
                          >
                            Generate Wallet Address
                            {walletLoading && <RefreshCcw className="ml-2 h-4 w-4 animate-spin" />}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => checkDepositsMutation.mutate()}
                    disabled={checkDepositsMutation.isPending}
                  >
                    <RefreshCcw className={`h-4 w-4 ${checkDepositsMutation.isPending ? 'animate-spin' : ''}`} />
                    <span>Check for Deposits</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Recent deposits */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Deposits</CardTitle>
                <CardDescription>Your recent cryptocurrency deposits</CardDescription>
              </CardHeader>
              <CardContent>
                {depositTransactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Currency</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {depositTransactions.slice(0, 5).map((tx: any) => {
                        const date = new Date(tx.createdAt);
                        const formattedDate = new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(date);
                        
                        return (
                          <TableRow key={tx.id}>
                            <TableCell className="flex items-center gap-2">
                              <CornerRightDown className="h-4 w-4 text-green-500" />
                              <span>{tx.targetCurrency?.symbol || 'Unknown'}</span>
                            </TableCell>
                            <TableCell>
                              {tx.targetAmount && tx.targetCurrency 
                                ? `${formatCrypto(tx.targetAmount, tx.targetCurrency.symbol)} ${tx.targetCurrency.symbol}`
                                : '-'
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
                ) : (
                  <div className="text-center py-10">
                    <Clock className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Deposits Yet</h3>
                    <p className="text-gray-500 mb-4">
                      You haven't made any deposits yet. Use the wallet addresses above to deposit cryptocurrency.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Information</CardTitle>
                <CardDescription>Important information about crypto deposits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Processing Time</h3>
                  <p className="text-sm text-gray-600">
                    Cryptocurrency deposits require blockchain confirmations before being credited to your account. The time this takes depends on the network you're using.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Confirmation Requirements</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Bitcoin (BTC): 2-6 confirmations</li>
                    <li>Ethereum (ETH): 12-15 confirmations</li>
                    <li>BNB: 15 confirmations</li>
                    <li>USDT (ERC-20): 12 confirmations</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Minimum Deposits</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Bitcoin (BTC): 0.0001 BTC</li>
                    <li>Ethereum (ETH): 0.01 ETH</li>
                    <li>BNB: 0.1 BNB</li>
                    <li>USDT (ERC-20): 10 USDT</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Important Notes</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Only send the specified cryptocurrency to its corresponding address.</li>
                    <li>Sending a different cryptocurrency may result in permanent loss of funds.</li>
                    <li>All deposits are automatically converted to USD at current market rates.</li>
                    <li>Deposits under the minimum amount may not be credited to your account.</li>
                  </ul>
                </div>
                
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-semibold text-blue-800">Security</h4>
                      <p className="mt-2 text-sm text-blue-700">
                        Your wallet addresses are generated securely using hierarchical deterministic (HD) wallet technology with industry-standard encryption.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>Contact our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  If you're having trouble with deposits or have any questions, our support team is available 24/7 to assist you.
                </p>
                <Button className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}