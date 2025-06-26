
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpDown, RefreshCw, Zap } from 'lucide-react';
import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
// import { useCachedQuery } from '@/lib/cache-manager';
// import { usePersistentState } from '@/hooks/use-persistent-state';

interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  image: string;
}

export default function MobileConvert() {
  const [location, navigate] = useLocation();
  const [fromAmount, setFromAmount] = useState('1');
  const [toAmount, setToAmount] = useState('0');
  const [fromCurrency, setFromCurrency] = useState('bitcoin');
  const [toCurrency, setToCurrency] = useState('ethereum');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const { data: cryptoData, isLoading, error } = useQuery({
    queryKey: ['/api/crypto/prices'],
    queryFn: async (): Promise<CryptoCurrency[]> => {
      const response = await fetch('/api/crypto/prices');
      if (!response.ok) {
        throw new Error(`Failed to fetch crypto data: ${response.statusText}`);
      }
      const result = await response.json();
      // Ensure we return an array
      return Array.isArray(result.data) ? result.data : [];
    },
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds cache
  });

  const fromCrypto = Array.isArray(cryptoData) ? cryptoData.find(crypto => crypto.id === fromCurrency) : null;
  const toCrypto = Array.isArray(cryptoData) ? cryptoData.find(crypto => crypto.id === toCurrency) : null;

  useEffect(() => {
    if (fromCrypto && toCrypto && fromAmount) {
      const fromValue = parseFloat(fromAmount);
      if (!isNaN(fromValue)) {
        const convertedAmount = (fromValue * fromCrypto.current_price) / toCrypto.current_price;
        setToAmount(convertedAmount.toFixed(8));
      }
    }
  }, [fromAmount, fromCrypto, toCrypto]);

  const handleSwapCurrencies = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setFromCurrency(toCurrency);
      setToCurrency(fromCurrency);
      setFromAmount(toAmount);
      setIsSwapping(false);
    }, 300);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
  };

  const handleSwapNow = () => {
    // Simulate swap process
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      // Here you would typically call an API to execute the swap
      alert(`Successfully swapped ${fromAmount} ${fromCrypto?.symbol?.toUpperCase()} for ${toAmount} ${toCrypto?.symbol?.toUpperCase()}`);
    }, 2000);
  };

  const CurrencySelector = ({ 
    selectedCurrency, 
    onSelect, 
    showDropdown, 
    setShowDropdown,
    label 
  }: {
    selectedCurrency: string;
    onSelect: (currency: string) => void;
    showDropdown: boolean;
    setShowDropdown: (show: boolean) => void;
    label: string;
  }) => {
    const selected = Array.isArray(cryptoData) ? cryptoData.find(crypto => crypto.id === selectedCurrency) : null;
    
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center justify-between w-full bg-blue-900 px-4 py-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {selected?.image && (
              <img src={selected.image} alt={selected.name} className="w-6 h-6 rounded-full" />
            )}
            <div className="text-left">
              <div className="text-white font-medium">{selected?.symbol?.toUpperCase()}</div>
              <div className="text-gray-400 text-sm">{selected?.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-sm">
              ${selected?.current_price?.toFixed(selected.current_price < 1 ? 6 : 2)}
            </div>
          </div>
        </button>
        
        {showDropdown && Array.isArray(cryptoData) && cryptoData.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-blue-900 border border-gray-600 rounded-lg max-h-60 overflow-y-auto z-50">
            {cryptoData.slice(0, 20).map((crypto) => (
              <button
                key={crypto.id}
                onClick={() => {
                  onSelect(crypto.id);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-800 transition-colors"
              >
                <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">{crypto.symbol?.toUpperCase()}</div>
                  <div className="text-gray-400 text-sm">{crypto.name}</div>
                </div>
                <div className="text-white text-sm">
                  ${crypto.current_price?.toFixed(crypto.current_price < 1 ? 6 : 2)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading || !Array.isArray(cryptoData)) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-between p-4 bg-[#0a0a2e] border-b border-[#1a1a40]">
          <button onClick={() => navigate('/mobile')} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-white">Convert</h2>
          <div className="w-6 h-6" />
        </div>
        <div className="p-4 animate-pulse">
          <div className="space-y-4">
            <div className="h-20 bg-[#0b0b30] rounded"></div>
            <div className="h-12 bg-[#0b0b30] rounded"></div>
            <div className="h-20 bg-[#0b0b30] rounded"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !cryptoData || cryptoData.length === 0) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-between p-4 bg-[#0a0a2e] border-b border-[#1a1a40]">
          <button onClick={() => navigate('/mobile')} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-white">Convert</h2>
          <div className="w-6 h-6" />
        </div>
        <div className="p-4 text-center">
          <div className="text-gray-400 mb-4">Unable to load cryptocurrency data</div>
          <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600">
            Retry
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-950 border-b border-blue-700">
        <button onClick={() => navigate('/mobile')} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-white">Convert</h2>
        <div className="w-6 h-6" />
      </div>

      <div className="p-4 space-y-6">
        {/* Live Rate Indicator */}
        <div className="flex items-center justify-center space-x-2 text-green-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Live rates updating</span>
        </div>

        {/* From Currency */}
        <div className="space-y-3">
          <label className="text-gray-400 text-sm font-medium">From</label>
          <div className="space-y-3">
            <Input
              type="number"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              placeholder="0.00"
              className="bg-blue-900 border-gray-600 text-white text-lg h-14 text-center"
            />
            <CurrencySelector
              selectedCurrency={fromCurrency}
              onSelect={setFromCurrency}
              showDropdown={showFromDropdown}
              setShowDropdown={setShowFromDropdown}
              label="From"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapCurrencies}
            disabled={isSwapping}
            className={`bg-orange-500 hover:bg-orange-600 p-4 rounded-full transition-all duration-300 ${
              isSwapping ? 'rotate-180 scale-110' : ''
            }`}
          >
            <ArrowUpDown className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* To Currency */}
        <div className="space-y-3">
          <label className="text-gray-400 text-sm font-medium">To</label>
          <div className="space-y-3">
            <Input
              type="text"
              value={toAmount}
              readOnly
              placeholder="0.00"
              className="bg-blue-900 border-gray-600 text-white text-lg h-14 text-center"
            />
            <CurrencySelector
              selectedCurrency={toCurrency}
              onSelect={setToCurrency}
              showDropdown={showToDropdown}
              setShowDropdown={setShowToDropdown}
              label="To"
            />
          </div>
        </div>

        {/* Exchange Rate */}
        {fromCrypto && toCrypto && (
          <div className="bg-blue-900 rounded-lg p-4">
            <div className="text-center">
              <div className="text-white text-lg font-semibold">
                1 {fromCrypto.symbol?.toUpperCase()} = {(fromCrypto.current_price / toCrypto.current_price).toFixed(8)} {toCrypto.symbol?.toUpperCase()}
              </div>
              <div className="text-gray-400 text-sm mt-1 flex items-center justify-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Real-time exchange rate</span>
              </div>
            </div>
          </div>
        )}

        {/* Swap Details */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Network Fee</span>
            <span className="text-white">~$0.50</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Processing Time</span>
            <span className="text-white">~30 seconds</span>
          </div>
        </div>

        {/* Swap Button */}
        <Button
          onClick={handleSwapNow}
          disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-14 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSwapping ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Swapping...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Swap Now</span>
            </div>
          )}
        </Button>
      </div>
    </MobileLayout>
  );
}
