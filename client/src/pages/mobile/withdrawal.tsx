import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ChevronDown, HelpCircle, QrCode, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
    icon: btcLogo,
    networks: [
      {
        networkId: 'bitcoin',
        networkName: 'Bitcoin Network',
        chainType: 'Bitcoin',
        minWithdrawal: 0.00027
      }
    ]
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: ethLogo,
    networks: [
      {
        networkId: 'erc20',
        networkName: 'Ethereum (ERC20)',
        chainType: 'ERC20',
        minWithdrawal: 0.01
      }
    ]
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    icon: usdtLogo,
    networks: [
      {
        networkId: 'erc20',
        networkName: 'Ethereum (ERC20)',
        chainType: 'ERC20',
        minWithdrawal: 10
      },
      {
        networkId: 'trc20',
        networkName: 'TRON (TRC20)',
        chainType: 'TRC20',
        minWithdrawal: 1
      },
      {
        networkId: 'bep20',
        networkName: 'BNB Smart Chain (BEP20)',
        chainType: 'BEP20',
        minWithdrawal: 1
      }
    ]
  }
];

export default function MobileWithdrawal() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
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

  // Only USD input is used - no reverse calculation needed

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
            toast({
              title: "Address Scanned",
              description: "Wallet address has been detected and filled in.",
            });
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
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please enter address manually.",
        variant: "destructive",
      });
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
      toast({
        title: "Withdrawal Processed",
        description: `Successfully withdrew $${usdAmount} USD via ${selectedCrypto.symbol}`,
      });
      
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
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle withdrawal submission
  const handleWithdraw = async () => {
    if (!selectedNetwork || !withdrawalAddress || !usdAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const usdAmountNum = parseFloat(usdAmount);
    const cryptoAmountNum = parseFloat(cryptoAmount || '0');
    
    if (isNaN(usdAmountNum) || usdAmountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid USD amount.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(cryptoAmountNum) || cryptoAmountNum <= 0) {
      toast({
        title: "Invalid Crypto Amount",
        description: "Unable to calculate crypto amount. Please check the exchange rate.",
        variant: "destructive",
      });
      return;
    }

    if (cryptoAmountNum < selectedNetwork.minWithdrawal) {
      toast({
        title: "Amount Too Low",
        description: `Minimum withdrawal amount is ${selectedNetwork.minWithdrawal} ${selectedCrypto.symbol}`,
        variant: "destructive",
      });
      return;
    }

    if (usdAmountNum > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    // Basic address validation
    if (withdrawalAddress.length < 10) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid withdrawal address.",
        variant: "destructive",
      });
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
        
        // Show success toast
        toast({
          title: "Withdrawal Completed! 🎉",
          description: `Successfully withdrew $${parseFloat(usdAmount).toFixed(2)} as ${parseFloat(cryptoAmount).toFixed(8)} ${selectedCrypto.symbol}. You'll receive a notification when processed.`,
          variant: "default",
        });
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

      {/* Content */}
      <div className="flex-1 px-3 py-4 space-y-3 overflow-hidden">
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

          {/* Network Selection - Improved */}
          <div>
            <label className="text-white font-medium mb-2 block text-xs">Network</label>
            <div className="relative">
              <button
                onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                disabled={selectedCrypto.networks.length === 1}
                className="w-full bg-[#1a1a40] border border-[#2a2a50] rounded-lg p-3 flex items-center justify-between disabled:opacity-70"
              >
                <div className="flex flex-col items-start">
                  <span className="text-white text-sm font-medium">
                    {selectedNetwork ? selectedNetwork.chainType : 'Choose network'}
                  </span>
                  {selectedNetwork && (
                    <span className="text-gray-400 text-xs">
                      {selectedNetwork.networkName}
                    </span>
                  )}
                </div>
                {selectedCrypto.networks.length > 1 && (
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showNetworkDropdown ? 'rotate-180' : ''}`} />
                )}
              </button>
              
              {showNetworkDropdown && selectedCrypto.networks.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a40] border border-[#2a2a50] rounded-lg z-10 shadow-lg">
                  {selectedCrypto.networks.map((network, index) => (
                    <button
                      key={network.networkId}
                      onClick={() => {
                        setSelectedNetwork(network);
                        setShowNetworkDropdown(false);
                      }}
                      className={`w-full p-3 text-left hover:bg-[#2a2a50] transition-colors ${
                        index === 0 ? 'rounded-t-lg' : ''
                      } ${
                        index === selectedCrypto.networks.length - 1 ? 'rounded-b-lg' : ''
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">{network.chainType}</span>
                        <span className="text-gray-400 text-xs">{network.networkName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Balance - Simple text display */}
          <div className="mb-2">
            <span className="text-gray-400 text-xs">
              Available: ${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* USD Amount Input - Recreated */}
          <div>
            <label className="text-white font-medium mb-2 block text-xs">Amount to Withdraw</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={usdAmount}
                onChange={handleUsdAmountChange}
                placeholder="Enter amount like 100.00"
                className="w-full bg-[#1a1a40] border border-[#2a2a50] rounded-md text-white placeholder:text-gray-500 pr-16 h-10 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <span className="text-orange-500 font-medium text-xs">USD</span>
                <button 
                  type="button"
                  className="text-orange-500 text-xs hover:text-orange-400"
                  onClick={() => {
                    const maxAmount = userBalance.toFixed(2);
                    setUsdAmount(maxAmount);
                    
                    // Trigger crypto amount calculation
                    const amount = parseFloat(maxAmount);
                    if (amount > 0 && priceData) {
                      const cryptoData = (priceData as any)?.success && Array.isArray((priceData as any)?.data) 
                        ? (priceData as any).data.find((crypto: any) => crypto.symbol === selectedCrypto.symbol)
                        : null;
                      
                      const price = cryptoData?.price;
                      if (price && price > 0) {
                        setCryptoAmount((amount / price).toFixed(8));
                      }
                    }
                  }}
                >
                  Max
                </button>
              </div>
            </div>
            
            {/* Live Conversion Display */}
            {usdAmount && cryptoAmount && parseFloat(usdAmount) > 0 && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-400">You will receive:</span>
                <div className="flex items-center space-x-1">
                  <img 
                    src={getCryptoLogo(selectedCrypto.symbol) || selectedCrypto.icon} 
                    alt={selectedCrypto.symbol}
                    className="w-4 h-4"
                  />
                  <span className="text-white font-medium">
                    {parseFloat(cryptoAmount).toFixed(8)} {selectedCrypto.symbol}
                  </span>
                </div>
              </div>
            )}
          </div>

        {/* Withdrawal Summary - Above Button */}
        <div className="px-3 pb-2 bg-[#0a0a2e]">
          {/* Withdrawal Fees */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Withdrawal Fees</span>
            <span className="text-white font-medium text-sm">0.00011 {selectedCrypto.symbol}</span>
          </div>
          
          {/* Amount Received */}
          {cryptoAmount && parseFloat(cryptoAmount) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Amount Received <span className="text-orange-500">Setting</span></span>
              <span className="text-white font-bold text-lg">
                {parseFloat(cryptoAmount).toFixed(8)} {selectedCrypto.symbol}
              </span>
            </div>
          )}
        </div>

        {/* Fixed Withdraw Button */}
        <div className="p-3 bg-[#0a0a2e] border-t border-[#1a1a40]">
          <Button
            onClick={handleWithdraw}
            disabled={!selectedNetwork || !withdrawalAddress || !usdAmount || parseFloat(usdAmount || '0') <= 0 || isProcessing}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:text-gray-400 text-white py-4 rounded-lg font-medium text-lg flex items-center justify-center space-x-2"
          >
            <span>{isProcessing ? 'Processing...' : 'Withdraw'}</span>
            {!isProcessing && usdAmount && parseFloat(usdAmount) > 0 && cryptoAmount && (
              <span className="text-white font-bold">
                {parseFloat(cryptoAmount).toFixed(8)} {selectedCrypto.symbol}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-[#0a0a2e] p-4 rounded-lg w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Scan QR Code</h3>
              <button onClick={stopQrScanner} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <video ref={videoRef} className="w-full rounded-lg" />
            <p className="text-gray-400 text-sm text-center mt-2">
              Point your camera at the QR code
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#1a1a40] p-8 rounded-xl border border-[#2a2a50] flex flex-col items-center space-y-4 mx-4 max-w-sm w-full">
            {/* Success Checkmark with animation */}
            <div className="relative">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-12 h-12 text-white animate-bounce" />
              </div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-green-400 rounded-full animate-ping opacity-75"></div>
            </div>
            
            {/* Success Text */}
            <div className="text-center">
              <h3 className="text-white font-bold text-xl mb-2">Withdrawal Successful!</h3>
              <p className="text-green-400 text-sm font-medium mb-3">
                Your transaction has been processed
              </p>
              <div className="bg-[#0a0a2e] rounded-lg p-3 border border-[#2a2a50]">
                <p className="text-orange-500 text-sm">
                  ${parseFloat(successData.usdAmount).toFixed(2)} → {parseFloat(successData.cryptoAmount).toFixed(8)} {successData.cryptoSymbol}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Processing Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#1a1a40] p-8 rounded-xl border border-[#2a2a50] flex flex-col items-center space-y-4">
            {/* Spinning Wheel */}
            <div className="w-16 h-16 border-4 border-gray-600 border-t-orange-500 rounded-full animate-spin"></div>
            
            {/* Processing Text */}
            <div className="text-center">
              <h3 className="text-white font-medium text-lg mb-2">Processing Withdrawal</h3>
              <p className="text-gray-400 text-sm">
                Your withdrawal is being processed...
              </p>
              <p className="text-orange-500 text-xs mt-2">
                ${parseFloat(usdAmount || '0').toFixed(2)} → {parseFloat(cryptoAmount || '0').toFixed(8)} {selectedCrypto.symbol}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}