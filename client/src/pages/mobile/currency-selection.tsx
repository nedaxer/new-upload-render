
import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/language-context';

interface CurrencySelectionProps {
  onSelectCurrency?: (currency: string) => void;
  currentCurrency?: string;
}

export default function CurrencySelection({ onSelectCurrency, currentCurrency = 'USD' }: CurrencySelectionProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  // Most used currencies
  const mostUsedCurrencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' }
  ];

  // Additional currencies (without flags as requested)
  const additionalCurrencies = [
    'CHF', 'CNY', 'INR', 'KRW', 'SGD', 'HKD', 'THB', 'MYR', 'IDR', 'PHP', 
    'VND', 'TWD', 'PKR', 'BDT', 'LKR', 'NPR', 'NOK', 'SEK', 'DKK', 'PLN', 
    'CZK', 'HUF', 'RON', 'BGN', 'TRY', 'RUB', 'UAH', 'ISK', 'AED', 'SAR', 
    'QAR', 'KWD', 'BHD', 'OMR', 'ILS', 'JOD', 'LBP', 'EGP', 'MAD', 'ZAR', 
    'NGN', 'KES', 'UGX', 'TZS', 'ETB', 'GHS', 'BRL', 'MXN', 'ARS', 'CLP', 
    'COP', 'PEN', 'UYU', 'BOB', 'PYG', 'NZD', 'FJD'
  ].sort();

  // Filter out most used currencies from additional list
  const otherCurrencies = additionalCurrencies.filter(currency => 
    !mostUsedCurrencies.some(used => used.code === currency)
  );

  // Filter currencies based on search query
  const filteredMostUsed = mostUsedCurrencies.filter(currency =>
    currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOtherCurrencies = otherCurrencies.filter(currency =>
    currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    if (onSelectCurrency) {
      onSelectCurrency(currency);
    }
    // Store in localStorage for persistence
    localStorage.setItem('selectedCurrency', currency);
    
    // Navigate back to settings if no parent handler
    if (!onSelectCurrency) {
      // Small delay to show selection feedback
      setTimeout(() => {
        window.history.back();
      }, 300);
    }
  };

  return (
    <MobileLayout hideBottomNav={true}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-950 border-b border-blue-700">
        <button onClick={() => window.history.back()}>
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">{t('currency_selection')}</h1>
        <div className="w-6 h-6" /> {/* Spacer */}
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-blue-700 bg-blue-950">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search currencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-blue-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="px-4 py-6 bg-blue-950 min-h-screen">
        {/* Most Used Section */}
        {filteredMostUsed.length > 0 && (
          <div className="mb-6">
            <h2 className="text-gray-400 text-xs mb-3 uppercase tracking-wide">Most Used</h2>
            <div className="space-y-2">
              {filteredMostUsed.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency.code)}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    selectedCurrency === currency.code
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-600 bg-blue-900 hover:bg-blue-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-white font-medium text-sm">{currency.code}</div>
                      <div className="text-gray-400 text-xs">{currency.name}</div>
                    </div>
                    {selectedCurrency === currency.code && (
                      <Check className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        </div>

        {/* More Section */}
        {filteredOtherCurrencies.length > 0 && (
          <div>
            <h2 className="text-gray-400 text-xs mb-3 uppercase tracking-wide">More Currencies</h2>
            <div className="grid grid-cols-4 gap-2">
              {filteredOtherCurrencies.map((currency) => (
                <button
                  key={currency}
                  onClick={() => handleCurrencySelect(currency)}
                  className={`p-3 rounded-lg text-xs font-medium transition-colors ${
                    selectedCurrency === currency
                      ? 'bg-orange-500 text-white'
                      : 'bg-blue-800 text-gray-300 hover:bg-blue-700'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {searchQuery && filteredMostUsed.length === 0 && filteredOtherCurrencies.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No currencies found matching "{searchQuery}"</div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
