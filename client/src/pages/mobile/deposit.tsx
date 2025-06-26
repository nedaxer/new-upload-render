import { useState } from 'react';
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';

const DEPOSIT_METHODS = [
  {
    id: 'crypto',
    title: 'Cryptocurrency',
    description: 'Deposit using Bitcoin, Ethereum, USDT, or other cryptocurrencies',
    icon: '₿',
    available: true
  },
  {
    id: 'bank',
    title: 'Bank Transfer',
    description: 'Direct bank transfer (processing time: 1-3 business days)',
    icon: '🏦',
    available: false
  },
  {
    id: 'card',
    title: 'Credit/Debit Card',
    description: 'Instant deposit using Visa, Mastercard, or other cards',
    icon: '💳',
    available: false
  },
  {
    id: 'paypal',
    title: 'PayPal',
    description: 'Deposit funds directly from your PayPal account',
    icon: '📱',
    available: false
  }
];

export default function MobileDeposit() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  const handleMethodSelect = (methodId: string) => {
    if (methodId === 'crypto') {
      navigate('/mobile/deposit/crypto');
    } else {
      // Show coming soon for other methods
      alert('This payment method is coming soon!');
    }
  };

  const handleBack = () => {
    navigate('/mobile/assets');
  };

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a40]">
        <button onClick={handleBack} className="p-2 hover:bg-gray-800 rounded-lg">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold">{t('deposit')}</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Choose Deposit Method</h2>
          <p className="text-gray-400">Select how you'd like to add funds to your account</p>
        </div>

        {/* Deposit Methods */}
        <div className="space-y-3">
          {DEPOSIT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.id)}
              disabled={!method.available}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                method.available
                  ? 'border-[#1a1a40] hover:border-blue-500 hover:bg-[#1a1a40] active:scale-98'
                  : 'border-gray-600 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{method.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{method.title}</h3>
                    {method.available && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {!method.available && (
                      <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{method.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-[#1a1a40] rounded-xl">
          <h3 className="font-semibold mb-2 flex items-center">
            🔒 Security Notice
          </h3>
          <p className="text-sm text-gray-300">
            All deposits are processed securely. We use industry-standard encryption 
            to protect your funds and personal information.
          </p>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Need help? Contact our support team
          </p>
          <Button 
            variant="ghost" 
            className="text-blue-400 hover:text-blue-300 mt-2"
          >
            Get Support
          </Button>
        </div>
      </div>
    </div>
  );
}