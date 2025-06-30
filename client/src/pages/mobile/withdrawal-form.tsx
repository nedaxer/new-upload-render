import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ChevronDown, HelpCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import MobileLayout from '@/components/mobile-layout';

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
    icon: '₿',
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
    icon: 'Ξ',
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
    icon: '₮',
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
    onSuccess: () => {
      toast({
        title: "Withdrawal Submitted",
        description: `Your ${selectedCrypto.symbol} withdrawal has been submitted successfully.`,
      });
      
      // Reset form and navigate
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
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

        {/* Tab Header */}
        <div className="flex border-b border-[#1a1a40] bg-[#0a0a2e] px-4">
          <button className="flex-1 py-3 text-center font-medium text-orange-500 border-b-2 border-orange-500 text-sm">
            On-Chain
          </button>
          <button className="flex-1 py-3 text-center font-medium text-gray-400 text-sm opacity-50 cursor-not-allowed">
            Internal Transfer
          </button>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Coin Selection */}
          <div>
            <label className="text-white font-medium mb-3 block text-sm">Coin</label>
            <div className="bg-[#1a1a40] border border-[#2a2a50] rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{selectedCrypto.icon}</span>
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
              <textarea
                value={withdrawalAddress}
                onChange={(e) => setWithdrawalAddress(e.target.value)}
                placeholder="Input or press and hold to paste the withdrawal address"
                className="w-full bg-[#1a1a40] border border-[#2a2a50] rounded-lg p-4 text-white placeholder:text-gray-500 min-h-[80px] resize-none"
              />
              <button className="absolute top-3 right-3 p-2 hover:bg-[#2a2a50] rounded">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
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

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium text-sm">Amount</label>
              <div className="flex items-center space-x-1">
                <span className="text-orange-500 text-sm">0</span>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <Input
                type="number"
                value={cryptoAmount}
                onChange={(e) => setCryptoAmount(e.target.value)}
                placeholder={selectedNetwork ? `Min. Withdrawal Amount: ${selectedNetwork.minWithdrawal}` : '0.00'}
                className="bg-[#1a1a40] border border-[#2a2a50] text-white placeholder:text-gray-500 pr-20"
                step="0.00000001"
                min="0"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <span className="text-orange-500 font-medium">{selectedCrypto.symbol}</span>
                <button className="text-orange-500 text-sm hover:text-orange-400">
                  Max
                </button>
              </div>
            </div>
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