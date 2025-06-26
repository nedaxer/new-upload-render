
import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/language-context';

interface CurrencySelectionProps {
  onSelectCurrency?: (currency: string) => void;
  currentCurrency?: string;
}

export default function CurrencySelection({ onSelectCurrency, currentCurrency = 'USD' }: CurrencySelectionProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const { t } = useLanguage();

  // Most used currencies
  const mostUsedCurrencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
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

      <div className="px-4 py-6 bg-blue-950 min-h-screen">
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
                  : 'border-gray-600 bg-blue-900'
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
            {otherCurrencies.map((currency) => (
              <button
                key={currency}
                onClick={() => handleCurrencySelect(currency)}
                className={`p-4 rounded-lg font-medium transition-colors ${
                  selectedCurrency === currency
                    ? 'bg-orange-500 text-white'
                    : 'bg-blue-800 text-gray-300 hover:bg-gray-600'
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
