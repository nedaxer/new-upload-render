import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

// Removed crypto logos as per user request

export default function AssetsHistory() {
  const [activeTab, setActiveTab] = useState('All Transactions');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  
  // Determine back navigation path based on referrer
  const getBackPath = () => {
    // Check if we came from notifications (check URL parameters or localStorage)
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from') || localStorage.getItem('assetsHistoryReferrer') || 'assets';
    
    if (from === 'notifications') {
      return '/mobile/notifications';
    }
    return '/mobile/assets';
  };

  // Fetch deposit transactions for authenticated user only
  const { data: depositsResponse, isLoading: isLoadingDeposits } = useQuery({
    queryKey: ['/api/deposits/history'],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds for new deposits
    retry: 3,
    retryDelay: 1000,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache to avoid stale data (replaces cacheTime in newer versions)
  });

  // Fetch transfer transactions for authenticated user only
  const { data: transfersResponse, isLoading: isLoadingTransfers } = useQuery({
    queryKey: ['/api/transfers/history'],
    enabled: !!user,
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
    staleTime: 0,
    gcTime: 0,
  });

  const deposits = Array.isArray((depositsResponse as any)?.data) ? (depositsResponse as any).data : [];
  const transfers = Array.isArray((transfersResponse as any)?.data) ? (transfersResponse as any).data : [];
  
  // Combine and sort all transactions
  const allTransactions = [...deposits, ...transfers].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Filter transactions based on active tab
  const getFilteredTransactions = () => {
    switch(activeTab) {
      case 'All Transactions':
        return allTransactions;
      case 'Deposit':
        return deposits;
      case 'Transfer':
        return transfers;
      case 'Withdraw':
        return []; // No withdrawals implemented yet
      default:
        return allTransactions;
    }
  };
  
  const transactions = getFilteredTransactions();
  const isLoading = isLoadingDeposits || isLoadingTransfers;
  
  // Force refresh when user changes
  useEffect(() => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ['/api/deposits/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transfers/history'] });
    }
  }, [user, queryClient]);

  // WebSocket connection for real-time transaction updates
  useEffect(() => {
    let socket: WebSocket;
    
    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('WebSocket connected for real-time transaction updates');
        socket.send(JSON.stringify({ type: 'subscribe_notifications' }));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Real-time transaction update received:', data);
          
          if (data.type === 'DEPOSIT_CREATED' || data.type === 'TRANSFER_CREATED') {
            // Refresh transaction history when new deposits or transfers are created
            queryClient.invalidateQueries({ queryKey: ['/api/deposits/history'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transfers/history'] });
            console.log('Transaction history refreshed due to new deposit/transfer');
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 3000);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };
    
    if (user) {
      connectWebSocket();
    }
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [user, queryClient]);

  const historyTabs = ['All Transactions', 'Deposit', 'Withdraw', 'Transfer'];

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Link href={getBackPath()}>
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-lg font-semibold">Asset History</h1>
        <div className="w-6 h-6" />
      </div>

      {/* Transaction Tabs */}
      <div className="px-4 py-4 bg-[#0a0a2e]">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {historyTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-2 px-2 text-sm ${
                activeTab === tab
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-4 space-y-3">
        {isLoading ? (
          // Loading skeleton matching new layout
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#1a1a40] border-[#2a2a50] p-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  {/* Icon skeleton */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700"></div>
                  
                  {/* Content skeleton */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-24"></div>
                        <div className="h-3 bg-gray-700 rounded w-20"></div>
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow skeleton */}
                  <div className="w-4 h-4 bg-gray-700 rounded flex-shrink-0"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-center">No transaction history</p>
            <p className="text-gray-500 text-sm text-center mt-1">
              Your transactions will appear here
            </p>
          </div>
        ) : (
          // Transaction items
          transactions.map((transaction: any) => {
            // Check if it's a transfer or deposit
            const isTransfer = transaction.type === 'sent' || transaction.type === 'received';
            
            if (isTransfer) {
              const isSent = transaction.type === 'sent';
              const isReceived = transaction.type === 'received';
              const otherUser = isSent ? transaction.toUser : transaction.fromUser;
              
              return (
                <Link 
                  key={transaction._id} 
                  href={`/mobile/transfer-details/${transaction.transactionId}`}
                >
                  <Card className="bg-[#1a1a40] border-[#2a2a50] p-4 hover:bg-[#2a2a50] transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      {/* Transaction Type Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isSent ? 'bg-red-500/20' : 'bg-green-500/20'
                      }`}>
                        {isSent ? (
                          <ArrowUp className="w-5 h-5 text-red-400" />
                        ) : (
                          <ArrowDown className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      
                      {/* Transaction Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm mb-1">
                              {isSent ? 'Transfer Sent' : 'Transfer Received'}
                            </p>
                            <p className="text-gray-400 text-xs mb-1">
                              {isSent ? 'To: ' : 'From: '}{otherUser?.name || 'Unknown User'}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          {/* Amount and Status */}
                          <div className="text-right">
                            <p className={`font-semibold text-sm mb-1 ${
                              isSent ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {isSent ? '-' : '+'}${transaction.amount.toLocaleString('en-US', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </p>
                            <div className="flex items-center justify-end space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                transaction.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'
                              }`}></div>
                              <p className="text-gray-400 text-xs capitalize">
                                {transaction.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow Icon */}
                      <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              );
            } else {
              // Deposit transaction
              return (
                <Link 
                  key={transaction._id} 
                  href={`/mobile/deposit-details/${transaction._id}`}
                >
                  <Card className="bg-[#1a1a40] border-[#2a2a50] p-4 hover:bg-[#2a2a50] transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      {/* Deposit Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Deposit Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm mb-1">
                              {transaction.cryptoSymbol} Deposit
                            </p>
                            <p className="text-gray-400 text-xs mb-1">
                              Network: {transaction.networkName || 'Unknown'}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          {/* Amount */}
                          <div className="text-right">
                            <p className="text-blue-400 font-semibold text-sm mb-1">
                              +{transaction.cryptoAmount.toFixed(6)} {transaction.cryptoSymbol}
                            </p>
                            <p className="text-gray-400 text-xs">
                              ${transaction.usdAmount.toLocaleString('en-US', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow Icon */}
                      <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              );
            }
          })
        )}
      </div>
    </div>
  );
}