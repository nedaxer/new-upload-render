
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
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' }
  ];

  // All available currencies with names and flags
  const allCurrencies = [
    // Major currencies
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
    
    // Asian currencies
    { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
    { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
    { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
    { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
    { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩' },
    { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭' },
    { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳' },
    { code: 'TWD', name: 'Taiwan Dollar', flag: '🇹🇼' },
    { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
    { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩' },
    { code: 'LKR', name: 'Sri Lankan Rupee', flag: '🇱🇰' },
    { code: 'NPR', name: 'Nepalese Rupee', flag: '🇳🇵' },
    
    // European currencies
    { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
    { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
    { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' },
    { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱' },
    { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿' },
    { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺' },
    { code: 'RON', name: 'Romanian Leu', flag: '🇷🇴' },
    { code: 'BGN', name: 'Bulgarian Lev', flag: '🇧🇬' },
    { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
    { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', flag: '🇺🇦' },
    { code: 'ISK', name: 'Icelandic Króna', flag: '🇮🇸' },
    
    // Middle East & Africa
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
    { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦' },
    { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
    { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭' },
    { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲' },
    { code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱' },
    { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴' },
    { code: 'LBP', name: 'Lebanese Pound', flag: '🇱🇧' },
    { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
    { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦' },
    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
    { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
    { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬' },
    { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿' },
    { code: 'ETB', name: 'Ethiopian Birr', flag: '🇪🇹' },
    { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
    
    // Americas
    { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
    { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
    { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷' },
    { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱' },
    { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴' },
    { code: 'PEN', name: 'Peruvian Sol', flag: '🇵🇪' },
    { code: 'UYU', name: 'Uruguayan Peso', flag: '🇺🇾' },
    { code: 'BOB', name: 'Bolivian Boliviano', flag: '🇧🇴' },
    { code: 'PYG', name: 'Paraguayan Guaraní', flag: '🇵🇾' },
    
    // Oceania
    { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
    { code: 'FJD', name: 'Fijian Dollar', flag: '🇫🇯' }
  ].sort((a, b) => a.name.localeCompare(b.name));

  // Filter out most used from all currencies to show separately
  const otherCurrencies = allCurrencies.filter(currency => 
    !mostUsedCurrencies.some(used => used.code === currency.code)
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
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <button onClick={() => window.history.back()}>
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">{t('currency_selection')}</h1>
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
