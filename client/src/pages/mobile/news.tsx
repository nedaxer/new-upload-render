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
              setLiveNewsData(data.data);
              setLastUpdate(new Date());
              console.log('Received live news update:', data.data.length, 'articles');
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
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-1">
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 text-xs">LIVE</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-red-500 text-xs">OFFLINE</span>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-400 text-sm">
            Real-time cryptocurrency news updates
          </p>
          {lastUpdate && (
            <p className="text-gray-500 text-xs">
              Last update: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {isLoading && !newsData && (
        <div className="px-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
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
          {liveNewsData.length > 0 && (
            <div className="text-center py-2">
              <div className="inline-flex items-center text-green-400 text-sm">
                <Zap className="w-3 h-3 mr-2" />
                Live updates active
              </div>
            </div>
          )}
          {displayNewsData.map((article, index) => (
            <a
              key={`${article.url}-${index}`}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              {article.urlToImage && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img 
                    src={article.urlToImage} 
                    alt={article.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-400 text-xs mb-3 line-clamp-3">
                {article.description}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400 font-medium">
                  {article.source?.name || 'Crypto News'}
                </span>
                <span className="text-gray-500">
                  {formatDate(article.publishedAt)}
                </span>
              </div>
            </a>
          ))}

          {/* Live connection indicator */}
          <div className="text-center py-4 text-xs text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              {isConnected ? (
                <>
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Real-time news updates active</span>
                </>
              ) : (
                <>
                  <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>Fallback mode - refreshing every 5 minutes</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {displayNewsData && displayNewsData.length === 0 && (
        <div className="px-4 py-8 text-center">
          <div className="text-gray-400">
            {isConnected ? 'Waiting for live news updates...' : 'No news articles available at the moment'}
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Refresh News
          </Button>
        </div>
      )}
    </MobileLayout>
  );
}