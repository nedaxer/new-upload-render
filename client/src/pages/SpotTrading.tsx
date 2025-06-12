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
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  Clock,
  DollarSign,
  Plus,
  Minus
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiRequest } from "@/lib/queryClient";

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: string;
}

interface OrderbookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface Orderbook {
  symbol: string;
  bids: OrderbookEntry[];
  asks: OrderbookEntry[];
  timestamp: number;
}

interface SpotOrder {
  id: number;
  symbol: string;
  side: 'buy' | 'sell';
  type: string;
  quantity: number;
  price: number;
  status: string;
  createdAt: string;
}

export default function SpotTrading() {
  const [selectedPair, setSelectedPair] = useState("BTCUSDT");
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [chartInterval, setChartInterval] = useState("1h");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch market data
  const { data: marketData = [], isLoading: marketLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market/prices'],
    refetchInterval: 5000,
  });

  // Fetch chart data
  const { data: chartData = [], isLoading: chartLoading } = useQuery({
    queryKey: ['/api/market/chart', selectedPair.replace('USDT', '').toLowerCase(), chartInterval],
    refetchInterval: 30000,
  });

  // Fetch orderbook
  const { data: orderbook, isLoading: orderbookLoading } = useQuery<Orderbook>({
    queryKey: ['/api/market/orderbook', selectedPair],
    refetchInterval: 2000,
  });

  // Fetch user's spot orders
  const { data: userOrders = [] } = useQuery<SpotOrder[]>({
    queryKey: ['/api/spot/orders'],
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiRequest('/api/spot/order', 'POST', orderData),
    onSuccess: () => {
      toast({
        title: "Order Placed",
        description: "Your spot order has been placed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/spot/orders'] });
      setQuantity("");
      setPrice("");
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => apiRequest(`/api/spot/order/${orderId}`, 'DELETE'),
    onSuccess: () => {
      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/spot/orders'] });
    },
  });

  const currentPrice = marketData.find(m => m.symbol === selectedPair.replace('USDT', ''))?.price || 0;

  const handlePlaceOrder = () => {
    if (!quantity || (orderType === 'limit' && !price)) {
      toast({
        title: "Invalid Order",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      symbol: selectedPair,
      side: orderSide,
      type: orderType,
      quantity: parseFloat(quantity),
      ...(orderType === 'limit' && { price: parseFloat(price) }),
    };

    placeOrderMutation.mutate(orderData);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Trading Pair Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Spot Trading
            </div>
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'MATICUSDT'].map(pair => (
                  <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Last Price</Label>
              <div className="text-2xl font-bold">${currentPrice.toLocaleString()}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">24h Change</Label>
              <div className={`text-lg font-semibold flex items-center gap-1 ${marketData.find(m => m.symbol === selectedPair.replace('USDT', ''))?.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {marketData.find(m => m.symbol === selectedPair.replace('USDT', ''))?.change24h >= 0 ? 
                  <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(marketData.find(m => m.symbol === selectedPair.replace('USDT', ''))?.change24h || 0).toFixed(2)}%
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">24h Volume</Label>
              <div className="text-lg font-semibold">
                ${((marketData.find(m => m.symbol === selectedPair.replace('USDT', ''))?.volume24h || 0) / 1000000).toFixed(1)}M
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Market Status</Label>
              <Badge variant="default" className="bg-green-500">Trading</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Price Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedPair} Chart</CardTitle>
              <div className="flex gap-2">
                {["5m", "15m", "1h", "4h", "1d"].map((interval) => (
                  <Button
                    key={interval}
                    variant={chartInterval === interval ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartInterval(interval)}
                  >
                    {interval}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="timestamp" />
                  <YAxis domain={['dataMin', 'dataMax']} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="close" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Order Form */}
        <Card>
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={orderSide} onValueChange={(value) => setOrderSide(value as 'buy' | 'sell')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy" className="text-green-600">Buy</TabsTrigger>
                <TabsTrigger value="sell" className="text-red-600">Sell</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="limit">Limit</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
              </TabsList>
            </Tabs>

            {orderType === 'limit' && (
              <div className="space-y-2">
                <Label>Price (USDT)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Quantity ({selectedPair.replace('USDT', '')})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map(percentage => (
                <Button
                  key={percentage}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Calculate quantity based on percentage of available balance
                    // This would need actual balance data
                    const estimatedQty = (percentage / 100) * 1; // Placeholder
                    setQuantity(estimatedQty.toString());
                  }}
                >
                  {percentage}%
                </Button>
              ))}
            </div>

            <Button 
              className={`w-full ${orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={handlePlaceOrder}
              disabled={placeOrderMutation.isPending}
            >
              {placeOrderMutation.isPending ? 'Placing...' : `${orderSide.toUpperCase()} ${selectedPair.replace('USDT', '')}`}
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>Trading Fee: 0.1%</div>
              <div>Available: $0.00 USDT</div>
              {orderType === 'limit' && price && quantity && (
                <div>Total: ${(parseFloat(price) * parseFloat(quantity)).toFixed(2)}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orderbook and Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orderbook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Order Book
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderbookLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Asks */}
                <div>
                  <div className="text-sm font-medium text-red-600 mb-2">Asks (Sell Orders)</div>
                  <div className="space-y-1">
                    {orderbook?.asks.slice(0, 10).reverse().map((ask, index) => (
                      <div key={index} className="grid grid-cols-3 text-xs py-1 hover:bg-red-50">
                        <span className="text-red-600">${ask.price.toFixed(2)}</span>
                        <span>{ask.quantity.toFixed(4)}</span>
                        <span className="text-muted-foreground">${ask.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Price */}
                <div className="border-y py-2 text-center">
                  <div className="text-lg font-bold">${currentPrice.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Last Price</div>
                </div>

                {/* Bids */}
                <div>
                  <div className="text-sm font-medium text-green-600 mb-2">Bids (Buy Orders)</div>
                  <div className="space-y-1">
                    {orderbook?.bids.slice(0, 10).map((bid, index) => (
                      <div key={index} className="grid grid-cols-3 text-xs py-1 hover:bg-green-50">
                        <span className="text-green-600">${bid.price.toFixed(2)}</span>
                        <span>{bid.quantity.toFixed(4)}</span>
                        <span className="text-muted-foreground">${bid.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Open Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No open orders
                </div>
              ) : (
                userOrders.filter(order => order.status === 'new' || order.status === 'partially_filled').map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{order.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.side.toUpperCase()} • {order.type.toUpperCase()}
                      </div>
                      <div className="text-xs">
                        {order.quantity} @ ${order.price}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{order.status}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelOrderMutation.mutate(order.id)}
                        disabled={cancelOrderMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}