import { MobileLayout } from '@/components/mobile-layout';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ExternalLink, Clock } from 'lucide-react';
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

  const { data: newsData, isLoading, error, refetch } = useQuery<NewsArticle[]>({
    queryKey: ['/api/crypto/news', refreshKey],
    queryFn: async () => {
      const response = await fetch('/api/crypto/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
    retry: 3,
    retryDelay: 2000,
    staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute
    gcTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
  });

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
          <h1 className="text-white text-2xl font-bold">Crypto News</h1>
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
        <p className="text-gray-400 text-sm mt-1">
          Live cryptocurrency news updates
        </p>
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

      {newsData && newsData.length > 0 && (
        <div className="px-4 space-y-4">
          {isLoading && (
            <div className="text-center py-2">
              <div className="inline-flex items-center text-blue-400 text-sm">
                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                Updating news...
              </div>
            </div>
          )}
          {newsData.map((article, index) => (
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

          {/* Auto-refresh indicator */}
          <div className="text-center py-4 text-xs text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auto-refreshing every 2 minutes</span>
            </div>
          </div>
        </div>
      )}

      {newsData && newsData.length === 0 && (
        <div className="px-4 py-8 text-center">
          <div className="text-gray-400">
            No news articles available at the moment
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