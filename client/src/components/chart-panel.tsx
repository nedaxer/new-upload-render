import { useState } from 'react';
import { GlobalChartContainer } from '@/components/global-chart-container';
import { useGlobalChartContext } from '@/contexts/global-chart-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface ChartPanelProps {
  className?: string;
  height?: string;
  defaultSymbol?: string;
}

export function ChartPanel({ 
  className = '', 
  height = '300px', 
  defaultSymbol = 'BYBIT:BTCUSDT' 
}: ChartPanelProps) {
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const { currentSymbol, isReady, isLoading } = useGlobalChartContext();

  const popularSymbols = [
    { symbol: 'BYBIT:BTCUSDT', label: 'BTC/USDT', name: 'Bitcoin' },
    { symbol: 'BYBIT:ETHUSDT', label: 'ETH/USDT', name: 'Ethereum' },
    { symbol: 'BYBIT:SOLUSDT', label: 'SOL/USDT', name: 'Solana' },
    { symbol: 'BYBIT:ADAUSDT', label: 'ADA/USDT', name: 'Cardano' }
  ];

  const handleToggleChart = () => {
    setIsChartVisible(!isChartVisible);
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    if (isChartVisible) {
      // Chart will update automatically via GlobalChartContainer
    }
  };

  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Trading Charts
          </CardTitle>
          <Button
            variant={isChartVisible ? "default" : "outline"}
            size="sm"
            onClick={handleToggleChart}
            className="text-xs"
          >
            {isChartVisible ? 'Hide Chart' : 'Show Chart'}
          </Button>
        </div>
        
        {/* Symbol selector */}
        <div className="flex gap-2 overflow-x-auto">
          {popularSymbols.map((item) => (
            <Button
              key={item.symbol}
              variant={selectedSymbol === item.symbol ? "default" : "outline"}
              size="sm"
              onClick={() => handleSymbolChange(item.symbol)}
              className="text-xs whitespace-nowrap"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isChartVisible ? (
          <div style={{ height }} className="relative">
            <GlobalChartContainer
              isVisible={true}
              symbol={selectedSymbol}
              className="w-full h-full"
              containerId="chart-panel-container"
            />
          </div>
        ) : (
          <div 
            style={{ height }} 
            className="flex items-center justify-center bg-gray-800 text-gray-400"
          >
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click "Show Chart" to display trading charts</p>
              <p className="text-xs mt-1 opacity-75">
                Charts will persist when you navigate between pages
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}