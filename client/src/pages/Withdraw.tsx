import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowUpCircle,
  AlertTriangle,
  Clock,
  Wallet,
  CreditCard,
  Shield,
  Calculator
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface UserBalance {
  symbol: string;
  balance: number;
  value: number;
}

interface WithdrawHistory {
  id: number;
  amount: number;
  currencySymbol: string;
  address: string;
  status: string;
  fee: number;
  txHash: string;
  createdAt: string;
}

export default function Withdraw() {
  const [selectedCurrency, setSelectedCurrency] = useState("BTC");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("mainnet");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user balances
  const { data: balances = [] } = useQuery<UserBalance[]>({
    queryKey: ['/api/user/balances'],
  });

  // Fetch withdrawal history
  const { data: withdrawHistory = [] } = useQuery<WithdrawHistory[]>({
    queryKey: ['/api/user/withdraw-history'],
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: (data: { 
      currency: string; 
      amount: number; 
      address: string; 
      network: string;
      twoFactorCode?: string;
    }) => apiRequest('/api/user/withdraw', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/withdraw-history'] });
      setWithdrawAmount("");
      setWithdrawAddress("");
      setTwoFactorCode("");
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const cryptoCurrencies = [
    { symbol: "BTC", name: "Bitcoin", networks: ["mainnet", "testnet"], minWithdraw: 0.001, fee: 0.0005 },
    { symbol: "ETH", name: "Ethereum", networks: ["mainnet", "testnet"], minWithdraw: 0.01, fee: 0.005 },
    { symbol: "BNB", name: "Binance Coin", networks: ["bsc", "testnet"], minWithdraw: 0.1, fee: 0.01 },
    { symbol: "ADA", name: "Cardano", networks: ["mainnet"], minWithdraw: 10, fee: 1 },
    { symbol: "DOT", name: "Polkadot", networks: ["mainnet"], minWithdraw: 1, fee: 0.1 },
    { symbol: "SOL", name: "Solana", networks: ["mainnet", "devnet"], minWithdraw: 0.1, fee: 0.01 },
    { symbol: "MATIC", name: "Polygon", networks: ["polygon", "mumbai"], minWithdraw: 10, fee: 1 },
    { symbol: "AVAX", name: "Avalanche", networks: ["mainnet", "fuji"], minWithdraw: 0.1, fee: 0.01 },
  ];

  const currentCurrency = cryptoCurrencies.find(c => c.symbol === selectedCurrency);
  const currentBalance = balances.find(b => b.symbol === selectedCurrency);
  const availableBalance = currentBalance?.balance || 0;
  const withdrawalFee = currentCurrency?.fee || 0;
  const minWithdraw = currentCurrency?.minWithdraw || 0;

  const calculateReceiveAmount = () => {
    const amount = parseFloat(withdrawAmount || "0");
    return Math.max(0, amount - withdrawalFee);
  };

  const isValidWithdrawal = () => {
    const amount = parseFloat(withdrawAmount || "0");
    return amount >= minWithdraw && 
           amount <= availableBalance && 
           withdrawAddress.length > 10;
  };

  const handleWithdraw = () => {
    if (!isValidWithdrawal()) {
      toast({
        title: "Invalid Withdrawal",
        description: "Please check the withdrawal amount and address",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      currency: selectedCurrency,
      amount: parseFloat(withdrawAmount),
      address: withdrawAddress,
      network: selectedNetwork,
      twoFactorCode: twoFactorCode || undefined
    });
  };

  const setMaxAmount = () => {
    const maxAmount = Math.max(0, availableBalance - withdrawalFee);
    setWithdrawAmount(maxAmount.toString());
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowUpCircle className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold">Withdraw Funds</h1>
            <p className="text-muted-foreground">Send your cryptocurrencies to external wallets</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="crypto" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
          <TabsTrigger value="fiat">Fiat Currency</TabsTrigger>
        </TabsList>

        {/* Cryptocurrency Withdrawals */}
        <TabsContent value="crypto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Withdrawal Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Crypto Withdrawal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Currency</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoCurrencies.map(currency => (
                        <SelectItem key={currency.symbol} value={currency.symbol}>
                          {currency.name} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground">
                    Available: {availableBalance.toFixed(6)} {selectedCurrency}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Network</Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCurrency?.networks.map(network => (
                        <SelectItem key={network} value={network}>
                          {network.charAt(0).toUpperCase() + network.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Withdrawal Address</Label>
                  <Input
                    placeholder={`Enter ${selectedCurrency} address`}
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <div className="text-xs text-muted-foreground">
                    Make sure the address is correct. Transactions cannot be reversed.
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={availableBalance}
                      step="0.000001"
                    />
                    <Button variant="outline" onClick={setMaxAmount}>
                      Max
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Min: {minWithdraw} {selectedCurrency} • Fee: {withdrawalFee} {selectedCurrency}
                  </div>
                </div>

                {/* 2FA Code (optional for demo) */}
                <div className="space-y-2">
                  <Label>2FA Code (Optional)</Label>
                  <Input
                    placeholder="Enter 6-digit code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    maxLength={6}
                  />
                </div>

                {/* Transaction Summary */}
                {withdrawAmount && (
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Withdrawal Amount:</span>
                      <span className="font-medium">{withdrawAmount} {selectedCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network Fee:</span>
                      <span className="font-medium">{withdrawalFee} {selectedCurrency}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>You will receive:</span>
                      <span className="text-green-600">{calculateReceiveAmount().toFixed(6)} {selectedCurrency}</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending || !isValidWithdrawal()}
                >
                  {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
                </Button>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <div className="font-medium mb-1">Security Notice:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• Double-check the withdrawal address</li>
                        <li>• Transactions are irreversible</li>
                        <li>• Allow 10-60 minutes for processing</li>
                        <li>• Large amounts may require manual review</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Limits & Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Withdrawal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Account Limits */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">Daily Withdrawal Limits</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Unverified Account:</span>
                      <span className="font-medium">$1,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>KYC Verified:</span>
                      <span className="font-medium">$50,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>VIP Account:</span>
                      <span className="font-medium">$500,000</span>
                    </div>
                  </div>
                </div>

                {/* Network Fees */}
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-3">Network Fees</div>
                  <div className="space-y-2 text-sm">
                    {cryptoCurrencies.map(currency => (
                      <div key={currency.symbol} className="flex justify-between">
                        <span>{currency.symbol}:</span>
                        <span className="font-medium">{currency.fee} {currency.symbol}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Processing Times */}
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-3">Processing Times</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Bitcoin (BTC): 10-60 minutes</div>
                    <div>Ethereum (ETH): 5-15 minutes</div>
                    <div>Binance Coin (BNB): 1-5 minutes</div>
                    <div>Other tokens: 5-30 minutes</div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-3">Security Features</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-3 w-3 text-green-600" />
                      <span>2FA Protection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-3 w-3 text-green-600" />
                      <span>Email Confirmation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-3 w-3 text-green-600" />
                      <span>Address Whitelist</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-3 w-3 text-green-600" />
                      <span>Anti-Phishing Code</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fiat Withdrawals */}
        <TabsContent value="fiat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Fiat Withdrawal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Bank Transfer</h3>
                <p className="text-muted-foreground mb-6">
                  Withdraw USD, EUR, and other fiat currencies to your bank account
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <Wallet className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-xs text-muted-foreground">1-3 days • $25 fee</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <CreditCard className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Wire Transfer</div>
                      <div className="text-xs text-muted-foreground">Same day • $50 fee</div>
                    </div>
                  </Button>
                </div>

                <div className="mt-6 text-sm text-muted-foreground">
                  Complete KYC verification to enable fiat withdrawals
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Withdrawals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {withdrawHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No withdrawal history found
              </div>
            ) : (
              withdrawHistory.slice(0, 10).map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      withdrawal.status === 'completed' ? 'bg-green-500' : 
                      withdrawal.status === 'pending' ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">
                        {withdrawal.amount} {withdrawal.currencySymbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        To: {withdrawal.address.slice(0, 12)}...{withdrawal.address.slice(-8)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(withdrawal.createdAt).toLocaleString()} • Fee: {withdrawal.fee} {withdrawal.currencySymbol}
                      </div>
                      {withdrawal.txHash && (
                        <div className="text-xs text-muted-foreground font-mono">
                          TX: {withdrawal.txHash.slice(0, 12)}...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      withdrawal.status === 'completed' ? 'default' : 
                      withdrawal.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }>
                      {withdrawal.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}