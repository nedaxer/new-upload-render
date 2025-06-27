import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export default function AssetsHistory() {
  const [activeTab, setActiveTab] = useState('Deposit');
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
  const { data: transactionsResponse, isLoading, error } = useQuery({
    queryKey: ['/api/deposits/history'],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds for new deposits
    retry: 3,
    retryDelay: 1000,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache to avoid stale data (replaces cacheTime in newer versions)
  });

  const transactions = Array.isArray(transactionsResponse?.data) ? transactionsResponse.data : [];
  
  console.log('Assets History - Transactions data:', transactionsResponse);
  console.log('Assets History - Error:', error);
  console.log('Assets History - User:', user);
  console.log('Assets History - Loading:', isLoading);
  
  // Force refresh when user changes
  useEffect(() => {
    if (user) {
      console.log('User authenticated, refreshing deposit history...');
      queryClient.invalidateQueries({ queryKey: ['/api/deposits/history'] });
    }
  }, [user, queryClient]);

  // Show debug information for troubleshooting
  const showDebugInfo = transactions.length === 0 && !isLoading && user;
  
  if (showDebugInfo) {
    console.log('DEBUG: No transactions found despite user being authenticated');
    console.log('User ID:', user._id);
    console.log('API Response:', transactionsResponse);
    console.log('Error Object:', error);
  }

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
          
          if (data.type === 'DEPOSIT_CREATED') {
            // Refresh transaction history when new deposits are created
            queryClient.invalidateQueries({ queryKey: ['/api/deposits/history'] });
            console.log('Transaction history refreshed due to new deposit');
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
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#1a1a40] border-[#2a2a50] p-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                    <div className="h-3 bg-gray-700 rounded w-32"></div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
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
              Your deposit transactions will appear here
            </p>
          </div>
        ) : (
          // Transaction items
          transactions
            .filter((transaction: any) => 
              activeTab === 'All Transactions' || 
              activeTab === 'Deposit'
            )
            .map((transaction: any) => (
              <Link 
                key={transaction._id} 
                href={`/mobile/deposit-details/${transaction._id}`}
              >
                <Card className="bg-[#1a1a40] border-[#2a2a50] p-4 hover:bg-[#2a2a50] transition-colors cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium text-sm">
                        {transaction.cryptoSymbol}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium text-sm">
                        {transaction.cryptoAmount.toFixed(8)}
                      </p>
                      <div className="flex items-center text-green-400 text-xs">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                        Succeeded
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 ml-2" />
                  </div>
                </Card>
              </Link>
            ))
        )}
      </div>
    </div>
  );
}