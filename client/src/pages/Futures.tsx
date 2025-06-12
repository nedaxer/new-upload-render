import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  AlertTriangle,
  Activity,
  Clock,
  DollarSign,
  Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiRequest } from "@/lib/queryClient";

interface FuturesContract {
  id: number;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  leverage: number;
  tickSize: number;
  minQty: number;
  maxQty: number;
}

interface FuturesPosition {
  id: number;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number;
  pnl: number;
  unrealizedPnl: number;
  status: string;
  stopLoss?: number;
  takeProfit?: number;
}

interface FuturesOrder {
  id: number;
  symbol: string;
  side: 'buy' | 'sell';
  type: string;
  quantity: number;
  price: number;
  leverage: number;
  status: string;
  createdAt: string;
}

export default function Futures() {
  const [selectedContract, setSelectedContract] = useState("BTCUSDT");
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [leverage, setLeverage] = useState([10]);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch futures contracts
  const { data: contracts = [] } = useQuery<FuturesContract[]>({
    queryKey: ['/api/market/futures-contracts'],
  });

  // Fetch user's futures positions
  const { data: positions = [] } = useQuery<FuturesPosition[]>({
    queryKey: ['/api/futures/positions'],
    refetchInterval: 5000,
  });

  // Fetch user's futures orders
  const { data: orders = [] } = useQuery<FuturesOrder[]>({
    queryKey: ['/api/futures/orders'],
  });

  // Fetch market data for price display
  const { data: marketData = [] } = useQuery({
    queryKey: ['/api/market/prices'],
    refetchInterval: 5000,
  });

  // Place futures order mutation
  const placeOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiRequest('/api/futures/order', 'POST', orderData),
    onSuccess: () => {
      toast({
        title: "Futures Order Placed",
        description: "Your futures order has been placed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/futures/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/futures/positions'] });
      setQuantity("");
      setPrice("");
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place futures order",
        variant: "destructive",
      });
    },
  });

  // Close position mutation
  const closePositionMutation = useMutation({
    mutationFn: (data: { positionId: number; type: 'market' | 'limit'; price?: number }) => 
      apiRequest('/api/futures/close-position', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Position Closed",
        description: "Position has been closed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/futures/positions'] });
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => apiRequest(`/api/futures/order/${orderId}`, 'DELETE'),
    onSuccess: () => {
      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/futures/orders'] });
    },
  });

  const currentContract = contracts.find(c => c.symbol === selectedContract);
  const currentPrice = marketData.find((m: any) => m.symbol === selectedContract.replace('USDT', ''))?.price || 0;
  const currentLeverage = leverage[0];

  const calculateMargin = () => {
    if (!quantity || !currentPrice) return 0;
    return (parseFloat(quantity) * currentPrice) / currentLeverage;
  };

  const calculateLiquidationPrice = (side: 'buy' | 'sell') => {
    if (!quantity || !currentPrice) return 0;
    const entryPrice = orderType === 'limit' && price ? parseFloat(price) : currentPrice;
    const marginRatio = 1 / currentLeverage;
    
    if (side === 'buy') {
      return entryPrice * (1 - marginRatio);
    } else {
      return entryPrice * (1 + marginRatio);
    }
  };

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
      symbol: selectedContract,
      side: orderSide,
      type: orderType,
      quantity: parseFloat(quantity),
      leverage: currentLeverage,
      ...(orderType === 'limit' && { price: parseFloat(price) }),
    };

    placeOrderMutation.mutate(orderData);
  };

  const totalPnl = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
  const totalMargin = positions.reduce((sum, pos) => sum + pos.margin, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Futures Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unrealized PnL</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Across {positions.length} positions
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Margin Used</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMargin.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Available: $15,847.32
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <div className="text-xs text-muted-foreground">
              {positions.filter(p => p.side === 'long').length} Long • {positions.filter(p => p.side === 'short').length} Short
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Health</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <div className="text-xs text-muted-foreground">
              Margin Ratio: 15.2%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Futures Trading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Contract</Label>
              <Select value={selectedContract} onValueChange={setSelectedContract}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map(contract => (
                    <SelectItem key={contract.symbol} value={contract.symbol}>
                      {contract.symbol} (Max {contract.leverage}x)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Mark Price</Label>
                <div className="text-lg font-bold">${currentPrice.toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Leverage</Label>
                <div className="text-lg font-bold">{currentContract?.leverage || 0}x</div>
              </div>
            </div>

            <Tabs value={orderSide} onValueChange={(value) => setOrderSide(value as 'buy' | 'sell')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy" className="text-green-600">Long</TabsTrigger>
                <TabsTrigger value="sell" className="text-red-600">Short</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="limit">Limit</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label>Leverage: {currentLeverage}x</Label>
              <Slider
                value={leverage}
                onValueChange={setLeverage}
                max={currentContract?.leverage || 125}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1x</span>
                <span>{currentContract?.leverage || 125}x</span>
              </div>
            </div>

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
              <Label>Size ({selectedContract.replace('USDT', '')})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Stop Loss</Label>
                <Input
                  type="number"
                  placeholder="Optional"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Take Profit</Label>
                <Input
                  type="number"
                  placeholder="Optional"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 text-xs bg-muted p-3 rounded">
              <div className="flex justify-between">
                <span>Margin Required:</span>
                <span className="font-medium">${calculateMargin().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Liquidation Price:</span>
                <span className="font-medium">${calculateLiquidationPrice(orderSide).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Trading Fee:</span>
                <span className="font-medium">0.04%</span>
              </div>
            </div>

            <Button 
              className={`w-full ${orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={handlePlaceOrder}
              disabled={placeOrderMutation.isPending}
            >
              {placeOrderMutation.isPending ? 'Placing...' : `${orderSide === 'buy' ? 'Long' : 'Short'} ${selectedContract.replace('USDT', '')}`}
            </Button>
          </CardContent>
        </Card>

        {/* Positions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {positions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No open positions
                </div>
              ) : (
                positions.map((position) => (
                  <div key={position.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={position.side === 'long' ? 'default' : 'destructive'}>
                          {position.side.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{position.symbol}</span>
                        <span className="text-sm text-muted-foreground">{position.leverage}x</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => closePositionMutation.mutate({ 
                            positionId: position.id, 
                            type: 'market' 
                          })}
                          disabled={closePositionMutation.isPending}
                        >
                          Close Market
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Size</Label>
                        <div className="font-medium">{position.size}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Entry Price</Label>
                        <div className="font-medium">${position.entryPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Mark Price</Label>
                        <div className="font-medium">${position.markPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Unrealized PnL</Label>
                        <div className={`font-medium ${position.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {(position.stopLoss || position.takeProfit) && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {position.stopLoss && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Stop Loss</Label>
                            <div className="font-medium text-red-600">${position.stopLoss.toFixed(2)}</div>
                          </div>
                        )}
                        {position.takeProfit && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Take Profit</Label>
                            <div className="font-medium text-green-600">${position.takeProfit.toFixed(2)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
            {orders.filter(order => order.status === 'new' || order.status === 'partially_filled').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No open orders
              </div>
            ) : (
              orders.filter(order => order.status === 'new' || order.status === 'partially_filled').map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                      {order.side === 'buy' ? 'LONG' : 'SHORT'}
                    </Badge>
                    <div>
                      <div className="font-medium">{order.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.type.toUpperCase()} • {order.leverage}x
                      </div>
                    </div>
                    <div className="text-sm">
                      <div>{order.quantity} @ ${order.price}</div>
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
  );
}