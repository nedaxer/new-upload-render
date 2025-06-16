import { MobileLayout } from '@/components/mobile-layout';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ExternalLink, Clock, Wifi, WifiOff, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
  publishedAt: string;
  urlToImage?: string;
}

export default function MobileNews() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveNewsData, setLiveNewsData] = useState<NewsArticle[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: newsData, isLoading, error, refetch } = useQuery<NewsArticle[]>({
    queryKey: ['/api/crypto/news', refreshKey],
    queryFn: async () => {
      const response = await fetch('/api/crypto/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Fallback refresh every 5 minutes
    retry: 3,
    retryDelay: 2000,
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  });

  // WebSocket connection for real-time news updates
  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      try {
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          console.log('WebSocket connected for news updates');
          setIsConnected(true);
          // Subscribe to news updates
          wsRef.current?.send(JSON.stringify({ type: 'subscribe_news' }));
        };
        
        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'news_update' && data.data) {
              const wasEmpty = liveNewsData.length === 0;
              setLiveNewsData(data.data);
              setLastUpdate(new Date());
              console.log('Received live news update:', data.data.length, 'articles');
              
              // Show a brief notification for new updates (except on initial load)
              if (!wasEmpty && data.data.length > 0) {
                // You could add a toast notification here if needed
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        wsRef.current.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Use live news data if available, otherwise fall back to regular API data
  const displayNewsData = liveNewsData.length > 0 ? liveNewsData : newsData;

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}h ago`;
      } else {
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
      }
    } catch {
      return 'Recently';
    }
  };

  return (
    <MobileLayout>
      <div className="bg-gray-900 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-white text-2xl font-bold">Crypto News</h1>
            {isConnected && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                <span className="text-green-400 text-xs font-medium">Live</span>
              </div>
            )}
            {!isConnected && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                <span className="text-gray-500 text-xs">Offline</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {lastUpdate && (
              <div className="text-right">
                <div className="text-gray-400 text-xs">Updated</div>
                <div className="text-gray-300 text-xs font-medium">
                  {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {isLoading && !newsData && (
        <div className="px-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-3">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-4/5"></div>
                  </div>
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="px-4 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
            <div className="text-red-400 text-sm mb-2">
              Unable to fetch crypto news
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {displayNewsData && displayNewsData.length > 0 && (
        <div className="px-4 space-y-4">
          {isLoading && (
            <div className="text-center py-2">
              <div className="inline-flex items-center text-blue-400 text-sm">
                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                Updating news...
              </div>
            </div>
          )}

          {displayNewsData.map((article, index) => (
            <article
              key={`${article.url}-${index}`}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200"
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 hover:bg-gray-750 transition-colors duration-200 active:scale-[0.99]"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-semibold text-sm leading-tight pr-3 flex-1 line-clamp-2">
                    {article.title}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 opacity-60" />
                </div>
                
                {article.description && (
                  <p className="text-gray-300 text-xs mb-4 leading-relaxed line-clamp-3 opacity-90">
                    {article.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-blue-400 text-xs font-medium">
                      {article.source?.name || 'Crypto News'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock className="w-3 h-3 mr-1.5" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
              </a>
            </article>
          ))}


        </div>
      )}

      {displayNewsData && displayNewsData.length === 0 && !isLoading && (
        <div className="px-4 py-16 text-center">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-white font-medium mb-2">No news available</h3>
            <p className="text-gray-400 text-sm mb-6">
              We're currently fetching the latest crypto news for you.
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh News
            </Button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}