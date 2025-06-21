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
  ArrowDown,
  ArrowUp,
  CircleDollarSign,
  DollarSign,
  RefreshCcw,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { CryptoChart, bitcoinData } from "@/components/crypto-chart";

// WebSocket connection for real-time updates
let ws: WebSocket | null = null;

export default function TradePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [prices, setPrices] = useState<{[key: string]: number}>({});
  const [connected, setConnected] = useState(false);

  // Trading state
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [selectedFromCurrency, setSelectedFromCurrency] = useState<string | null>(null);
  const [selectedToCurrency, setSelectedToCurrency] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [estimatedResult, setEstimatedResult] = useState<number | null>(null);

  // User balances query
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/user/balances"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/balances");
      return res.json();
    },
  });

  // Currencies query
  const { data: currencyData, isLoading: currencyLoading } = useQuery({
    queryKey: ["/api/trading/currencies"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/trading/currencies");
      return res.json();
    },
  });

  // Transactions query
  const { data: transactionData, isLoading: transactionLoading } = useQuery({
    queryKey: ["/api/user/transactions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/transactions");
      return res.json();
    },
  });

  // Buy crypto mutation
  const buyMutation = useMutation({
    mutationFn: async (data: { fromCurrencyId: number, toCurrencyId: number, amount: number }) => {
      const res = await apiRequest("/api/trading/buy", "POST", data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch balances and transactions
      queryClient.invalidateQueries({ queryKey: ["/api/user/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/dashboard"] });

      toast({
        title: "Success",
        description: `Successfully bought ${selectedToCurrency}`,
      });

      // Reset form
      setAmount("");
      setEstimatedResult(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to buy crypto",
        variant: "destructive",
      });
    },
  });

  // Sell crypto mutation
  const sellMutation = useMutation({
    mutationFn: async (data: { fromCurrencyId: number, toCurrencyId: number, amount: number }) => {
      const res = await apiRequest("/api/trading/sell", "POST", data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch balances and transactions
      queryClient.invalidateQueries({ queryKey: ["/api/user/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/dashboard"] });

      toast({
        title: "Success",
        description: `Successfully sold ${selectedFromCurrency}`,
      });

      // Reset form
      setAmount("");
      setEstimatedResult(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sell crypto",
        variant: "destructive",
      });
    },
  });

  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toFixed(2)}`;
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

          // Update estimated result if we have an amount and selected currencies
          if (amount && selectedFromCurrency && selectedToCurrency) {
            updateEstimatedResult(amount, selectedFromCurrency, selectedToCurrency, newPrices);
          }
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
  }, [amount, selectedFromCurrency, selectedToCurrency]);

  // Set default currencies when data loads
  useEffect(() => {
    if (currencyData?.data && currencyData.data.length > 0 && balanceData?.data) {
      if (tradeType === "buy") {
        // Default buy: USD to BTC
        const usdCurrency = currencyData.data.find((c: any) => c.symbol === "USD");
        const btcCurrency = currencyData.data.find((c: any) => c.symbol === "BTC");

        if (usdCurrency && btcCurrency) {
          setSelectedFromCurrency(usdCurrency.symbol);
          setSelectedToCurrency(btcCurrency.symbol);
        }
      } else {
        // Default sell: BTC to USD
        const usdCurrency = currencyData.data.find((c: any) => c.symbol === "USD");
        const btcCurrency = currencyData.data.find((c: any) => c.symbol === "BTC");

        if (usdCurrency && btcCurrency) {
          setSelectedFromCurrency(btcCurrency.symbol);
          setSelectedToCurrency(usdCurrency.symbol);
        }
      }
    }
  }, [currencyData, balanceData, tradeType]);

  // Update estimated result when amount or currencies change
  const updateEstimatedResult = (
    amountStr: string, 
    fromCurrency: string | null, 
    toCurrency: string | null,
    priceData = prices
  ) => {
    if (!amountStr || !fromCurrency || !toCurrency) {
      setEstimatedResult(null);
      return;
    }

    const parsedAmount = parseFloat(amountStr);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setEstimatedResult(null);
      return;
    }

    // Get prices
    const fromPrice = fromCurrency === "USD" ? 1 : priceData[fromCurrency] || 0;
    const toPrice = toCurrency === "USD" ? 1 : priceData[toCurrency] || 0;

    if (fromPrice <= 0 || toPrice <= 0) {
      setEstimatedResult(null);
      return;
    }

    // Calculate estimated result
    // If selling crypto for USD: amount * price
    // If buying crypto with USD: amount / price
    // If trading crypto to crypto: (amount * fromPrice) / toPrice
    let result;

    if (fromCurrency === "USD") {
      result = parsedAmount / toPrice;
    } else if (toCurrency === "USD") {
      result = parsedAmount * fromPrice;
    } else {
      result = (parsedAmount * fromPrice) / toPrice;
    }

    setEstimatedResult(result);
  };

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    updateEstimatedResult(newAmount, selectedFromCurrency, selectedToCurrency);
  };

  // Handle from currency change
  const handleFromCurrencyChange = (currency: string) => {
    // Don't allow same currency for from and to
    if (currency === selectedToCurrency) {
      return;
    }

    setSelectedFromCurrency(currency);
    updateEstimatedResult(amount, currency, selectedToCurrency);
  };

  // Handle to currency change
  const handleToCurrencyChange = (currency: string) => {
    // Don't allow same currency for from and to
    if (currency === selectedFromCurrency) {
      return;
    }

    setSelectedToCurrency(currency);
    updateEstimatedResult(amount, selectedFromCurrency, currency);
  };

  // Handle trade tab change
  const handleTradeTypeChange = (type: string) => {
    const newType = type as "buy" | "sell";
    setTradeType(newType);

    // Reset form
    setAmount("");
    setEstimatedResult(null);

    // Swap currencies for buy/sell
    if (selectedFromCurrency && selectedToCurrency) {
      if (newType === "buy" && selectedFromCurrency !== "USD") {
        setSelectedFromCurrency("USD");
        // Keep the to currency
      } else if (newType === "sell" && selectedToCurrency !== "USD") {
        setSelectedToCurrency("USD");
        // Keep the from currency
      }
    }
  };

  // Handle trade submission
  const handleTradeSubmit = () => {
    if (!selectedFromCurrency || !selectedToCurrency || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Get currency IDs
    const fromCurrency = currencyData?.data.find(
      (c: any) => c.symbol === selectedFromCurrency
    );
    const toCurrency = currencyData?.data.find(
      (c: any) => c.symbol === selectedToCurrency
    );

    if (!fromCurrency || !toCurrency) {
      toast({
        title: "Error",
        description: "Currency not found",
        variant: "destructive",
      });
      return;
    }

    // Check if user has enough balance
    const userBalance = balanceData?.data.find(
      (b: any) => b.currency.symbol === selectedFromCurrency
    );

    if (!userBalance || userBalance.balance < parsedAmount) {
      toast({
        title: "Error",
        description: `Insufficient ${selectedFromCurrency} balance`,
        variant: "destructive",
      });
      return;
    }

    const tradeData = {
      fromCurrencyId: fromCurrency.id,
      toCurrencyId: toCurrency.id,
      amount: parsedAmount,
    };

    if (tradeType === "buy") {
      buyMutation.mutate(tradeData);
    } else {
      sellMutation.mutate(tradeData);
    }
  };

  // Loading state
  if (balanceLoading || currencyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#0033a0]"></div>
      </div>
    );
  }

  // Get balances and currencies
  const balances = balanceData?.data || [];
  const currencies = currencyData?.data || [];
  const transactions = transactionData?.data || [];

  const usdBalance = balances.find((b: any) => b.currency.symbol === "USD")?.balance || 0;

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
            <a href="/dashboard/trade" className="text-sm font-medium text-[#0033a0]">Trade</a>
            <a href="/dashboard/staking" className="text-sm font-medium">Stake</a>
            <a href="/dashboard/deposit" className="text-sm font-medium">Deposit</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium mr-4">
              {formatCurrency(usdBalance)} USD
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Wallet className="h-4 w-4" />
              <span>Deposit</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container flex-1 py-8 px-4 md:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trade Crypto</h1>
              <p className="text-gray-500">
                Buy and sell cryptocurrencies with low fees
              </p>
            </div>

            {/* Trading card */}
            <Card>
              <CardHeader>
                <CardTitle>Exchange</CardTitle>
                <CardDescription>
                  Convert between cryptocurrencies or USD
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="buy" onValueChange={handleTradeTypeChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                  </TabsList>

                  <TabsContent value="buy" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fromCurrency">From</Label>
                        <div className="flex mt-1.5">
                          <Select
                            value={selectedFromCurrency || ""}
                            onValueChange={handleFromCurrencyChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies
                                .filter((c: any) => c.symbol === "USD") // Only USD for buying
                                .map((currency: any) => (
                                  <SelectItem
                                    key={currency.id}
                                    value={currency.symbol}
                                  >
                                    {currency.name} ({currency.symbol})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <div className="relative mt-1.5">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0.00"
                            className="w-full pl-10"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Available: {formatCurrency(usdBalance)}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="toCurrency">To</Label>
                        <div className="flex mt-1.5">
                          <Select
                            value={selectedToCurrency || ""}
                            onValueChange={handleToCurrencyChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies
                                .filter((c: any) => c.symbol !== "USD") // Exclude USD for buying target
                                .map((currency: any) => (
                                  <SelectItem
                                    key={currency.id}
                                    value={currency.symbol}
                                  >
                                    {currency.name} ({currency.symbol})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">You will receive:</span>
                          <span className="text-lg font-bold">
                            {estimatedResult !== null && selectedToCurrency
                              ? `${formatCrypto(estimatedResult, selectedToCurrency)} ${selectedToCurrency}`
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span>Exchange Rate:</span>
                          <span>
                            {selectedFromCurrency && selectedToCurrency && prices[selectedToCurrency]
                              ? `1 ${selectedFromCurrency} = ${formatCrypto(1 / prices[selectedToCurrency], selectedToCurrency)} ${selectedToCurrency}`
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sell" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fromCurrency">From</Label>
                        <div className="flex mt-1.5">
                          <Select
                            value={selectedFromCurrency || ""}
                            onValueChange={handleFromCurrencyChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies
                                .filter((c: any) => c.symbol !== "USD") // Exclude USD for selling source
                                .map((currency: any) => (
                                  <SelectItem
                                    key={currency.id}
                                    value={currency.symbol}
                                  >
                                    {currency.name} ({currency.symbol})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <div className="relative mt-1.5">
                          <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0.00"
                            className="w-full"
                            min="0"
                            step="0.000001"
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Available: {selectedFromCurrency ? 
                            `${formatCrypto(
                              balances.find((b: any) => b.currency.symbol === selectedFromCurrency)?.balance || 0,
                              selectedFromCurrency
                            )} ${selectedFromCurrency}` : 
                            "-"
                          }
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="toCurrency">To</Label>
                        <div className="flex mt-1.5">
                          <Select
                            value={selectedToCurrency || ""}
                            onValueChange={handleToCurrencyChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies
                                .filter((c: any) => c.symbol === "USD") // Only USD for selling target
                                .map((currency: any) => (
                                  <SelectItem
                                    key={currency.id}
                                    value={currency.symbol}
                                  >
                                    {currency.name} ({currency.symbol})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">You will receive:</span>
                          <span className="text-lg font-bold">
                            {estimatedResult !== null
                              ? formatCurrency(estimatedResult)
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span>Exchange Rate:</span>
                          <span>
                            {selectedFromCurrency && prices[selectedFromCurrency]
                              ? `1 ${selectedFromCurrency} = ${formatCurrency(prices[selectedFromCurrency])}`
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAmount("");
                    setEstimatedResult(null);
                  }}
                >
                  Reset
                </Button>
                <Button 
                  onClick={handleTradeSubmit}
                  disabled={
                    !selectedFromCurrency || 
                    !selectedToCurrency || 
                    !amount || 
                    parseFloat(amount) <= 0 ||
                    buyMutation.isPending ||
                    sellMutation.isPending
                  }
                >
                  {tradeType === "buy" ? "Buy" : "Sell"}
                  {(buyMutation.isPending || sellMutation.isPending) && (
                    <RefreshCcw className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Recent transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
                <CardDescription>Your latest trading activity</CardDescription>
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
                    {transactions
                      .filter((tx: any) => tx.type === 'trade_buy' || tx.type === 'trade_sell')
                      .slice(0, 5)
                      .map((tx: any) => {
                        const date = new Date(tx.createdAt);
                        const formattedDate = new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(date);

                        // Format transaction type
                        let txType = tx.type === 'trade_buy' ? 'Buy' : 'Sell';
                        let txIcon = tx.type === 'trade_buy' 
                          ? <ArrowDown className="h-4 w-4 text-green-500" />
                          : <ArrowUp className="h-4 w-4 text-red-500" />;

                        return (
                          <TableRow key={tx.id}>
                            <TableCell className="flex items-center gap-2">
                              {txIcon}
                              <span>{txType}</span>
                            </TableCell>
                            <TableCell>
                              {tx.type === 'trade_buy'
                                ? `${formatCurrency(tx.sourceAmount)} → ${formatCrypto(tx.targetAmount, tx.targetCurrency.symbol)} ${tx.targetCurrency.symbol}`
                                : `${formatCrypto(tx.sourceAmount, tx.sourceCurrency.symbol)} ${tx.sourceCurrency.symbol} → ${formatCurrency(tx.targetAmount)}`
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

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Market Overview</h2>
              <p className="text-gray-500">
                Real-time cryptocurrency prices and charts
              </p>
            </div>

            {/* Market price chart */}
            <Card>
              <CardHeader>
                <CardTitle>Bitcoin (BTC)</CardTitle>
                <CardDescription>
                  Live price chart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <CryptoChart
                    data={bitcoinData}
                    coinName="Bitcoin"
                    coinSymbol="BTC"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-gray-500">
                <div>Price: {formatCurrency(prices["BTC"] || 0)}</div>
                <div className="flex items-center text-green-500">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  2.4% (24h)
                </div>
              </CardFooter>
            </Card>

            {/* Price list */}
            <Card>
              <CardHeader>
                <CardTitle>Current Prices</CardTitle>
                <CardDescription>
                  Live cryptocurrency rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Price (USD)</TableHead>
                      <TableHead>Change (24h)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies
                      .filter((c: any) => c.symbol !== "USD")
                      .map((currency: any) => {
                        const symbol = currency.symbol;
                        const price = prices[symbol] || 0;

                        // Mock 24h change for demo
                        const changePercent = symbol === "BTC" ? 2.4 :
                                            symbol === "ETH" ? -1.2 :
                                            symbol === "BNB" ? 3.8 :
                                            0.5;

                        return (
                          <TableRow key={currency.id}>
                            <TableCell className="font-medium">
                              {currency.name} ({symbol})
                            </TableCell>
                            <TableCell>
                              {formatCurrency(price)}
                            </TableCell>
                            <TableCell>
                              <span className={`flex items-center ${
                                changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {changePercent >= 0 ? 
                                  <ArrowUp className="h-3 w-3 mr-1" /> : 
                                  <ArrowDown className="h-3 w-3 mr-1" />
                                }
                                {Math.abs(changePercent).toFixed(2)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setTradeType("buy");
                                  setSelectedFromCurrency("USD");
                                  setSelectedToCurrency(symbol);
                                  setAmount("");
                                  setEstimatedResult(null);
                                }}
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
              <CardFooter className="text-xs text-gray-500">
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}