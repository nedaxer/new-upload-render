import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ArrowUpDown,
  ChevronDown,
  Info,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useState } from 'react';

export default function MobileConvert() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USDT');
  const [toCurrency, setToCurrency] = useState('BTC');

  const exchangeRate = 0.0000095;

  const handleSwapCurrencies = () => {
    const tempCurrency = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const calculateToAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      return (numAmount * exchangeRate).toFixed(8);
    }
    return '';
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateToAmount(value));
  };

  const popularPairs = [
    { from: 'USDT', to: 'BTC', rate: '0.0000095' },
    { from: 'USDT', to: 'ETH', rate: '0.000388' },
    { from: 'BTC', to: 'ETH', rate: '40.84' },
    { from: 'USDT', to: 'BNB', rate: '0.00153' }
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <div className="p-4 bg-gray-900">
        <h1 className="text-xl font-bold text-white text-center">Convert</h1>
      </div>

      {/* Conversion Card */}
      <div className="px-4 py-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          {/* From Currency */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">From</span>
              <span className="text-gray-400 text-sm">Available: 1,250.00 USDT</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Input
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white text-xl font-bold text-right"
                />
              </div>
              <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg min-w-[100px]">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">₮</span>
                </div>
                <span className="text-white font-medium">{fromCurrency}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center py-2">
            <button
              onClick={handleSwapCurrencies}
              className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              <ArrowUpDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* To Currency */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">To</span>
              <span className="text-gray-400 text-sm">Balance: 0.00485 BTC</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Input
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white text-xl font-bold text-right"
                />
              </div>
              <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg min-w-[100px]">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">₿</span>
                </div>
                <span className="text-white font-medium">{toCurrency}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">1 {fromCurrency} ≈ {exchangeRate} {toCurrency}</span>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center space-x-1 text-green-500 text-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+0.12%</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Real-time rate • Updated 2s ago</span>
            </div>
          </div>

          {/* Convert Button */}
          <Button 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
            disabled={!fromAmount || parseFloat(fromAmount) <= 0}
          >
            Convert
          </Button>
        </Card>
      </div>

      {/* Popular Conversions */}
      <div className="px-4 pb-6">
        <h3 className="text-white font-medium mb-4">Popular Conversions</h3>
        <div className="space-y-3">
          {popularPairs.map((pair, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {pair.from === 'USDT' ? '₮' : pair.from === 'BTC' ? '₿' : 'Ξ'}
                      </span>
                    </div>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {pair.to === 'BTC' ? '₿' : pair.to === 'ETH' ? 'Ξ' : '₮'}
                      </span>
                    </div>
                  </div>
                  <span className="text-white font-medium">{pair.from}/{pair.to}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{pair.rate}</div>
                  <div className="text-green-500 text-sm">+0.24%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Conversion History */}
      <div className="px-4 pb-6">
        <h3 className="text-white font-medium mb-4">Recent Conversions</h3>
        <Card className="bg-gray-800 border-gray-700 p-4 text-center">
          <div className="text-gray-400 mb-2">No conversion history</div>
          <div className="text-gray-500 text-sm">Your recent conversions will appear here</div>
        </Card>
      </div>
    </MobileLayout>
  );
}