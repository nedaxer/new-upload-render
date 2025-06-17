import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PortfolioDemo() {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Convert USD amounts to selected currency
  const convertToSelectedCurrency = (usdAmount: number): string => {
    return usdAmount.toFixed(2);
  };

  // Get currency symbol
  const getCurrencySymbol = (currency: string): string => {
    return '$';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <h1 className="text-xl font-bold text-white">Portfolio Demo</h1>
      </div>

      {/* Total Assets */}
      <div className="px-4 pb-6">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-gray-400 text-sm">Total Assets</span>
          <button onClick={() => setShowBalance(!showBalance)}>
            {showBalance ? (
              <Eye className="w-4 h-4 text-gray-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">
              {showBalance ? convertToSelectedCurrency(0.51) : '****'}
            </span>
            <span className="text-gray-400">{selectedCurrency}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <span>≈ {showBalance ? '0.00000484' : '****'} BTC</span>
          </div>
        </div>
      </div>

      {/* Portfolio Circle Chart */}
      <div className="px-4">
        <h3 className="text-white font-medium mb-6 text-sm">Portfolio Distribution</h3>
        
        {/* Circular Portfolio Chart */}
        <div className="relative flex flex-col items-center mb-8">
          {/* Donut Chart Container */}
          <div className="relative w-80 h-80 mb-6">
            {/* SVG Donut Chart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="8"
                />
                
                {/* Bitcoin segment (60%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="8"
                  strokeDasharray="150.8 100.4"
                  strokeDashoffset="0"
                  className="transition-all duration-1000"
                />
                
                {/* USDT segment (25%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray="62.8 188.4"
                  strokeDashoffset="-150.8"
                  className="transition-all duration-1000"
                />
                
                {/* ETH segment (10%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray="25.1 226.1"
                  strokeDashoffset="-213.6"
                  className="transition-all duration-1000"
                />
                
                {/* BNB segment (5%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="8"
                  strokeDasharray="12.6 238.6"
                  strokeDashoffset="-238.7"
                  className="transition-all duration-1000"
                />
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-white">
                  {showBalance ? getCurrencySymbol(selectedCurrency) + convertToSelectedCurrency(0.51) : '****'}
                </div>
                <div className="text-xs text-gray-400">Total Value</div>
              </div>
            </div>
            
            {/* Crypto Labels Around Donut */}
            {/* BTC Label - Top Right */}
            <div className="absolute top-8 right-2">
              <div className="flex items-center space-x-2">
                <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-orange-500/30">
                  <div className="text-orange-400 text-sm font-bold">BTC</div>
                  <div className="text-white text-xs font-semibold">60%</div>
                  <div className="text-gray-300 text-xs">
                    {showBalance ? getCurrencySymbol(selectedCurrency) + convertToSelectedCurrency(0.31) : '***'}
                  </div>
                </div>
                <div className="w-4 h-1 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            
            {/* USDT Label - Bottom Right */}
            <div className="absolute bottom-8 right-2">
              <div className="flex items-center space-x-2">
                <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-green-500/30">
                  <div className="text-green-400 text-sm font-bold">USDT</div>
                  <div className="text-white text-xs font-semibold">25%</div>
                  <div className="text-gray-300 text-xs">
                    {showBalance ? getCurrencySymbol(selectedCurrency) + convertToSelectedCurrency(0.13) : '***'}
                  </div>
                </div>
                <div className="w-4 h-1 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            {/* ETH Label - Bottom Left */}
            <div className="absolute bottom-8 left-2">
              <div className="flex items-center space-x-2 flex-row-reverse">
                <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-500/30 text-right">
                  <div className="text-blue-400 text-sm font-bold">ETH</div>
                  <div className="text-white text-xs font-semibold">10%</div>
                  <div className="text-gray-300 text-xs">
                    {showBalance ? getCurrencySymbol(selectedCurrency) + convertToSelectedCurrency(0.05) : '***'}
                  </div>
                </div>
                <div className="w-4 h-1 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            
            {/* BNB Label - Top Left */}
            <div className="absolute top-8 left-2">
              <div className="flex items-center space-x-2 flex-row-reverse">
                <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-yellow-500/30 text-right">
                  <div className="text-yellow-400 text-sm font-bold">BNB</div>
                  <div className="text-white text-xs font-semibold">5%</div>
                  <div className="text-gray-300 text-xs">
                    {showBalance ? getCurrencySymbol(selectedCurrency) + convertToSelectedCurrency(0.03) : '***'}
                  </div>
                </div>
                <div className="w-4 h-1 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">24h Change</div>
            <div className="text-green-500 text-lg font-bold">+2.4%</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">Total Profit</div>
            <div className="text-orange-500 text-lg font-bold">
              {showBalance ? '+' + getCurrencySymbol(selectedCurrency) + convertToSelectedCurrency(0.12) : '+***'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}