import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ChevronRight, Check } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface Transaction {
  id: number;
  cryptoSymbol: string;
  amount: number;
  status: string;
  timestamp: string;
  type: string;
}

export default function AssetHistoryPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Deposit');
  const [selectedAsset, setSelectedAsset] = useState('All Assets');

  // Get notification ID from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const notificationId = urlParams.get('notificationId');

  // Mock transaction data based on the uploaded images
  const mockTransactions: Transaction[] = [
    {
      id: 1,
      cryptoSymbol: 'BNB',
      amount: 0.00399334,
      status: 'Succeeded',
      timestamp: '2025-06-15 03:57:28',
      type: 'deposit'
    },
    {
      id: 2,
      cryptoSymbol: 'BNB',
      amount: 0.00049602,
      status: 'Succeeded',
      timestamp: '2025-06-13 21:42:01',
      type: 'deposit'
    },
    {
      id: 3,
      cryptoSymbol: 'BNB',
      amount: 0.00078271,
      status: 'Succeeded',
      timestamp: '2025-06-08 17:05:41',
      type: 'deposit'
    }
  ];

  const handleTransactionClick = (transaction: Transaction) => {
    setLocation(`/mobile/deposit-details/${transaction.id}`);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const filteredTransactions = activeTab === 'Deposit' 
    ? mockTransactions.filter(tx => tx.type === 'deposit')
    : mockTransactions;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/mobile/notifications')}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Asset History</h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('All Transactions')}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
              activeTab === 'All Transactions'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setActiveTab('Deposit')}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
              activeTab === 'Deposit'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('Withdraw')}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
              activeTab === 'Withdraw'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Withdraw
          </button>
          <button
            onClick={() => setActiveTab('Transfer')}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
              activeTab === 'Transfer'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Transfer
          </button>
        </div>

        {/* Asset Filter */}
        <div className="flex items-center space-x-4 p-4 border-b border-gray-800">
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
          >
            <option value="All Assets">All Assets</option>
            <option value="BNB">BNB</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
          </select>
          
          <select
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
          >
            <option value="Deposit">Deposit</option>
            <option value="All">All</option>
          </select>
        </div>
      </div>

      <div className="p-4">
        {/* Transaction List */}
        <div className="space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <Card 
                key={transaction.id} 
                className="bg-gray-900 border-gray-800 p-4 cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleTransactionClick(transaction)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-white text-lg">
                        {transaction.cryptoSymbol}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-green-500 text-sm font-medium">
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      {transaction.timestamp}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-semibold text-lg mb-1">
                      {transaction.amount.toFixed(8)}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No transactions found</div>
              <div className="text-sm text-gray-500">
                {activeTab === 'Deposit' ? 'No deposits yet' : `No ${activeTab.toLowerCase()} transactions yet`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}