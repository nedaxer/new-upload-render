import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ChevronRight, X, Copy, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import MobileLayout from '@/components/mobile-layout';

interface CryptoOption {
  symbol: string;
  name: string;
  networks: NetworkOption[];
}

interface NetworkOption {
  networkId: string;
  networkName: string;
  chainType: string;
}

const cryptoOptions: CryptoOption[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    networks: [
      {
        networkId: 'bitcoin',
        networkName: 'Bitcoin Network',
        chainType: 'Bitcoin'
      }
    ]
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    networks: [
      {
        networkId: 'erc20',
        networkName: 'Ethereum (ERC20)',
        chainType: 'ERC20'
      },
      {
        networkId: 'trc20',
        networkName: 'TRON (TRC20)',
        chainType: 'TRC20'
      },
      {
        networkId: 'bep20',
        networkName: 'BNB Smart Chain (BEP20)',
        chainType: 'BEP20'
      }
    ]
  }
];

interface WithdrawalMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'crypto' | 'fiat') => void;
}

function WithdrawalMethodModal({ isOpen, onClose, onSelectMethod }: WithdrawalMethodModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999999999]">
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a2e] border-t border-[#1a1a40] text-white rounded-t-2xl animate-slide-up max-h-[70vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex flex-row items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Select Withdrawal Method</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-medium mb-3 text-sm">Crypto Withdrawal</h3>
              
              <button 
                onClick={() => onSelectMethod('crypto')}
                className="w-full flex items-center justify-between p-4 bg-[#1a1a40] border border-[#2a2a50] rounded-lg hover:bg-[#2a2a50] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">₿</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">Crypto Networks</p>
                    <p className="text-gray-400 text-xs">BTC, USDT (ERC20, TRC20, BEP20)</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div>
              <h3 className="text-white font-medium mb-3 text-sm">Fiat Withdrawal</h3>
              
              <button 
                onClick={() => onSelectMethod('fiat')}
                className="w-full flex items-center justify-between p-4 bg-[#1a1a40] border border-[#2a2a50] rounded-lg hover:bg-[#2a2a50] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">$</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">Bank Transfer</p>
                    <p className="text-gray-400 text-xs">Withdraw to bank account</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

function ComingSoonModal({ isOpen, onClose, title, message }: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999999999]">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-[#0a0a2e] border border-[#1a1a40] rounded-2xl p-6 w-full max-w-sm">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <Button 
              onClick={onClose}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobileWithdrawal() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Modal states
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  
  // Form states
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption | null>(null);
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState(0);
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

  // Calculate crypto amount when USD amount changes
  useEffect(() => {
    if (!selectedCrypto || !usdAmount || !priceData) {
      setCryptoAmount(0);
      return;
    }

    const amount = parseFloat(usdAmount);
    if (isNaN(amount) || amount <= 0) {
      setCryptoAmount(0);
      return;
    }

    const price = (priceData as any)?.[selectedCrypto.symbol.toLowerCase()];
    if (price && price > 0) {
      setCryptoAmount(amount / price);
    }
  }, [selectedCrypto, usdAmount, priceData]);

  // Handle withdrawal method selection
  const handleMethodSelect = (method: 'crypto' | 'fiat') => {
    setShowMethodModal(false);
    if (method === 'fiat') {
      setShowComingSoonModal(true);
    }
  };

  // Handle crypto selection
  const handleCryptoSelect = (crypto: CryptoOption) => {
    setSelectedCrypto(crypto);
    // Auto-select first network if only one available
    if (crypto.networks.length === 1) {
      setSelectedNetwork(crypto.networks[0]);
    } else {
      setSelectedNetwork(null);
    }
    setWithdrawalAddress('');
    setUsdAmount('');
  };

  // Handle network selection
  const handleNetworkSelect = (network: NetworkOption) => {
    setSelectedNetwork(network);
    setWithdrawalAddress('');
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
        title: "Withdrawal Successful",
        description: `Your ${selectedCrypto?.symbol} withdrawal has been initiated successfully.`,
      });
      
      // Reset form
      setSelectedCrypto(null);
      setSelectedNetwork(null);
      setWithdrawalAddress('');
      setUsdAmount('');
      setCryptoAmount(0);
      
      // Refresh balance
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      
      // Navigate back to assets
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
    if (!selectedCrypto || !selectedNetwork || !withdrawalAddress || !usdAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(usdAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (amount > userBalance) {
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
        usdAmount: amount,
        cryptoAmount,
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
          <Link href="/mobile/assets">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-lg font-medium">Withdraw</h1>
          <div className="w-6 h-6" />
        </div>

        <div className="px-4 space-y-6">
          {/* Balance Display */}
          <Card className="bg-[#1a1a40] border-[#2a2a50] p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <h2 className="text-2xl font-bold text-white">
                ${userBalance.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </h2>
            </div>
          </Card>

          {/* Withdrawal Method Selection */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Withdrawal Method</label>
            <button
              onClick={() => setShowMethodModal(true)}
              className="w-full flex items-center justify-between p-4 bg-[#1a1a40] border border-[#2a2a50] rounded-lg hover:bg-[#2a2a50] transition-colors"
            >
              <span className="text-gray-400 text-sm">
                {selectedCrypto ? `${selectedCrypto.symbol} - ${selectedCrypto.name}` : 'Select withdrawal method'}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Network Selection */}
          {selectedCrypto && selectedCrypto.networks.length > 1 && (
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Network</label>
              <div className="space-y-2">
                {selectedCrypto.networks.map((network) => (
                  <button
                    key={network.networkId}
                    onClick={() => handleNetworkSelect(network)}
                    className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      selectedNetwork?.networkId === network.networkId
                        ? 'bg-orange-500/20 border-orange-500 text-orange-500'
                        : 'bg-[#1a1a40] border-[#2a2a50] text-gray-400 hover:bg-[#2a2a50]'
                    }`}
                  >
                    <span className="text-sm font-medium">{network.networkName}</span>
                    <span className="text-xs">{network.chainType}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Withdrawal Address */}
          {selectedNetwork && (
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                {selectedCrypto?.symbol} Address ({selectedNetwork.chainType})
              </label>
              <div className="relative">
                <Input
                  value={withdrawalAddress}
                  onChange={(e) => setWithdrawalAddress(e.target.value)}
                  placeholder={`Enter ${selectedCrypto?.symbol} address`}
                  className="bg-[#1a1a40] border-[#2a2a50] text-white placeholder:text-gray-500 pr-10"
                />
                {withdrawalAddress && (
                  <button
                    onClick={() => copyToClipboard(withdrawalAddress)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Make sure this address supports {selectedNetwork.networkName}
              </p>
            </div>
          )}

          {/* Amount Input */}
          {selectedNetwork && (
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Amount (USD)</label>
              <Input
                type="number"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                placeholder="0.00"
                className="bg-[#1a1a40] border-[#2a2a50] text-white placeholder:text-gray-500"
                step="0.01"
                min="0"
                max={userBalance}
              />
              {cryptoAmount > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  ≈ {cryptoAmount.toFixed(8)} {selectedCrypto?.symbol}
                </p>
              )}
            </div>
          )}

          {/* Withdraw Button */}
          {selectedNetwork && withdrawalAddress && usdAmount && (
            <Button
              onClick={handleWithdraw}
              disabled={isProcessing || withdrawalMutation.isPending}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-base font-medium"
            >
              {isProcessing || withdrawalMutation.isPending ? 'Processing...' : 'Withdraw'}
            </Button>
          )}

          {/* Important Notes */}
          <Card className="bg-[#1a1a40] border-[#2a2a50] p-4">
            <h3 className="text-sm font-medium text-white mb-2">Important Notes</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Withdrawals are processed immediately and cannot be reversed</li>
              <li>• Make sure to double-check the withdrawal address</li>
              <li>• Network fees may apply depending on blockchain congestion</li>
              <li>• Minimum withdrawal amount may apply</li>
            </ul>
          </Card>
        </div>

        {/* Modals */}
        <WithdrawalMethodModal
          isOpen={showMethodModal}
          onClose={() => setShowMethodModal(false)}
          onSelectMethod={handleMethodSelect}
        />

        <ComingSoonModal
          isOpen={showComingSoonModal}
          onClose={() => setShowComingSoonModal(false)}
          title="Feature Coming Soon"
          message="Fiat withdrawals will be available soon. For now, you can withdraw using cryptocurrency networks."
        />
      </div>
    </MobileLayout>
  );
}