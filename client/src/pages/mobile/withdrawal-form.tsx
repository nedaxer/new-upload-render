import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ChevronDown, HelpCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import MobileLayout from '@/components/mobile-layout';

// Crypto logos
const btcLogo = '/logos/btc-logo.svg';
const ethLogo = '/logos/eth-logo.svg';
const usdtLogo = '/logos/usdt-logo.svg';
const bnbLogo = '/logos/bnb-logo.svg';

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
    case 'bnb':
      return bnbLogo;
    default:
      return null;
  }
};

interface CryptoOption {
  symbol: string;
  name: string;
  icon: string;
  networks: NetworkOption[];
}

interface NetworkOption {
  networkId: string;
  networkName: string;
  chainType: string;
  minWithdrawal: number;
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

interface WithdrawalFormProps {
  selectedCrypto: CryptoOption;
  onBack: () => void;
}

export default function WithdrawalForm({ selectedCrypto, onBack }: WithdrawalFormProps) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption | null>(
    selectedCrypto.networks.length === 1 ? selectedCrypto.networks[0] : null
  );
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
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
      
      // Immediately invalidate and refetch all related data for real-time updates
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
    
    console.log('Withdrawal validation:', {
      cryptoAmount,
      usdAmount,
      cryptoAmountNum,
      usdAmountNum,
      selectedNetwork,
      withdrawalAddress
    });
    
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-[#0a0a2e] text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
          <button onClick={onBack} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-medium">Withdraw</h1>
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <div className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center">
              <span className="text-xs text-white">📋</span>
            </div>
          </div>
        </div>

        {/* Withdrawal Method Header */}
        <div className="border-b border-[#1a1a40] bg-[#0a0a2e] px-4 py-3">
          <h2 className="text-center font-medium text-orange-500 text-sm">
            Crypto Withdrawal Gateway
          </h2>
          <p className="text-center text-xs text-gray-400 mt-1">
            Withdraw USD via cryptocurrency networks
          </p>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Coin Selection */}
          <div>
            <label className="text-white font-medium mb-3 block text-sm">Coin</label>
            <div className="bg-[#1a1a40] border border-[#2a2a50] rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img 
                    src={getCryptoLogo(selectedCrypto.symbol) || selectedCrypto.icon} 
                    alt={selectedCrypto.symbol}
                    className="w-8 h-8"
                    onError={(e) => {
                      // Fallback to text icon if image fails
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center';
                      fallbackDiv.innerHTML = `<span class="text-white font-bold text-sm">${selectedCrypto.symbol.charAt(0)}</span>`;
                      e.currentTarget.parentNode?.replaceChild(fallbackDiv, e.currentTarget);
                    }}
                  />
                </div>
                <div>
                  <span className="text-white font-medium">{selectedCrypto.symbol}</span>
                  <span className="text-gray-400 ml-2">{selectedCrypto.name}</span>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Address Input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium text-sm">Address</label>
              <button className="text-gray-400 text-sm hover:text-white">
                Address Book
                <ChevronDown className="w-4 h-4 inline ml-1" />
              </button>
            </div>
            <div className="relative">
              <Input
                type="text"
                value={withdrawalAddress}
                onChange={(e) => setWithdrawalAddress(e.target.value)}
                placeholder="Input or press and hold to paste the withdrawal address"
                className="bg-[#1a1a40] border border-[#2a2a50] text-white placeholder:text-gray-500 pr-12 h-12"
              />
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#2a2a50] rounded"
                onClick={() => {
                  // QR scan functionality - placeholder for now
                  toast({
                    title: "QR Scanner",
                    description: "QR code scanning coming soon",
                  });
                }}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3v-10c0-2-1-3-3-3h-10c-2 0-3 1-3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11l2 2 4-4" />
                </svg>
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
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium text-sm">Withdrawal Amount (USD)</label>
              <div className="flex items-center space-x-1">
                <span className="text-orange-500 text-sm">${userBalance.toFixed(2)}</span>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
            </div>
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
            {/* Available Balance */}
            <div className="mt-1 text-xs text-gray-500">
              Available: ${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
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

          {/* Funding Account */}
          <div>
            <label className="text-white font-medium mb-3 block text-sm">Funding Account:</label>
            <div className="text-white text-lg font-bold">
              ${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Note Section */}
          <div className="bg-[#1a1a40] rounded-lg p-4">
            <div className="text-white font-medium text-sm mb-2">Note:</div>
            <div className="text-gray-400 text-xs">
              Daily Remaining Limit: 1,000,000/1,000,000 USDT
              <HelpCircle className="w-3 h-3 inline ml-1" />
            </div>
            <div className="text-orange-500 text-xs mt-2 underline">
              Need help? Please visit our Help Center.
            </div>
          </div>

          {/* Fee Information */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Withdrawal Fees</span>
              <span className="text-white">0.00011 {selectedCrypto.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Amount Received</span>
              <span className="text-white">
                {cryptoAmount ? (parseFloat(cryptoAmount) - 0.00011).toFixed(8) : '0'} {selectedCrypto.symbol}
              </span>
            </div>
          </div>

          {/* Withdraw Button */}
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