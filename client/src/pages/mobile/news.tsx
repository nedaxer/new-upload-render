import { MobileLayout } from '@/components/mobile-layout';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ExternalLink, Clock, Wifi, WifiOff, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

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
  const { t } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveNewsData, setLiveNewsData] = useState<NewsArticle[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: newsData, isLoading, error } = useQuery<NewsArticle[]>({
    queryKey: ['/api/crypto/news'],
    queryFn: async () => {
      const response = await fetch('/api/crypto/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
    retry: 2,
    retryDelay: 3000,
    staleTime: 10 * 60 * 1000, // Consider data stale after 10 minutes
    gcTime: 30 * 60 * 1000 // Keep in cache for 30 minutes
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
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-black text-2xl font-bold">{t('news')}</h1>
            {isConnected && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {lastUpdate && (
              <span className="text-gray-500 text-xs">
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {isLoading && !newsData && (
        <div className="px-4 py-4 space-y-4 bg-gray-50 min-h-screen">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="px-4 py-8 bg-gray-50 min-h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-red-600 text-sm mb-2">
              Unable to fetch crypto news
            </div>
            <div className="text-red-500 text-sm">
              Please check your internet connection
            </div>
          </div>
        </div>
      )}

      {displayNewsData && displayNewsData.length > 0 && (
        <div className="px-4 py-4 space-y-3 bg-gray-50 min-h-screen">

          {displayNewsData.map((article, index) => (
            <a
              key={`${article.url}-${index}`}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="flex items-start space-x-4">
                {/* Content Section */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-black font-medium text-base mb-2 line-clamp-2 leading-tight">
                    {article.title}
                  </h2>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{article.source?.name || 'Crypto News'}</span>
                    <span>•</span>
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
                
                {/* Image Section */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                    {article.urlToImage ? (
                      <img 
                        src={article.urlToImage} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`fallback-icon w-full h-full flex items-center justify-center text-gray-400 text-xs ${article.urlToImage ? 'hidden' : 'flex'}`}>
                      <div className="text-center">
                        <div className="text-2xl mb-1">📰</div>
                        <div>News</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}


        </div>
      )}

      {displayNewsData && displayNewsData.length === 0 && (
        <div className="px-4 py-12 text-center">
          <div className="text-gray-400 mb-4">
            No articles available
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      )}
    </MobileLayout>
  );
}