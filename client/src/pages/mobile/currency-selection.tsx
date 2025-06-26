import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
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

  // Complete currency list with names for better searching (JPY removed)
  const allCurrencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
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
    { code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱' },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦' },
    { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
    { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭' },
    { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲' },
    { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴' },
    { code: 'LBP', name: 'Lebanese Pound', flag: '🇱🇧' },
    { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
    { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
    { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
    { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬' },
    { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿' },
    { code: 'ETB', name: 'Ethiopian Birr', flag: '🇪🇹' },
    { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦' },
    { code: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳' },
    { code: 'DZD', name: 'Algerian Dinar', flag: '🇩🇿' },
    { code: 'LYD', name: 'Libyan Dinar', flag: '🇱🇾' },
    { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
    { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷' },
    { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴' },
    { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱' },
    { code: 'PEN', name: 'Peruvian Sol', flag: '🇵🇪' },
    { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' }
  ];

  // Most used currencies (excluding JPY, top 6)
  const mostUsedCurrencies = allCurrencies.slice(0, 6);

  // Filter currencies based on search query
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) {
      return allCurrencies;
    }
    
    const query = searchQuery.toLowerCase();
    return allCurrencies.filter(currency => 
      currency.code.toLowerCase().includes(query) ||
      currency.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const clearSearch = () => setSearchQuery('');

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
      <div className="flex items-center justify-between p-3 bg-[#0a0a2e] border-b border-gray-600">
        <button onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-base font-semibold text-white">{t('currency_selection')}</h1>
        <div className="w-5 h-5" /> {/* Spacer */}
      </div>

      <div className="px-3 py-4 bg-[#0a0a2e] min-h-screen">
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search currencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-2 bg-[#1a1a40] border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>

        {!searchQuery ? (
          <>
            {/* Most Used Section */}
            <div className="mb-5">
              <h2 className="text-gray-400 text-xs mb-2">Most Used</h2>
              <div className="space-y-2">
                {mostUsedCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleCurrencySelect(currency.code)}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      selectedCurrency === currency.code
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-600 bg-[#1a1a40] hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{currency.flag}</span>
                        <div className="text-left">
                          <div className="text-white font-medium text-xs">{currency.code}</div>
                          <div className="text-gray-400 text-xs">{currency.name}</div>
                        </div>
                      </div>
                      {selectedCurrency === currency.code && (
                        <Check className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* All Other Currencies Grid */}
            <div>
              <h2 className="text-gray-400 text-xs mb-2">All Currencies</h2>
              <div className="grid grid-cols-2 gap-2">
                {allCurrencies.slice(6).map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleCurrencySelect(currency.code)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedCurrency === currency.code
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#1a1a40] text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">{currency.flag}</span>
                      <div className="text-left">
                        <div className="font-medium text-xs">{currency.code}</div>
                        <div className="text-xs opacity-80">{currency.name}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Search Results */
          <div className="space-y-2">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency.code)}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    selectedCurrency === currency.code
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-600 bg-[#1a1a40] hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{currency.flag}</span>
                      <div className="text-left">
                        <div className="text-white font-medium text-xs">{currency.code}</div>
                        <div className="text-gray-400 text-xs">{currency.name}</div>
                      </div>
                    </div>
                    {selectedCurrency === currency.code && (
                      <Check className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p className="text-sm">No currencies found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}