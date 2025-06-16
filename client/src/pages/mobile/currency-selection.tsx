
import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

interface CurrencySelectionProps {
  onSelectCurrency?: (currency: string) => void;
  currentCurrency?: string;
}

export default function CurrencySelection({ onSelectCurrency, currentCurrency = 'USD' }: CurrencySelectionProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);

  // Most used currencies
  const mostUsedCurrencies = [
    { code: 'USD', name: 'US Dollar' }
  ];

  // All other currencies in grid format
  const moreCurrencies = [
    'AED', 'ARS', 'AUD',
    'BDT', 'BGN', 'BHD', 
    'BOB', 'BRL', 'CAD',
    'CHF', 'CLP', 'CNY',
    'COP', 'CZK', 'DKK',
    'EGP', 'EUR', 'GBP',
    'GEL', 'HKD', 'HUF',
    'IDR', 'ILS', 'INR',
    'JPY', 'KES', 'KRW',
    'KWD', 'KZT', 'MAD',
    'MNT', 'MXN', 'MYR',
    'NGN', 'NOK', 'NZD',
    'OMR', 'PEN', 'PHP',
    'PKR', 'PLN', 'QAR',
    'RON', 'RUB', 'SAR',
    'SEK', 'TRY', 'TWD',
    'UAH', 'UGX', 'UYU',
    'VES', 'VND', 'ZAR'
  ];

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    if (onSelectCurrency) {
      onSelectCurrency(currency);
    }
    // Store in localStorage for persistence
    localStorage.setItem('selectedCurrency', currency);
    // Let the parent component handle navigation
  };

  return (
    <MobileLayout hideBottomNav={true}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <Link href="/mobile">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-lg font-semibold text-white">Select a Currency</h1>
        <div className="w-6 h-6" /> {/* Spacer */}
      </div>

      <div className="px-4 py-6 bg-gray-900 min-h-screen">
        {/* Most Used Section */}
        <div className="mb-6">
          <h2 className="text-gray-400 text-sm mb-3">Most Used</h2>
          {mostUsedCurrencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencySelect(currency.code)}
              className={`w-full p-4 rounded-lg border-2 transition-colors ${
                selectedCurrency === currency.code
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-600 bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{currency.code}</span>
                {selectedCurrency === currency.code && (
                  <Check className="w-5 h-5 text-orange-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* More Section */}
        <div>
          <h2 className="text-gray-400 text-sm mb-3">More</h2>
          <div className="grid grid-cols-3 gap-3">
            {moreCurrencies.map((currency) => (
              <button
                key={currency}
                onClick={() => handleCurrencySelect(currency)}
                className={`p-4 rounded-lg font-medium transition-colors ${
                  selectedCurrency === currency
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
