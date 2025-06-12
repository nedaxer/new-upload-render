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
  ArrowDownCircle,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wallet,
  QrCode,
  CreditCard
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DepositAddress {
  id: number;
  address: string;
  network: string;
  currencySymbol: string;
}

interface DepositHistory {
  id: number;
  amount: number;
  currencySymbol: string;
  status: string;
  txHash: string;
  createdAt: string;
}

export default function Deposit() {
  const [selectedCurrency, setSelectedCurrency] = useState("BTC");
  const [selectedNetwork, setSelectedNetwork] = useState("mainnet");
  const [copiedAddress, setCopiedAddress] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deposit addresses
  const { data: depositAddresses = [] } = useQuery<DepositAddress[]>({
    queryKey: ['/api/user/deposit-addresses'],
  });

  // Fetch deposit history
  const { data: depositHistory = [] } = useQuery<DepositHistory[]>({
    queryKey: ['/api/user/deposit-history'],
  });

  // Generate new address mutation
  const generateAddressMutation = useMutation({
    mutationFn: (data: { currency: string; network: string }) => 
      apiRequest('/api/user/generate-deposit-address', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Address Generated",
        description: "New deposit address has been generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/deposit-addresses'] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate deposit address",
        variant: "destructive",
      });
    },
  });

  const cryptoCurrencies = [
    { symbol: "BTC", name: "Bitcoin", networks: ["mainnet", "testnet"] },
    { symbol: "ETH", name: "Ethereum", networks: ["mainnet", "testnet"] },
    { symbol: "BNB", name: "Binance Coin", networks: ["bsc", "testnet"] },
    { symbol: "ADA", name: "Cardano", networks: ["mainnet"] },
    { symbol: "DOT", name: "Polkadot", networks: ["mainnet"] },
    { symbol: "SOL", name: "Solana", networks: ["mainnet", "devnet"] },
    { symbol: "MATIC", name: "Polygon", networks: ["polygon", "mumbai"] },
    { symbol: "AVAX", name: "Avalanche", networks: ["mainnet", "fuji"] },
  ];

  const currentCurrency = cryptoCurrencies.find(c => c.symbol === selectedCurrency);
  const currentAddress = depositAddresses.find(addr => 
    addr.currencySymbol === selectedCurrency && addr.network === selectedNetwork
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      toast({
        title: "Copied",
        description: "Address copied to clipboard",
      });
      setTimeout(() => setCopiedAddress(""), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const generateQRCode = (address: string) => {
    // Generate QR code URL - using a free QR code service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowDownCircle className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">Deposit Funds</h1>
            <p className="text-muted-foreground">Add funds to your trading account</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="crypto" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
          <TabsTrigger value="fiat">Fiat Currency</TabsTrigger>
        </TabsList>

        {/* Cryptocurrency Deposits */}
        <TabsContent value="crypto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deposit Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Crypto Deposit
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

                {currentAddress ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Deposit Address</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={currentAddress.address} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(currentAddress.address)}
                        >
                          {copiedAddress === currentAddress.address ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="border rounded-lg p-4 bg-white">
                        <img 
                          src={generateQRCode(currentAddress.address)} 
                          alt="Deposit Address QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <div className="font-medium mb-1">Important Notes:</div>
                          <ul className="space-y-1 text-xs">
                            <li>• Only send {selectedCurrency} to this address</li>
                            <li>• Minimum deposit: 0.001 {selectedCurrency}</li>
                            <li>• Network: {selectedNetwork}</li>
                            <li>• Deposits require 3 confirmations</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No deposit address found for this network</p>
                    <Button 
                      onClick={() => generateAddressMutation.mutate({
                        currency: selectedCurrency,
                        network: selectedNetwork
                      })}
                      disabled={generateAddressMutation.isPending}
                    >
                      {generateAddressMutation.isPending ? 'Generating...' : 'Generate Address'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deposit Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Deposit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <div className="font-medium">Copy Address</div>
                      <div className="text-sm text-muted-foreground">Copy the deposit address or scan the QR code</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <div className="font-medium">Send Cryptocurrency</div>
                      <div className="text-sm text-muted-foreground">Send {selectedCurrency} from your external wallet to this address</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <div className="font-medium">Wait for Confirmation</div>
                      <div className="text-sm text-muted-foreground">Your deposit will be credited after network confirmations</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-2">Processing Times:</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Bitcoin (BTC): 1-6 confirmations (~10-60 min)</div>
                    <div>Ethereum (ETH): 12 confirmations (~3-5 min)</div>
                    <div>Binance Coin (BNB): 15 confirmations (~1-3 min)</div>
                    <div>Other tokens: 1-15 confirmations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fiat Deposits */}
        <TabsContent value="fiat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Fiat Deposit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Credit Card & Bank Transfer</h3>
                <p className="text-muted-foreground mb-6">
                  Deposit USD, EUR, and other fiat currencies directly to your account
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <CreditCard className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Credit Card</div>
                      <div className="text-xs text-muted-foreground">Instant • 3.5% fee</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <Wallet className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-xs text-muted-foreground">1-3 days • No fee</div>
                    </div>
                  </Button>
                </div>

                <div className="mt-6 text-sm text-muted-foreground">
                  Contact support to enable fiat deposits for your account
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deposit History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Deposits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {depositHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No deposit history found
              </div>
            ) : (
              depositHistory.slice(0, 10).map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      deposit.status === 'completed' ? 'bg-green-500' : 
                      deposit.status === 'pending' ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">
                        {deposit.amount} {deposit.currencySymbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(deposit.createdAt).toLocaleDateString()}
                      </div>
                      {deposit.txHash && (
                        <div className="text-xs text-muted-foreground font-mono">
                          TX: {deposit.txHash.slice(0, 12)}...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      deposit.status === 'completed' ? 'default' : 
                      deposit.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }>
                      {deposit.status}
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