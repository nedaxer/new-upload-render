import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useLocation, useSearch } from 'wouter';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';

// Sample addresses for demonstration - in real app these would come from API
const SAMPLE_ADDRESSES = {
  'bitcoin-Bitcoin': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  'ethereum-ERC20': '0x742d35cc6634c0532925a3b8d4e3e5c51b60e365',
  'tether-ERC20': '0x742d35cc6634c0532925a3b8d4e3e5c51b60e365',
  'tether-TRC20': 'TQrZ8tyTkdL6FgWMB6Z8XtGvN4J5YkBjL9',
  'tether-BSC': '0x742d35cc6634c0532925a3b8d4e3e5c51b60e365',
  'binancecoin-BSC': '0x742d35cc6634c0532925a3b8d4e3e5c51b60e365'
};

export default function MobileDepositAddress() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [depositAddress, setDepositAddress] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGeneratingAddress, setIsGeneratingAddress] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const crypto = params.get('crypto') || '';
    const network = params.get('network') || '';
    setSelectedCrypto(crypto);
    setSelectedNetwork(network);

    // Simulate address generation
    setTimeout(() => {
      const addressKey = `${crypto}-${network}`;
      const address = SAMPLE_ADDRESSES[addressKey as keyof typeof SAMPLE_ADDRESSES] || 'Address not available';
      setDepositAddress(address);
      setIsGeneratingAddress(false);

      // Generate QR Code
      QRCode.toDataURL(address, { width: 256, margin: 2 })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR code generation error:', err));
    }, 2000);
  }, [searchParams]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams);
    const crypto = params.get('crypto');
    if (selectedNetwork && crypto) {
      // Check if crypto has multiple networks
      const networks = {
        'tether': ['ERC20', 'TRC20', 'BSC'],
        'bitcoin': ['Bitcoin'],
        'ethereum': ['ERC20'],
        'binancecoin': ['BSC']
      };
      const cryptoNetworks = networks[crypto as keyof typeof networks] || [];
      
      if (cryptoNetworks.length > 1) {
        navigate(`/mobile/deposit/network?crypto=${crypto}`);
      } else {
        navigate('/mobile/deposit/crypto');
      }
    } else {
      navigate('/mobile/deposit/crypto');
    }
  };

  const getCryptoInfo = (cryptoId: string) => {
    const info = {
      'tether': { name: 'USDT', symbol: '₮', minDeposit: '1' },
      'bitcoin': { name: 'Bitcoin', symbol: '₿', minDeposit: '0.0001' },
      'ethereum': { name: 'Ethereum', symbol: 'Ξ', minDeposit: '0.01' },
      'binancecoin': { name: 'BNB', symbol: 'B', minDeposit: '0.01' }
    };
    return info[cryptoId as keyof typeof info] || { name: cryptoId, symbol: '?', minDeposit: '0' };
  };

  const cryptoInfo = getCryptoInfo(selectedCrypto);

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a40]">
        <button onClick={handleBack} className="p-2 hover:bg-gray-800 rounded-lg">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold">Deposit Address</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {cryptoInfo.symbol}
          </div>
          <h2 className="text-2xl font-bold mb-2">{cryptoInfo.name} Deposit</h2>
          <p className="text-gray-400">Network: {selectedNetwork}</p>
        </div>

        {/* Address Generation Loading */}
        {isGeneratingAddress && (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating Deposit Address...</h3>
            <p className="text-gray-400">Please wait while we create your unique deposit address</p>
          </div>
        )}

        {/* QR Code and Address */}
        {!isGeneratingAddress && (
          <>
            {/* QR Code */}
            <div className="bg-white rounded-xl p-6 mb-6 text-center">
              {qrDataUrl && (
                <img 
                  src={qrDataUrl} 
                  alt="Deposit Address QR Code" 
                  className="mx-auto"
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              )}
            </div>

            {/* Address */}
            <div className="bg-[#1a1a40] rounded-xl p-4 mb-6">
              <h3 className="font-semibold mb-3 text-center">Deposit Address</h3>
              <div className="bg-[#0a0a2e] rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300 break-all font-mono">
                  {depositAddress}
                </p>
              </div>
              <Button
                onClick={handleCopyAddress}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={copySuccess}
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </>
                )}
              </Button>
            </div>

            {/* Important Information */}
            <div className="space-y-4">
              {/* Minimum Deposit */}
              <div className="bg-[#1a1a40] rounded-xl p-4">
                <h3 className="font-semibold mb-2">Deposit Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Deposit:</span>
                    <span>{cryptoInfo.minDeposit} {cryptoInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span>{selectedNetwork}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Time:</span>
                    <span>10-60 minutes</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-400 mb-2">Important Warnings</h3>
                    <ul className="text-sm text-red-300 space-y-1">
                      <li>• Only send {cryptoInfo.name} to this address</li>
                      <li>• Ensure you're using the {selectedNetwork} network</li>
                      <li>• Deposits to wrong network will be lost</li>
                      <li>• Minimum deposit: {cryptoInfo.minDeposit} {cryptoInfo.name}</li>
                      <li>• Address is valid for 24 hours</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-[#1a1a40] rounded-xl p-4">
                <h3 className="font-semibold mb-2">Next Steps</h3>
                <ol className="text-sm text-gray-300 space-y-1">
                  <li>1. Copy the deposit address above</li>
                  <li>2. Go to your external wallet or exchange</li>
                  <li>3. Send {cryptoInfo.name} to this address via {selectedNetwork}</li>
                  <li>4. Wait for network confirmations</li>
                  <li>5. Funds will appear in your Nedaxer account</li>
                </ol>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <Button
                onClick={() => navigate('/mobile/assets')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                View My Assets
              </Button>
              <Button
                onClick={() => navigate('/mobile/deposit')}
                variant="outline"
                className="w-full border-[#1a1a40] text-gray-300 hover:bg-[#1a1a40]"
              >
                Make Another Deposit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}