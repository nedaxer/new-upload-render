import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ChevronDown, HelpCircle, QrCode, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showSuccessNotification, showErrorNotification } from '@/hooks/use-global-notification';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

import QrScanner from 'qr-scanner';

// Crypto logos
const btcLogo = '/logos/btc-logo.svg';
const ethLogo = '/logos/eth-logo.svg';
const usdtLogo = '/logos/usdt-logo.svg';

const getCryptoLogo = (symbol: string): string | null => {
  switch (symbol.toLowerCase()) {
    case 'btc':
    case 'bitcoin':
      return btcLogo;
    case 'eth':
    case 'ethereum':
      return ethLogo;
    case 'usdt':
    case 'tether':
      return usdtLogo;
    default:
      return null;
  }
};

interface NetworkOption {
  networkId: string;
  networkName: string;
  chainType: string;
  minWithdrawal: number;
}

interface CryptoOption {
  symbol: string;
  name: string;
  icon: string;
  networks: NetworkOption[];
}

const cryptoOptions: CryptoOption[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '/crypto-icons/btc.svg',
    networks: [
      {
        networkId: 'bitcoin',
        networkName: 'Bitcoin Network',
        chainType: 'Bitcoin',
        minWithdrawal: 0.001,
      },
    ],
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: '/crypto-icons/eth.svg',
    networks: [
      {
        networkId: 'ethereum',
        networkName: 'ERC20 (Ethereum)',
        chainType: 'ERC20',
        minWithdrawal: 0.01,
      },
    ],
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    icon: '/crypto-icons/usdt.svg',
    networks: [
      {
        networkId: 'erc20',
        networkName: 'ERC20 (Ethereum)',
        chainType: 'ERC20',
        minWithdrawal: 10,
      },
      {
        networkId: 'trc20',
        networkName: 'TRC20 (Tron)',
        chainType: 'TRC20',
        minWithdrawal: 1,
      },
      {
        networkId: 'bep20',
        networkName: 'BEP-20 (BSC)',
        chainType: 'BEP20',
        minWithdrawal: 1,
      },
    ],
  },
];

