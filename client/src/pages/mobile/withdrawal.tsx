import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ChevronDown, HelpCircle, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import MobileLayout from '@/components/mobile-layout';
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

  const userBalance = (balanceData as any)?.data?.balance || 0;

  // Calculate amounts when one changes
  useEffect(() => {
    if (!cryptoAmount || !priceData) {
      setUsdAmount('');
      return;
    }

    const amount = parseFloat(cryptoAmount);
    if (isNaN(amount) || amount <= 0) {
      setUsdAmount('');
      return;
    }

    const price = (priceData as any)?.[selectedCrypto.symbol.toLowerCase()];
    if (price && price > 0) {
      setUsdAmount((amount * price).toFixed(2));
    }
  }, [cryptoAmount, selectedCrypto.symbol, priceData]);

  // Calculate crypto amount from USD
  const handleUsdAmountChange = (value: string) => {
    setUsdAmount(value);
    
    if (!value || !priceData) {
      setCryptoAmount('');
      return;
    }

    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) {
      setCryptoAmount('');
      return;
    }

    const price = (priceData as any)?.[selectedCrypto.symbol.toLowerCase()];
    if (price && price > 0) {
      setCryptoAmount((amount / price).toFixed(8));
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
    if (!selectedNetwork || !withdrawalAddress || !cryptoAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const cryptoAmountNum = parseFloat(cryptoAmount);
    const usdAmountNum = parseFloat(usdAmount);
    
    if (isNaN(cryptoAmountNum) || cryptoAmountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(usdAmountNum) || usdAmountNum <= 0) {
      toast({
        title: "Invalid USD Amount",
        description: "Please enter a valid USD amount.",
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
    
    try {
      await withdrawalMutation.mutateAsync({
        cryptoSymbol: selectedCrypto.symbol,
        cryptoName: selectedCrypto.name,
        chainType: selectedNetwork.chainType,
        networkName: selectedNetwork.networkName,
        withdrawalAddress,
        usdAmount: usdAmountNum,
        cryptoAmount: cryptoAmountNum,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MobileLayout>
      <div className="h-screen bg-[#0a0a2e] text-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#0a0a2e] border-b border-[#1a1a40]">
          <Link href="/mobile/assets">
            <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-white" />
          </Link>
          <h1 className="text-lg font-medium">Withdraw</h1>
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-gray-400" />
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

        {/* Content */}
        <div className="flex-1 px-4 py-6 space-y-4 overflow-hidden">
          {/* Available Balance Card */}
          <div className="bg-[#1a1a40] border border-[#2a2a50] rounded-lg p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Available Balance</p>
              <p className="text-white text-2xl font-bold">${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Coin Selection */}
          <div>
            <label className="text-white font-medium mb-3 block text-sm">Coin</label>
            <div className="relative">
              <button
                onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
                className="w-full bg-[#1a1a40] border border-[#2a2a50] rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={getCryptoLogo(selectedCrypto.symbol) || selectedCrypto.icon} 
                    alt={selectedCrypto.symbol}
                    className="w-8 h-8"
                    onError={(e) => {
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center';
                      fallbackDiv.innerHTML = `<span class="text-white font-bold text-sm">${selectedCrypto.symbol.charAt(0)}</span>`;
                      e.currentTarget.parentNode?.replaceChild(fallbackDiv, e.currentTarget);
                    }}
                  />
                  <div>
                    <span className="text-white font-medium">{selectedCrypto.symbol}</span>
                    <span className="text-gray-400 ml-2">{selectedCrypto.name}</span>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              
              {showCryptoDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a40] border border-[#2a2a50] rounded-lg z-10">
                  {cryptoOptions.map((crypto) => (
                    <button
                      key={crypto.symbol}
                      onClick={() => handleCryptoSelect(crypto)}
                      className="w-full p-4 text-left hover:bg-[#2a2a50] first:rounded-t-lg last:rounded-b-lg flex items-center space-x-3"
                    >
                      <img 
                        src={getCryptoLogo(crypto.symbol) || crypto.icon} 
                        alt={crypto.symbol}
                        className="w-6 h-6"
                      />
                      <div>
                        <span className="text-white">{crypto.symbol}</span>
                        <span className="text-gray-400 ml-2 text-sm">{crypto.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Address Input with QR Scanner */}
          <div>
            <label className="text-white font-medium mb-3 block text-sm">Address</label>
            <div className="relative">
              <Input
                type="text"
                value={withdrawalAddress}
                onChange={(e) => setWithdrawalAddress(e.target.value)}
                placeholder="Scan QR or enter withdrawal address"
                className="bg-[#1a1a40] border border-[#2a2a50] text-white placeholder:text-gray-500 pr-12 h-12"
              />
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#2a2a50] rounded"
                onClick={startQrScanner}
              >
                <QrCode className="w-5 h-5 text-orange-500" />
              </button>
            </div>
          </div>

          {/* Network Selection */}
          <div>
            <label className="text-white font-medium mb-3 block text-sm">Network</label>
            <div className="relative">
              <button
                onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                className="w-full bg-[#1a1a40] border border-[#2a2a50] rounded-lg p-4 flex items-center justify-between"
              >
                <span className="text-gray-400">
                  {selectedNetwork ? selectedNetwork.chainType : 'Please choose a chain type'}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
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
                      className="w-full p-4 text-left hover:bg-[#2a2a50] first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span className="text-white">{network.chainType}</span>
                      <div className="text-xs text-gray-400 mt-1">{network.networkName}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* USD Amount Input */}
          <div>
            <label className="text-white font-medium mb-3 block text-sm">Withdrawal Amount (USD)</label>
            <div className="relative">
              <Input
                type="number"
                value={usdAmount}
                onChange={(e) => handleUsdAmountChange(e.target.value)}
                placeholder="Enter USD amount to withdraw"
                className="bg-[#1a1a40] border border-[#2a2a50] text-white placeholder:text-gray-500 pr-20 h-12"
                step="0.01"
                min="0"
                max={userBalance}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <span className="text-orange-500 font-medium">USD</span>
                <button 
                  className="text-orange-500 text-sm hover:text-orange-400"
                  onClick={() => {
                    setUsdAmount(userBalance.toFixed(2));
                  }}
                >
                  Max
                </button>
              </div>
            </div>
            {/* Crypto Equivalent Display */}
            {cryptoAmount && parseFloat(cryptoAmount) > 0 && (
              <div className="mt-2 p-3 bg-[#2a2a50] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">You will receive:</span>
                  <div className="flex items-center space-x-2">
                    <img 
                      src={getCryptoLogo(selectedCrypto.symbol) || ''} 
                      alt={selectedCrypto.symbol}
                      className="w-5 h-5"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-white font-medium">
                      {parseFloat(cryptoAmount).toFixed(8)} {selectedCrypto.symbol}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Withdraw Button */}
        <div className="p-4 bg-[#0a0a2e] border-t border-[#1a1a40]">
          <Button
            onClick={handleWithdraw}
            disabled={!selectedNetwork || !withdrawalAddress || !cryptoAmount || isProcessing}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:text-gray-400 text-white py-4 rounded-lg font-medium"
          >
            {isProcessing ? 'Processing...' : 'Withdraw'}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}