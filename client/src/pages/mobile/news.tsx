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
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 3,
    retryDelay: 2000
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
        <div className="px-4 pb-4 space-y-4">
          {newsData.map((article, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
              {article.urlToImage && (
                <div className="aspect-video bg-gray-700 overflow-hidden">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>{article.source?.name || 'Unknown Source'}</span>
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
                
                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                  {article.title}
                </h3>
                
                {article.description && (
                  <p className="text-gray-400 text-xs mb-3 line-clamp-3">
                    {article.description}
                  </p>
                )}
                
                <button
                  onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-xs transition-colors"
                >
                  <span>Read More</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
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