export default function MobileWithdrawal() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Form states
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(cryptoOptions[0]);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption | null>(
    cryptoOptions[0].networks.length === 1 ? cryptoOptions[0].networks[0] : null
  );
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    usdAmount: string;
    cryptoAmount: string;
    cryptoSymbol: string;
  } | null>(null);

  // Fetch user balance
  const { data: balanceData } = useQuery({
    queryKey: ['/api/wallet/summary'],
    enabled: !!user,
  });

  // Fetch crypto prices
  const { data: priceData } = useQuery({
    queryKey: ['/api/crypto/realtime-prices'],
    refetchInterval: 30000,
    staleTime: 25000,
  });

  const userBalance = (balanceData as any)?.data?.totalUSDValue || (balanceData as any)?.data?.usdBalance || 0;

  // USD input handler - formats as normal currency
  const handleUsdAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove any non-digit or decimal characters
    value = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts[1];
    }
    
    // Limit to 2 decimal places for USD
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    setUsdAmount(value);
    
    // Calculate crypto amount if valid number
    if (value && priceData) {
      const amount = parseFloat(value);
      if (!isNaN(amount) && amount > 0) {
        const cryptoData = (priceData as any)?.success && Array.isArray((priceData as any)?.data) 
          ? (priceData as any).data.find((crypto: any) => crypto.symbol === selectedCrypto.symbol)
          : null;
        
        const price = cryptoData?.price;
        if (price && price > 0) {
          setCryptoAmount((amount / price).toFixed(8));
        } else {
          setCryptoAmount('');
        }
      } else {
        setCryptoAmount('');
      }
    } else {
      setCryptoAmount('');
    }
  };

  // Handle crypto selection
  const handleCryptoSelect = (crypto: CryptoOption) => {
    setSelectedCrypto(crypto);
    setSelectedNetwork(crypto.networks.length === 1 ? crypto.networks[0] : null);
    setShowCryptoDropdown(false);
  };

  // QR Scanner functions
  const startQrScanner = async () => {
    setShowQrScanner(true);
    try {
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            setWithdrawalAddress(result.data);
            stopQrScanner();
            showSuccessNotification(
              "Address Scanned",
              "Wallet address has been detected and filled in."
            );
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        await qrScannerRef.current.start();
      }
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      showErrorNotification(
        "Camera Error",
        "Unable to access camera. Please enter address manually."
      );
      setShowQrScanner(false);
    }
  };

  const stopQrScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setShowQrScanner(false);
  };

  // Cleanup QR scanner on unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  // Withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: async (data: {
      cryptoSymbol: string;
      cryptoName: string;
      chainType: string;
      networkName: string;
      withdrawalAddress: string;
      usdAmount: number;
      cryptoAmount: number;
    }) => {
      console.log('Sending withdrawal request:', data);
      
      const response = await fetch('/api/withdrawals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Withdrawal failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      showSuccessNotification(
        "Withdrawal Processed",
        `Successfully withdrew $${usdAmount} USD via ${selectedCrypto.symbol}`
      );
      
      // Invalidate and refetch all related data for real-time updates
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawals/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      
      // Reset form
      setWithdrawalAddress('');
      setCryptoAmount('');
      setUsdAmount('');
      
      navigate('/mobile/assets');
    },
    onError: (error: any) => {
      showErrorNotification(
        "Withdrawal Failed",
        error.message || "Failed to process withdrawal. Please try again."
      );
    },
  });

  // Handle withdrawal submission
  const handleWithdraw = async () => {
    if (!selectedNetwork || !withdrawalAddress || !usdAmount) {
      showErrorNotification(
        "Missing Information",
        "Please fill in all required fields."
      );
      return;
    }

    const usdAmountNum = parseFloat(usdAmount);
    const cryptoAmountNum = parseFloat(cryptoAmount || '0');
    
    if (isNaN(usdAmountNum) || usdAmountNum <= 0) {
      showErrorNotification(
        "Invalid Amount",
        "Please enter a valid USD amount."
      );
      return;
    }

    if (isNaN(cryptoAmountNum) || cryptoAmountNum <= 0) {
      showErrorNotification(
        "Invalid Crypto Amount",
        "Unable to calculate crypto amount. Please check the exchange rate."
      );
      return;
    }

    if (cryptoAmountNum < selectedNetwork.minWithdrawal) {
      showErrorNotification(
        "Amount Too Low",
        `Minimum withdrawal amount is ${selectedNetwork.minWithdrawal} ${selectedCrypto.symbol}`
      );
      return;
    }

    if (usdAmountNum > userBalance) {
      showErrorNotification(
        "Insufficient Balance",
        "You don't have enough balance for this withdrawal."
      );
      return;
    }

    // Basic address validation
    if (withdrawalAddress.length < 10) {
      showErrorNotification(
        "Invalid Address",
        "Please enter a valid withdrawal address."
      );
      return;
    }

    setIsProcessing(true);
    setShowPendingModal(true);
    
    try {
      // Show pending modal for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await withdrawalMutation.mutateAsync({
        cryptoSymbol: selectedCrypto.symbol,
        cryptoName: selectedCrypto.name,
        chainType: selectedNetwork.chainType,
        networkName: selectedNetwork.networkName,
        withdrawalAddress,
        usdAmount: usdAmountNum,
        cryptoAmount: cryptoAmountNum,
      });
      
      // Store success data
      setSuccessData({
        usdAmount: usdAmount,
        cryptoAmount: cryptoAmount,
        cryptoSymbol: selectedCrypto.symbol
      });
      
      // Hide pending modal and show success
      setShowPendingModal(false);
      setShowSuccessModal(true);
      
      // Show success for 2 seconds then hide
      setTimeout(() => {
        setShowSuccessModal(false);
        setSuccessData(null);
        
        // Clear form
        setUsdAmount('');
        setCryptoAmount('');
        setWithdrawalAddress('');
      }, 2000);
      
      // Invalidate notifications and balance queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-[#0a0a2e] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[#0a0a2e] border-b border-[#1a1a40]">
        <Link href="/mobile/assets">
          <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
        </Link>
        <h1 className="text-base font-medium">Withdraw</h1>
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 px-3 py-4 space-y-3 overflow-y-auto pb-24">
        {/* Coin Selection */}
        <div>
          <label className="text-white font-medium mb-2 block text-xs">Coin</label>
          <div className="relative">
            <button
              onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
              className="w-full bg-[#1a1a40] border border-[#2a2a50] rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <img 
                  src={getCryptoLogo(selectedCrypto.symbol) || selectedCrypto.icon} 
                  alt={selectedCrypto.symbol}
                  className="w-6 h-6"
                  onError={(e) => {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center';
                    fallbackDiv.innerHTML = `<span class="text-white font-bold text-xs">${selectedCrypto.symbol.charAt(0)}</span>`;
                    e.currentTarget.parentNode?.replaceChild(fallbackDiv, e.currentTarget);
                  }}
                />
                <div>
                  <span className="text-white font-medium text-sm">{selectedCrypto.symbol}</span>
                  <span className="text-gray-400 ml-1 text-xs">{selectedCrypto.name}</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showCryptoDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a40] border border-[#2a2a50] rounded-lg z-10">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.symbol}
                    onClick={() => handleCryptoSelect(crypto)}
                    className="w-full p-3 text-left hover:bg-[#2a2a50] first:rounded-t-lg last:rounded-b-lg flex items-center space-x-2"
                  >
                    <img 
                      src={getCryptoLogo(crypto.symbol) || crypto.icon} 
                      alt={crypto.symbol}
                      className="w-5 h-5"
                    />
                    <div>
                      <span className="text-white text-sm">{crypto.symbol}</span>
                      <span className="text-gray-400 ml-1 text-xs">{crypto.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Address Input with QR Scanner */}
        <div>
          <label className="text-white font-medium mb-2 block text-xs">Address</label>
          <div className="relative">
            <Input
              type="text"
              value={withdrawalAddress}
              onChange={(e) => setWithdrawalAddress(e.target.value)}
              placeholder="Scan QR or enter withdrawal address"
              className="bg-[#1a1a40] border border-[#2a2a50] text-white placeholder:text-gray-500 pr-10 h-10 text-sm"
            />
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#2a2a50] rounded"
              onClick={startQrScanner}
            >
              <QrCode className="w-4 h-4 text-orange-500" />
            </button>
          </div>
        </div>

        {/* Network Selection */}
        <div>
          <label className="text-white font-medium mb-2 block text-xs">Network</label>
          <div className="relative">
            <button
              onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
              disabled={selectedCrypto.networks.length === 1}
              className="w-full bg-[#1a1a40] border border-[#2a2a50] rounded-lg p-3 flex items-center justify-between disabled:opacity-70"
            >
              <div className="flex flex-col items-start">
                <span className="text-white text-sm">
                  {selectedNetwork?.networkName || 'Select Network'}
                </span>
                {selectedNetwork && (
                  <span className="text-gray-400 text-xs">
                    Min: {selectedNetwork.minWithdrawal} {selectedCrypto.symbol}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showNetworkDropdown && selectedCrypto.networks.length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a40] border border-[#2a2a50] rounded-lg z-10">
                {selectedCrypto.networks.map((network) => (
                  <button
                    key={network.networkId}
                    onClick={() => {
                      setSelectedNetwork(network);
                      setShowNetworkDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-[#2a2a50] first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex flex-col">
                      <span className="text-white text-sm">{network.networkName}</span>
                      <span className="text-gray-400 text-xs">
                        Min: {network.minWithdrawal} {selectedCrypto.symbol}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-white font-medium mb-2 block text-xs">Amount</label>
          <Input
            type="text"
            value={usdAmount}
            onChange={handleUsdAmountChange}
            placeholder="0.00"
            className="bg-[#1a1a40] border border-[#2a2a50] text-white placeholder:text-gray-500 h-10 text-sm"
          />
          
          {/* Balance display */}
          <div className="mt-1 text-xs text-gray-400">
            Available: ${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </div>
          
          {/* Live USD to crypto conversion */}
          {cryptoAmount && (
            <div className="mt-1 text-xs text-orange-500">
              ≈ {cryptoAmount} {selectedCrypto.symbol}
            </div>
          )}
        </div>

        {/* QR Scanner Modal */}
        {showQrScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a40] rounded-lg p-4 w-80 max-w-[90vw]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Scan QR Code</h3>
                <button
                  onClick={stopQrScanner}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <video
                ref={videoRef}
                className="w-full h-48 bg-black rounded-lg"
                playsInline
              />
            </div>
          </div>
        )}

        {/* Pending Modal */}
        {showPendingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a40] rounded-lg p-6 w-80 max-w-[90vw] text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <h3 className="text-white font-medium mb-2">Processing Withdrawal</h3>
              <p className="text-gray-400 text-sm">Please wait while we process your withdrawal...</p>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && successData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a40] rounded-lg p-6 w-80 max-w-[90vw] text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Withdrawal Successful!</h3>
              <p className="text-gray-400 text-sm mb-2">
                Successfully withdrew ${successData.usdAmount} USD
              </p>
              <p className="text-gray-400 text-xs">
                ≈ {successData.cryptoAmount} {successData.cryptoSymbol}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="p-3 bg-[#0a0a2e] border-t border-[#1a1a40]">
        <Button
          onClick={handleWithdraw}
          disabled={!selectedNetwork || !withdrawalAddress || !usdAmount || isProcessing}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium h-12 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Withdraw'}
        </Button>
      </div>
    </div>
  );
}